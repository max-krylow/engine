/// <amd-module name="engine/core/Traverse" />

import { SourceFile } from '../html/base/SourceFile';
import { SourceReader } from '../html/base/SourceReader';
import { getTagNodeDescription, NodeDescription, INodeDescriptions } from '../html/NodeDescription';
import { Parser, IOptions as IParserOptions } from '../html/Parser';
import { IErrorHandler } from '../utils/ErrorHandler';
import { TransformVisitor } from "./Transform";
import { Ast } from "./Ast";
import { isComponentName } from "./Names";
import { Parser as ExpressionParser } from '../expression/Parser';

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

export function getNodeDescription(name: string): NodeDescription {
   if (NODE_DESCRIPTION[name]) {
      return NODE_DESCRIPTION[name];
   }
   if (isComponentName(name)) {
      return COMPONENT_DESCRIPTION;
   }
   return getTagNodeDescription(name);
}

export function traverse(html: string, options: IOptions, errorHandler: IErrorHandler): Ast[] {
   const config = {
      ...options,
      nodeDescriptor: getNodeDescription
   };
   const htmlParser = new Parser(config, errorHandler);
   const transformer = new TransformVisitor(new ExpressionParser(), errorHandler);
   const reader = new SourceReader(new SourceFile(html, options.filePath));
   const tree = htmlParser.parse(reader);
   return transformer.transform(tree);
}

