const { ErrorHandler } = require('engine/utils/ErrorHandler');

const CONSOLE_LOGGER = {
   debug: console.debug.bind(console),
   info: console.info.bind(console),
   warn: console.warn.bind(console),
   error: console.error.bind(console)
};

exports.ERROR_HANDLER = new ErrorHandler(CONSOLE_LOGGER);
