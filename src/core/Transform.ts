/// <amd-module name="engine/core/Transform" />

import * as RawNodes from "../html/base/Nodes";
import * as AstNodes from "./Ast";
import { IParser, Parser } from '../expression/Parser';
import { processTextData } from "./TextProcessor";
import { Scope } from "./Scope";
import * as Names from './Names';

/**
 * @file src/core/Transformer.ts
 */

/**
 *
 */
interface IAttributesCollection {
   /**
    *
    */
   attributes: AstNodes.IAttributes;
   /**
    *
    */
   options: AstNodes.IOptions;
   /**
    *
    */
   events: AstNodes.IEvents;
}


/**
 *
 */
interface IFilteredAttributes {
   [name: string]: RawNodes.Attribute;
}

/**
 *
 * @param node
 * @param expected
 */
function filterAttributes(node: RawNodes.Tag, expected: string[]): IFilteredAttributes {
   const collection: IFilteredAttributes = { };
   for (const attributeName in node.attributes) {
      if (node.attributes.hasOwnProperty(attributeName)) {
         if (expected.indexOf(attributeName) > -1) {
            collection[attributeName] = node.attributes[attributeName];
         } else {
            throw new Error(`Unexpected attribute "${attributeName}" on tag "${node.name}". Ignore this attribute`);
         }
      }
   }
   return collection;
}

/**
 *
 * @param node
 * @param name
 */
function getDataNode(node: RawNodes.Tag, name: string): string {
   const attributes = filterAttributes(node, [name]);
   const data = attributes[name];
   if (data === undefined) {
      throw new Error(`Expected attribute "${name}" on tag "${node.name}". Ignore this tag`);
   }
   if (data.value === null) {
      throw new Error(`Expected attribute "${name}" on tag "${node.name}" has value. Ignore this tag`);
   }
   return data.value;
}

function validateElseNode(node: RawNodes.Tag) {
   if (!(node.prev instanceof RawNodes.Tag)) {
      throw new Error(`Unexpected tag "${node.name}" without tag "ws:if" before. Ignore this tag`);
   }
   if (node.prev.name === 'ws:else') {
      if (!node.prev.attributes.hasOwnProperty('data')) {
         throw new Error(`Unexpected tag "${node.name}" before tag "ws:else" without attribute "data". Ignore this tag`);
      }
   } else if (node.prev.name !== 'ws:if') {
      throw new Error(`Unexpected tag "${node.name}" without tag "ws:if" before. Ignore this tag`);
   }
}

export interface ITransformedResult {
   scope: Scope;
   ast: AstNodes.Ast[];
}

export interface ITransformer {
   transform(nodes: RawNodes.IVisitable[]): ITransformedResult;
}

/**
 * Releases transformation from parse tree into abstract syntax tree.
 */
export class TransformVisitor implements RawNodes.IVisitor<Scope, AstNodes.Ast[]>, ITransformer {
   expressionParser: IParser;

   /**
    * Initialize new instance of transform visitor.
    */
   constructor() {
      this.expressionParser = new Parser();
   }

   /**
    * Visit all nodes in the given array and generate their ast representation.
    * @param nodes {IVisitable} Collection of nodes.
    * @param context {Scope} Context.
    */
   visitAll(nodes: RawNodes.IVisitable[], context: Scope): AstNodes.Ast[] {
      const children = nodes
         .map(node => node.accept(this, context))
         .reduce((acc: any[], cur) => acc.concat(cur), []);
      return children.filter((node: AstNodes.Ast) => node !== undefined);
   }

   /**
    * Visit cdata node and generate its ast representation.
    * @param node {CData} CDATA section node.
    * @param context {*} Context.
    */
   visitCData(node: RawNodes.CData, context: Scope): AstNodes.Ast[] {
      return [new AstNodes.CDataNode(node.value)];
   }

   /**
    * Visit comment node and generate its ast representation.
    * @param node {Comment} Comment node.
    * @param context {*} Context.
    */
   visitComment(node: RawNodes.Comment, context: Scope): AstNodes.Ast[] {
      return [new AstNodes.CommentNode(node.value)];
   }

   /**
    * Visit doctype node and generate its ast representation.
    * @param node {Doctype} Doctype node.
    * @param context {*} Context.
    */
   visitDoctype(node: RawNodes.Doctype, context: Scope): AstNodes.Ast[] {
      return [new AstNodes.DoctypeNode(node.value)];
   }

