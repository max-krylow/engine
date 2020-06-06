/// <amd-module name="engine/core/Transformer" />

import * as RawNodes from "../html/base/Nodes";
import * as AstNodes from "./Ast";
import { IParser, Parser } from '../expression/Parser';
import { processTextData } from "./TextProcessor";

/**
 * @file src/core/Transformer.ts
 */

const EMPTY_STRING = '';

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
 * @param name
 */
function isAttribute(name: string): boolean {
   return /^attr:/gi.test(name);
}

/**
 *
 * @param name
 */
function getAttributeName(name: string): string {
   return name.replace(/^attr:/gi, EMPTY_STRING);
}

/**
 *
 * @param name
 */
function isEvent(name: string): boolean {
   return /^on:/gi.test(name);
}

/**
 *
 * @param name
 */
function getEventName(name: string): string {
   return name.replace(/^on:/gi, EMPTY_STRING);
}

/**
 *
 * @param name
 */
function isBind(name: string): boolean {
   return /^bind:/gi.test(name);
}

/**
 *
 * @param name
 */
function getBindName(name: string): string {
   return name.replace(/^bind:/gi, EMPTY_STRING);
}

/**
 *
 * @param name
 */
function isComponentName(name: string): boolean {
   return /(\w+[\.:])+\w+/gi.test(name);
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

/**
 * Releases transformation from parse tree into abstract syntax tree.
 */
export class TransformVisitor implements RawNodes.IVisitor<any, AstNodes.Ast> {
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
    * @param context {*} Context.
    */
   visitAll(nodes: RawNodes.IVisitable[], context?: any): any {
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
   visitCData(node: RawNodes.CData, context?: any): any {
      return [new AstNodes.CDataNode(node.value)];
   }

   /**
    * Visit comment node and generate its ast representation.
    * @param node {Comment} Comment node.
    * @param context {*} Context.
    */
   visitComment(node: RawNodes.Comment, context?: any): any {
      return [new AstNodes.CommentNode(node.value)];
   }

   /**
    * Visit doctype node and generate its ast representation.
    * @param node {Doctype} Doctype node.
    * @param context {*} Context.
    */
   visitDoctype(node: RawNodes.Doctype, context?: any): any {
      return [new AstNodes.DoctypeNode(node.value)];
   }

   /**
    * Visit tag node and generate its ast representation.
    * @param node {Tag} Tag node.
    * @param context {*} Context.
    */
   visitTag(node: RawNodes.Tag, context?: any): any {
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
            if (isComponentName(node.name)) {
               return this.createComponentNode(node, context);
            }
            return this.createElementNode(node, context);
      }
   }

   /**
    * Visit text node and generate its ast representation.
    * @param node {Text} Text node.
    * @param context {*} Context.
    */
   visitText(node: RawNodes.Text, context?: any): any {
      const value = node.value
         .replace(/(\r|\r\n|\n|\n\r)/gi, '')
         .trim();
      if (value.length === 0) {
         return undefined;
      }
      return processTextData(value, this.expressionParser);
   }

   /**
    *
    * @param node
    * @param context
    */
   createIfNode(node: RawNodes.Tag, context?: any): AstNodes.IfNode[] {
      const dataNode = getDataNode(node, 'data');
      const test = this.expressionParser.parse(dataNode);
      const consequent = this.visitAll(node.children, context);
      return [new AstNodes.IfNode(test, consequent)];
   }

   /**
    *
    * @param node
    * @param context
    */
   createElseNode(node: RawNodes.Tag, context?: any): AstNodes.ElseNode[] {
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
      return [new AstNodes.ElseNode(consequent, test)];
   }

   /**
    *
    * @param node
    * @param context
    */
   createForNode(node: RawNodes.Tag, context?: any): AstNodes.ForNode[] {
      const dataNode = getDataNode(node, 'data');
      const data = this.expressionParser.parse(dataNode);
      const ast = new AstNodes.ForNode(data);
      ast.content = this.visitAll(node.children);
      return [ast];
   }

   /**
    *
    * @param node
    * @param context
    */
   createForeachNode(node: RawNodes.Tag, context?: any): AstNodes.ForeachNode[] {
      const dataNode = getDataNode(node, 'data');
      const data = this.expressionParser.parse(dataNode);
      const ast = new AstNodes.ForeachNode(data);
      ast.content = this.visitAll(node.children);
      return [ast];
   }

   /**
    *
    * @param node
    * @param context
    */
   createTemplateNode(node: RawNodes.Tag, context?: any): AstNodes.TemplateNode[] {
      const nameNode = getDataNode(node, 'name');
      const ast = new AstNodes.TemplateNode(nameNode);
      ast.content = this.visitAll(node.children);
      return [ast];
   }

   /**
    *
    * @param node
    * @param hasAttributesOnly
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
            if (isBind(attributeName)) {
               const property = getBindName(attributeName);
               optionsStorage[property] = new AstNodes.BindNode(property, this.expressionParser.parse(value));
            } else if (isEvent(attributeName)) {
               const event = getEventName(attributeName);
               collection.events[event] = new AstNodes.EventNode(event, this.expressionParser.parse(value));
            } else if (isAttribute(attributeName)) {
               const attribute = getAttributeName(attributeName);
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
    *
    * @param node
    * @param context
    */
   createPartialNode(node: RawNodes.Tag, context?: any): AstNodes.PartialNode[] {
      const { attributes, events, options } = this.visitAttributes(node, false);
      const { template } = options;
      delete options['template'];
      if (template === undefined) {
         throw new Error(`Expected attribute "template" on tag "${node.name}". Ignore this tag`);
      }
      const ast = new AstNodes.PartialNode(node.attributes['template'].value as string, attributes, options, events);
      const content = this.visitAll(node.children, context);
      ast.options['content'] = new AstNodes.ContentOptionNode('content', content);
      return [ast];
   }

   /**
    *
    * @param node
    * @param context
    */
   createComponentNode(node: RawNodes.Tag, context?: any): AstNodes.ComponentNode[] {
      const { attributes, events, options } = this.visitAttributes(node, false);
      let ast = new AstNodes.ComponentNode(node.name, attributes, options, events);
      const content = this.visitAll(node.children, context);
      ast.options['content'] = new AstNodes.ContentOptionNode('content', content);
      return [ast];
   }

   /**
    *
    * @param node
    * @param context
    */
   createElementNode(node: RawNodes.Tag, context?: any): AstNodes.ElementNode[] {
      const { attributes, events } = this.visitAttributes(node, true);
      let ast = new AstNodes.ElementNode(node.name, attributes, events);
      ast.content = this.visitAll(node.children, context);
      return [ast];
   }
}
