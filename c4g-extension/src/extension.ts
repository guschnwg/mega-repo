import * as vscode from 'vscode';

const extensionOutput = vscode.window.createOutputChannel("C$G");

const TOP_OF_DOCUMENT = new vscode.Range(0, 0, 0, 0);
const TEST_EXPRESSION = /^def test_.*\(/gm;
const ALL_METHODS_EXPRESSION = /^def .*\(/gm;
const ALL_CLASSES_EXPRESSION = /^class .*\(/gm;

const POSSIBLE_FLAGS = ["-v", "-vv", "--pdb", "--exitfirst"];
const INTEGRATIONS = ["facebook", "tiktok", "pinterest"];
const ENVIRONMENTS = ["development", "staging", "production"];

const RUN_TESTS_FILE = 'extension.runTestsFile';
const RUN_TEST_METHOD = 'extension.runTestMethod';

const COPY_IMPORT_STATEMENT = 'extension.copyImportStatement';
const OPEN_CONSOLE_WITH_THIS_IMPORTED = 'extension.openConsoleWithThisImported';


function _filePath() {
	return vscode.workspace.asRelativePath(vscode.window.activeTextEditor?.document.fileName!);
}

function _importStatement(method: string) {
	const filePath = _filePath();

	const fileAsMethod = filePath
		.replace('srv/', '')
		.replace('.py', '')
		.replace(/\//g, '.')
		.replace(/\.__init__/g, '')
		.replace(/^(src\.)/, "")
		.replace(/^(api.src\.)/, "");

	if (method) return `from ${fileAsMethod} import ${method}`;

	const pathToModule = fileAsMethod.split('.');
	const module = pathToModule.pop();

	return `from ${pathToModule.join('.')} import ${module}`;
}

async function _testFlags(openConfig: boolean) {
	if (!openConfig) return [];

	return await vscode.window.showQuickPick(POSSIBLE_FLAGS, { title: "Choose your flags", canPickMany: true }) || [];
}

async function _withMigrations(openConfig: boolean) {
	if (!openConfig) return false;

	return await vscode.window.showQuickPick(["Yes", "No"], { title: "With migration" }) === "Yes";
}

function _testCommand(withMigrations: boolean) {
	return withMigrations ? 'docker-test' : 'docker-test-without-migration';
}

function _addCodeLenses(document: vscode.TextDocument, expression: RegExp, func: (range: vscode.Range, match: string) => Array<vscode.CodeLens>) {
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

// Commands

async function runTestsFile(openConfig = false) {
	const flags = await _testFlags(openConfig);
	const withMigrations = await _withMigrations(openConfig);
	const terminal = vscode.window.createTerminal("Running your tests");

	terminal.sendText(`make ${_testCommand(withMigrations)} TEST_PATH="${flags.join(' ')} ${_filePath()}"`);
}

async function runTestMethod(method: string, openConfig = false) {
	const flags = await _testFlags(openConfig);
	const withMigrations = await _withMigrations(openConfig);
	const terminal = vscode.window.createTerminal("Running your tests");

	terminal.sendText(`make ${_testCommand(withMigrations)} TEST_PATH="${flags.join(' ')} ${_filePath()}::${method}"`);
}

async function copyImportStatement(method: string) {
	vscode.env.clipboard.writeText(_importStatement(method));
}

async function openConsoleWithThisImported(method: string) {
	const integration = await vscode.window.showQuickPick(INTEGRATIONS, { title: "Choose integration" });
	const environment = await vscode.window.showQuickPick(ENVIRONMENTS, { title: "Choose env" });

	if (!integration || !environment) return;

	const terminal = vscode.window.createTerminal("The console you wanted");
	terminal.sendText(`make ${integration}-${environment}-console EXTRA="-c '${_importStatement(method)}'"`);
}

// Providers

class C4gTestsCodeLensProvider implements vscode.CodeLensProvider {
	runTestMethodCommand = (method: string, openConfig = false): vscode.Command => ({
		command: RUN_TEST_METHOD,
		title: 'Run' + (openConfig ? ' with config' : ''),
		arguments: [method, openConfig],
	});

	runTestsFileCommand = (openConfig = false): vscode.Command => ({
		command: RUN_TESTS_FILE,
		title: 'Run' + (openConfig ? ' with config' : ''),
		arguments: [openConfig],
	});

	async provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
		return [
			new vscode.CodeLens(TOP_OF_DOCUMENT, this.runTestsFileCommand()),
			new vscode.CodeLens(TOP_OF_DOCUMENT, this.runTestsFileCommand(true)),
			..._addCodeLenses(document, TEST_EXPRESSION, (range: vscode.Range, match: string) => {
				let method = match.replace('def ', '').replace('(', '');

				return [
					new vscode.CodeLens(range, this.runTestMethodCommand(method)),
					new vscode.CodeLens(range, this.runTestMethodCommand(method, true)),
				];
			})
		];
	}
}

class C4gImportCodeLensProvider implements vscode.CodeLensProvider {
	copyImportStatementCommand = (method: string): vscode.Command => ({
		command: COPY_IMPORT_STATEMENT,
		title: 'Copy import',
		arguments: [method],
	});

	openConsoleWithThisImportedCommand = (method: string): vscode.Command => ({
		command: OPEN_CONSOLE_WITH_THIS_IMPORTED,
		title: 'Open console',
		arguments: [method],
	});

	async provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
		return [
			new vscode.CodeLens(TOP_OF_DOCUMENT, this.copyImportStatementCommand('')),
			new vscode.CodeLens(TOP_OF_DOCUMENT, this.openConsoleWithThisImportedCommand('')),
			..._addCodeLenses(document, ALL_METHODS_EXPRESSION, (range: vscode.Range, match: string) => {
				let method = match.replace('def ', '').replace('(', '');

				return [
					new vscode.CodeLens(range, this.copyImportStatementCommand(method)),
					new vscode.CodeLens(range, this.openConsoleWithThisImportedCommand(method)),
				];
			}),
			..._addCodeLenses(document, ALL_CLASSES_EXPRESSION, (range: vscode.Range, match: string) => {
				let method = match.replace('class ', '').replace('(', '');

				return [
					new vscode.CodeLens(range, this.copyImportStatementCommand(method)),
					new vscode.CodeLens(range, this.openConsoleWithThisImportedCommand(method)),
				];
			})
		];
	}
}


// Extension

export function activate(context: vscode.ExtensionContext) {
	// Register the providers
	context.subscriptions.push(
		vscode.languages.registerCodeLensProvider(
			{ scheme: 'file', language: 'python', pattern: '**/*.py' },
			new C4gImportCodeLensProvider()
		),
		vscode.languages.registerCodeLensProvider(
			{ scheme: 'file', language: 'python', pattern: '**/test_*.py' },
			new C4gTestsCodeLensProvider()
		),
	);

	// Register the commands
	context.subscriptions.push(
		vscode.commands.registerCommand(RUN_TESTS_FILE, runTestsFile),
		vscode.commands.registerCommand(RUN_TEST_METHOD, runTestMethod),
		vscode.commands.registerCommand(COPY_IMPORT_STATEMENT, copyImportStatement),
		vscode.commands.registerCommand(OPEN_CONSOLE_WITH_THIS_IMPORTED, openConsoleWithThisImported),
	);
}

export function deactivate() { /* noop */ }
