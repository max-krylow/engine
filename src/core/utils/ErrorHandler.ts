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
   DEBUG = 1,
   /**
    *
    */
   INFO = 2,
   /**
    *
    */
   WARN = 4,
   /**
    *
    */
   ERROR = 8,
   /**
    *
    */
   FATAL = 16
}

/**
 *
 */
class ErrorHandler implements IErrorHandler {
   /**
    *
    */
   private readonly level: ErrorHandlerLevel;
   /**
    *
    */
   private readonly emitter: IMessagesEmitter;

   /**
    *
    * @param level
    * @param emitter
    */
   constructor(level: ErrorHandlerLevel, emitter: IMessagesEmitter) {
      this.level = level;
      this.emitter = emitter;
   }

   /**
    *
    * @param message
    */
   debug(message: string): void {
      if (this.level & ErrorHandlerLevel.DEBUG) {
         this.emitter.debug(message);
      }
   }

   /**
    *
    * @param message
    */
   info(message: string): void {
      if (this.level & ErrorHandlerLevel.INFO) {
         this.emitter.debug(message);
      }
   }

   /**
    *
    * @param message
    */
   warn(message: string): void {
      if (this.level & ErrorHandlerLevel.WARN) {
         this.emitter.debug(message);
      }
   }

   /**
    *
    * @param message
    */
   error(message: string): void {
      if (this.level & ErrorHandlerLevel.ERROR) {
         this.emitter.debug(message);
      }
   }

   /**
    *
    * @param message
    */
   fatal(message: string): void {
      if (this.level & ErrorHandlerLevel.FATAL) {
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
