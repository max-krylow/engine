/// <amd-module name="engine/core/utils/Buffer" />

const LINE_FEED = '\n';
const NULL_REPLACEMENT = '\ufffd';

/**
 *
 */
interface IBuffer<T> {
   /**
    *
    */
   consume(): T | null;

   /**
    *
    */
   reconsume(): void;
}

/**
 *
 */
interface INavigation {
   /**
    *
    */
   getLine(): number;

   /**
    *
    */
   getColumn(): number;
}

function preprocess(value: string): string {
   return value
      .replace(/\n\r/ig, LINE_FEED)
      .replace(/\r\n/ig, LINE_FEED)
      .replace(/\u0000/ig, NULL_REPLACEMENT);
}

/**
 *
 */
export default class Buffer implements IBuffer<string>, INavigation {
   private readonly buffer: string;
   private position: number;
   private reconsumeFlag: boolean;
   private line: number;
   private column: number;
   private lastLF: boolean;

   /**
    *
    * @param buffer
    */
   constructor(buffer: string) {
      this.buffer = preprocess(buffer);
      this.position = -1;
      this.reconsumeFlag = false;
      this.line = 0;
      this.column = -1;
      this.lastLF = false;
   }

   /**
    *
    */
   public consume(): string | null {
      if (this.reconsumeFlag) {
         this.reconsumeFlag = false;
         return this.buffer[this.position] || null;
      }
      if (this.position < this.buffer.length) {
         ++this.position;
         ++this.column;
      }
      const char = this.buffer[this.position] || null;
      if (this.lastLF) {
         this.lastLF = false;
         this.column = 0;
         ++this.line;
      }
      if (char === LINE_FEED) {
         this.lastLF = true;
      }
      return char;
   }

   /**
    *
    */
   public reconsume(): void {
      if (this.position > -1 && this.position < this.buffer.length) {
         this.reconsumeFlag = true;
      }
   }

   /**
    *
    */
   public getLine(): number {
      return this.line;
   }

   /**
    *
    */
   public getColumn(): number {
      return this.column;
   }
}
