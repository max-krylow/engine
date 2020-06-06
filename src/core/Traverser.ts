/// <amd-module name="engine/core/Traverser" />

import { SourceFile } from '../html/base/SourceFile';
import { SourceReader } from '../html/base/SourceReader';
import { getTagNodeDescription, NodeDescription, INodeDescriptions } from '../html/NodeDescription';
import { IParser, Parser, IOptions as IParserOptions } from '../html/Parser';
import { IErrorHandler } from '../utils/ErrorHandler';
import { IVisitor } from "../html/base/Nodes";
import { TransformVisitor } from "./Transformer";

export interface IOptions extends IParserOptions {
   // TODO
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

interface ITraversed {
   ast: any[];
   filePath: string;
}

export class Traverser {
   htmlParser: IParser;
   transformer: IVisitor<any, any>;

   constructor(options: IOptions, errorHandler: IErrorHandler) {
      const config = {
         ...options,
         nodeDescriptor: getNodeDescription
      };
      this.htmlParser = new Parser(config, errorHandler);
      this.transformer = new TransformVisitor();
   }

   traverse(html: string, filePath: string): ITraversed {
      const reader = new SourceReader(new SourceFile(html, filePath));
      const tree = this.htmlParser.parse(reader);
      const ast = this.transformer.visitAll(tree, { });
      return {
         ast,
         filePath
      };
   }
}
