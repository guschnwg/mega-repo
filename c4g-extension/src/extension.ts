import * as vscode from 'vscode';

const TOP_OF_DOCUMENT = new vscode.Range(0, 0, 0, 0);
const TEST_EXPRESSION = /^def test_.*\(/gm;
const ALL_METHODS_EXPRESSION = /^def .*\(/gm;

const RUN_TESTS_FILE = 'extension.runTestsFile';
const RUN_TEST_METHOD = 'extension.runTestMethod';

const COPY_IMPORT_STATEMENT = 'extension.copyImportStatement';
const OPEN_CONSOLE_WITH_THIS_IMPORTED = 'extension.openConsoleWithThisImported';

const extensionOutput = vscode.window.createOutputChannel("C$G");

export function activate(context: vscode.ExtensionContext) {
	function _filePath() {
		const fileName = vscode.window.activeTextEditor?.document.fileName!;
		return vscode.workspace.asRelativePath(fileName);
	}

	function _importStatement(method: string) {
		const filePath = _filePath();
		const fileAsMethod = filePath.replace('srv/', '').replace('.py', '').replace(/\//g, '.');

		if (method) {
			return `from ${fileAsMethod} import ${method}`;
		}

		const pathToModule = fileAsMethod.split('.');
		const module = pathToModule.pop();

		return `from ${pathToModule.join('.')} import ${module}`;
	}

	async function runTestsFile(openConfig = false) {
		const terminal = vscode.window.createTerminal("Applying git diff from current editor");
		terminal.sendText(`make docker-test TEST_PATH="${_filePath()}"`);
	}

	async function runTestMethod(method: string, openConfig = false) {
		const terminal = vscode.window.createTerminal("Applying git diff from current editor");
		terminal.sendText(`make docker-test TEST_PATH="${_filePath()}::${method}"`);
	}

	async function copyImportStatement(method: string) {
		vscode.env.clipboard.writeText(_importStatement(method));
	}

	async function openConsoleWithThisImported(method: string) {
		const integration = await vscode.window.showQuickPick(
			["facebook", "tiktok", "pinterest"], { title: "Choose integration" }
		);
		if (!integration) {
			return;
		}

		const environment = await vscode.window.showQuickPick(
			["development", "staging", "production"], { title: "Choose env" }
		);
		if (!integration) {
			return;
		}

		const terminal = vscode.window.createTerminal("The console you wanted");
		terminal.sendText(`make ${integration}-${environment}-console EXTRA="-c '${_importStatement(method)}'"`);
	}

	context.subscriptions.push(
		vscode.languages.registerCodeLensProvider({ scheme: 'file', language: 'python', pattern: '**/*.py' }, new C4gTestsCodeLensProvider()),
		vscode.commands.registerCommand(RUN_TESTS_FILE, runTestsFile),
		vscode.commands.registerCommand(RUN_TEST_METHOD, runTestMethod),
		vscode.commands.registerCommand(COPY_IMPORT_STATEMENT, copyImportStatement),
		vscode.commands.registerCommand(OPEN_CONSOLE_WITH_THIS_IMPORTED, openConsoleWithThisImported),
	);
}

export function deactivate() { }


const runTestMethodCommand = (method: string, openConfig = false): vscode.Command => ({
	command: RUN_TEST_METHOD,
	title: 'Run' + (openConfig ? ' with config' : ''),
	arguments: [method, openConfig],
});

const runTestsFileCommand = (openConfig = false): vscode.Command => ({
	command: RUN_TESTS_FILE,
	title: 'Run' + (openConfig ? ' with config' : ''),
	arguments: [openConfig],
});

const copyImportStatementCommand = (method: string): vscode.Command => ({
	command: COPY_IMPORT_STATEMENT,
	title: 'Copy import',
	arguments: [method],
});

const openConsoleWithThisImportedCommand = (method: string): vscode.Command => ({
	command: OPEN_CONSOLE_WITH_THIS_IMPORTED,
	title: 'Open console',
	arguments: [method],
});

class C4gTestsCodeLensProvider implements vscode.CodeLensProvider {
	_addCodeLenses(document: vscode.TextDocument, expression: RegExp, func: (range: vscode.Range, match: string) => Array<vscode.CodeLens>) {
		const text = document.getText();

		const codeLenses = [];

		const regex = new RegExp(expression);
		let matches = regex.exec(text);
		while (matches) {
			const line = document.lineAt(document.positionAt(matches.index).line);

			const indexOf = line.text.indexOf(matches[0]);
			const position = new vscode.Position(line.lineNumber, indexOf);

			const range = document.getWordRangeAtPosition(position, new RegExp(expression));

			if (range) {
				codeLenses.push(...func(range, matches[0]));
			}

			matches = regex.exec(text);
		}

		return codeLenses;
	}

	addTestCodeLenses(document: vscode.TextDocument) {
		return this._addCodeLenses(document, TEST_EXPRESSION, (range: vscode.Range, match: string) => {
			let method = match.replace('def ', '').replace('(', '');

			return [
				new vscode.CodeLens(range, runTestMethodCommand(method)),
				new vscode.CodeLens(range, runTestMethodCommand(method, true)),
			];
		});
	}

	addCopyImportCodeLenses(document: vscode.TextDocument) {
		return this._addCodeLenses(document, ALL_METHODS_EXPRESSION, (range: vscode.Range, match: string) => {
			let method = match.replace('def ', '').replace('(', '');

			return [
				new vscode.CodeLens(range, copyImportStatementCommand(method)),
				new vscode.CodeLens(range, openConsoleWithThisImportedCommand(method)),
			];
		});
	}

	async provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
		let codeLenses = [
			new vscode.CodeLens(TOP_OF_DOCUMENT, runTestsFileCommand()),
			new vscode.CodeLens(TOP_OF_DOCUMENT, runTestsFileCommand(true)),
			new vscode.CodeLens(TOP_OF_DOCUMENT, copyImportStatementCommand('')),
		];

		codeLenses.push(...this.addTestCodeLenses(document));
		codeLenses.push(...this.addCopyImportCodeLenses(document));

		return codeLenses;
	}
}

