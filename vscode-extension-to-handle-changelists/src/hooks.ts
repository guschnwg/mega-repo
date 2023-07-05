import * as vscode from 'vscode';
import * as fs from 'fs';
import * as childProcess from 'child_process';

//
function getRepoRoot(workspaceFolder: string) {
  return childProcess.execSync(`cd ${workspaceFolder} && git rev-parse --show-toplevel`).toString().trim();
}

export function getScript(fromExtensionPath: string) {
  return fs.readFileSync(`${fromExtensionPath}/src/script.sh`).toString().trim();
}

export function getFilePath() {
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

function isScriptInFile(script: string) {
  const preCommit = getPreCommitHook();
  return preCommit.includes(script);
}

function isExecutable() {
  try {
    fs.accessSync(getFilePath(), fs.constants.X_OK)
    return true
  } catch {
    return false
  }
}
export function isHookInstalled(context: vscode.ExtensionContext) {
  const script = getScript(context.extensionPath);
  return isScriptInFile(script) && isExecutable();
}
export function uninstallHook(context: vscode.ExtensionContext) {
  const preCommit = getPreCommitHook();
  const script = getScript(context.extensionPath);
  const newPreCommit = preCommit.replace(script, '');
  savePreCommit(newPreCommit.trim());
}
export function installHook(context: vscode.ExtensionContext) {
  const script = getScript(context.extensionPath);
  if (!isScriptInFile(script)) {
    const preCommit = getPreCommitHook();
    const newPreCommit = `${script}\n\n${preCommit}`;
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

  const path = `${workspaceFolder}/.gitchangelist`;

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