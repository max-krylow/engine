/// <amd-module name="engine/core/Transformer" />

import * as RawNodes from "../html/base/Nodes";
import * as AstNodes from "./Ast";

/**
 * @file src/core/Transformer.ts
 */

export class TransformVisitor implements RawNodes.IVisitor {
   constructor() {
      // TODO: Release finite state machine
   }

   visitAll(nodes: RawNodes.IVisitable[], context?: any): any {
      return nodes.map(node => node.accept(this, context));
   }

   visitAttribute(node: RawNodes.Attribute, context?: any): any {
      // TODO: Release attribute transform
      return { };
   }

   visitCData(node: RawNodes.CData, context?: any): any {
      return new AstNodes.CDataNode(node.value);
   }

   visitComment(node: RawNodes.Comment, context?: any): any {
      return new AstNodes.CommentNode(node.value);
   }

   visitDoctype(node: RawNodes.Doctype, context?: any): any {
      return new AstNodes.DoctypeNode(node.value);
   }

   visitTag(node: RawNodes.Tag, context?: any): any {
      return this.transform(node, context);
   }

   visitText(node: RawNodes.Text, context?: any): any {
      return new AstNodes.TextNode(node.value);
   }

   private transform(node: RawNodes.Tag, context?: any): any {
      // TODO: Release context transform using finite state machine
      return this.transformElement(node, context);
   }

   private transformElement(node: RawNodes.Tag, context?: any): any {
      const attributes = { };
      const events = { };
      let ast = new AstNodes.ElementNode(node.name, attributes, events);
      ast.content = this.visitAll(node.children, context);
      return ast;
   }
}
