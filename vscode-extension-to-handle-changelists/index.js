// import fs from 'fs';
const fs = require('fs');
const childProcess = require('child_process');

function getChangelists() {
  const buffer = fs.readFileSync('./.gitchangelists');
  const data = buffer.toString();

  let changelists = data.split('\n#')
    .map(c => c.replace(/^# /, '')) // Removes a starting # 
    .map(c => c.replace(/^#/, '')) // Removes a starting #
    .map(c => c.replace(/\n$/, '')) // Removes an ending \n
    .map(c => c.trim()) // Trim both the start and end to remove spaces
    .map(c => c.split('\n')); // Split the lines

  return changelists.map(([title, ...files]) => ({ title, files }));
}

console.log(getChangelists());

function getScriptData() {
  return fs.readFileSync('./script.sh').toString().trim();
}

function getRepoRoot() {
  return childProcess.execSync('git rev-parse --show-toplevel').toString().trim();
}

function getPreCommitHook() {
  const folder = getRepoRoot();
  try {
    return fs.readFileSync(`${folder}/.git/hooks/pre-commit`).toString();
  } catch {
    return '';
  }
}

function savePreCommit(data) {
  const folder = getRepoRoot();
  const path = `${folder}/.git/hooks/pre-commit`;

  if (data) {
    fs.writeFileSync(path, data);
  } else {
    try {
      fs.unlinkSync(path);
    } catch {}
  }
}

function isHookInstalled() {
  const script = getScriptData();
  const preCommit = getPreCommitHook();
  return preCommit.includes(script);
}

console.log(isHookInstalled());

function uninstallHook() {
  const script = getScriptData();
  const preCommit = getPreCommitHook();
  const newPreCommit = preCommit.replace(script, '');
  savePreCommit(newPreCommit.trim());
}

uninstallHook();

console.log(isHookInstalled());

function installHook() {
  const script = getScriptData();
  const preCommit = getPreCommitHook();
  const newPreCommit = `${preCommit}\n\n${script}`;
  savePreCommit(newPreCommit.trim());
}

installHook();

console.log(isHookInstalled());
