const { ErrorHandler } = require('engine/utils/ErrorHandler');

const CONSOLE_LOGGER = {
   debug: console.log.bind(console),
   info: console.log.bind(console),
   warn: console.warn.bind(console),
   error: console.error.bind(console),
   fatal: console.error.bind(console)
};

exports.ERROR_HANDLER = new ErrorHandler(CONSOLE_LOGGER);
