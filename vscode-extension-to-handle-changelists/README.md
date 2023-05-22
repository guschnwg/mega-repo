# Git Changelists

This is two step work:

- [x] Git Hook to prevent commits
- [ ] VS Code extension to list change list


# Instalation

Set up the config
`git config --global init.templatedir '~/.git-templates'`

Create a git template for hooks
`mkdir -p ~/.git-templates/hooks`

Create the pre-commit file
`touch ~/.git-templates/hooks/pre-commit`

Create the shared pre-commit hook
```bash
tee -a ~/.git-templates/hooks/pre-commit << END
#!/bin/sh

FILES=\$(git diff --name-only --cached)
CHANGELIST=".gitchangelist\n\$([ -f .gitchangelist ] && cat .gitchangelist | grep "^[^#]")"
NOT_ALLOWED_FILES=""

while IFS= read -r FILE; do
  if [[ "\$CHANGELIST" == *"\$FILE"* ]]; then
    NOT_ALLOWED_FILES="\$NOT_ALLOWED_FILES\n\$FILE"
  fi
done <<< "\$FILES"
if [[ "\$NOT_ALLOWED_FILES" != "" ]]; then
  echo "You have stuff from a changelist in the commit, remove it, then 🚢"
  echo \$NOT_ALLOWED_FILES
  exit 1
fi
END
```

Make sure it is exectutable
```bash
chmod a+x ~/.git-templates/hooks/pre-commit
```

Need to init the repo again
```bash
git init
```

Set up a file to don't commit 

echo 
```bash
tee -a .gitchangelist << END
# Do not commit
vscode-extension-to-handle-changelists/do-not-commit.js
END
```

Changelists are never committable

```bash
➜  mega-repo git:(main) ✗ git commit -m 'test'
You have stuff from a changelist in the commit, remove it, then 🚢

.gitchangelist
vscode-extension-to-handle-changelists/do-not-commit.js
```

```bash
➜  mega-repo git:(main) ✗ git commit -m 'test'                
You have stuff from a changelist in the commit, remove it, then 🚢

vscode-extension-to-handle-changelists/do-not-commit.js
```


# Debugging

`rm ~/.git-templates/hooks/pre-commit`
`rm .git/hooks/pre-commit`
