/// <amd-module name="engine/html/Parser" />

/**
 * @file src/html/Parser.ts
 */

import { ISourceReader } from "./base/SourceReader";
import { Node } from "./base/Nodes";
import { ITokenizerOptions } from "./Tokenizer";
import { NodeDescription } from "./NodeDescription";
import TreeBuilder from "./TreeBuilder";
import { IErrorHandler } from "../utils/ErrorHandler";
import { Tokenizer } from "./Tokenizer";

export interface IParser {
   parse(reader: ISourceReader): Node[];
}

export interface IOptions extends ITokenizerOptions {
   nodeDescriptor: (name: string) => NodeDescription;
}

export class Parser implements IParser {
   private readonly builder: TreeBuilder;
   private readonly tokenizer: Tokenizer;

   constructor(options: IOptions, errorHandler: IErrorHandler) {
      this.builder = new TreeBuilder(options.nodeDescriptor, errorHandler);
      this.tokenizer = new Tokenizer(this.builder, options, errorHandler);
   }

   parse(reader: ISourceReader): Node[] {
      this.tokenizer.start();
      this.tokenizer.tokenize(reader);
      return this.builder.getTree();
   }
}
