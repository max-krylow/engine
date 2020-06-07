/// <amd-module name="engine/core/Annotate" />

import * as AstNodes from "./Ast";
import { Scope } from "./Scope";

/**
 *
 */
export interface IOptions {
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
 *
 */
interface IAnnotationContext extends IOptions {
   /**
    *
    */
   scope: Scope;
}

/**
 * Interface for result object of annotation.
 */
interface IAnnotatedData {
   /**
    * Annotated abstract syntax tree.
    */
   ast: AstNodes.Ast[];
   /**
    *
    */
   scope: Scope;
}

/**
 * Represents methods for AST nodes annotation.
 */
export class AnnotateVisitor implements AstNodes.IAstVisitor<IAnnotationContext, void> {

   /**
    *
    * @param nodes
    * @param context
    */
   visitAll(nodes: AstNodes.Ast[], context: IAnnotationContext): void {
      nodes.map((node) => node.accept(this, context));
   }

   /**
    *
    * @param node
    * @param context
    */
   visitAttributeNode(node: AstNodes.AttributeNode, context: IAnnotationContext): void {
      node.value.map((node) => node.accept(this, context));
   }

   /**
    *
    * @param node
    * @param context
    */
   visitBindNode(node: AstNodes.BindNode, context: IAnnotationContext): void {
      return undefined;
   }

   /**
    *
    * @param node
    * @param context
    */
   visitCData(node: AstNodes.CDataNode, context: IAnnotationContext): void {
      return;
   }

   /**
    *
    * @param node
    * @param context
    */
   visitComment(node: AstNodes.CommentNode, context: IAnnotationContext): void {
      return;
   }

   /**
    *
    * @param collection
    * @param context
    */
   visitNodeData(collection: AstNodes.IAttributes | AstNodes.IOptions | AstNodes.IEvents, context: IAnnotationContext): void {
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
   visitComponent(node: AstNodes.ComponentNode, context: IAnnotationContext): void {
      this.visitNodeData(node.attributes, context);
      this.visitNodeData(node.options, context);
      this.visitNodeData(node.events, context);
      context.scope.registerDependency(node.name);
   }

   /**
    *
    * @param node
    * @param context
    */
   visitDoctype(node: AstNodes.DoctypeNode, context: IAnnotationContext): void {
      return;
   }

   /**
    *
    * @param node
    * @param context
    */
   visitElement(node: AstNodes.ElementNode, context: IAnnotationContext): void {
      this.visitNodeData(node.attributes, context);
      this.visitNodeData(node.events, context);
      node.content.map((node) => node.accept(this, context));
   }

   /**
    *
    * @param node
    * @param context
    */
   visitElse(node: AstNodes.ElseNode, context: IAnnotationContext): void {
      node.consequent.map((node) => node.accept(this, context));
   }

   /**
    *
    * @param node
    * @param context
    */
   visitEventNode(node: AstNodes.EventNode, context: IAnnotationContext): void {
      return undefined;
   }

   /**
    *
    * @param node
    * @param context
    */
   visitExpression(node: AstNodes.ExpressionNode, context: IAnnotationContext): void {
      return undefined;
   }

   /**
    *
    * @param node
    * @param context
    */
   visitFor(node: AstNodes.ForNode, context: IAnnotationContext): void {
      const newContext: IAnnotationContext = { ...context };
      newContext.scope = new Scope(context.scope);
      node.content.map((node) => node.accept(this, newContext));
   }

   /**
    *
    * @param node
    * @param context
    */
   visitForeach(node: AstNodes.ForeachNode, context: IAnnotationContext): void {
      const newContext: IAnnotationContext = { ...context };
      newContext.scope = new Scope(context.scope);
      node.content.map((node) => node.accept(this, newContext));
   }

   /**
    *
    * @param node
    * @param context
    */
   visitIf(node: AstNodes.IfNode, context: IAnnotationContext): void {
      node.consequent.map((node) => node.accept(this, context));
   }

   /**
    *
    * @param node
    * @param context
    */
   visitLocalization(node: AstNodes.LocalizationNode, context: IAnnotationContext): void {
      context.scope.registerTranslation(context.module, node.text, node.context);
   }

   /**
    *
    * @param node
    * @param context
    */
   visitContentOptionNode(node: AstNodes.ContentOptionNode, context: IAnnotationContext): void {
      this.visitAll(node.content, context);
   }

   /**
    *
    * @param node
    * @param context
    */
   visitOptionNode(node: AstNodes.OptionNode, context: IAnnotationContext): void {
      node.value.map((node) => node.accept(this, context));
   }

   /**
    *
    * @param node
    * @param context
    */
   visitPartial(node: AstNodes.PartialNode, context: IAnnotationContext): void {
      this.visitNodeData(node.attributes, context);
      this.visitNodeData(node.options, context);
      this.visitNodeData(node.events, context);
   }

   /**
    *
    * @param node
    * @param context
    */
   visitTemplate(node: AstNodes.TemplateNode, context: IAnnotationContext): void {
      node.content.map((node) => node.accept(this, context));
   }

   /**
    *
    * @param node
    * @param context
    */
   visitText(node: AstNodes.TextNode, context: IAnnotationContext): void {
      context.scope.registerTranslation(context.module, node.content);
   }

   /**
    *
    * @param ast {Ast[]}
    * @param options
    */
   annotate(ast: AstNodes.Ast[], options: IOptions): IAnnotatedData {
      const context: IAnnotationContext = {
         ...options,
         scope: new Scope()
      };
      this.visitAll(ast, context);
      return {
         ast,
         scope: context.scope
      }
   }
}
