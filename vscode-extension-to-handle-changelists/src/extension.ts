import * as vscode from 'vscode';

import { Provider } from './provider';
import { checkHookCommand, installHookCommand, uninstallHookCommand } from './commands';

export function activate(context: vscode.ExtensionContext) {
  const treeDataProvider = new Provider();

  vscode.window.createTreeView('changelists', { treeDataProvider });

	// Register the commands
	context.subscriptions.push(
		vscode.commands.registerCommand('install', installHookCommand(treeDataProvider)),
		vscode.commands.registerCommand('check', checkHookCommand(treeDataProvider)),
		vscode.commands.registerCommand('uninstall', uninstallHookCommand(treeDataProvider)),
    vscode.window.registerTreeDataProvider('changelists', treeDataProvider)
	);
}

export function deactivate() {}
