/// <amd-module name="engine/expression/Expression" />

/**
 * @file src/expression/Expression.ts
 */

export interface IVisitor {
   visitExpression(node: Expression, context: any): any;
}

export abstract class Node {
   abstract accept(visitor: IVisitor, context: any): any;
}

export class Expression extends Node {
   text: string;

   constructor(text: string) {
      super();
      this.text = text;
   }

   accept(visitor: IVisitor, context: any): any {
      return visitor.visitExpression(this, context);
   }
}
