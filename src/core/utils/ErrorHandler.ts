/// <amd-module name="engine/core/utils/ErrorHandler" />

/**
 *
 */
interface IErrorHandler {
   /**
    *
    * @param message
    */
   debug(message: string): void;
   /**
    *
    * @param message
    */
   info(message: string): void;
   /**
    *
    * @param message
    */
   warn(message: string): void;
   /**
    *
    * @param message
    */
   error(message: string): void;
   /**
    *
    * @param message
    */
   fatal(message: string): void;
}

/**
 *
 */
interface IMessagesEmitter {
   /**
    *
    * @param message
    */
   debug(message: string): void;
   /**
    *
    * @param message
    */
   info(message: string): void;
   /**
    *
    * @param message
    */
   warn(message: string): void;
   /**
    *
    * @param message
    */
   error(message: string): void;
   /**
    *
    * @param message
    */
   fatal(message: string): void;
}

/**
 *
 */
enum ErrorHandlerLevel {
   /**
    *
    */
   NONE = 0,
   /**
    *
    */
   DEBUG = 1,
   /**
    *
    */
   INFO = 2,
   /**
    *
    */
   WARN = 3,
   /**
    *
    */
   ERROR = 4,
   /**
    *
    */
   FATAL = 5
}

/**
 *
 */
class ErrorHandler implements IErrorHandler {
   /**
    *
    */
   private readonly emitter: IMessagesEmitter;
   /**
    *
    */
   private readonly level: ErrorHandlerLevel;

   /**
    *
    * @param level
    * @param emitter
    */
   constructor(emitter: IMessagesEmitter, level: ErrorHandlerLevel) {
      this.emitter = emitter;
      this.level = level;
   }

   /**
    *
    * @param message
    */
   debug(message: string): void {
      if (this.level >= ErrorHandlerLevel.DEBUG) {
         this.emitter.debug(message);
      }
   }

   /**
    *
    * @param message
    */
   info(message: string): void {
      if (this.level >= ErrorHandlerLevel.INFO) {
         this.emitter.debug(message);
      }
   }

   /**
    *
    * @param message
    */
   warn(message: string): void {
      if (this.level >= ErrorHandlerLevel.WARN) {
         this.emitter.debug(message);
      }
   }

   /**
    *
    * @param message
    */
   error(message: string): void {
      if (this.level >= ErrorHandlerLevel.ERROR) {
         this.emitter.debug(message);
      }
   }

   /**
    *
    * @param message
    */
   fatal(message: string): void {
      if (this.level >= ErrorHandlerLevel.FATAL) {
         this.emitter.debug(message);
      }
   }
}

export {
   IErrorHandler,
   IMessagesEmitter,
   ErrorHandlerLevel,
   ErrorHandler
};
