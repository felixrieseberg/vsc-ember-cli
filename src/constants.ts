"use strict";

export const ignoreItems = [
    // compiled output
    "dist/**",
    "tmp/**",
    "build/**",
    "cache/**",
    // dependencies
    "node_modules/**",
    "bower_components/**",
    // misc
    ".sass-cache/**",
    "connect.lock/**",
    "coverage/*/**",
    "libpeerconnection.log"
];

export const jsConfig = {
  "compilerOptions": {
    "target": "es6",
    "experimentalDecorators": true
  }
};