/// <amd-module name="engine/core/Scope" />

import * as AstNodes from './Ast';

/**
 *
 */
interface ITemplates {
   /**
    *
    */
   [name: string]: {
      /**
       *
       */
      node: AstNodes.TemplateNode;
      /**
       *
       */
      usages: number;
   };
}

/**
 *
 */
export class Scope {
   /**
    *
    */
   parent: Scope | null;
   /**
    *
    */
   templates: ITemplates;

   /**
    *
    * @param parent
    */
   constructor(parent: Scope | null = null) {
      this.parent = parent;
      this.templates = parent !== null ? parent.templates : { };
   }

   /**
    *
    * @param node
    */
   registerTemplate(node: AstNodes.TemplateNode): void {
      if (this.templates.hasOwnProperty(node.name)) {
         throw new Error(`Template with name "${node.name}" has already been declared in this scope`);
      }
      this.templates[node.name] = {
         node,
         usages: 0
      };
   }

   /**
    *
    * @param templateName
    */
   registerTemplateUsage(templateName: string): void {
      if (!this.templates.hasOwnProperty(templateName)) {
         throw new Error(`Template with name "${templateName}" has not been declared in this scope`);
      }
      ++this.templates[templateName].usages;
   }

   /**
    *
    * @param name
    */
   getTemplateNode(name: string): AstNodes.TemplateNode {
      if (!this.templates.hasOwnProperty(name)) {
         throw new Error(`Template with name "${name}" has not been declared in this scope`);
      }
      return this.templates[name].node;
   }

   /**
    *
    * @param name
    */
   getTemplateUsages(name: string): number {
      if (!this.templates.hasOwnProperty(name)) {
         throw new Error(`Template with name "${name}" has not been declared in this scope`);
      }
      return this.templates[name].usages;
   }
}
