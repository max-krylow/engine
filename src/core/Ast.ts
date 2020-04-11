/// <amd-module name="engine/core/Ast" />

import { Expression } from "../expression/Expression";

/**
 * @file src/core/Ast.ts
 */

export enum Flags {
   BROKEN = 1,
   UNPACKED = 2,
   REPAIRED = 4
}

declare type TData = ArrayNode | BooleanNode | FunctionNode | NumberNode | ObjectNode | StringNode | ValueNode;
declare type TText = ProgramNode | TextNode;
declare type TContent = PartialNode | IfNode | ElseNode | ForNode | ForeachNode | ElementNode | ProgramNode | TextNode;

export interface ITextCollection {
   [ name: string ]: TText;
}

export interface IObjectProperties {
   [name: string]: TData | TContent;
}

export interface IEventsCollection {
   [ name: string ]: ProgramNode;
}

export interface IAstVisitor {
   visitArray(node: ArrayNode, context: any): any;
   visitBoolean(node: BooleanNode, context: any): any;
   visitFunction(node: FunctionNode, context: any): any;
   visitNumber(node: NumberNode, context: any): any;
   visitObject(node: ObjectNode, context: any): any;
   visitString(node: StringNode, context: any): any;
   visitValue(node: ValueNode, context: any): any;
   visitTemplate(node: TemplateNode, context: any): any;
   visitPartial(node: PartialNode, context: any): any;
   visitControl(node: ControlNode, context: any): any;
   visitIf(node: IfNode, context: any): any;
   visitElse(node: ElseNode, context: any): any;
   visitFor(node: ForNode, context: any): any;
   visitForeach(node: ForeachNode, context: any): any;
   visitElement(node: ElementNode, context: any): any;
   visitText(node: TextNode, context: any): any;
   visitDoctype(node: DoctypeNode, context: any): any;
   visitCData(node: CDataNode, context: any): any;
   visitComment(node: CommentNode, context: any): any;
   visitProgram(node: ProgramNode, context: any): any;
}

export abstract class Ast {
   flags: Flags;

   protected constructor(flags: Flags = 0) {
      this.flags = flags;
   }

   abstract accept(visitor: IAstVisitor, context: any): any;
}

export abstract class ActiveNode extends Ast {
   attributes: ITextCollection;
   events: IEventsCollection;

   protected constructor(attributes: ITextCollection, events: IEventsCollection) {
      super();
      this.attributes = attributes;
      this.events = events;
   }
}

export class ArrayNode extends Ast {
   elements: TData[] = [];

   constructor() {
      super();
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitArray(this, context);
   }
}

export class BooleanNode extends Ast {
   content: ProgramNode;

   constructor(content: ProgramNode) {
      super();
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitBoolean(this, context);
   }
}

export class FunctionNode extends Ast {
   content: ProgramNode;

   constructor(content: ProgramNode) {
      super();
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitFunction(this, context);
   }
}

export class NumberNode extends Ast {
   content: ProgramNode;

   constructor(content: ProgramNode) {
      super();
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitNumber(this, context);
   }
}

export class ObjectNode extends Ast {
   properties: IObjectProperties;

   constructor(properties: IObjectProperties) {
      super();
      this.properties = properties;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitObject(this, context);
   }
}

export class StringNode extends Ast {
   content: ProgramNode;

   constructor(content: ProgramNode) {
      super();
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitString(this, context);
   }
}

export class ValueNode extends Ast {
   content: ProgramNode;

   constructor(content: ProgramNode) {
      super();
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitValue(this, context);
   }
}

export class TemplateNode extends Ast {
   name: string;
   content: TContent[] = [];

   constructor(name: string) {
      super();
      this.name = name;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitTemplate(this, context);
   }
}

export class PartialNode extends ActiveNode {
   name: ProgramNode | string;
   options: IObjectProperties;

   constructor(name: ProgramNode | string, attributes: ITextCollection, options: IObjectProperties, events: IEventsCollection) {
      super(attributes, events);
      this.name = name;
      this.options = options;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitPartial(this, context);
   }
}

export class ControlNode extends ActiveNode {
   name: string;
   options: IObjectProperties;

   constructor(name: string, attributes: ITextCollection, options: IObjectProperties, events: IEventsCollection) {
      super(attributes, events);
      this.name = name;
      this.options = options;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitControl(this, context);
   }
}

export class IfNode extends Ast {
   test: ProgramNode;
   consequent: TContent;
   alternate: TContent | undefined;

   constructor(test: ProgramNode, consequent: TContent, alternate?: TContent) {
      super();
      this.test = test;
      this.consequent = consequent;
      this.alternate = alternate;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitIf(this, context);
   }
}

export class ElseNode extends Ast {
   consequent: TContent;
   test: ProgramNode | undefined;
   alternate: TContent | undefined;

   constructor(consequent: TContent, test?: ProgramNode, alternate?: TContent) {
      super();
      this.consequent = consequent;
      this.test = test;
      this.alternate = alternate;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitElse(this, context);
   }
}

export class ForNode extends Ast {
   init: ProgramNode | undefined;
   test: ProgramNode | undefined;
   update: ProgramNode | undefined;
   content: TContent[];

   constructor(init: ProgramNode | undefined, test: ProgramNode | undefined, update: ProgramNode | undefined, content: TContent[]) {
      super();
      this.init = init;
      this.test = test;
      this.update = update;
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitFor(this, context);
   }
}

export class ForeachNode extends Ast {
   index: ProgramNode | undefined;
   iterator: ProgramNode;
   collection: ProgramNode;
   content: TContent[];

   constructor(index: ProgramNode | undefined, iterator: ProgramNode, collection: ProgramNode, content: TContent[]) {
      super();
      this.index = index;
      this.iterator = iterator;
      this.collection = collection;
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitForeach(this, context);
   }
}

export class ElementNode extends ActiveNode {
   name: string;
   content: TContent[] = [];

   constructor(name: string, attributes: ITextCollection, events: IEventsCollection) {
      super(attributes, events);
      this.name = name;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitElement(this, context);
   }
}

export class TextNode extends Ast {
   content: string;

   constructor(content: string) {
      super();
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitText(this, context);
   }
}

export class DoctypeNode extends Ast {
   content: string;

   constructor(content: string) {
      super();
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitDoctype(this, context);
   }
}

export class CDataNode extends Ast {
   content: string;

   constructor(content: string) {
      super();
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitCData(this, context);
   }
}

export class CommentNode extends Ast {
   content: string;

   constructor(content: string) {
      super();
      this.content = content;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitComment(this, context);
   }
}

export class ProgramNode extends Ast {
   expressions: Expression[];

   constructor(expressions: Expression[]) {
      super();
      this.expressions = expressions;
   }

   accept(visitor: IAstVisitor, context: any): any {
      return visitor.visitProgram(this, context);
   }
}
