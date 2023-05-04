# c4g-extension

Just run it

![Regular file](https://github.com/guschnwg/mega-repo/raw/main/c4g-extension/regular_file.png "Regular File")


![Test file](https://github.com/guschnwg/mega-repo/blob/main/c4g-extension/test_file.png?raw=true "Test File")


## Commands

- Copy Import: it loads to your clipboard the import python command
  - In the File: `from cats4gold.facebook.services import ads`
  - In the Method: `from cats4gold.facebook.services.ads import kick_ad`
  - In the Class: `from cats4gold.facebook.services.ads import Lala`

- Open Console: opens a console in a new Terminal with the imported command already loaded.
  - Opens a Quick Pick letting you choose the Integration and the Env

- Run: Just runs the test method/file without any real deal.

- Run with config: Open a Quick Pick to let you choose the flags.

# Shipping

- Change the code
- Change the version in package.json
- pnpm run compile
- pnpm run ship
- Install from VSIX...
- Choose the file
- Install and reload
- Move the file to release folder
- Push