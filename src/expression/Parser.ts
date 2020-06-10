/// <amd-module name="engine/expression/Parser" />
// tslint:disable


/**
 * @file src/expression/Parser.ts
 */

const { Parser: RawParser } = require('./resource/parser');

export interface Position {
   line: number;
   column: number;
}

export interface SourceLocation {
   start: Position;
   end: Position;
}

export interface IExpressionVisitor<C, R> {
   visitProgramNode(node: ProgramNode, context: C): R;
   visitEmptyStatementNode(node: EmptyStatementNode, context: C): R;
   visitExpressionStatementNode(node: ExpressionStatementNode, context: C): R;
   visitVariableDeclarationNode(node: VariableDeclarationNode, context: C): R;
   visitVariableDeclaratorNode(node: VariableDeclaratorNode, context: C): R;
   visitThisExpressionNode(node: ThisExpressionNode, context: C): R;
   visitArrayExpressionNode(node: ArrayExpressionNode, context: C): R;
   visitObjectExpressionNode(node: ObjectExpressionNode, context: C): R;
   visitSequenceExpressionNode(node: SequenceExpressionNode, context: C): R;
   visitUnaryExpressionNode(node: UnaryExpressionNode, context: C): R;
   visitBinaryExpressionNode(node: BinaryExpressionNode, context: C): R;
   visitAssignmentExpressionNode(node: AssignmentExpressionNode, context: C): R;
   visitUpdateExpressionNode(node: UpdateExpressionNode, context: C): R;
   visitLogicalExpressionNode(node: LogicalExpressionNode, context: C): R;
   visitConditionalExpressionNode(node: ConditionalExpressionNode, context: C): R;
   visitNewExpressionNode(node: NewExpressionNode, context: C): R;
   visitCallExpressionNode(node: CallExpressionNode, context: C): R;
   visitMemberExpressionNode(node: MemberExpressionNode, context: C): R;
   visitIdentifierNode(node: IdentifierNode, context: C): R;
   visitLiteralNode(node: LiteralNode, context: C): R
}

export class StringVisitor implements IExpressionVisitor<void, string> {
   public visitProgramNode(node: ProgramNode, context: any): string {
      let elements = node.body;
      let str = "";
      for (let i = 0, len = elements.length; i < len; i++) {
         str += elements[i].accept(this, context);
      }
      return str;
   }

   public visitEmptyStatementNode(node: EmptyStatementNode, context: any): string {
      return ";";
   }

   public visitExpressionStatementNode(node: ExpressionStatementNode, context: any): string {
      return node.expression.accept(this, context);
   }

   public visitVariableDeclarationNode(node: VariableDeclarationNode, context: any): string {
      let str = node.kind + " ";
      let declarations = node.declarations;
      for (let i = 0, len = declarations.length; i < len; i++) {
         if (i !== 0) {
            str += ",";
         }
         str += declarations[i].accept(this, context);
      }
      return str;
   }

   public visitVariableDeclaratorNode(node: VariableDeclaratorNode, context: any): string {
      let str = node.id.accept(this, context);
      let init = node.init;
      if (init !== null) {
         str += " = " + init.accept(this, context);
      }
      return str;
   }

   public visitThisExpressionNode(node: ThisExpressionNode, context: any): string {
      return "this";
   }

   public visitArrayExpressionNode(node: ArrayExpressionNode, context: any): string {
      let str = "[";
      let elements = node.elements;
      for (let i = 0, len = elements.length; i < len; i++) {
         const element = elements[i];
         if (i !== 0) {
            str += ",";
         }
         if (element !== null) {
            str += element.accept(this, context);
         }
      }
      return str + "]";
   }

   public visitObjectExpressionNode(node: ObjectExpressionNode, context: any): string {
      let str = "{";
      let properties = node.properties;
      for (let i = 0, len = properties.length; i < len; i++) {
         let prop = properties[i];
         let key = prop.key;
         let value = prop.value;
         if (i !== 0) {
            str += ",";
         }
         str += key.accept(this, context) + ":" + value.accept(this, context);
      }
      return str + "}";
   }

   public visitSequenceExpressionNode(node: SequenceExpressionNode, context: any): string {
      let str = "";
      let expressions = node.expressions;
      for (let i = 0, len = expressions.length; i < len; i++) {
         if (i !== 0) {
            str += ",";
         }
         str += expressions[i].accept(this, context);
      }
      return str;
   }

   public visitUnaryExpressionNode(node: UnaryExpressionNode, context: any): string {
      const argument = node.argument.accept(this, context);
      if (['delete', 'typeof', 'void'].indexOf(node.operator) > -1) {
         return `${node.operator} ${argument}`;
      }
      return `${node.operator}${argument}`;
   }

   public visitBinaryExpressionNode(node: BinaryExpressionNode, context: any): string {
      const left = node.left.accept(this, context);
      const right = node.right.accept(this, context);
      return `${left} ${node.operator} ${right}`;
   }

   public visitAssignmentExpressionNode(node: AssignmentExpressionNode, context: any): string {
      const left = node.left.accept(this, context);
      const right = node.right.accept(this, context);
      return `${left} ${node.operator} ${right}`;
   }

