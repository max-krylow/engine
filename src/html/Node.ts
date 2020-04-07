/// <amd-module name="engine/html/Node" />

import { IAttributes } from "./Attribute";

/**
 *
 */
enum NodeType {
   /**
    *
    */
   Tag,
   /**
    *
    */
   Text,
   /**
    *
    */
   CDATA,
   /**
    *
    */
   Comment,
   /**
    *
    */
   Doctype
}

/**
 *
 */
class Node {
   /**
    *
    */
   readonly type: NodeType;
   /**
    *
    */
   parent: NodeWithChildren | null;
   /**
    *
    */
   prev: Node | null;
   /**
    *
    */
   next: Node | null;

   /**
    *
    * @param type
    */
   constructor(type: NodeType) {
      this.type = type;
      this.parent = null;
      this.prev = null;
      this.next = null;
   }

   /**
    *
    */
   public toString(): string {
      return '';
   }
}

/**
 *
 */
class DataNode extends Node {
   /**
    *
    */
   data: string;

   /**
    *
    * @param type
    * @param data
    */
   constructor(type: NodeType, data: string) {
      super(type);
      this.data = data;
   }

   /**
    *
    */
   public toString(): string {
      if (this.type === NodeType.Comment) {
         return `<!--${this.data}-->`;
      }
      if (this.type === NodeType.CDATA) {
         return `<![CDATA[${this.data}]]>`;
      }
      if (this.type === NodeType.Doctype) {
         return `<!DOCTYPE ${this.data}>`;
      }
      return this.data;
   }
}

/**
 *
 */
class NodeWithChildren extends Node {
   /**
    *
    */
   children: Node[];

   /**
    *
    * @param type
    * @param children
    */
   constructor(type: NodeType, children: Node[]) {
      super(type);
      this.children = children;
   }
}

/**
 *
 */
class TagNode extends NodeWithChildren {
   /**
    *
    */
   public name: string;
   /**
    *
    */
   public attribs: IAttributes;
   /**
    *
    */
   public selfClosing: boolean;

   /**
    *
    * @param name
    * @param attribs
    * @param selfClosing
    */
   constructor(name: string, attribs: IAttributes, selfClosing: boolean) {
      super(NodeType.Tag, []);
      this.name = name;
      this.attribs = attribs;
      this.selfClosing = selfClosing;
   }

   /**
    *
    */
   public toString(): string {
      let attributes = '';
      for (let name in this.attribs) {
         if (this.attribs.hasOwnProperty(name)) {
            attributes += ` ${name}`;
            if (this.attribs[name].value) {
               attributes += `="${this.attribs[name].value}"`;
            }
         }
      }
      if (this.selfClosing) {
         return `<${this.name}${attributes} />`;
      }
      const head = `<${this.name}${attributes}>`;
      let body = '';
      for (let i = 0; i < this.children.length; ++i) {
         body += this.children[i].toString();
      }
      const tail = `</${this.name}>`;
      return head + body + tail;
   }
}

export {
   Node,
   NodeWithChildren,
   NodeType,
   DataNode,
   TagNode
};
