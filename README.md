BitBoost Market - ecommerce redefined.

The project has 3-package.json structure. Before starting to work with the project, please run "npm install" in the same folder with the package.json:
1) /package.json stands for the electron builder, it is CI-ready (AppVeyor and Travis), just change the keys in .travis.yml and appveyor.yml files to yours and enjoy the auto-deployment process. To build the project into a dist on your machine - run "npm run build" or "npm run win/linux/mac" for a platform-specific build. You can change logo in /build folder
2) /app/package.json stands for the electron backend. Just run "npm start" to start your electron app. You can change name/version in /app/package.json
3) /app/app/package.json stands for the Angular 6 front-end webapp. Run "ng build --watch" to run the watcher for your changes or "ng build" to produce a dist to be used with electron


For front-end:

- run "npm install -g --production windows-build-tools" to install python and tools
- run "npm install -g node-gyp" to install node-gyp
- run "npm install -g webpack" to install webpack
- run "npm install -g @angular/cli" to install Angular build tools
- run "npm install" from the mercury-node folder
- run "npm install" from the mercury-node/app folder
- run "npm install" from the mercury-node/app/app folder
- build the UI: "npm run-script build" from the mercury-node/app/app folder
- rebuild packages to support electron: run "node_modules\.bin\electron-rebuild -p -f" from the mercury-node/app folder

For back-end only (debugging purposes):

- run "npm install express" from mercury-node/app folder
- install VS Code for debugging
- install Postman for issuing requests

Workaround for unicode symbols in path (Windows):

add "--devdir="C:\nodejs\nodegyp"" to npm install command
