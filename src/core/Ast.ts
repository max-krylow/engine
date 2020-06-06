/// <amd-module name="engine/core/Ast" />

import { ProgramNode } from '../expression/Parser';
import { IExpressionVisitor } from "../expression/Parser";

/**
 * @file src/core/Ast.ts
 */

/**
 * Ast node flags.
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

export function isTypeofText(value: any): boolean {
   return value instanceof ExpressionNode ||
      value instanceof TextNode ||
      value instanceof LocalizationNode;
}

/**
 * Wasaby node type.
 */
export declare type TWasaby = TemplateNode | PartialNode | ComponentNode | IfNode | ElseNode | ForNode | ForeachNode;

export function isTypeofWasaby(value: any): boolean {
   return value instanceof TemplateNode ||
      value instanceof PartialNode ||
      value instanceof ComponentNode ||
      value instanceof IfNode ||
      value instanceof ForNode ||
      value instanceof ForeachNode;
}

/**
 * Html node type.
 */
export declare type THtml = ElementNode | DoctypeNode | CDataNode | CommentNode;

export function isTypeofHtml(value: any): boolean {
   return value instanceof ElementNode ||
      value instanceof DoctypeNode ||
      value instanceof CDataNode ||
      value instanceof CommentNode;
}

/**
 * Content representation type.
 */
export declare type TContent = TWasaby | TText | THtml;

export function isTypeofContent(value: any): boolean {
   return isTypeofWasaby(value) || isTypeofText(value) || isTypeofHtml(value);
}

export function validateContent(value: Ast[]): TContent[] {
   for (let i = 0; i < value.length; ++i) {
      if (!isTypeofContent(value[i])) {
         throw new Error(`Expected node type of Content. Got ${value.constructor.name}`);
      }
   }
   return value as TContent[];
}

/**
 * Interface for visitor of abstract syntax nodes.
 */
export interface IAstVisitor<C, R> {
   /**
    * Visit all nodes in collection.
    * @param nodes {Ast[]} Collection of nodes.
    * @param context {C} Current visiting context.
    */
   visitAll(nodes: Ast[], context: C): R;

   /**
    * Visit AST node.
    * @param node {TemplateNode} Template node.
    * @param context {C} Current visiting context.
    */
   visitTemplate(node: TemplateNode, context: C): R;

   /**
    * Visit AST node.
    * @param node {PartialNode} Partial node.
    * @param context {C} Current visiting context.
    */
   visitPartial(node: PartialNode, context: C): R;

   /**
    * Visit AST node.
    * @param node {ComponentNode} Component node.
    * @param context {C} Current visiting context.
    */
   visitComponent(node: ComponentNode, context: C): R;

   /**
    * Visit AST node.
    * @param node {IfNode} If node.
    * @param context {C} Current visiting context.
    */
   visitIf(node: IfNode, context: C): R;

   /**
    * Visit AST node.
    * @param node {ElseNode} Else node.
    * @param context {C} Current visiting context.
    */
   visitElse(node: ElseNode, context: C): R;

   /**
    * Visit AST node.
    * @param node {ForNode} For node.
    * @param context {C} Current visiting context.
    */
   visitFor(node: ForNode, context: C): R;

   /**
    * Visit AST node.
    * @param node {ForeachNode} Foreach node.
    * @param context {C} Current visiting context.
    */
   visitForeach(node: ForeachNode, context: C): R;

   /**
    * Visit AST node.
    * @param node {ElementNode} Element node.
    * @param context {C} Current visiting context.
    */
   visitElement(node: ElementNode, context: C): R;

   /**
    * Visit AST node.
    * @param node {TextNode} Text node.
    * @param context {C} Current visiting context.
    */
   visitText(node: TextNode, context: C): R;

   /**
    * Visit AST node.
    * @param node {DoctypeNode} Doctype node.
    * @param context {C} Current visiting context.
    */
   visitDoctype(node: DoctypeNode, context: C): R;

   /**
    * Visit AST node.
    * @param node {CDataNode} CData node.
    * @param context {C} Current visiting context.
    */
   visitCData(node: CDataNode, context: C): R;

