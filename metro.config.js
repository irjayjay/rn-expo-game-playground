// metro.config.js
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const TS = require.resolve('tslib/tslib.es6.js');

const alias = { tslib: TS };

config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (alias[moduleName]) {
        return {
            filePath: alias[moduleName],
            type: 'sourceFile',
        };
    }
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
