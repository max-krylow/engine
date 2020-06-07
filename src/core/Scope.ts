/// <amd-module name="engine/core/Scope" />

import { TemplateNode } from './Ast';
import { Dictionary, IDictionaryItem } from "./i18n";

/**
 *
 */
export interface ITemplates {
   /**
    *
    */
   [name: string]: {
      /**
       *
       */
      node: TemplateNode;
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
   protected parent: Scope | null;
   /**
    *
    */
   private readonly templates: ITemplates;
   /**
    *
    */
   private readonly translations: Dictionary;
   /**
    *
    */
   private readonly dependencies: string[];

   /**
    *
    * @param parent
    */
   constructor(parent: Scope | null = null) {
      if (parent) {
         this.parent = parent;
         this.templates = parent.templates;
         this.translations = parent.translations;
         this.dependencies = parent.dependencies;
         return;
      }
      this.parent = null;
      this.templates = { };
      this.translations = new Dictionary();
      this.dependencies = [];
   }

   /**
    *
    * @param node
    */
   registerTemplate(node: TemplateNode): void {
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
   getTemplateNode(name: string): TemplateNode {
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

   /**
    *
    * @param module
    * @param text
    * @param context
    */
   registerTranslation(module: string, text: string, context: string = ''): void {
      this.translations.push(module, text, context);
   }

   /**
    *
    * @param name
    */
   registerDependency(name: string): void {
      this.dependencies.push(name);
   }

   /**
    *
    */
   getDependencies(): string[] {
      return this.dependencies;
   }

   /**
    *
    */
   getTranslations(): IDictionaryItem[] {
      return this.translations.getItems();
   }
}
