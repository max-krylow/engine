/// <amd-module name="engine/html/Node" />

import Location from "../core/utils/Location";

/**
 *
 */
interface AttributeValue {
   /**
    *
    */
   readonly location: Location;
   /**
    *
    */
   readonly value: string | null;
}

/**
 *
 */
interface Attributes {
   /**
    *
    */
   [attribute: string]: AttributeValue;
}

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
   Script,
   /**
    *
    */
   Style,
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
   public readonly type: NodeType;
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
   public get parentNode(): NodeWithChildren | null {
      return this.parent || null;
   }

   /**
    *
    * @param parent
    */
   public set parentNode(parent: NodeWithChildren | null) {
      this.parent = parent;
   }

   /**
    *
    */
   public get nextSibling(): Node | null {
      return this.next || null;
   }

   /**
    *
    * @param next
    */
   public set nextSibling(next: Node | null) {
      this.next = next;
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
   public data: string;

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
   public get nodeValue(): string {
      return this.data;
   }

   /**
    *
    * @param data
    */
   public set nodeValue(data: string) {
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
 * @param name
 */
function getNodeTypeByName(name: string): NodeType {
   switch (name) {
      case 'script':
         return NodeType.Script;
      case 'style':
         return NodeType.Style;
      default:
         return NodeType.Tag;
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

   /**
    *
    */
   get firstChild(): Node | null {
      return this.children[0] || null;
   }

   /**
    *
    */
   get lastChild(): Node | null {
      return this.children[this.children.length - 1] || null;
   }

   /**
    *
    */
   get childNodes(): Node[] {
      return this.children;
   }

   /**
    *
    * @param children
    */
   set childNodes(children: Node[]) {
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
   public attribs: Attributes;
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
   constructor(name: string, attribs: Attributes, selfClosing: boolean) {
      super(getNodeTypeByName(name), []);
      this.name = name;
      this.attribs = attribs;
      this.selfClosing = selfClosing;
   }

   /**
    *
    */
   get tagName(): string {
      return this.name;
   }

   /**
    *
    * @param name
    */
   set tagName(name: string) {
      this.name = name;
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
