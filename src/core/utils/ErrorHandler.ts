/// <amd-module name="engine/core/utils/ErrorHandler" />

/**
 *
 * @file src/core/utils/ErrorHandler.ts
 */

import { ILogger } from "./ILogger";

/**
 * Interface for handler errors.
 */
export interface IErrorHandler {
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
   notice(message: string): void;

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
   critical(message: string): void;

   /**
    *
    * @param message
    */
   alert(message: string): void;

   /**
    *
    * @param message
    */
   fatal(message: string): void;
}

/**
 *
 */
export class ErrorHandler implements IErrorHandler {
   /**
    *
    */
   private readonly logger: ILogger;

   /**
    *
    * @param logger
    */
   constructor(logger: ILogger) {
      this.logger = logger;
   }

   /**
    *
    * @param message
    */
   debug(message: string): void {
      this.logger.debug(message);
   }

   /**
    *
    * @param message
    */
   info(message: string): void {
      this.logger.info(message);
   }

   /**
    *
    * @param message
    */
   notice(message: string): void {
      this.logger.info(message);
   }

   /**
    *
    * @param message
    */
   warn(message: string): void {
      this.logger.warn(message);
   }

   /**
    *
    * @param message
    */
   error(message: string): void {
      this.logger.error(message);
   }

   /**
    *
    * @param message
    */
   critical(message: string): void {
      this.logger.error(message);
   }

   /**
    *
    * @param message
    */
   alert(message: string): void {
      this.logger.error(message);
   }

   /**
    *
    * @param message
    */
   fatal(message: string): void {
      this.logger.error(message);
   }
}

