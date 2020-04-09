/// <amd-module name="engine/html/TreeBuilder" />

import Location from "../core/utils/Location";
import { DataNode, Node, NodeType, NodeWithChildren, TagNode, ITagNodeOptions } from "./Node";
import { INodeDescription } from "./NodeDescription";

import { ITokenHandler } from "./base/ITokenizer";
import { IErrorHandler } from "../core/utils/ErrorHandler";
import { ITokenizer } from "./base/ITokenizer";
import { IAttributes } from "./Attribute";
import { ContentModel } from "./base/ContentModel";

/**
 *
 */
declare type TNodeDescriptor = (name: string) => INodeDescription;

/**
 *
 */
class TreeBuilder implements ITokenHandler {
   /**
    *
    */
   private readonly nodeDescriptor: TNodeDescriptor;
   /**
    *
    */
   private tree: Node[] = null;
   /**
    *
    */
   private stack: Node[] = null;
   /**
    *
    */
   private dataNode: DataNode = null;
   /**
    *
    */
   private errorHandler: IErrorHandler = null;
   /**
    *
    */
   private tokenizer: ITokenizer = null;

   /**
    * Inialize new instance.
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
   public onOpenTag(name: string, attributes: IAttributes, selfClosing: boolean, location: Location): void {
      const description = this.nodeDescriptor(name);
      if (selfClosing) {
         if (!(description.allowSelfClosing || description.isVoid)) {
            this.error(`Tag ${name} cannot be self-closing or void`);
         }
      }
      const options: ITagNodeOptions = {
         selfClosing,
         isVoid: description.isVoid
      };
      let node = new TagNode(name, attributes, options, location);
      this.appendNode(node);
      if ((!selfClosing && !description.isVoid)) {
         this.stack.push(node);
      }
      if (description.contentModel !== ContentModel.DATA) {
         this.tokenizer.setContentModel(description.contentModel, name);
      }
   }

   /**
    * Handle close tag token.
    * @param name
    * @param location
    */
   public onCloseTag(name: string, location: Location): void {
      const description = this.nodeDescriptor(name);
      this.dataNode = null;
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
   public onText(data: string, location: Location): void {
      this.appendDataNode(NodeType.Text, data, location);
   }

   /**
    * Handle comment token.
    * @param data
    * @param location
    */
   public onComment(data: string, location: Location): void {
      this.appendDataNode(NodeType.Comment, data, location);
   }

   /**
    * Handle cdata token.
    * @param data
    * @param location
    */
   public onCDATA(data: string, location: Location): void {
      let node = new DataNode(NodeType.CDATA, data, location);
      this.appendNode(node);
   }

   /**
    * Handle doctype token.
    * @param data
    * @param location
    */
   public onDoctype(data: string, location: Location): void {
      let node = new DataNode(NodeType.Doctype, data, location);
      this.appendNode(node);
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
   public getTree(): Node[] {
      return this.tree;
   }

   /**
    * Append new tag node.
    * @param node
    */
   private appendNode(node: Node): void {
      const parent = this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
      const siblings = parent ? (parent as NodeWithChildren).children : this.tree;
      const prev = siblings.length > 0 ? siblings[siblings.length - 1] : null;
      siblings.push(node);
      if (prev) {
         node.prev = prev;
         prev.next = node;
      }
      if (parent) {
         node.parent = parent as NodeWithChildren;
      }
      this.dataNode = null;
   }

   /**
    * Append new data node.
    * @param type
    * @param data
    * @param location
    */
   private appendDataNode(type: NodeType, data: string, location: Location): void {
      if (this.dataNode && this.dataNode.type === type) {
         this.dataNode.data += data;
         this.dataNode.location = new Location(this.dataNode.location.start, location.end);
         return;
      }
      let node = new DataNode(type, data, location);
      this.appendNode(node);
      this.dataNode = node;
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
         const currentNodeName = (node as TagNode).name;
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
         const currentNodeName = (node as TagNode).name;
         if (!this.nodeDescriptor(currentNodeName).closedByParent) {
            this.error(`Unclosed element ${currentNodeName}`);
         }
      }
   }
}

export {
   TreeBuilder
};
