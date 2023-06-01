#!/bin/sh

FILES=$(git diff --name-only --cached)
CHANGELIST=".gitchangelist\n$([ -f .gitchangelist ] && cat .gitchangelist | grep "^[^#]")"
NOT_ALLOWED_FILES=""

while IFS= read -r FILE; do
  if [[ "$CHANGELIST" == *"$FILE"* ]]; then
    NOT_ALLOWED_FILES="$NOT_ALLOWED_FILES\n$FILE"
  fi
done <<< "$FILES"

if [[ "$NOT_ALLOWED_FILES" != "" ]]; then
  echo "You have stuff from a changelist in the commit, remove it, then 🚢"
  echo $NOT_ALLOWED_FILES
  exit 1
fi