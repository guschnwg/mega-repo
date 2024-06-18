import * as vscode from 'vscode';
import { isHookInstalled, getChangelists } from './hooks';

export class Provider implements vscode.TreeDataProvider<vscode.TreeItem> {
  context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getHookCommands() {
    const installHook = new vscode.TreeItem('Install Hook');
    const checkHook = new vscode.TreeItem('Check Hook');
    const viewGitPreCommitFile = new vscode.TreeItem('View Git PreCommit File');
    const uninstallHook = new vscode.TreeItem('Uninstall Hook');

    installHook.command = { title: 'Install', command: 'install' };
    checkHook.command = { title: 'Check', command: 'check' };
    viewGitPreCommitFile.command = { title: 'View Git PreCommit Hook', command: 'viewGitPreCommitFile' };
    uninstallHook.command = { title: 'Check', command: 'uninstall' };

    installHook.iconPath = new vscode.ThemeIcon('debug-start');
    checkHook.iconPath = new vscode.ThemeIcon('debug-restart');
    viewGitPreCommitFile.iconPath = new vscode.ThemeIcon('notebook-open-as-text');
    uninstallHook.iconPath = new vscode.ThemeIcon('debug-stop');

    const actionHook = isHookInstalled(this.context) ? uninstallHook : installHook;

    return [actionHook, checkHook, viewGitPreCommitFile];
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if (element) {
      if (element.label === 'Changelists') {
        return Promise.resolve(
          getChangelists()
            .map(({ title }) => new vscode.TreeItem(
              title,
              vscode.TreeItemCollapsibleState.Collapsed
            ))
        );
      } else {
        const changeList = getChangelists().find(({ title }) => title === element.label);

        if (!changeList) {
          return Promise.resolve([]);
        }

        return Promise.resolve(
          changeList.files.map((file) => {
            const item = new vscode.TreeItem(file);
            item.resourceUri = vscode.Uri.parse(item.label!.toString());
            return item;
          })
        );
      }
    }

    return Promise.resolve(
      [
        ...this.getHookCommands(),
        new vscode.TreeItem('Changelists', vscode.TreeItemCollapsibleState.Collapsed),
      ]
    );
  }
}
