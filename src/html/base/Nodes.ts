/// <amd-module name="engine/html/base/Nodes" />

/**
 * @file src/html/base/Nodes.ts
 */

import { SourceLocation } from "./SourceReader";

export interface IVisitor {
   visitAttribute(node: Attribute, context: any): any;
   visitText(node: Text, context: any): any;
   visitComment(node: Comment, context: any): any;
   visitCData(node: CData, context: any): any;
   visitDoctype(node: Doctype, context: any): any;
   visitTag(node: Tag, context: any): any;
   visitAll(nodes: IVisitable[], context: any): any;
}

export interface IVisitable {
   accept(visitor: IVisitor, context: any): any;
}

export abstract class Node implements IVisitable {
   parent: Node | null = null;
   prev: Node | null = null;
   next: Node | null = null;

   abstract accept(visitor: IVisitor, context: any): any;
}

export class Attribute implements IVisitable {
   name: string;
   value: string | null;
   location: SourceLocation;

   constructor(name: string, value: string | null, location: SourceLocation) {
      this.name = name;
      this.value = value;
      this.location = location;
   }

   accept(visitor: IVisitor, context: any): any {
      return visitor.visitAttribute(this, context);
   }
}

export interface IAttributes {
   [name: string]: Attribute;
}

export class Text extends Node {
   value: string;
   location: SourceLocation;

   constructor(value: string, location: SourceLocation) {
      super();
      this.value = value;
      this.location = location;
   }

   accept(visitor: IVisitor, context: any): any {
      return visitor.visitText(this, context);
   }
}

export class Comment extends Node {
   value: string;
   location: SourceLocation;

   constructor(value: string, location: SourceLocation) {
      super();
      this.value = value;
      this.location = location;
   }

   accept(visitor: IVisitor, context: any): any {
      return visitor.visitComment(this, context);
   }
}

export class CData extends Node {
   value: string;
   location: SourceLocation;

   constructor(value: string, location: SourceLocation) {
      super();
      this.value = value;
      this.location = location;
   }

   accept(visitor: IVisitor, context: any): any {
      return visitor.visitCData(this, context);
   }
}

export class Doctype extends Node {
   value: string;
   location: SourceLocation;

   constructor(value: string, location: SourceLocation) {
      super();
      this.value = value;
      this.location = location;
   }

   accept(visitor: IVisitor, context: any): any {
      return visitor.visitDoctype(this, context);
   }
}

export class Tag extends Node {
   name: string;
   attributes: IAttributes;
   children: Tag[] = [];
   location: SourceLocation;
   isSelfClosing: boolean = false;
   isVoid: boolean = false;

   constructor(name: string, attributes: IAttributes, location: SourceLocation) {
      super();
      this.name = name;
      this.attributes = attributes;
      this.location = location;
   }

   accept(visitor: IVisitor, context: any): any {
      return visitor.visitTag(this, context);
   }
}

export class MarkupVisitor implements IVisitor {
   visitAttribute(node: Attribute): any {
      if (node.value) {
         return `${node.name}="${node.value}"`;
      }
      return node.name;
   }

   visitText(node: Text): any {
      return node.value;
   }

   visitComment(node: Comment): any {
      return `<!--${node.value}-->`;
   }

   visitCData(node: CData): any {
      return `<![CDATA[${node.value}]]>`;
   }

   visitDoctype(node: Doctype): any {
      return `<!DOCTYPE ${node.value}>`;
   }

   visitTag(node: Tag, context: any): any {
      const attributes = this.visitAttributes(node.attributes, context);
      if (node.isVoid) {
         return `<${node.name}${attributes}>`;
      }
      if (node.isSelfClosing) {
         return `<${node.name}${attributes} />`;
      }
      return `<${node.name}${attributes}>${this.visitAll(node.children, context)}</${node.name}>`;
   }

   visitAll(nodes: IVisitable[], context: any): any {
      return nodes.map(child => child.accept(this, context)).join('');
   }

   visitAttributes(attributes: IAttributes, context: any): any {
      let str = '';
      for (let name in attributes) {
         if (attributes.hasOwnProperty(name)) {
            str += ` ${attributes[name].accept(this, context)}`;
         }
      }
      return str;
   }
}
