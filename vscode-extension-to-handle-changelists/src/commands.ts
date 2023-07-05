import * as vscode from 'vscode';
import { Provider } from './provider';
import { getFilePath, installHook, isHookInstalled, uninstallHook } from './hooks';

//

export function installHookCommand(context: vscode.ExtensionContext, treeDataProvider: Provider) {
  return () => {
    installHook(context);
    treeDataProvider.refresh();
  };
}

export function checkHookCommand(context: vscode.ExtensionContext, treeDataProvider: Provider) {
  return () => {
    treeDataProvider.refresh();
    const msg = isHookInstalled(context) ? "Installed!" : "Not installed!";
    vscode.window.showInformationMessage(msg);
  };
}

export function viewGitPreCommitFile(context: vscode.ExtensionContext, treeDataProvider: Provider) {
  return () => {
    const path = getFilePath();
    vscode.commands.executeCommand('workbench.action.quickOpen', path);
  };
}

export function uninstallHookCommand(context: vscode.ExtensionContext, treeDataProvider: Provider) {
  return () => {
    uninstallHook(context);
    treeDataProvider.refresh();
  };
}
