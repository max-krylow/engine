/// <amd-module name="engine/html/Node" />

import { IAttributes } from "./Attributes";
import { SourceLocation } from "./base/SourceReader";

/**
 * @file src/html/Node.ts
 */

/**
 *
 */
export enum NodeType {
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
export class Node {
   /**
    *
    */
   readonly type: NodeType;
   /**
    *
    */
   location: SourceLocation;
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
    * @param type {NodeType}
    * @param location {SourceLocation}
    */
   constructor(type: NodeType, location: SourceLocation) {
      this.type = type;
      this.location = location;
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
export class DataNode extends Node {
   /**
    *
    */
   data: string;

   /**
    *
    * @param type
    * @param data
    * @param location {SourceLocation}
    */
   constructor(type: NodeType, data: string, location: SourceLocation) {
      super(type, location);
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
export class NodeWithChildren extends Node {
   /**
    *
    */
   children: Node[];

   /**
    *
    * @param type
    * @param children
    * @param location {SourceLocation}
    */
   constructor(type: NodeType, children: Node[], location: SourceLocation) {
      super(type, location);
      this.children = children;
   }
}

/**
 *
 */
export interface ITagNodeOptions {
   /**
    *
    */
   selfClosing: boolean;
   /**
    *
    */
   isVoid: boolean;
}

/**
 *
 */
export class TagNode extends NodeWithChildren {
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
    */
   public isVoid: boolean;

   /**
    *
    * @param name
    * @param attribs
    * @param options
    * @param location {SourceLocation}
    */
   constructor(name: string, attribs: IAttributes, options: ITagNodeOptions, location: SourceLocation) {
      super(NodeType.Tag, [], location);
      this.name = name;
      this.attribs = attribs;
      this.selfClosing = options.selfClosing;
      this.isVoid = options.isVoid;
   }

   /**
    *
    */
   public toString(): string {
      let attributes = '';
      for (let name in this.attribs) {
         if (this.attribs.hasOwnProperty(name)) {
            attributes += ` ${this.attribs[name]}`;
         }
      }
      if (this.isVoid) {
         return `<${this.name}${attributes}>`;
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

