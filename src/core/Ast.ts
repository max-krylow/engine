/// <amd-module name="engine/core/Ast" />

import { Expression } from "../expression/Expression";

/**
 * @file src/core/Ast.ts
 */

export enum Flags {
   /**
    * Flag for broken node that should be ignored.
    */
   BROKEN = 1,
   /**
    * Flag for unpacked node that has been changed its view.
    */
   UNPACKED = 2,
   /**
    * Flag for broken node that was repaired.
    */
   REPAIRED = 4
}

/**
 * Data representation type.
 */
declare type TData = ArrayNode | BooleanNode | FunctionNode | NumberNode | ObjectNode | StringNode | ValueNode;

/**
 * Text representation type.
 */
declare type TText = ProgramNode | TextNode;

/**
 * Content representation type.
 */
declare type TContent = PartialNode | IfNode | ElseNode | ForNode | ForeachNode | ElementNode | ProgramNode | TextNode;

/**
 * Interface for attributes collection.
 */
export interface IAttributesCollection {
   /**
    * @name {string} Attribute name.
    * @returns {TText} Text or program node.
    */
   [name: string]: TText;
}

/**
 * Interface for control or object properties.
 */
export interface IObjectProperties {
   /**
    * @name {string} Control or object property.
    * @returns {TData | TContent} Content of object property.
    */
   [name: string]: TData | TContent;
}

/**
 * Represents interface for event handlers.
 */
export interface IEventsCollection {
   /**
    * @name {string} Event name.
    * @returns {ProgramNode} Event handler.
    */
   [name: string]: ProgramNode;
}

/**
 * Interface for visitor of abstract syntax nodes.
 */
export interface IAstVisitor {
   visitArray(node: ArrayNode, context: any): any;
   visitBoolean(node: BooleanNode, context: any): any;
   visitFunction(node: FunctionNode, context: any): any;
   visitNumber(node: NumberNode, context: any): any;
   visitObject(node: ObjectNode, context: any): any;
   visitString(node: StringNode, context: any): any;
   visitValue(node: ValueNode, context: any): any;
   visitTemplate(node: TemplateNode, context: any): any;
   visitPartial(node: PartialNode, context: any): any;
   visitControl(node: ControlNode, context: any): any;
   visitIf(node: IfNode, context: any): any;
   visitElse(node: ElseNode, context: any): any;
   visitFor(node: ForNode, context: any): any;
   visitForeach(node: ForeachNode, context: any): any;
   visitElement(node: ElementNode, context: any): any;
   visitText(node: TextNode, context: any): any;
   visitDoctype(node: DoctypeNode, context: any): any;
   visitCData(node: CDataNode, context: any): any;
   visitComment(node: CommentNode, context: any): any;
   visitProgram(node: ProgramNode, context: any): any;
}

/**
 * Declares abstract class for node of abstract syntax tree.
 */
export abstract class Ast {
   /**
    * Processing flags.
    */
   flags: Flags;

   /**
    * Initialize new instance of abstract syntax node.
    * @param flags Initialize flags.
    */
   protected constructor(flags: Flags = 0) {
      this.flags = flags;
   }

   /**
    *
    * @param visitor {IAstVisitor} Concrete visitor.
    * @param context {*} Context.
    */
   abstract accept(visitor: IAstVisitor, context: any): any;
}

/**
 * Abstract class for node of abstract syntax tree that
 * contains attributes and event handlers.
 */
export abstract class ActiveNode extends Ast {
   /**
    * Node attributes.
    */
   attributes: IAttributesCollection;
   /**
    * Node event handlers.
    */
   events: IEventsCollection;

   /**
    * Initialize new instance of abstract syntax node.
    * @param attributes {IAttributesCollection} Node attributes.
    * @param events {IEventsCollection} Node event handlers.
    */
   protected constructor(attributes: IAttributesCollection, events: IEventsCollection) {
      super();
      this.attributes = attributes;
      this.events = events;
   }
}

/**
 * Represents node for ws:Array tag.
 *
 * ```
 *    <ws:Array>
 *       elements
 *    </ws:Array>
 * ```
 */
export class ArrayNode extends Ast {
   /**
    * Content elements.
    */
   elements: TData[] = [];

   /**
    * Initialize new instance of abstract syntax node.
    */
   constructor() {
      super();
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitArray(this, context);
   }
}

/**
 * Represents node for ws:Boolean tag.
 *
 * ```
 *    <ws:Boolean>
 *       content
 *    </ws:Boolean>
 * ```
 */
export class BooleanNode extends Ast {
   content: ProgramNode;

   /**
    * Initialize new instance of abstract syntax node.
    * @param content {ProgramNode} Content expression.
    */
   constructor(content: ProgramNode) {
      super();
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitBoolean(this, context);
   }
}

/**
 * Represents node for ws:Function tag.
 *
 * ```
 *    <ws:Function>
 *       content
 *    </ws:Function>
 * ```
 */
export class FunctionNode extends Ast {
   content: ProgramNode;

   /**
    * Initialize new instance of abstract syntax node.
    * @param content {ProgramNode} Content expression.
    */
   constructor(content: ProgramNode) {
      super();
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitFunction(this, context);
   }
}

