/// <amd-module name="engine/html/TreeBuilder" />

import Location from "../core/utils/Location";
import { DataNode, Node, NodeType, NodeWithChildren, TagNode } from "./Node";
import { INodeDescription } from "./Description";

import { ITokenHandler } from "./base/ITokenizer";
import { IErrorHandler } from "../core/utils/ErrorHandler";
import { ITokenizer } from "./base/ITokenizer";
import { IAttributes } from "./Attribute";

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
    *
    */
   constructor(nodeDescriptor: TNodeDescriptor) {
      this.nodeDescriptor = nodeDescriptor;
   }

   /**
    *
    * @param errorHandler
    */
   public setErrorHandler(errorHandler: IErrorHandler): void {
      this.errorHandler = errorHandler;
   }

   /**
    *
    */
   public getErrorHandler(): IErrorHandler {
      return this.errorHandler;
   }

   /**
    *
    * @param tokenizer
    */
   public onStart(tokenizer: ITokenizer): void {
      this.tree = [];
      this.stack = [];
      this.tokenizer = tokenizer;
   }

   /**
    *
    * @param name
    * @param attributes
    * @param selfClosing
    * @param location
    */
   public onOpenTag(name: string, attributes: IAttributes, selfClosing: boolean, location: Location): void {
      const description = this.nodeDescriptor(name);
      if (selfClosing) {
         if (!(description.allowSelfClosing || description.isVoid)) {
            this.error('tryToCloseVoidOrNotSelfClosingTag');
         }
      }
      let node = new TagNode(name, attributes, selfClosing, location);
      this.appendNode(node);
      if (!selfClosing) {
         this.stack.push(node);
      }
   }

   /**
    *
    * @param name
    * @param location
    */
   public onCloseTag(name: string, location: Location): void {
      const description = this.nodeDescriptor(name);
      this.dataNode = null;
      if (description.isVoid) {
         this.error('tryToCloseVoidTag');
      }
      this.popNode(name);
   }

   /**
    *
    * @param data
    * @param location
    */
   public onText(data: string, location: Location): void {
      this.appendDataNode(NodeType.Text, data, location);
   }

   /**
    *
    * @param data
    * @param location
    */
   public onComment(data: string, location: Location): void {
      this.appendDataNode(NodeType.Comment, data, location);
   }

   /**
    *
    * @param data
    * @param location
    */
   public onCDATA(data: string, location: Location): void {
      let node = new DataNode(NodeType.CDATA, data, location);
      this.appendNode(node);
   }

   /**
    *
    * @param data
    * @param location
    */
   public onDoctype(data: string, location: Location): void {
      let node = new DataNode(NodeType.Doctype, data, location);
      this.appendNode(node);
   }

   /**
    *
    */
   public onEOF(): void {
      this.flushStack();
   }

   /**
    *
    */
   public getTree(): Node[] {
      return this.tree;
   }

   /**
    *
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
    *
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
    *
    * @param message
    */
   private error(message: string): void {
      if (this.errorHandler && typeof this.errorHandler.error === 'function') {
         this.errorHandler.error(message);
      }
   }

   /**
    *
    * @param message
    */
   private warn(message: string): void {
      if (this.errorHandler && typeof this.errorHandler.warn === 'function') {
         this.errorHandler.warn(message);
      }
   }

   /**
    *
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
            this.error('unexpectedClosingTagNames');
            return;
         }
      }
      this.error('wantedCloseTag');
   }

   /**
    *
    */
   private flushStack(): void {
      for (let index = this.stack.length - 1; index >= 0; --index) {
         const node = this.stack[index];
         const currentNodeName = (node as TagNode).name;
         if (!this.nodeDescriptor(currentNodeName).closedByParent) {
            this.error('gotUnclosedTags');
         }
      }
   }
}

export {
   TreeBuilder
};
