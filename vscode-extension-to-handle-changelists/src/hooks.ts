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
function getPreCommitHook() {
  const workspaceFolder = getWorkspaceRoot();
  if (!workspaceFolder) {
    return '';
  }

  const folder = getRepoRoot(workspaceFolder);
  try {
    return fs.readFileSync(`${folder}/.git/hooks/pre-commit`).toString();
  } catch {
    return '';
  }
}
function savePreCommit(data: string) {
  const workspaceFolder = getWorkspaceRoot();
  if (!workspaceFolder) {
    return false;
  }

  console.log(workspaceFolder);

  const folder = getRepoRoot(workspaceFolder);
  const path = `${folder}/.git/hooks/pre-commit`;

  if (data) {
    fs.writeFileSync(path, data);
  } else {
    try {
      fs.unlinkSync(path);
    } catch { }
  }
}
export function isHookInstalled() {
  const preCommit = getPreCommitHook();
  return preCommit.includes(SCRIPT);
}
export function uninstallHook() {
  const preCommit = getPreCommitHook();
  const newPreCommit = preCommit.replace(SCRIPT, '');
  savePreCommit(newPreCommit.trim());
}
export function installHook() {
  if (isHookInstalled()) {
    return;
  }

  const preCommit = getPreCommitHook();
  const newPreCommit = `${SCRIPT}\n\n${preCommit}`;
  savePreCommit(newPreCommit.trim());
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