/**
 * Represents node for ws:Number tag.
 *
 * ```
 *    <ws:Number>
 *       content
 *    </ws:Number>
 * ```
 */
export class NumberNode extends Ast {
   content: ProgramNode;

   /**
    * Initialize new instance of abstract syntax node.
    * @param content {ProgramNode} Content expression.
    */
   constructor(content: ProgramNode) {
      super();
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitNumber(this, context);
   }
}

/**
 * Represents node for ws:Object tag.
 *
 * ```
 *    <ws:Object>
 *       <ws:property>
 *          content
 *       </ws:property>
 *    </ws:Object>
 * ```
 */
export class ObjectNode extends Ast {
   properties: IObjectProperties;

   /**
    * Initialize new instance of abstract syntax node.
    * @param properties {IObjectProperties} Object properties collection.
    */
   constructor(properties: IObjectProperties) {
      super();
      this.properties = properties;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitObject(this, context);
   }
}

/**
 * Represents node for ws:String tag.
 *
 * ```
 *    <ws:String>
 *       content
 *    </ws:String>
 * ```
 */
export class StringNode extends Ast {
   content: ProgramNode;

   /**
    * Initialize new instance of abstract syntax node.
    * @param content {ProgramNode} Content expression.
    */
   constructor(content: ProgramNode) {
      super();
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitString(this, context);
   }
}

/**
 * Represents node for ws:Value tag.
 *
 * ```
 *    <ws:Value>
 *       content
 *    </ws:Value>
 * ```
 */
export class ValueNode extends Ast {
   content: ProgramNode;

   /**
    * Initialize new instance of abstract syntax node.
    * @param content {ProgramNode} Content expression.
    */
   constructor(content: ProgramNode) {
      super();
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitValue(this, context);
   }
}

/**
 * Represents node for ws:template tag.
 *
 * ```
 *    <ws:template name="template name">
 *       content
 *    </ws:template>
 * ```
 */
export class TemplateNode extends Ast {
   name: string;
   content: TContent[] = [];

   /**
    * Initialize new instance of abstract syntax node.
    * @param name {string} Template name.
    */
   constructor(name: string) {
      super();
      this.name = name;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitTemplate(this, context);
   }
}

/**
 * Represents node for ws:partial tag.
 *
 * ```
 *    <ws:partial template="name or expression">
 *       content
 *    </ws:partial>
 * ```
 */
export class PartialNode extends ActiveNode {
   name: ProgramNode | string;
   options: IObjectProperties;

   /**
    * Initialize new instance of abstract syntax node.
    * @param name {string} Partial name.
    * @param attributes {IAttributesCollection} Partial attributes.
    * @param options {IObjectProperties} Partial properties.
    * @param events {IEventsCollection} Partial event handlers.
    */
   constructor(name: ProgramNode | string, attributes: IAttributesCollection, options: IObjectProperties, events: IEventsCollection) {
      super(attributes, events);
      this.name = name;
      this.options = options;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitPartial(this, context);
   }
}

/**
 * Represents node for control tag.
 *
 * ```
 *    <control attr:name="value" on:event="handler" option="value">
 *       content
 *    </control>
 * ```
 */
export class ControlNode extends ActiveNode {
   /**
    * Control name.
    */
   name: string;
   /**
    * Control properties.
    */
   options: IObjectProperties;

   /**
    * Initialize new instance of abstract syntax node.
    * @param name {string} Control name.
    * @param attributes {IAttributesCollection} Control attributes.
    * @param options {IObjectProperties} Control properties.
    * @param events {IEventsCollection} Control event handlers.
    */
   constructor(name: string, attributes: IAttributesCollection, options: IObjectProperties, events: IEventsCollection) {
      super(attributes, events);
      this.name = name;
      this.options = options;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitControl(this, context);
   }
}

/**
 * Represents node for ws:if tag.
 *
 * ```
 *    <ws:if data="expression">
 *       content
 *    </ws:if>
 * ```
 */
export class IfNode extends Ast {
   /**
    * Test expression.
    */
   test: ProgramNode;
   /**
    * Consequent nodes.
    */
   consequent: TContent;
   /**
    * Alternate nodes.
    */
   alternate: TContent | undefined;

   /**
    * Initialize new instance of abstract syntax node.
    * @param test {ProgramNode} Test expression.
    * @param consequent {TContent} Consequent nodes.
    * @param alternate {TContent} Alternate nodes.
    */
   constructor(test: ProgramNode, consequent: TContent, alternate?: TContent) {
      super();
      this.test = test;
      this.consequent = consequent;
      this.alternate = alternate;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitIf(this, context);
   }
}

/**
 * Represents node for ws:else tag.
 *
 * ```
 *    <ws:else data="expression">
 *       content
 *    </ws:else>
 * ```
 */
export class ElseNode extends Ast {
   /**
    * Consequent nodes.
    */
   consequent: TContent;
   /**
    * Test expression. If not empty then node equals to "else if".
    */
   test: ProgramNode | undefined;
   /**
    * Alternate nodes that is not empty if and only if there is test expression.
    */
   alternate: TContent | undefined;

