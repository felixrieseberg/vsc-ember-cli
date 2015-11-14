## Travis CI Extension for Visual Studio Code
Check the Travis CI build status of your project right in Visual Studio Code! This extension displays a small status indicator in the status bar.

![Screenshot](screen.png)

It comes with two commands: `Update Status` and `Open in Travis`. It is enabled automatically if a `.travis.yml` is present in your project.

## Configuration
Travis uses a username/repository combination to find your test. By default, the extension will atempt to gather that information from your Git configuration, using the `origin` remote. So, if your repository lives in `https://github.com/felixrieseberg/bubblegum`, the extension will expect to find tests at `https://travis-ci.org/felixrieseberg/bubblegum`.

However, you can easily override that setting. Simply open or create `./.vscode/settings.json` and fill in the following fields:

```json
{
    "travis.repository": "electron",
    "travis.username": "atom"
}
```

## License
MIT, please see LICENSE for details. Copyright (c) 2015 Felix Rieseberg and Microsoft Corporation.