   public visitUpdateExpressionNode(node: UpdateExpressionNode, context: any): string {
      const argument = node.argument.accept(this, context);
      if (node.prefix) {
         return `${node.operator}${argument}`;
      }
      return `${argument}${node.operator}`;
   }

   public visitLogicalExpressionNode(node: LogicalExpressionNode, context: any): string {
      return node.left.accept(this, context) + node.operator + node.right.accept(this, context);
   }

   public visitConditionalExpressionNode(node: ConditionalExpressionNode, context: any): string {
      return node.test.accept(this, context) + "?" + node.consequent.accept(this, context) + ":" + node.alternate.accept(this, context);
   }

   public visitNewExpressionNode(node: NewExpressionNode, context: any): string {
      let str = "new " + node.callee.accept(this, context);
      let args = node.arguments;
      if (args !== null) {
         str += "(";
         for (let i = 0, len = args.length; i < len; i++) {
            if (i !== 0) {
               str += ",";
            }
            str += args[i].accept(this, context);
         }
         str += ")";
      }
      return str;
   }

   public visitCallExpressionNode(node: CallExpressionNode, context: any): string {
      let str = node.callee.accept(this, context) + "(";
      let args = node.arguments;
      for (let i = 0, len = args.length; i < len; i++) {
         if (i !== 0) {
            str += ",";
         }
         str += args[i].accept(this, context);
      }
      return str + ")";
   }

   public visitMemberExpressionNode(node: MemberExpressionNode, context: any): string {
      if (node.computed) {
         return node.object.accept(this, context) + "[" + node.property.accept(this, context) + "]";
      }
      return node.object.accept(this, context) + "." + node.property.accept(this, context);
   }

   public visitIdentifierNode(node: IdentifierNode, context: any): string {
      return node.name;
   }

   public visitLiteralNode(node: LiteralNode, context: any): string {
      return node.value;
   }
}

export abstract class Node {
   public type: string;
   public loc: SourceLocation;
   protected constructor(type: string, loc: SourceLocation) {
      this.type = type;
      this.loc = loc;
   }
   abstract accept(visitor: IExpressionVisitor<any, any>, context: any): any;
}

export class ProgramNode extends Node {
   public body: ExpressionStatementNode[];
   constructor(body: ExpressionStatementNode[], loc: SourceLocation) {
      super("Program", loc);
      this.body = body;
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitProgramNode(this, context);
   }
}

export class EmptyStatementNode extends Node {
   constructor(loc: SourceLocation) {
      super("EmptyStatement", loc);
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitEmptyStatementNode(this, context);
   }
}

export class ExpressionStatementNode extends Node {
   public expression: Node;
   constructor(expression: Node, loc: SourceLocation) {
      super("ExpressionStatement", loc);
      this.expression = expression;
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitExpressionStatementNode(this, context);
   }
}

export class VariableDeclarationNode extends Node {
   public declarations: Node[];
   public kind: string;
   constructor(declarations: Node[], kind: string, loc: SourceLocation) {
      super("VariableDeclaration", loc);
      this.declarations = declarations;
      this.kind = kind;
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitVariableDeclarationNode(this, context);
   }
}

export class VariableDeclaratorNode extends Node {
   public id: IdentifierNode;
   public init: Node | null;
   constructor(id: IdentifierNode, init: Node | null, loc: SourceLocation) {
      super("VariableDeclarator", loc);
      this.id = id;
      this.init = init;
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitVariableDeclaratorNode(this, context);
   }
}

export class ThisExpressionNode extends Node {
   constructor(discriminant: Node, cases: Node[], loc: SourceLocation) {
      super("ThisExpression", loc);
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitThisExpressionNode(this, context);
   }
}

declare type TArrayElement = Node | null;

export class ArrayExpressionNode extends Node {
   public elements: TArrayElement[];
   constructor(elements: Node[], loc: SourceLocation) {
      super("ArrayExpression", loc);
      this.elements = elements;
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitArrayExpressionNode(this, context);
   }
}

interface IObjectProperty {
   key: Node;
   value: Node;
}

export class ObjectExpressionNode extends Node {
   public properties: IObjectProperty[];
   constructor(properties: IObjectProperty[], loc: SourceLocation) {
      super("ObjectExpression", loc);
      this.properties = properties;
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitObjectExpressionNode(this, context);
   }
}

export class SequenceExpressionNode extends Node {
   public expressions: Node[];
   constructor(expressions: Node[], loc: SourceLocation) {
      super("SequenceExpression", loc);
      this.expressions = expressions;
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitSequenceExpressionNode(this, context);
   }
}

export class UnaryExpressionNode extends Node {
   public operator: string;
   public prefix: boolean;
   public argument: Node;
   constructor(operator: string, prefix: boolean, argument: Node, loc: SourceLocation) {
      super("UnaryExpression", loc);
      this.operator = operator;
      this.prefix = prefix;
      this.argument = argument;
      this.loc = loc;
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitUnaryExpressionNode(this, context);
   }
}

