/// <amd-module name="engine/core/Annotator" />

import * as AstNodes from "./Ast";
import { Dictionary } from "./i18n";

/**
 * Interface for result object of annotation.
 */
interface IAnnotatedData {
   /**
    * Annotated abstract syntax tree.
    */
   ast: AstNodes.Ast[];
   /**
    * Translations dictionary.
    */
   dictionary: Dictionary;
}

/**
 * Annotation process context.
 */
interface IAnnotatorContext {
   /**
    * Translations dictionary.
    */
   dictionary: Dictionary;
   /**
    * Module name.
    */
   module: string;
   /**
    * File name.
    */
   fileName: string;
   /**
    * Dependencies collection.
    */
   dependencies: string[];
}

/**
 * Options for annotation process.
 */
interface IOptions {
   /**
    * Module name.
    */
   module: string;
   /**
    * File name.
    */
   fileName: string;
}

/**
 * Represents methods for AST nodes annotation.
 */
export class Annotator implements AstNodes.IAstVisitor<IAnnotatorContext, void> {

   /**
    *
    * @param nodes
    * @param context
    */
   visitAll(nodes: AstNodes.Ast[], context: IAnnotatorContext): void {
      nodes.map((node) => node.accept(this, context));
   }

   /**
    *
    * @param node
    * @param context
    */
   visitAttributeNode(node: AstNodes.AttributeNode, context: IAnnotatorContext): void {
      node.value.map((node) => node.accept(this, context));
   }

   /**
    *
    * @param node
    * @param context
    */
   visitBindNode(node: AstNodes.BindNode, context: IAnnotatorContext): void {
      return undefined;
   }

   /**
    *
    * @param node
    * @param context
    */
   visitCData(node: AstNodes.CDataNode, context: IAnnotatorContext): void {
      return;
   }

   /**
    *
    * @param node
    * @param context
    */
   visitComment(node: AstNodes.CommentNode, context: IAnnotatorContext): void {
      return;
   }

   /**
    *
    * @param collection
    * @param context
    */
   visitNodeData(collection: AstNodes.IAttributes | AstNodes.IOptions | AstNodes.IEvents, context: IAnnotatorContext): void {
      for (const name in collection) {
         if (collection.hasOwnProperty(name)) {
            collection[name].accept(this, context);
         }
      }
   }

   /**
    *
    * @param node
    * @param context
    */
   visitComponent(node: AstNodes.ComponentNode, context: IAnnotatorContext): void {
      this.visitNodeData(node.attributes, context);
      this.visitNodeData(node.options, context);
      this.visitNodeData(node.events, context);
      context.dependencies.push(node.name);
   }

   /**
    *
    * @param node
    * @param context
    */
   visitDoctype(node: AstNodes.DoctypeNode, context: IAnnotatorContext): void {
      return;
   }

   /**
    *
    * @param node
    * @param context
    */
   visitElement(node: AstNodes.ElementNode, context: IAnnotatorContext): void {
      this.visitNodeData(node.attributes, context);
      this.visitNodeData(node.events, context);
      node.content.map((node) => node.accept(this, context));
   }

   /**
    *
    * @param node
    * @param context
    */
   visitElse(node: AstNodes.ElseNode, context: IAnnotatorContext): void {
      node.consequent.map((node) => node.accept(this, context));
   }

   /**
    *
    * @param node
    * @param context
    */
   visitEventNode(node: AstNodes.EventNode, context: IAnnotatorContext): void {
      return undefined;
   }

   /**
    *
    * @param node
    * @param context
    */
   visitExpression(node: AstNodes.ExpressionNode, context: IAnnotatorContext): void {
      return undefined;
   }

   /**
    *
    * @param node
    * @param context
    */
   visitFor(node: AstNodes.ForNode, context: IAnnotatorContext): void {
      node.content.map((node) => node.accept(this, context));
   }

   /**
    *
    * @param node
    * @param context
    */
   visitForeach(node: AstNodes.ForeachNode, context: IAnnotatorContext): void {
      node.content.map((node) => node.accept(this, context));
   }

   /**
    *
    * @param node
    * @param context
    */
   visitIf(node: AstNodes.IfNode, context: IAnnotatorContext): void {
      node.consequent.map((node) => node.accept(this, context));
   }

   /**
    *
    * @param node
    * @param context
    */
   visitLocalization(node: AstNodes.LocalizationNode, context: IAnnotatorContext): void {
      context.dictionary.push(context.module, node.text, node.context);
   }

   /**
    *
    * @param node
    * @param context
    */
   visitContentOptionNode(node: AstNodes.ContentOptionNode, context: IAnnotatorContext): void {
      this.visitAll(node.content, context);
   }

   /**
    *
    * @param node
    * @param context
    */
   visitOptionNode(node: AstNodes.OptionNode, context: IAnnotatorContext): void {
      node.value.map((node) => node.accept(this, context));
   }

   /**
    *
    * @param node
    * @param context
    */
   visitPartial(node: AstNodes.PartialNode, context: IAnnotatorContext): void {
      this.visitNodeData(node.attributes, context);
      this.visitNodeData(node.options, context);
      this.visitNodeData(node.events, context);
   }

   /**
    *
    * @param node
    * @param context
    */
   visitTemplate(node: AstNodes.TemplateNode, context: IAnnotatorContext): void {
      node.content.map((node) => node.accept(this, context));
   }

   /**
    *
    * @param node
    * @param context
    */
   visitText(node: AstNodes.TextNode, context: IAnnotatorContext): void {
      context.dictionary.push(context.module, node.content);
   }

   /**
    *
    * @param ast
    * @param options
    */
   annotate(ast: AstNodes.Ast[], options: IOptions): IAnnotatedData {
      const context: IAnnotatorContext = {
         module: options.module,
         dictionary: new Dictionary(),
         dependencies: [],
         fileName: options.fileName
      };
      this.visitAll(ast, context);
      return {
         ast,
         dictionary: context.dictionary
      }
   }
}
