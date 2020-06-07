/// <amd-module name="engine/core/Transform" />

import * as RawNodes from "../html/base/Nodes";
import * as AstNodes from "./Ast";
import { IParser } from '../expression/Parser';
import { processTextData } from "./TextProcessor";
import * as Names from './Names';
import { IErrorHandler } from "../utils/ErrorHandler";

/**
 * @file src/core/Transformer.ts
 */

/**
 * Collection of sorted attributes.
 */
interface IAttributesCollection {
   /**
    * Set of attributes and binds for elements.
    */
   attributes: AstNodes.IAttributes;
   /**
    * Set of options and binds for component.
    */
   options: AstNodes.IOptions;
   /**
    * Set of events for element and component.
    */
   events: AstNodes.IEvents;
}

/**
 * Collection of filtered attributes.
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
 * Transformer interface.
 */
export interface ITransformer {
   /**
    * Transform raw nodes into Wasaby nodes.
    * @param nodes {IVisitable[]} Collection of raw nodes.
    */
   transform(nodes: RawNodes.IVisitable[]): AstNodes.Ast[];
}

/**
 * Releases transformation from parse tree into abstract syntax tree.
 */
export class TransformVisitor implements RawNodes.IVisitor<void, AstNodes.Ast[]>, ITransformer {
   expressionParser: IParser;
   errorHandler: IErrorHandler;

   /**
    * Initialize new instance of transform visitor.
    * @param expressionParser
    * @param errorHandler
    */
   constructor(expressionParser: IParser, errorHandler: IErrorHandler) {
      this.expressionParser = expressionParser;
      this.errorHandler = errorHandler;
   }

   /**
    * Visit all nodes in the given array and generate their ast representation.
    * @param nodes {IVisitable} Collection of nodes.
    */
   visitAll(nodes: RawNodes.IVisitable[]): AstNodes.Ast[] {
      const children = nodes
         .map(node => node.accept(this, context))
         .reduce((acc: any[], cur) => acc.concat(cur), []);
      return children.filter((node: AstNodes.Ast) => node !== undefined);
   }

   /**
    * Visit cdata node and generate its ast representation.
    * @param node {CData} CDATA section node.
    */
   visitCData(node: RawNodes.CData): AstNodes.Ast[] {
      const ast = new AstNodes.CDataNode(node.value);
      return [ast];
   }

   /**
    * Visit comment node and generate its ast representation.
    * @param node {Comment} Comment node.
    */
   visitComment(node: RawNodes.Comment): AstNodes.Ast[] {
      const ast = new AstNodes.CommentNode(node.value);
      return [ast];
   }

   /**
    * Visit doctype node and generate its ast representation.
    * @param node {Doctype} Doctype node.
    */
   visitDoctype(node: RawNodes.Doctype): AstNodes.Ast[] {
      const ast = new AstNodes.DoctypeNode(node.value);
      return [ast];
   }

   /**
    * Visit tag node and generate its ast representation.
    * @param node {Tag} Tag node.
    */
   visitTag(node: RawNodes.Tag): AstNodes.Ast[] {
      switch (node.name) {
         case 'ws:if':
            return this.createIfNode(node);
         case 'ws:else':
            return this.createElseNode(node);
         case 'ws:for':
            return this.createForNode(node);
         case 'ws:foreach':
            return this.createForeachNode(node);
         case 'ws:template':
            return this.createTemplateNode(node);
         case 'ws:partial':
            return this.createPartialNode(node);
         default:
            if (Names.isComponentName(node.name)) {
               return this.createComponentNode(node);
            }
            return this.createElementNode(node);
      }
   }

