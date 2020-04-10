/// <amd-module name="engine/html/TreeBuilder" />

import { NodeDescription } from "./NodeDescription";
import { SourceLocation } from "./base/SourceReader";
import { ITokenHandler } from "./base/ITokenizer";
import { IErrorHandler } from "../utils/ErrorHandler";
import { ITokenizer } from "./base/ITokenizer";
import { ContentModel } from "./base/ContentModel";
import * as Nodes from "./base/Nodes";

/**
 * @file src/html/TreeBuilder.ts
 */

/**
 *
 */
declare type TNodeDescriptor = (name: string) => NodeDescription;

/**
 *
 */
export default class TreeBuilder implements ITokenHandler {
   /**
    *
    */
   private readonly nodeDescriptor: TNodeDescriptor;
   /**
    *
    */
   private readonly errorHandler: IErrorHandler | undefined;
   /**
    *
    */
   private tree: Nodes.Node[] = [];
   /**
    *
    */
   private stack: Nodes.Tag[] = [];
   /**
    *
    */
   private dataNode: Nodes.Node | undefined;
   /**
    *
    */
   private tokenizer: ITokenizer | undefined;

   /**
    * Initialize new instance.
    */
   constructor(nodeDescriptor: TNodeDescriptor, errorHandler?: IErrorHandler) {
      this.nodeDescriptor = nodeDescriptor;
      this.errorHandler = errorHandler;
   }

   /**
    * Handle start token.
    * @param tokenizer
    */
   public onStart(tokenizer: ITokenizer): void {
      this.tree = [];
      this.stack = [];
      this.tokenizer = tokenizer;
   }

   /**
    * Handle open tag token.
    * @param name
    * @param attributes
    * @param selfClosing
    * @param location
    */
   public onOpenTag(name: string, attributes: Nodes.IAttributes, selfClosing: boolean, location: SourceLocation): void {
      const description = this.nodeDescriptor(name);
      if (selfClosing) {
         if (!(description.allowSelfClosing || description.isVoid)) {
            this.error(`Tag ${name} cannot be self-closing or void`);
         }
      }
      const node = new Nodes.Tag(name, attributes, location);
      node.isSelfClosing = selfClosing;
      node.isVoid = description.isVoid;
      this.appendNode(node);
      if ((!selfClosing && !description.isVoid)) {
         this.stack.push(node);
      }
      if (this.tokenizer && description.contentModel !== ContentModel.DATA) {
         this.tokenizer.setContentModel(description.contentModel, name);
      }
   }

   /**
    * Handle close tag token.
    * @param name
    * @param location
    */
   public onCloseTag(name: string, location: SourceLocation): void {
      const description = this.nodeDescriptor(name);
      this.dataNode = undefined;
      if (description.isVoid) {
         this.error(`End tag ${name}`);
      }
      this.popNode(name);
   }

   /**
    * Handle text token.
    * @param data
    * @param location
    */
   public onText(data: string, location: SourceLocation): void {
      if (this.dataNode instanceof Nodes.Text) {
         this.dataNode.value += data;
         this.dataNode.location = new SourceLocation(this.dataNode.location.start, location.end);
         return;
      }
      let node = new Nodes.Text(data, location);
      this.appendNode(node);
      this.dataNode = node;
   }

   /**
    * Handle comment token.
    * @param data
    * @param location
    */
   public onComment(data: string, location: SourceLocation): void {
      if (this.dataNode instanceof Nodes.Comment) {
         this.dataNode.value += data;
         this.dataNode.location = new SourceLocation(this.dataNode.location.start, location.end);
         return;
      }
      let node = new Nodes.Comment(data, location);
      this.appendNode(node);
      this.dataNode = node;
   }

   /**
    * Handle cdata token.
    * @param data
    * @param location
    */
   public onCDATA(data: string, location: SourceLocation): void {
      this.appendNode(new Nodes.CData(data, location));
   }

   /**
    * Handle doctype token.
    * @param data
    * @param location
    */
   public onDoctype(data: string, location: SourceLocation): void {
      this.appendNode(new Nodes.Doctype(data, location));
   }

   /**
    * Handle eof token.
    */
   public onEOF(): void {
      this.flushStack();
   }

   /**
    * Get resulting tree.
    */
   public getTree(): Nodes.Node[] {
      return this.tree;
   }

   /**
    * Append new tag node.
    * @param node
    */
   private appendNode(node: Nodes.Node): void {
      const parent = this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
      const siblings = parent ? parent.children : this.tree;
      const prev = siblings.length > 0 ? siblings[siblings.length - 1] : null;
      siblings.push(node);
      if (prev) {
         node.prev = prev;
         prev.next = node;
      }
      if (parent) {
         node.parent = parent;
      }
      this.dataNode = undefined;
   }

   /**
    * Handle error.
    * @param message
    */
   private error(message: string): void {
      if (this.errorHandler && typeof this.errorHandler.error === 'function') {
         this.errorHandler.error(message);
      }
   }

   /**
    * Pop nodes from stack of open nodes.
    * @param name
    */
   private popNode(name: string): void {
      for (let index = this.stack.length - 1; index >= 0; --index) {
         const node = this.stack[index];
         const currentNodeName = (node as Nodes.Tag).name;
         if (currentNodeName === name) {
            this.stack.splice(index, this.stack.length - index);
            return;
         }
         if (!this.nodeDescriptor(currentNodeName).closedByParent) {
            this.error(`Stray end tag ${name}`);
            return;
         }
      }
      this.error(`Stray end tag ${name}`);
   }

   /**
    * Flush stack of open nodes.
    */
   private flushStack(): void {
      for (let index = this.stack.length - 1; index >= 0; --index) {
         const node = this.stack[index];
         if (!this.nodeDescriptor(node.name).closedByParent) {
            this.error(`Unclosed element ${node.name}`);
         }
      }
   }
}
