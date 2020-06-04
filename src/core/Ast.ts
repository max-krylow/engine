/// <amd-module name="engine/core/Ast" />

import { ProgramNode } from '../expression/Parser';

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
 * Text representation type.
 */
export declare type TText = ExpressionNode | TextNode | LocalizationNode;

/**
 * Content representation type.
 */
export declare type TContent = PartialNode | IfNode | ElseNode | ForNode | ForeachNode | ElementNode | ProgramNode | TextNode;

/**
 * Interface for visitor of abstract syntax nodes.
 */
export interface IAstVisitor<C, R> {
   visitTemplate(node: TemplateNode, context: C): R;
   visitPartial(node: PartialNode, context: C): R;
   visitControl(node: ControlNode, context: C): R;
   visitIf(node: IfNode, context: C): R;
   visitElse(node: ElseNode, context: C): R;
   visitFor(node: ForNode, context: C): R;
   visitForeach(node: ForeachNode, context: C): R;
   visitElement(node: ElementNode, context: C): R;
   visitText(node: TextNode, context: C): R;
   visitDoctype(node: DoctypeNode, context: C): R;
   visitCData(node: CDataNode, context: C): R;
   visitComment(node: CommentNode, context: C): R;
   visitExpression(node: ExpressionNode, context: C): R;
   visitLocalization(node: LocalizationNode, context: C): R;
   visitAttributeNode(node: AttributeNode, context: C): R;
   visitOptionNode(node: OptionNode, context: C): R;
   visitBindNode(node: BindNode, context: C): R;
   visitEventNode(node: EventNode, context: C): R;
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
   abstract accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown;
}

/**
 * Represents node for simple attribute.
 *
 * ```
 *    ...
 *    <htmlElementName
 *       attribute="value" >
 *       ...
 *    <htmlElementName>
 *    ...
 *    ...
 *    <controlName
 *       attr:attribute="value" >
 *       ...
 *    <controlName>
 *    ...
 * ```
 */
export class AttributeNode extends Ast {
   /**
    * Attribute name.
    */
   name: string;
   /**
    * Attribute expression.
    */
   value: TText[];

   /**
    * Initialize new instance of abstract syntax node.
    * @param name {string} Attribute name.
    * @param value {TText[]} Attribute expression.
    */
   constructor(name: string, value: TText[]) {
      super();
      this.name = name;
      this.value = value;
   }

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitAttributeNode(this, context);
   }
}

/**
 * Represents node for simple option.
 *
 * ```
 *    ...
 *    option="value"
 *    ...
 * ```
 */
export class OptionNode extends Ast {
   /**
    * Option name.
    */
   name: string;
   /**
    * Property expression.
    */
   value: TText[];

   /**
    * Initialize new instance of abstract syntax node.
    * @param name {string} Option name.
    * @param value {TText[]} Property expression.
    */
   constructor(name: string, value: TText[]) {
      super();
      this.name = name;
      this.value = value;
   }

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitOptionNode(this, context);
   }
}

/**
 * Represents node for binding construction.
 *
 * ```
 *    ...
 *    bind:option="otherOption"
 *    ...
 * ```
 */
export class BindNode extends Ast {
   /**
    * Binding property name.
    */
   property: string;
   /**
    * Binding property name or expression.
    */
   value: ProgramNode;

   /**
    * Initialize new instance of abstract syntax node.
    * @param property {string} Binding property name.
    * @param value {ProgramNode} Binding property name or expression.
    */
   constructor(property: string, value: ProgramNode) {
      super();
      this.property = property;
      this.value = value;
   }

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitBindNode(this, context);
   }
}

/**
 * Represents node for event handlers.
 *
 * ```
 *    ...
 *    on:eventName="handler(arguments)"
 *    ...
 * ```
 */
export class EventNode extends Ast {
   /**
    * Event name.
    */
   event: string;
   /**
    * Handler for event.
    */
   handler: ProgramNode;

   /**
    * Initialize new instance of abstract syntax node.
    * @param event {string} Event name.
    * @param handler {ProgramNode} Handler for event.
    */
   constructor(event: string, handler: ProgramNode) {
      super();
      this.event = event;
      this.handler = handler;
   }

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitEventNode(this, context);
   }
}

/**
 * Interface for attributes collection.
 */
