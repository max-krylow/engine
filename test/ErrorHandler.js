const { ErrorHandlerLevel, ErrorHandler } = require('engine/core/utils/ErrorHandler');

const CONSOLE_EMITTER = {
   debug: console.debug.bind(console),
   info: console.info.bind(console),
   warn: console.warn.bind(console),
   error: console.error.bind(console),
   fatal: console.error.bind(console)
};

const ERROR_HANDLER = new ErrorHandler(CONSOLE_EMITTER, ErrorHandlerLevel.DEBUG);

exports.ERROR_HANDLER = ERROR_HANDLER;
