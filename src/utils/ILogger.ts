/// <amd-module name="engine/utils/ILogger" />

/**
 * @file src/utils/ILogger.ts
 */

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
 * Represents methods for logger.
 */
export interface ILogger {
   /**
    * Log debug message.
    * @param message {string} Message text.
    */
   debug(message: string): void;

   /**
    * Log information message.
    * @param message {string} Message text.
    */
   info(message: string): void;

   /**
    * Log warning message.
    * @param message {string} Message text.
    */
   warn(message: string): void;

   /**
    * Log error message.
    * @param message {string} Message text.
    */
   error(message: string): void;

   /**
    * Disable all logging below the given level.
    * @param level {LoggerLevel} Logging level.
    */
   setLevel(level: LoggerLevel): void;
}