   /**
    * Visit tag node and generate its ast representation.
    * @param node {Tag} Tag node.
    * @param context {*} Context.
    */
   visitTag(node: RawNodes.Tag, context: Scope): AstNodes.Ast[] {
      switch (node.name) {
         case 'ws:if':
            return this.createIfNode(node, context);
         case 'ws:else':
            return this.createElseNode(node, context);
         case 'ws:for':
            return this.createForNode(node, context);
         case 'ws:foreach':
            return this.createForeachNode(node, context);
         case 'ws:template':
            return this.createTemplateNode(node, context);
         case 'ws:partial':
            return this.createPartialNode(node, context);
         default:
            if (Names.isComponentName(node.name)) {
               return this.createComponentNode(node, context);
            }
            return this.createElementNode(node, context);
      }
   }

   /**
    * Process text node and split it into expressions, text and localizations.
    * @param node {Tag} Raw representation of Text nodes.
    * @param context {*} Current transform context.
    */
   visitText(node: RawNodes.Text, context: Scope): AstNodes.Ast[] {
      const value = node.value
         .replace(/(\r|\r\n|\n|\n\r)/gi, '')
         .trim();
      if (value.length === 0) {
         return [];
      }
      return processTextData(value, this.expressionParser);
   }

   /**
    * Create instance of If node by its raw representation.
    * @param node {Tag} Raw representation of If node.
    * @param context {*} Current transform context.
    */
   createIfNode(node: RawNodes.Tag, context: Scope): AstNodes.IfNode[] {
      const dataNode = getDataNode(node, 'data');
      const test = this.expressionParser.parse(dataNode);
      const consequent = this.visitAll(node.children, context);
      return [new AstNodes.IfNode(test, AstNodes.validateContent(consequent))];
   }

   /**
    * Create instance of Else node by its raw representation.
    * @param node {Tag} Raw representation of Else node.
    * @param context {*} Current transform context.
    */
   createElseNode(node: RawNodes.Tag, context: Scope): AstNodes.ElseNode[] {
      let test;
      validateElseNode(node);
      const { data: dataNode } = filterAttributes(node, ['data']);
      if (dataNode !== undefined) {
         if (dataNode.value !== null) {
            test = this.expressionParser.parse(dataNode.value);
         } else {
            throw new Error(`Expected attribute "data" on tag "${node.name}" has value. Ignore this tag`);
         }
      }
      const consequent = this.visitAll(node.children, context);
      return [new AstNodes.ElseNode(AstNodes.validateContent(consequent), test)];
   }

   /**
    * Create instance of For node by its raw representation.
    * @param node {Tag} Raw representation of For node.
    * @param context {*} Current transform context.
    */
   createForNode(node: RawNodes.Tag, context: Scope): AstNodes.ForNode[] {
      const nodeScope = AstNodes.ForNode.createScope(context);
      const dataNode = getDataNode(node, 'data');
      const data = this.expressionParser.parse(dataNode);
      const ast = new AstNodes.ForNode(data);
      const content = this.visitAll(node.children, nodeScope);
      ast.content = AstNodes.validateContent(content);
      return [ast];
   }

   /**
    * Create instance of Foreach node by its raw representation.
    * @param node {Tag} Raw representation of Foreach node.
    * @param context {*} Current transform context.
    */
   createForeachNode(node: RawNodes.Tag, context: Scope): AstNodes.ForeachNode[] {
      const nodeScope = AstNodes.ForeachNode.createScope(context);
      const dataNode = getDataNode(node, 'data');
      const data = this.expressionParser.parse(dataNode);
      const ast = new AstNodes.ForeachNode(data);
      const content = this.visitAll(node.children, nodeScope);
      ast.content = AstNodes.validateContent(content);
      return [ast];
   }

   /**
    * Create instance of Template node by its raw representation.
    * @param node {Tag} Raw representation of Template node.
    * @param context {*} Current transform context.
    */
   createTemplateNode(node: RawNodes.Tag, context: Scope): AstNodes.TemplateNode[] {
      const nodeScope = AstNodes.ForeachNode.createScope(context);
      const name = getDataNode(node, 'name');
      const templateName = AstNodes.validateTemplateName(name);
      const ast = new AstNodes.TemplateNode(templateName);
      const content = this.visitAll(node.children, nodeScope);
      ast.content = AstNodes.validateContent(content);
      context.registerTemplate(ast);
      return [ast];
   }

