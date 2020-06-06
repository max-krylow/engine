/// <amd-module name="engine/core/Annotator" />

import * as AstNodes from "./Ast";
import { Dictionary } from "./i18n";

interface IAnnotatedData {
   ast: AstNodes.Ast[];
   dictionary: Dictionary;
}

interface IAnnotatorContext {
   dictionary: Dictionary;
   module: string;
   dependencies: string[];
}

interface IOptions {
   module: string;
}

export class Annotator implements AstNodes.IAstVisitor<IAnnotatorContext, void> {
   visitAll(nodes: AstNodes.Ast[], context: IAnnotatorContext): void {
      nodes.map((node) => node.accept(this, context));
   }

   visitAttributeNode(node: AstNodes.AttributeNode, context: IAnnotatorContext): void {
      node.value.map((node) => node.accept(this, context));
   }

   visitBindNode(node: AstNodes.BindNode, context: IAnnotatorContext): void {
      return undefined;
   }

   visitCData(node: AstNodes.CDataNode, context: IAnnotatorContext): void {
      return;
   }

   visitComment(node: AstNodes.CommentNode, context: IAnnotatorContext): void {
      return;
   }

   visitNodeData(collection: AstNodes.IAttributes | AstNodes.IOptions | AstNodes.IEvents, context: IAnnotatorContext): void {
      for (const name in collection) {
         if (collection.hasOwnProperty(name)) {
            collection[name].accept(this, context);
         }
      }
   }

   visitComponent(node: AstNodes.ComponentNode, context: IAnnotatorContext): void {
      this.visitNodeData(node.attributes, context);
      this.visitNodeData(node.options, context);
      this.visitNodeData(node.events, context);
      context.dependencies.push(node.name);
   }

   visitDoctype(node: AstNodes.DoctypeNode, context: IAnnotatorContext): void {
      return;
   }

   visitElement(node: AstNodes.ElementNode, context: IAnnotatorContext): void {
      this.visitNodeData(node.attributes, context);
      this.visitNodeData(node.events, context);
      node.content.map((node) => node.accept(this, context));
   }

   visitElse(node: AstNodes.ElseNode, context: IAnnotatorContext): void {
      node.consequent.map((node) => node.accept(this, context));
   }

   visitEventNode(node: AstNodes.EventNode, context: IAnnotatorContext): void {
      return undefined;
   }

   visitExpression(node: AstNodes.ExpressionNode, context: IAnnotatorContext): void {
      return undefined;
   }

   visitFor(node: AstNodes.ForNode, context: IAnnotatorContext): void {
      node.content.map((node) => node.accept(this, context));
   }

   visitForeach(node: AstNodes.ForeachNode, context: IAnnotatorContext): void {
      node.content.map((node) => node.accept(this, context));
   }

   visitIf(node: AstNodes.IfNode, context: IAnnotatorContext): void {
      node.consequent.map((node) => node.accept(this, context));
   }

   visitLocalization(node: AstNodes.LocalizationNode, context: IAnnotatorContext): void {
      context.dictionary.push(context.module, node.text, node.context);
   }

   visitContentOptionNode(node: AstNodes.ContentOptionNode, context: IAnnotatorContext): void {
      this.visitAll(node.content, context);
   }

   visitOptionNode(node: AstNodes.OptionNode, context: IAnnotatorContext): void {
      node.value.map((node) => node.accept(this, context));
   }

   visitPartial(node: AstNodes.PartialNode, context: IAnnotatorContext): void {
      this.visitNodeData(node.attributes, context);
      this.visitNodeData(node.options, context);
      this.visitNodeData(node.events, context);
   }

   visitTemplate(node: AstNodes.TemplateNode, context: IAnnotatorContext): void {
      node.content.map((node) => node.accept(this, context));
   }

   visitText(node: AstNodes.TextNode, context: IAnnotatorContext): void {
      context.dictionary.push(context.module, node.content);
   }

   annotate(ast: AstNodes.Ast[], options: IOptions): IAnnotatedData {
      const context: IAnnotatorContext = {
         module: options.module,
         dictionary: new Dictionary(),
         dependencies: []
      };
      this.visitAll(ast, context);
      return {
         ast,
         dictionary: context.dictionary
      }
   }
}
