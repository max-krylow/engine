/// <amd-module name="engine/html/base/Nodes" />

/**
 * @file src/html/base/Nodes.ts
 */

import { SourceLocation } from "./SourceReader";

/**
 * Interface that declares methods to visit nodes in the tree.
 * @param C Type of context.
 * @param R Type of visit functions return value.
 */
export interface IVisitor<C, R> {
   /**
    * Visit comment node.
    * @param node {Comment} Comment node.
    * @param context {*} Context.
    */
   visitText(node: Text, context?: C): R;

   /**
    *
    * @param node
    * @param context {*} Context.
    */
   visitComment(node: Comment, context?: C): R;

   /**
    * Visit CDATA section node.
    * @param node {CData} CDATA section node.
    * @param context {*} Context.
    */
   visitCData(node: CData, context?: C): R;

   /**
    * Visit doctype node.
    * @param node {Doctype} Doctype node.
    * @param context {*} Context.
    */
   visitDoctype(node: Doctype, context?: C): R;

   /**
    * Visit tag node.
    * @param node {Tag} Tag node.
    * @param context {*} Context.
    */
   visitTag(node: Tag, context?: C): R;

   /**
    * Visit all nodes in the given array.
    * @param nodes {IVisitable[]} Array of nodes.
    * @param context {*} Context.
    */
   visitAll(nodes: IVisitable[], context?: C): R;
}

/**
 * Interface for node that supports visiting.
 */
export interface IVisitable {
   /**
    * Accept visitor.
    * @param visitor {IVisitor} Concrete visitor.
    * @param context {*} Context.
    */
   accept(visitor: IVisitor<unknown, unknown>, context?: unknown): unknown;
}

/**
 * Abstract class for all nodes.
 */
export abstract class Node implements IVisitable {
   /**
    * Attribute location in source.
    */
   location: SourceLocation;
   /**
    * Reference to parent node.
    */
   parent: Node | null = null;
   /**
    * Reference to previous sibling node.
    */
   prev: Node | null = null;
   /**
    * Reference to next sibling node.
    */
   next: Node | null = null;

   /**
    * Initialize instance with location.
    * @param location {SourceLocation} Location in source.
    */
   protected constructor(location: SourceLocation) {
      this.location = location;
   }

   /**
    * Accept visitor.
    * @param visitor {IVisitor} Concrete visitor.
    * @param context {*} Context.
    */
   abstract accept(visitor: IVisitor<unknown, unknown>, context?: unknown): unknown;
}

/**
 * Attribute node.
 */
export class Attribute {
   /**
    * Attribute name.
    */
   name: string;
   /**
    * Attribute value.
    */
   value: string | null;
   /**
    * Attribute location in source.
    */
   location: SourceLocation;

   /**
    * Initialize new instance of attribute.
    * @param name {string} Attribute name.
    * @param value {string | null} Attribute value.
    * @param location {SourceLocation} Attribute location in source.
    */
   constructor(name: string, value: string | null, location: SourceLocation) {
      this.name = name;
      this.value = value;
      this.location = location;
   }
}

/**
 * Interface for attributes collection.
 */
export interface IAttributes {
   /**
    * @name {string} Attribute name.
    * @returns {Attribute} Attribute instance.
    */
   [name: string]: Attribute;
}

/**
 * Represents text node.
 */
export class Text extends Node {
   /**
    * Text content.
    */
   value: string;

   /**
    * Initialize new instance of text.
    * @param value {string} Text content.
    * @param location {SourceLocation} Text location in source.
    */
   constructor(value: string, location: SourceLocation) {
      super(location);
      this.value = value;
      this.location = location;
   }

   /**
    * Accept visitor.
    * @param visitor {IVisitor} Concrete visitor.
    * @param context {*} Context.
    */
   accept(visitor: IVisitor<unknown, unknown>, context?: unknown): unknown {
      return visitor.visitText(this, context);
   }
}

/**
 * Represents comment node.
 */
export class Comment extends Node {
   /**
    * Comment content.
    */
   value: string;

   /**
    * Initialize new instance of comment.
    * @param value {string} Comment content.
    * @param location {SourceLocation} Comment location in source.
    */
   constructor(value: string, location: SourceLocation) {
      super(location);
      this.value = value;
      this.location = location;
   }

   /**
    * Accept visitor.
    * @param visitor {IVisitor} Concrete visitor.
    * @param context {*} Context.
    */
   accept(visitor: IVisitor<unknown, unknown>, context?: unknown): unknown {
      return visitor.visitComment(this, context);
   }
}

