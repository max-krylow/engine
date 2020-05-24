/// <amd-module name="engine/core/Transformer" />

import * as RawNodes from "../html/base/Nodes";
import * as AstNodes from "./Ast";

/**
 * @file src/core/Transformer.ts
 */

/**
 * Releases transformation from parse tree into abstract syntax tree.
 */
export class TransformVisitor implements RawNodes.IVisitor<any, AstNodes.Ast> {

   /**
    * Initialize new instance of transform visitor.
    * @todo Release finite state machine.
    */
   constructor() { }

   /**
    * Visit all nodes in the given array and generate their ast representation.
    * @param nodes {IVisitable} Collection of nodes.
    * @param context {*} Context.
    */
   visitAll(nodes: RawNodes.IVisitable[], context?: any): any {
      return nodes.map(node => node.accept(this, context));
   }

   /**
    * Visit attribute and generate its ast representation.
    * @param node {Attribute} Attribute node.
    * @param context {*} Context.
    * @todo Release attribute transform
    */
   visitAttribute(node: RawNodes.Attribute, context?: any): any {
      return { };
   }

   /**
    * Visit cdata node and generate its ast representation.
    * @param node {CData} CDATA section node.
    * @param context {*} Context.
    */
   visitCData(node: RawNodes.CData, context?: any): any {
      return new AstNodes.CDataNode(node.value);
   }

   /**
    * Visit comment node and generate its ast representation.
    * @param node {Comment} Comment node.
    * @param context {*} Context.
    */
   visitComment(node: RawNodes.Comment, context?: any): any {
      return new AstNodes.CommentNode(node.value);
   }

   /**
    * Visit doctype node and generate its ast representation.
    * @param node {Doctype} Doctype node.
    * @param context {*} Context.
    */
   visitDoctype(node: RawNodes.Doctype, context?: any): any {
      return new AstNodes.DoctypeNode(node.value);
   }

   /**
    * Visit tag node and generate its ast representation.
    * @param node {Tag} Tag node.
    * @param context {*} Context.
    */
   visitTag(node: RawNodes.Tag, context?: any): any {
      const attributes = { };
      const events = { };
      let ast = new AstNodes.ElementNode(node.name, attributes, events);
      ast.content = this.visitAll(node.children, context);
      return ast;
   }

   /**
    * Visit text node and generate its ast representation.
    * @param node {Text} Text node.
    * @param context {*} Context.
    * @todo Release parsing text.
    */
   visitText(node: RawNodes.Text, context?: any): any {
      return new AstNodes.TextNode(node.value);
   }
}
