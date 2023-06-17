import * as vscode from 'vscode';
import { Provider } from './provider';
import { installHook, isHookInstalled, uninstallHook } from './hooks';

//

export function installHookCommand(treeDataProvider: Provider) {
  return () => {
    installHook();
    treeDataProvider.refresh();
  };
}

export function checkHookCommand(treeDataProvider: Provider) {
  return () => {
    treeDataProvider.refresh();
    const msg = isHookInstalled() ? "Installed!" : "Not installed!";
    vscode.window.showInformationMessage(msg);
  };
}

export function uninstallHookCommand(treeDataProvider: Provider) {
  return () => {
    uninstallHook();
    treeDataProvider.refresh();
  };
}
