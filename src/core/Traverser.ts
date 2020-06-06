/// <amd-module name="engine/core/Traverser" />

import { SourceFile } from '../html/base/SourceFile';
import { SourceReader } from '../html/base/SourceReader';
import { getTagNodeDescription, NodeDescription, INodeDescriptions } from '../html/NodeDescription';
import { IParser, Parser, IOptions as IParserOptions } from '../html/Parser';
import { IErrorHandler } from '../utils/ErrorHandler';
import {TransformVisitor, ITransformedResult, ITransformer } from "./Transformer";

export interface IOptions extends IParserOptions {
   filePath: string;
}

const NODE_DESCRIPTION: INodeDescriptions = {
   'ws:if': new NodeDescription({
      isVoid: false,
      allowSelfClosing: false
   }),
   'ws:for': new NodeDescription({
      isVoid: false,
      allowSelfClosing: false
   }),
   'ws:foreach': new NodeDescription({
      isVoid: false,
      allowSelfClosing: false
   }),
   'ws:template': new NodeDescription({
      isVoid: false,
      allowSelfClosing: false
   }),
   'ws:partial': new NodeDescription({
      isVoid: false,
      allowSelfClosing: true
   })
};

const COMPONENT_DESCRIPTION = new NodeDescription({
   allowSelfClosing: true
});

function isComponentName(name: string): boolean {
   return /(\w+[\.:])+\w+/gi.test(name);
}

export function getNodeDescription(name: string): NodeDescription {
   if (NODE_DESCRIPTION[name]) {
      return NODE_DESCRIPTION[name];
   }
   if (isComponentName(name)) {
      return COMPONENT_DESCRIPTION;
   }
   return getTagNodeDescription(name);
}

export interface ITraversedResult extends ITransformedResult {
   ast: any[];
   filePath: string;
}

export class Traverser {
   htmlParser: IParser;
   transformer: ITransformer;

   constructor(options: IOptions, errorHandler: IErrorHandler) {
      const config = {
         ...options,
         nodeDescriptor: getNodeDescription
      };
      this.htmlParser = new Parser(config, errorHandler);
      this.transformer = new TransformVisitor();
   }

   traverse(html: string, options: IOptions): ITraversedResult {
      const reader = new SourceReader(new SourceFile(html, options.filePath));
      const tree = this.htmlParser.parse(reader);
      const traversed = this.transformer.transform(tree);
      return {
         ...traversed,
         filePath: options.filePath
      };
   }
}