   /**
    * Visit attributes and collect them in chunks: attributes, options, events.
    * @param node {Tag} Some tag.
    * @param hasAttributesOnly {boolean} Flag to collect algorithm.
    *  Component and Partial nodes have options such but Element node has only attributes.
    *  If flag is true then no options will be collected.
    */
   visitAttributes(node: RawNodes.Tag, hasAttributesOnly: boolean): IAttributesCollection {
      const collection: IAttributesCollection = {
         attributes: { },
         options: { },
         events: { }
      };
      const optionsStorage = hasAttributesOnly ? collection.attributes : collection.options;
      for (const attributeName in node.attributes) {
         if (node.attributes.hasOwnProperty(attributeName)) {
            const value = node.attributes[attributeName].value as string;
            if (Names.isBind(attributeName)) {
               const property = Names.getBindName(attributeName);
               optionsStorage[property] = new AstNodes.BindNode(property, this.expressionParser.parse(value));
            } else if (Names.isEvent(attributeName)) {
               const event = Names.getEventName(attributeName);
               collection.events[event] = new AstNodes.EventNode(event, this.expressionParser.parse(value));
            } else if (Names.isAttribute(attributeName)) {
               const attribute = Names.getAttributeName(attributeName);
               const value = node.attributes[attributeName].value as string;
               const processedValue = processTextData(value, this.expressionParser);
               collection.attributes[attribute] = new AstNodes.AttributeNode(attribute, processedValue);
            } else {
               const processedValue = processTextData(value, this.expressionParser);
               optionsStorage[attributeName] = new AstNodes.OptionNode(attributeName, processedValue);
            }
         }
      }
      return collection;
   }

   /**
    * Create instance of Partial node by its raw representation.
    * @param node {Tag} Raw representation of Partial node.
    * @param context {*} Current transform context.
    */
   createPartialNode(node: RawNodes.Tag, context: Scope): AstNodes.PartialNode[] {
      const { attributes, events, options } = this.visitAttributes(node, false);
      const { template } = options;
      delete options['template'];
      if (template === undefined) {
         throw new Error(`Expected attribute "template" on tag "${node.name}". Ignore this tag`);
      }
      const templateName = AstNodes.validateTemplateName(node.attributes['template'].value as string);
      const ast = new AstNodes.PartialNode(templateName, attributes, options, events);
      const content = this.visitAll(node.children, context);
      ast.options['content'] = new AstNodes.ContentOptionNode('content', AstNodes.validateContent(content));
      context.registerTemplateUsage(templateName);
      return [ast];
   }

   /**
    * Create instance of Component node by its raw representation.
    * @param node {Tag} Raw representation of Component node.
    * @param context {*} Current transform context.
    */
   createComponentNode(node: RawNodes.Tag, context: Scope): AstNodes.ComponentNode[] {
      const { attributes, events, options } = this.visitAttributes(node, false);
      let ast = new AstNodes.ComponentNode(node.name, attributes, options, events);
      const content = this.visitAll(node.children, context);
      ast.options['content'] = new AstNodes.ContentOptionNode('content', AstNodes.validateContent(content));
      return [ast];
   }

   /**
    * Create instance of Element node by its raw representation.
    * @param node {Tag} Raw representation of Element node.
    * @param context {*} Current transform context.
    */
   createElementNode(node: RawNodes.Tag, context: Scope): AstNodes.ElementNode[] {
      const { attributes, events } = this.visitAttributes(node, true);
      let ast = new AstNodes.ElementNode(node.name, attributes, events);
      const content = this.visitAll(node.children, context);
      ast.content = AstNodes.validateContent(content);
      return [ast];
   }

   /**
    * Transform raw nodes into wasaby nodes.
    * @param nodes {RawNodes[]} Raw nodes.
    */
   transform(nodes: RawNodes.IVisitable[]): ITransformedResult {
      const scope = new Scope();
      const ast = this.visitAll(nodes, scope);
      return {
         ast,
         scope
      };
   }
}
