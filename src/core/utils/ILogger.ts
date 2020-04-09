/// <amd-module name="engine/core/utils/ILogger" />

/**
 *
 */
export enum LoggerLevel {
   /**
    *
    */
   DEBUG,
   /**
    *
    */
   INFO,
   /**
    *
    */
   WARN,
   /**
    *
    */
   ERROR
}

/**
 *
 */
export interface ILogger {
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
    * @param level
    */
   setLevel(level: LoggerLevel): void;
}