   /**
    * Visit AST node.
    * @param node {CommentNode} Comment node.
    * @param context {C} Current visiting context.
    */
   visitComment(node: CommentNode, context: C): R;

   /**
    * Visit AST node.
    * @param node {ExpressionNode} Expression node.
    * @param context {C} Current visiting context.
    */
   visitExpression(node: ExpressionNode, context: C): R;

   /**
    * Visit AST node.
    * @param node {LocalizationNode} Localization node.
    * @param context {C} Current visiting context.
    */
   visitLocalization(node: LocalizationNode, context: C): R;

   /**
    * Visit AST node.
    * @param node {AttributeNode} Attribute node.
    * @param context {C} Current visiting context.
    */
   visitAttributeNode(node: AttributeNode, context: C): R;

   /**
    * Visit AST node.
    * @param node {OptionNode} Option node.
    * @param context {C} Current visiting context.
    */
   visitOptionNode(node: OptionNode, context: C): R;

   /**
    * Visit AST node.
    * @param node {ContentOptionNode} Content option node.
    * @param context {C} Current visiting context.
    */
   visitContentOptionNode(node: ContentOptionNode, context: C): R;

   /**
    * Visit AST node.
    * @param node {BindNode} Bind node.
    * @param context {C} Current visiting context.
    */
   visitBindNode(node: BindNode, context: C): R;

   /**
    * Visit AST node.
    * @param node {EventNode} Event node.
    * @param context {C} Current visiting context.
    */
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
 *    <componentName
 *       attr:attribute="value" >
 *       ...
 *    <componentName>
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
 * Represents node for content node option or root content of ws:partial or Component.
 */
export class ContentOptionNode extends Ast {
   /**
    * Option name.
    */
   name: string;
   /**
    * Content data.
    */
   content: TContent[];

   /**
    * Initialize new instance of abstract syntax node.
    * @param name {string} Option name.
    * @param content {TContent[]} Content data.
    */
   constructor(name: string, content: TContent[]) {
      super();
      this.name = name;
      this.content = content;
   }

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitContentOptionNode(this, context);
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
   [option: string]: OptionNode | BindNode | ContentOptionNode;
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
   /**
    * Template name.
    */
   name: string;
   /**
    * Template content.
    */
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
export abstract class BaseHtmlElement extends Ast {
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
export class PartialNode extends BaseHtmlElement {
   /**
    * Partial name.
    */
   name: string;
   /**
    * Partial properties.
    */
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
 * Represents node for component tag.
 *
 * ```
 *    <componentName attr:name="value" on:event="handler" option="value">
 *       content
 *    </componentName>
 * ```
 */
export class ComponentNode extends BaseHtmlElement {
   /**
    * Component name.
    */
   name: string;
   /**
    * Component properties.
    */
   options: IOptions;

   /**
    * Initialize new instance of abstract syntax node.
    * @param name {string} Component name.
    * @param attributes {IAttributes} Component attributes.
    * @param options {IOptions} Component properties.
    * @param events {IEvents} Component event handlers.
    */
   constructor(name: string, attributes: IAttributes, options: IOptions, events: IEvents) {
      super(attributes, events);
      this.name = name;
      this.options = options;
   }

