/// <amd-module name="engine/html/TreeBuilder" />

import Location from "../core/utils/Location";
import { IAttributes, IBuilder } from "./Tokenizer";
import { DataNode, Node, NodeType, NodeWithChildren, TagNode } from "./Node";

/**
 *
 */
class TreeBuilder implements IBuilder {
   /**
    *
    */
   private tree: Node[];
   /**
    *
    */
   private stack: Node[];
   /**
    *
    */
   private dataNode: DataNode;

   /**
    *
    */
   constructor() {
      this.tree = [];
      this.stack = [];
   }

   /**
    *
    * @param name
    * @param attributes
    * @param selfClosing
    * @param location
    */
   public onOpenTag(name: string, attributes: IAttributes, selfClosing: boolean, location?: Location): void {
      let node = new TagNode(name, attributes, selfClosing);
      this.appendNode(node);
      this.stack.push(node);
   }

   /**
    *
    * @param name
    * @param location
    */
   public onCloseTag(name: string, location?: Location): void {
      this.dataNode = null;
      // check names
      this.stack.pop();
      // write additional info
   }

   /**
    *
    * @param data
    * @param location
    */
   public onText(data: string, location?: Location): void {
      this.appendDataNode(NodeType.Text, data, location);
   }

   /**
    *
    * @param data
    * @param location
    */
   public onComment(data: string, location?: Location): void {
      this.appendDataNode(NodeType.Comment, data, location);
   }

   /**
    *
    * @param data
    * @param location
    */
   public onCDATA(data: string, location?: Location): void {
      let node = new DataNode(NodeType.CDATA, data);
      this.appendNode(node);
   }

   /**
    *
    * @param data
    * @param location
    */
   public onDoctype(data: string, location?: Location): void {
      let node = new DataNode(NodeType.Doctype, data);
      this.appendNode(node);
   }

   /**
    *
    */
   public onEOF(): void {
      // TODO: release
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
   private appendDataNode(type: NodeType, data: string, location?: Location): void {
      if (this.dataNode && this.dataNode.type === type) {
         this.dataNode.data += data;
         return;
      }
      let node = new DataNode(type, data);
      this.appendNode(node);
      this.dataNode = node;
   }

}

export {
   TreeBuilder
};
