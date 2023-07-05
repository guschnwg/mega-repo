import * as vscode from 'vscode';

import { Provider } from './provider';
import { checkHookCommand, installHookCommand, uninstallHookCommand, viewGitPreCommitFile } from './commands';

export function activate(context: vscode.ExtensionContext) {
  const treeDataProvider = new Provider(context);

  vscode.window.createTreeView('changelists', { treeDataProvider });

	// Register the commands
	context.subscriptions.push(
		vscode.commands.registerCommand('install', installHookCommand(context, treeDataProvider)),
		vscode.commands.registerCommand('check', checkHookCommand(context, treeDataProvider)),
		vscode.commands.registerCommand('viewGitPreCommitFile', viewGitPreCommitFile(context, treeDataProvider)),
		vscode.commands.registerCommand('uninstall', uninstallHookCommand(context, treeDataProvider)),
    vscode.window.registerTreeDataProvider('changelists', treeDataProvider)
	);
}

export function deactivate() {}