   /**
    * Initialize new instance of abstract syntax node.
    * @param consequent {TContent} Consequent nodes.
    * @param test {ProgramNode} Test expression.
    * @param alternate {TContent} Alternate nodes.
    */
   constructor(consequent: TContent, test?: ProgramNode, alternate?: TContent) {
      super();
      this.consequent = consequent;
      this.test = test;
      this.alternate = alternate;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitElse(this, context);
   }
}

/**
 * Represents node for ws:for.
 *
 * ```
 *    <ws:for data="init; test; update">
 *       content
 *    </ws:for>
 * ```
 */
export class ForNode extends Ast {
   /**
    * Initialize expression.
    */
   init: ProgramNode | undefined;
   /**
    * Test expression.
    */
   test: ProgramNode | undefined;
   /**
    * Update expression.
    */
   update: ProgramNode | undefined;
   /**
    * Content nodes.
    */
   content: TContent[] = [];

   /**
    * Initialize new instance of abstract syntax node.
    * @param init {ProgramNode | undefined} Initialize expression.
    * @param test {ProgramNode | undefined} Test expression.
    * @param update {ProgramNode | undefined} Update expression.
    */
   constructor(init: ProgramNode | undefined, test: ProgramNode | undefined, update: ProgramNode | undefined) {
      super();
      this.init = init;
      this.test = test;
      this.update = update;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitFor(this, context);
   }
}

/**
 * Represents node for ws:for.
 *
 * ```
 *    <ws:for data="index, iterator in collection">
 *       content
 *    </ws:for>
 * ```
 */
export class ForeachNode extends Ast {
   /**
    * Expression for iterator indexer.
    */
   index: ProgramNode | undefined;
   /**
    * Iterator expression.
    */
   iterator: ProgramNode;
   /**
    * Collection expression.
    */
   collection: ProgramNode;
   /**
    * Content nodes.
    */
   content: TContent[] = [];

   /**
    * Initialize new instance of abstract syntax node.
    * @param index {ProgramNode | undefined} Expression for iterator indexer.
    * @param iterator {ProgramNode} Iterator expression.
    * @param collection {ProgramNode} Collection expression.
    */
   constructor(index: ProgramNode | undefined, iterator: ProgramNode, collection: ProgramNode) {
      super();
      this.index = index;
      this.iterator = iterator;
      this.collection = collection;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitForeach(this, context);
   }
}

/**
 * Represents node for element tag.
 *
 * ```
 *    <tag attribute="value" on:event="handler">
 *       content
 *    </tag>
 * ```
 */
export class ElementNode extends ActiveNode {
   /**
    * Element name.
    */
   name: string;
   /**
    * Element children.
    */
   content: TContent[] = [];

   /**
    * Initialize new instance of abstract syntax node.
    * @param name {string} Element name.
    * @param attributes {IAttributesCollection} Element attributes collection.
    * @param events {IEventsCollection} Element event handlers.
    */
   constructor(name: string, attributes: IAttributesCollection, events: IEventsCollection) {
      super(attributes, events);
      this.name = name;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitElement(this, context);
   }
}

/**
 * Represents node for text.
 */
export class TextNode extends Ast {
   /**
    * Text content.
    */
   content: string;

   /**
    * Initialize new instance of abstract syntax node.
    * @param content {string} Text content.
    */
   constructor(content: string) {
      super();
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitText(this, context);
   }
}

/**
 * Represents node for doctype declaration.
 *
 * @example
 * ```
 *    <!DOCTYPE content>
 * ```
 */
export class DoctypeNode extends Ast {
   /**
    * Doctype content.
    */
   content: string;

   /**
    * Initialize new instance of abstract syntax node.
    * @param content {string} Doctype content.
    */
   constructor(content: string) {
      super();
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitDoctype(this, context);
   }
}

/**
 * Represents node for cdata declaration.
 *
 * ```
 *    <![CDATA[ content ]]>
 * ```
 */
export class CDataNode extends Ast {
   /**
    * Cdata section content.
    */
   content: string;

   /**
    * Initialize new instance of abstract syntax node.
    * @param content {string} Cdata section content.
    */
   constructor(content: string) {
      super();
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitCData(this, context);
   }
}

/**
 * Represents node for comment.
 *
 * ```
 *    <!-- content -->
 * ```
 */
export class CommentNode extends Ast {
   /**
    * Comment content.
    */
   content: string;

   /**
    * Initialize new instance of abstract syntax node.
    * @param content {string} Comment content.
    */
   constructor(content: string) {
      super();
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitComment(this, context);
   }
}

/**
 * Represents node for mustache expression.
 *
 * ```
 *    {{ javascript expression }}
 * ```
 */
export class ProgramNode extends Ast {
   /**
    * Program node expressions.
    */
   expressions: Expression[];

   /**
    * Initialize new instance of abstract syntax node.
    * @param expressions {Expression[]} Program node expressions.
    */
   constructor(expressions: Expression[]) {
      super();
      this.expressions = expressions;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitProgram(this, context);
   }
}