/**
 * Represents CDATA section node.
 */
export class CData extends Node {
   /**
    * Cdata section content.
    */
   value: string;

   /**
    * Initialize new instance of cdata section.
    * @param value {string} Cdata section content.
    * @param location {SourceLocation} Cdata section location in source.
    */
   constructor(value: string, location: SourceLocation) {
      super(location);
      this.value = value;
      this.location = location;
   }

   /**
    * Accept visitor.
    * @param visitor {IVisitor} Concrete visitor.
    * @param context {*} Context.
    */
   accept(visitor: IVisitor<unknown, unknown>, context?: unknown): unknown {
      return visitor.visitCData(this, context);
   }
}

/**
 * Represents doctype declaration node.
 */
export class Doctype extends Node {
   /**
    * Doctype declaration content.
    */
   value: string;

   /**
    * Initialize new instance of doctype.
    * @param value {string} Doctype declaration content.
    * @param location {SourceLocation} Doctype declaration location in source.
    */
   constructor(value: string, location: SourceLocation) {
      super(location);
      this.value = value;
      this.location = location;
   }

   /**
    * Accept visitor.
    * @param visitor {IVisitor} Concrete visitor.
    * @param context {*} Context.
    */
   accept(visitor: IVisitor<unknown, unknown>, context?: unknown): unknown {
      return visitor.visitDoctype(this, context);
   }
}

/**
 * Represents tag node.
 */
export class Tag extends Node {
   /**
    * Tag name.
    */
   name: string;
   /**
    * Tag attributes collection.
    */
   attributes: IAttributes;
   /**
    * Tag node children collection.
    */
   children: Tag[] = [];
   /**
    * Flag weather node is self-closing.
    */
   isSelfClosing: boolean = false;
   /**
    * Flag weather node is void.
    */
   isVoid: boolean = false;

   /**
    * Initialize new instance of tag node.
    * @param name {string} Tag name.
    * @param attributes {IAttributes} Attributes collection.
    * @param location {SourceLocation} Tag node location in source.
    */
   constructor(name: string, attributes: IAttributes, location: SourceLocation) {
      super(location);
      this.name = name;
      this.attributes = attributes;
      this.location = location;
   }

   /**
    * Accept visitor.
    * @param visitor {IVisitor} Concrete visitor.
    * @param context {*} Context.
    */
   accept(visitor: IVisitor<unknown, unknown>, context?: unknown): unknown {
      return visitor.visitTag(this, context);
   }
}

/**
 * Markup visitor.
 * Recursively visit all nodes in given tree
 * and returns string representation.
 */
export class MarkupVisitor implements IVisitor<void, string> {
   /**
    * Visit text node and return its content.
    * @param node {Text} Text node.
    */
   visitText(node: Text): string {
      return node.value;
   }

   /**
    * Visit comment node and generate string representation.
    * @param node {Comment} Comment node.
    */
   visitComment(node: Comment): string {
      return `<!--${node.value}-->`;
   }

   /**
    * Visit cdata node and generate string representation.
    * @param node {CData} CDATA section node.
    */
   visitCData(node: CData): string {
      return `<![CDATA[${node.value}]]>`;
   }

   /**
    * Visit doctype node and generate string representation.
    * @param node {Doctype} Doctype node.
    */
   visitDoctype(node: Doctype): string {
      return `<!DOCTYPE ${node.value}>`;
   }

   /**
    * Visit attributes and generate string representation.
    * @param attributes {IAttributes} Attributes collection.
    */
   visitAttributes(attributes: IAttributes): string {
      let str = '';
      for (let name in attributes) {
         if (attributes.hasOwnProperty(name)) {
            if (attributes[name].value) {
               str += ` ${attributes[name].name}="${attributes[name].value}"`;
            } else {
               str += ` ${attributes[name].name}`;
            }
         }
      }
      return str;
   }

   /**
    * Visit tag node and generate its string representation.
    * @param node {Tag} Tag node.
    */
   visitTag(node: Tag): string {
      const attributes = this.visitAttributes(node.attributes);
      if (node.isVoid) {
         return `<${node.name}${attributes}>`;
      }
      if (node.isSelfClosing) {
         return `<${node.name}${attributes} />`;
      }
      return `<${node.name}${attributes}>${this.visitAll(node.children)}</${node.name}>`;
   }

   /**
    * Visit all nodes in the given array and generate string representation.
    * @param nodes {IVisitable[]} Array of nodes.
    */
   visitAll(nodes: IVisitable[]): string {
      return nodes.map(child => child.accept(this)).join('');
   }
}