export class BinaryExpressionNode extends Node {
   public operator: string;
   public left: Node;
   public right: Node;
   constructor(operator: string, left: Node, right: Node, loc: SourceLocation) {
      super("BinaryExpression", loc);
      this.operator = operator;
      this.left = left;
      this.right = right;
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitBinaryExpressionNode(this, context);
   }
}

export class AssignmentExpressionNode extends Node {
   public operator: string;
   public left: Node;
   public right: Node;
   constructor(operator: string, left: Node, right: Node, loc: SourceLocation) {
      super("AssignmentExpression", loc);
      this.operator = operator;
      this.left = left;
      this.right = right;
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitAssignmentExpressionNode(this, context);
   }
}

export class UpdateExpressionNode extends Node {
   public operator: string;
   public argument: Node;
   public prefix: boolean;
   constructor(operator: string, argument: Node, prefix: boolean, loc: SourceLocation) {
      super("UpdateExpression", loc);
      this.operator = operator;
      this.argument = argument;
      this.prefix = prefix;
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitUpdateExpressionNode(this, context);
   }
}

export class LogicalExpressionNode extends Node {
   public operator: string;
   public left: Node;
   public right: Node;
   constructor(operator: string, left: Node, right: Node, loc: SourceLocation) {
      super("LogicalExpression", loc);
      this.operator = operator;
      this.left = left;
      this.right = right;
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitLogicalExpressionNode(this, context);
   }
}

export class ConditionalExpressionNode extends Node {
   public test: Node;
   public consequent: Node;
   public alternate: Node;
   constructor(test: Node, consequent: Node, alternate: Node, loc: SourceLocation) {
      super("ConditionalExpression", loc);
      this.test = test;
      this.consequent = consequent;
      this.alternate = alternate;
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitConditionalExpressionNode(this, context);
   }
}

export class NewExpressionNode extends Node {
   public callee: Node;
   public arguments: Node[];
   constructor(callee: Node, args: Node[], loc: SourceLocation) {
      super("NewExpression", loc);
      this.callee = callee;
      this.arguments = args;
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitNewExpressionNode(this, context);
   }
}

export class CallExpressionNode extends Node {
   public callee: Node;
   public arguments: Node[];
   constructor(callee: Node, args: Node[], loc: SourceLocation) {
      super("CallExpression", loc);
      this.callee = callee;
      this.arguments = args;
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitCallExpressionNode(this, context);
   }
}

export class MemberExpressionNode extends Node {
   public object: Node;
   public property: Node;
   public computed: boolean;
   constructor(object: Node, property: Node, computed: boolean, loc: SourceLocation) {
      super("MemberExpression", loc);
      this.object = object;
      this.property = property;
      this.computed = computed;
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitMemberExpressionNode(this, context);
   }
}

export class IdentifierNode extends Node {
   public name: string;
   constructor(name: string, loc: SourceLocation) {
      super("Identifier", loc);
      this.name = name;
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitIdentifierNode(this, context);
   }
}

export class LiteralNode extends Node {
   public value: string;
   constructor(value: string, loc: SourceLocation) {
      super("Literal", loc);
      this.value = value;
   }
   public accept(visitor: IExpressionVisitor<any, any>, context: any): any {
      return visitor.visitLiteralNode(this, context);
   }
}

const ParserMixin = {
   nodes: {
      ProgramNode: ProgramNode,
      EmptyStatementNode: EmptyStatementNode,
      ExpressionStatementNode: ExpressionStatementNode,
      VariableDeclarationNode: VariableDeclarationNode,
      VariableDeclaratorNode: VariableDeclaratorNode,
      ThisExpressionNode: ThisExpressionNode,
      ArrayExpressionNode: ArrayExpressionNode,
      ObjectExpressionNode: ObjectExpressionNode,
      SequenceExpressionNode: SequenceExpressionNode,
      UnaryExpressionNode: UnaryExpressionNode,
      BinaryExpressionNode: BinaryExpressionNode,
      AssignmentExpressionNode: AssignmentExpressionNode,
      UpdateExpressionNode: UpdateExpressionNode,
      LogicalExpressionNode: LogicalExpressionNode,
      ConditionalExpressionNode: ConditionalExpressionNode,
      NewExpressionNode: NewExpressionNode,
      CallExpressionNode: CallExpressionNode,
      MemberExpressionNode: MemberExpressionNode,
      IdentifierNode: IdentifierNode,
      LiteralNode: LiteralNode
   },
   newLine: false,
   wasNewLine: false,
   restricted: false,
   parseError: function(message: string, hash: any): void {
      if (!((hash.expected && hash.expected.indexOf("';'") >= 0) && (
         hash.token === "}" ||
         hash.token === "EOF" ||
         hash.token === "BR++" ||
         hash.token === "BR--" ||
         this.newLine ||
         this.wasNewLine
      ))) {
         throw new SyntaxError(message);
      }
   }
};

export interface IParser {
   parse(data: string): ProgramNode;
}

Object.assign(RawParser.prototype, ParserMixin);
export const Parser: new () => IParser = RawParser;