   /**
    * Process text node and split it into expressions, text and localizations.
    * @param node {Tag} Raw representation of Text nodes.
    */
   visitText(node: RawNodes.Text): AstNodes.Ast[] {
      // TODO: Release whitespace visitor
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
    */
   createIfNode(node: RawNodes.Tag): AstNodes.IfNode[] {
      const dataNode = getDataNode(node, 'data');
      const test = this.expressionParser.parse(dataNode);
      const consequent = this.visitAll(node.children);
      const ast = new AstNodes.IfNode(test, AstNodes.validateContent(consequent));
      return [ast];
   }

   /**
    * Create instance of Else node by its raw representation.
    * @param node {Tag} Raw representation of Else node.
    */
   createElseNode(node: RawNodes.Tag): AstNodes.ElseNode[] {
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
      const consequent = this.visitAll(node.children);
      const ast = new AstNodes.ElseNode(AstNodes.validateContent(consequent), test);
      return [ast];
   }

   /**
    * Create instance of For node by its raw representation.
    * @param node {Tag} Raw representation of For node.
    */
   createForNode(node: RawNodes.Tag): AstNodes.ForNode[] {
      const dataNode = getDataNode(node, 'data');
      const data = this.expressionParser.parse(dataNode);
      const ast = new AstNodes.ForNode(data);
      const content = this.visitAll(node.children);
      ast.content = AstNodes.validateContent(content);
      return [ast];
   }

   /**
    * Create instance of Foreach node by its raw representation.
    * @param node {Tag} Raw representation of Foreach node.
    */
   createForeachNode(node: RawNodes.Tag): AstNodes.ForeachNode[] {
      const dataNode = getDataNode(node, 'data');
      const data = this.expressionParser.parse(dataNode);
      const ast = new AstNodes.ForeachNode(data);
      const content = this.visitAll(node.children);
      ast.content = AstNodes.validateContent(content);
      return [ast];
   }

   /**
    * Create instance of Template node by its raw representation.
    * @param node {Tag} Raw representation of Template node.
    */
   createTemplateNode(node: RawNodes.Tag): AstNodes.TemplateNode[] {
      const name = getDataNode(node, 'name');
      const templateName = AstNodes.validateTemplateName(name);
      const ast = new AstNodes.TemplateNode(templateName);
      const content = this.visitAll(node.children);
      ast.content = AstNodes.validateContent(content);
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
    */
   createPartialNode(node: RawNodes.Tag): AstNodes.PartialNode[] {
      const { attributes, events, options } = this.visitAttributes(node, false);
      const { template } = options;
      delete options['template'];
      if (template === undefined) {
         throw new Error(`Expected attribute "template" on tag "${node.name}". Ignore this tag`);
      }
      const templateName = AstNodes.validateTemplateName(node.attributes['template'].value as string);
      const ast = new AstNodes.PartialNode(templateName, attributes, options, events);
      const content = this.visitAll(node.children);
      ast.options['content'] = new AstNodes.ContentOptionNode('content', AstNodes.validateContent(content));
      return [ast];
   }

   /**
    * Create instance of Component node by its raw representation.
    * @param node {Tag} Raw representation of Component node.
    */
   createComponentNode(node: RawNodes.Tag): AstNodes.ComponentNode[] {
      const { attributes, events, options } = this.visitAttributes(node, false);
      let ast = new AstNodes.ComponentNode(node.name, attributes, options, events);
      const content = this.visitAll(node.children);
      ast.options['content'] = new AstNodes.ContentOptionNode('content', AstNodes.validateContent(content));
      return [ast];
   }

   /**
    * Create instance of Element node by its raw representation.
    * @param node {Tag} Raw representation of Element node.
    */
   createElementNode(node: RawNodes.Tag): AstNodes.ElementNode[] {
      const { attributes, events } = this.visitAttributes(node, true);
      let ast = new AstNodes.ElementNode(node.name, attributes, events);
      const content = this.visitAll(node.children);
      ast.content = AstNodes.validateContent(content);
      return [ast];
   }

   /**
    * Transform raw nodes into wasaby nodes.
    * @param nodes {RawNodes[]} Raw nodes.
    */
   transform(nodes: RawNodes.IVisitable[]): AstNodes.Ast[] {
      return this.visitAll(nodes);
   }
}