export interface IAttributes {
   [attribute: string]: AttributeNode | BindNode;
}

/**
 * Interface for options collection.
 */
export interface IOptions {
   [option: string]: AttributeNode | BindNode;
}

/**
 * Interface for event handlers collection.
 */
export interface IEvents {
   [event: string]: EventNode;
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

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitTemplate(this, context);
   }
}

/**
 * Abstract class for node of abstract syntax tree that
 * contains attributes and event handlers.
 */
export abstract class ActiveNode extends Ast {
   /**
    * Node attributes.
    */
   attributes: IAttributes;
   /**
    * Node event handlers.
    */
   events: IEvents;

   /**
    * Initialize new instance of abstract syntax node.
    * @param attributes {IAttributes} Node attributes.
    * @param events {IEvents} Node event handlers.
    */
   protected constructor(attributes: IAttributes, events: IEvents) {
      super();
      this.attributes = attributes;
      this.events = events;
   }
}

/**
 * Represents node for ws:partial tag.
 *
 * ```
 *    <ws:partial template="name">
 *       content
 *    </ws:partial>
 * ```
 */
export class PartialNode extends ActiveNode {
   name: string;
   options: IOptions;

   /**
    * Initialize new instance of abstract syntax node.
    * @param template {string} Partial name.
    * @param attributes {IAttributes} Partial attributes.
    * @param options {IOptions} Partial properties.
    * @param events {IEvents} Partial event handlers.
    */
   constructor(template: string, attributes: IAttributes, options: IOptions, events: IEvents) {
      super(attributes, events);
      this.name = template;
      this.options = options;
   }

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
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
   options: IOptions;

   /**
    * Initialize new instance of abstract syntax node.
    * @param name {string} Control name.
    * @param attributes {IAttributes} Control attributes.
    * @param options {IOptions} Control properties.
    * @param events {IEvents} Control event handlers.
    */
   constructor(name: string, attributes: IAttributes, options: IOptions, events: IEvents) {
      super(attributes, events);
      this.name = name;
      this.options = options;
   }

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
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

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
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

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
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
    * Cycle expression aka 'init; test; update'.
    */
   expression: ProgramNode;
   /**
    * Content nodes.
    */
   content: TContent[] = [];

   /**
    * Initialize new instance of abstract syntax node.
    * @param expression {ProgramNode} Initialize expression.
    */
   constructor(expression: ProgramNode) {
      super();
      this.expression = expression;
   }

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitFor(this, context);
   }
}

/**
 * Represents node for ws:for.
 *
 * ```
 *    <ws:foreach data="index, iterator in collection">
 *       content
 *    </ws:foreach>
 * ```
 */
export class ForeachNode extends Ast {
   /**
    * Cycle expression aka '[index, ] item in collection'.
    */
   expression: ProgramNode;
   /**
    * Content nodes.
    */
   content: TContent[] = [];

   /**
    * Initialize new instance of abstract syntax node.
    * @param expression {ProgramNode} Cycle expression aka '[index, ] item in collection'.
    */
   constructor(expression: ProgramNode) {
      super();
      this.expression = expression;
   }

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
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
    * @param attributes {IAttributes} Element attributes collection.
    * @param events {IEvents} Element event handlers.
    */
   constructor(name: string, attributes: IAttributes, events: IEvents) {
      super(attributes, events);
      this.name = name;
   }

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
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

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
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

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
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

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
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

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
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
export class ExpressionNode extends Ast {
   /**
    * Program node expressions.
    */
   programNode: ProgramNode;

   /**
    * Initialize new instance of abstract syntax node.
    * @param programNode {ProgramNode} Program node.
    */
   constructor(programNode: ProgramNode) {
      super();
      this.programNode = programNode;
   }

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitExpression(this, context);
   }
}

/**
 * Represents node for translatable text.
 *
 * ```
 *    {[ translatable context @@ translatable text ]}
 * ```
 */
export class LocalizationNode extends Ast {
   text: string;
   context: string;

   /**
    * Initialize new instance of abstract syntax node.
    * @param text {string} Translatable text data.
    * @param context {string} Translatable context data.
    */
   constructor(text: string, context: string) {
      super();
      this.text = text;
      this.context = context;
   }

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitLocalization(this, context);
   }
}