   accept(visitor: IAstVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitComponent(this, context);
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
   consequent: TContent[];
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
   constructor(test: ProgramNode, consequent: TContent[], alternate?: TContent) {
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
   consequent: TContent[];
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
   constructor(consequent: TContent[], test?: ProgramNode, alternate?: TContent) {
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
export class ElementNode extends BaseHtmlElement {
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
   /**
    * Localization text.
    */
   text: string;
   /**
    * Localization context.
    */
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

/**
 * Ast node visitor context.
 */
interface IAstVisitorContext {
   /**
    * To make difference between options and attributes.
    */
   hasAttributesOnly?: boolean;
}

/**
 * Markup visitor.
 * Recursively visit all nodes in given tree
 * and returns string representation.
 */
export class MarkupVisitor implements IAstVisitor<IAstVisitorContext, string> {
   /**
    * Expression visitor.
    */
   expressionVisitor: IExpressionVisitor<IAstVisitorContext, string>;

   /**
    * Initialize new instance of markup visitor.
    * @param expressionVisitor {IExpressionVisitor<IAstVisitorContext, string>} Expression visitor.
    */
   constructor(expressionVisitor: IExpressionVisitor<IAstVisitorContext, string>) {
      this.expressionVisitor = expressionVisitor;
   }

   /**
    * Generate text representation of node.
    * @param node {AttributeNode} Attribute node.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitAttributeNode(node: AttributeNode, context: IAstVisitorContext): string {
      const value = this.visitAll(node.value, context);
      if (!context.hasAttributesOnly) {
         return `attr:${node.name}="${value}"`;
      }
      return `${node.name}="${value}"`;
   }

   /**
    * Generate text representation of node.
    * @param node {BindNode} Bind node.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitBindNode(node: BindNode, context: IAstVisitorContext): string {
      const value = node.value.accept(this.expressionVisitor, context);
      return `bind:${node.property}="${value}"`;
   }

   /**
    * Generate text representation of node.
    * @param node {CDataNode} CData node.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitCData(node: CDataNode, context: IAstVisitorContext): string {
      return `<![CDATA[${node.content}]]>`;
   }

   /**
    * Generate text representation of node.
    * @param node {CommentNode} Comment node.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitComment(node: CommentNode, context: IAstVisitorContext): string {
      return `<!--${node.content}-->`;
   }

   /**
    * Generate text representation of node.
    * @param node {ContentOptionNode} Content option node.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitContentOptionNode(node: ContentOptionNode, context: IAstVisitorContext): string {
      return this.visitAll(node.content, context);
   }

   /**
    * Generate text representation of node.
    * @param node {ComponentNode} Component node.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitComponent(node: ComponentNode, context: IAstVisitorContext): string {
      let attributes = '';
      let content = '';
      for (const name in node.attributes) {
         if (node.attributes.hasOwnProperty(name)) {
            const value = node.attributes[name].accept(this, { ...context, hasAttributesOnly: false });
            attributes += ` ${value}`;
         }
      }
      for (const name in node.events) {
         if (node.events.hasOwnProperty(name)) {
            const value = node.events[name].accept(this, context);
            attributes += ` ${value}`;
         }
      }
      for (const name in node.options) {
         if (node.options.hasOwnProperty(name)) {
            if (node.options[name] instanceof ContentOptionNode) {
               content += node.options[name].accept(this, context);
            } else {
               const value = node.options[name].accept(this, context);
               attributes += ` ${value}`;
            }
         }
      }
      return `<${node.name}${attributes}>${content}</${node.name}>`;
   }

   /**
    * Generate text representation of node.
    * @param node {DoctypeNode} Doctype node.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitDoctype(node: DoctypeNode, context: IAstVisitorContext): string {
      return `<!DOCTYPE ${node.content}>`;
   }

   /**
    * Generate text representation of node.
    * @param node {ElementNode} Element node.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitElement(node: ElementNode, context: IAstVisitorContext): string {
      let attributes = '';
      for (const name in node.attributes) {
         if (node.attributes.hasOwnProperty(name)) {
            const value = node.attributes[name].accept(this, { ...context, hasAttributesOnly: true });
            attributes += ` ${value}`;
         }
      }
      for (const name in node.events) {
         if (node.events.hasOwnProperty(name)) {
            const value = node.events[name].accept(this, context);
            attributes += ` ${value}`;
         }
      }
      const content = this.visitAll(node.content, context);
      return `<${node.name}${attributes}>${content}</${node.name}>`;
   }

   /**
    * Generate text representation of node.
    * @param node {ElseNode} Else node.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitElse(node: ElseNode, context: IAstVisitorContext): string {
      const data = node.test !== undefined ? node.test.accept(this.expressionVisitor, context) : '';
      const attribute = data ? ` data="${data}"` : '';
      const content = this.visitAll(node.consequent, context);
      return `<ws:else${attribute}>${content}</ws:else>`;
   }

   /**
    * Generate text representation of node.
    * @param node {EventNode} Event node.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitEventNode(node: EventNode, context: IAstVisitorContext): string {
      const value = node.handler.accept(this.expressionVisitor, context);
      return `on:${node.event}="${value}"`;
   }

   /**
    * Generate text representation of node.
    * @param node {ExpressionNode} Expression node.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitExpression(node: ExpressionNode, context: IAstVisitorContext): string {
      const value = node.programNode.accept(this.expressionVisitor, context);
      return `{{${value}}}`;
   }

   /**
    * Generate text representation of node.
    * @param node {ForNode} For node.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitFor(node: ForNode, context: IAstVisitorContext): string {
      const data = node.expression.accept(this.expressionVisitor, context);
      const content = this.visitAll(node.content, context);
      return `<ws:for data="${data}">${content}</ws:for>`;
   }

   /**
    * Generate text representation of node.
    * @param node {ForeachNode} Foreach node.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitForeach(node: ForeachNode, context: IAstVisitorContext): string {
      const data = node.expression.accept(this.expressionVisitor, context);
      const content = this.visitAll(node.content, context);
      return `<ws:foreach data="${data}">${content}</ws:foreach>`;
   }

   /**
    * Generate text representation of node.
    * @param node {IfNode} If node.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitIf(node: IfNode, context: IAstVisitorContext): string {
      const data = node.test.accept(this.expressionVisitor, context);
      const content = this.visitAll(node.consequent, context);
      return `<ws:if data="${data}">${content}</ws:if>`;
   }

   /**
    * Generate text representation of node.
    * @param node {LocalizationNode} Localization node.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitLocalization(node: LocalizationNode, context: IAstVisitorContext): string {
      if (node.context) {
         return `{[${node.context}@@${node.text}]}`;
      }
      return `{[${node.text}]}`;
   }

   /**
    * Generate text representation of node.
    * @param node {OptionNode} Option node.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitOptionNode(node: OptionNode, context: IAstVisitorContext): string {
      const value = this.visitAll(node.value, context);
      return `${node.name}="${value}"`;
   }

   /**
    * Generate text representation of node.
    * @param node {PartialNode} Partial node.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitPartial(node: PartialNode, context: IAstVisitorContext): string {
      let attributes = '';
      let content = '';
      for (const name in node.attributes) {
         if (node.attributes.hasOwnProperty(name)) {
            const value = node.attributes[name].accept(this, { ...context, hasAttributesOnly: false });
            attributes += ` ${value}`;
         }
      }
      for (const name in node.events) {
         if (node.events.hasOwnProperty(name)) {
            const value = node.events[name].accept(this, context);
            attributes += ` ${value}`;
         }
      }
      for (const name in node.options) {
         if (node.options.hasOwnProperty(name)) {
            if (node.options[name] instanceof ContentOptionNode) {
               content += node.options[name].accept(this, context);
            } else {
               const value = node.options[name].accept(this, context);
               attributes += ` ${value}`;
            }
         }
      }
      return `<ws:partial template="${node.name}"${attributes}>${content}</ws:partial>`;
   }

   /**
    * Generate text representation of node.
    * @param node {TemplateNode} Template node.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitTemplate(node: TemplateNode, context: IAstVisitorContext): string {
      const content = this.visitAll(node.content, context);
      return `<ws:template name="${node.name}">${content}</ws:template>`;
   }

   /**
    * Generate text representation of node.
    * @param node {TextNode} Text node.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitText(node: TextNode, context: IAstVisitorContext): string {
      return node.content;
   }

   /**
    * Generate markup for all nodes in collection.
    * @param nodes {Ast[]} Collection of nodes.
    * @param context {IAstVisitorContext} Current visiting context.
    */
   visitAll(nodes: Ast[], context: IAstVisitorContext = { }): string {
      return nodes.map(child => child.accept(this, context)).join('');
   }
}
