import * as vscode from 'vscode';
import * as fs from 'fs';
import * as childProcess from 'child_process';

const SCRIPT: string = `#!/bin/sh

FILES=$(git diff --name-only --cached)
CHANGELIST=".gitchangelist\\n$([ -f .gitchangelist ] && cat .gitchangelist | grep "^[^#]")"
NOT_ALLOWED_FILES=""

while IFS= read -r FILE; do
  if [[ "$CHANGELIST" == *"$FILE"* ]]; then
    NOT_ALLOWED_FILES="$NOT_ALLOWED_FILES\\n$FILE"
  fi
done <<< "$FILES"

if [[ "$NOT_ALLOWED_FILES" != "" ]]; then
  echo "You have stuff from a changelist in the commit, remove it, then 🚢"
  echo $NOT_ALLOWED_FILES
  exit 1
fi`;
//
function getRepoRoot(workspaceFolder: string) {
  return childProcess.execSync(`cd ${workspaceFolder} && git rev-parse --show-toplevel`).toString().trim();
}

function getFilePath() {
  const workspaceFolder = getWorkspaceRoot();
  if (!workspaceFolder) {
    return '';
  }

  const folder = getRepoRoot(workspaceFolder);

  return `${folder}/.git/hooks/pre-commit`
}

function getPreCommitHook() {
  try {
    return fs.readFileSync(getFilePath()).toString();
  } catch {
    return '';
  }
}
function savePreCommit(data: string) {
  const path = getFilePath();

  if (data) {
    fs.writeFileSync(path, data);
  } else {
    try {
      fs.unlinkSync(path);
    } catch { }
  }
}

function isScriptInFile() {
  const preCommit = getPreCommitHook();
  return preCommit.includes(SCRIPT);
}

function isExecutable() {
  try {
    fs.accessSync(getFilePath(), fs.constants.X_OK)
    return true
  } catch {
    return false
  }
}
export function isHookInstalled() {
  return isScriptInFile() && isExecutable();
}
export function uninstallHook() {
  const preCommit = getPreCommitHook();
  const newPreCommit = preCommit.replace(SCRIPT, '');
  savePreCommit(newPreCommit.trim());
}
export function installHook() {
  if (!isScriptInFile()) {
    const preCommit = getPreCommitHook();
    const newPreCommit = `${SCRIPT}\n\n${preCommit}`;
    savePreCommit(newPreCommit.trim());
  }
  if (!isExecutable()) {
    return childProcess.execSync(`chmod u+x ${getFilePath()}`).toString().trim();
  }
}

export function getWorkspaceRoot() {
  if (!vscode.workspace.workspaceFolders) {
    return null;
  }

  return vscode.workspace.workspaceFolders[0].uri.fsPath;
}


export function getChangelists() {
  const workspaceFolder = getWorkspaceRoot();
  if (!workspaceFolder) {
    return [];
  }

  const path = `${workspaceFolder}/.gitchangelists`;

  const buffer = fs.readFileSync(path);
  const data = buffer.toString();

  let changelists = data.split('\n#')
    .map((c: string) => c.replace(/^# /, '')) // Removes a starting # 
    .map((c: string) => c.replace(/^#/, '')) // Removes a starting #
    .map((c: string) => c.replace(/\n$/, '')) // Removes an ending \n
    .map((c: string) => c.trim()) // Trim both the start and end to remove spaces
    .map((c: string) => c.split('\n')); // Split the lines

  return changelists.map(([title, ...files]) => ({ title, files }));
}