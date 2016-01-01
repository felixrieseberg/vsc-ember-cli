## Ember Cli Extension for Visual Studio Code
[![Build Status](https://travis-ci.org/felixrieseberg/vsc-ember-cli.svg?branch=master)](https://travis-ci.org/felixrieseberg/vsc-ember-cli)

Use Ember Cli directly from Visual Studio Code. After installation, all `ember cli` commands are available through Code's own command list, enabling you for example to generate blueprints, run tests, or build your app without leaving your editor. 

![Screenshot](screen.gif)

#### Features
 * Visual Studio Code is automatically configured to play well with Ember Cli projects - as soon as a `.ember-cli` file is detected in the workspace, we'll create a fitting `jsconfig.json` to ensure that Visual Studio Code enables ES6 and Modules support.
 * All Ember Commands are available through Visual Studio Code's Commande Pallete
 * Snippets make day-to-day tasks a lot easier

#### Commands Implemented
 * Create addon folder structure (also known as `ember addon`)
 * Build app (also known as `ember build`)
 * Build, watch, and live-reload app (also known as `ember serve`)
 * Generate blueprint(also known as `ember generate`)
 * Destroy blueprint (also known as `ember destroy`)
 * Create new app in the current workspace (also known as `ember init`)
 * Create new app in a sub-folder in the current workspace (also known as `ember new`)
 * Install ember addon (also known as `ember install`)
 * Display the Ember Cli version (also known as `ember version`)
 * Run tests (also known as `ember test`)
 * Run tests in server mode (also known as `ember test --server`)
 * Setup project for development in Visual Studio Code
 
## Install
In Visual Studio Code, run `ext install vsc-ember-cli` - or, simply hit `CMD/CTRL + Shift + P`, search for "Install Extension", and then search for "ember cli".

## Bugs and Issues
Under the covers, this addon is merely executing Ember commands for you. In practice, this sometimes leads to issues, since the addon does not come with Ember Cli and is absolutely reliant on your system being setup properly. To debug issues, set an environment variable named `VSC_EMBER_CLI_DEBUG` - Visual Studio Code will then always display the output window for all operations, allowing you to see what's happening in the terminal.

## Contributions
There's a few things that could improve the extension - snippets and IntelliSense support is probably at the very top of everyone's wish list. Contributions are extremely welcome!

## License
MIT, please see LICENSE for details. Copyright (c) 2015 Felix Rieseberg and Microsoft Corporation.