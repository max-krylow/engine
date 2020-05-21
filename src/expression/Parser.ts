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
   visitBlockStatementNode(node: BlockStatementNode, context: C): R;
   visitExpressionStatementNode(node: ExpressionStatementNode, context: C): R;
   visitIfStatementNode(node: IfStatementNode, context: C): R;
   visitLabeledStatementNode(node: LabeledStatementNode, context: C): R;
   visitBreakStatementNode(node: BreakStatementNode, context: C): R;
   visitContinueStatementNode(node: ContinueStatementNode, context: C): R;
   visitWithStatementNode(node: WithStatementNode, context: C): R;
   visitSwitchStatementNode(node: SwitchStatementNode, context: C): R;
   visitReturnStatementNode(node: ReturnStatementNode, context: C): R;
   visitThrowStatementNode(node: ThrowStatementNode, context: C): R;
   visitTryStatementNode(node: TryStatementNode, context: C): R;
   visitWhileStatementNode(node: WhileStatementNode, context: C): R;
   visitDoWhileStatementNode(node: DoWhileStatementNode, context: C): R;
   visitForStatementNode(node: ForStatementNode, context: C): R;
   visitForInStatementNode(node: ForInStatementNode, context: C): R;
   visitDebuggerStatementNode(node: DebuggerStatementNode, context: C): R;
   visitFunctionDeclarationNode(node: FunctionDeclarationNode, context: C): R;
   visitVariableDeclarationNode(node: VariableDeclarationNode, context: C): R;
   visitVariableDeclaratorNode(node: VariableDeclaratorNode, context: C): R;
   visitThisExpressionNode(node: ThisExpressionNode, context: C): R;
   visitArrayExpressionNode(node: ArrayExpressionNode, context: C): R;
   visitObjectExpressionNode(node: ObjectExpressionNode, context: C): R;
   visitFunctionExpressionNode(node: FunctionExpressionNode, context: C): R;
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
   visitSwitchCaseNode(node: SwitchCaseNode, context: C): R;
   visitCatchClauseNode(node: CatchClauseNode, context: C): R;
   visitIdentifierNode(node: IdentifierNode, context: C): R;
   visitLiteralNode(node: LiteralNode, context: C): R
}

export class StringVisitor implements IExpressionVisitor<void, string> {
   public visitProgramNode(node: ProgramNode, context: any): any {
      let elements = node.body;
      let str = "";
      for (let i = 0, len = elements.length; i < len; i++) {
         str += elements[i].accept(this, context);
      }
      return str;
   }
   public visitEmptyStatementNode(node: EmptyStatementNode, context: any): any {
      return ";";
   }
   public visitBlockStatementNode(node: BlockStatementNode, context: any): any {
      let statements = node.body;
      let str = "{";
      for (let i = 0, len = statements.length; i < len; i++) {
         str += statements[i].accept(this, context);
      }
      return str + "}";
   }
   public visitExpressionStatementNode(node: ExpressionStatementNode, context: any): any {
      return node.expression.accept(this, context) + ";";
   }
   public visitIfStatementNode(node: IfStatementNode, context: any): any {
      let str = "if(" + node.test.accept(this, context) + ")";
      let consequent = node.consequent;
      let alternate = node.alternate;
      str += consequent.accept(this, context);
      if (alternate !== null) {
         str += "else";
         str += alternate.accept(this, context);
      }
      return str;
   }
   public visitLabeledStatementNode(node: LabeledStatementNode, context: any): any {
      return node.label.accept(this, context) + ":" + node.body.accept(this, context);
   }
   public visitBreakStatementNode(node: BreakStatementNode, context: any): any {
      let str = "break";
      let label = node.label;
      if (label !== null) {
         str += " " + label.accept(this, context);
      }
      return str + ";";
   }
   public visitContinueStatementNode(node: ContinueStatementNode, context: any): any {
      let str = "continue";
      let label = node.label;
      if (label !== null) {
         str += " " + label.accept(this, context);
      }
      return str + ";";
   }
   public visitWithStatementNode(node: WithStatementNode, context: any): any {
      let str = "with(" + node.object.accept(this, context) + ")";
      let body = node.body;
      str += body.accept(this, context);
      return str;
   }
   public visitSwitchStatementNode(node: SwitchStatementNode, context: any): any {
      let str = "switch(" + node.discriminant.accept(this, context) + ")" + "{";
      let cases = node.cases;
      for (let i = 0, len = cases.length; i < len; i++) {
         str += cases[i].accept(this, context);
      }
      return str + "}";
   }
   public visitReturnStatementNode(node: ReturnStatementNode, context: any): any {
      let str = "return";
      let argument = node.argument;
      if (argument !== null) {
         str += " " + argument.accept(this, context);
      }
      return str + ";";
   }
   public visitThrowStatementNode(node: ThrowStatementNode, context: any): any {
      let str = "throw";
      let argument = node.argument;
      if (argument !== null) {
         str += " " + argument.accept(this, context);
      }
      return str + ";";
   }
   public visitTryStatementNode(node: TryStatementNode, context: any): any {
      let str = "try";
      let handlers = node.handlers;
      let finalizer = node.finalizer;
      str += node.block.accept(this, context);
      if (handlers !== null) {
         for (let i = 0; i < handlers.length; ++i) {
            str += handlers[i].accept(this, context);
         }
      }
      if (finalizer !== null) {
         str += "finally" + finalizer.accept(this, context);
      }
      return str;
   }
   public visitWhileStatementNode(node: WhileStatementNode, context: any): any {
      let str = "while(" + node.test.accept(this, context) + ")";
      let body = node.body;
      str += body.accept(this, context);
      return str;
   }
   public visitDoWhileStatementNode(node: DoWhileStatementNode, context: any): any {
      let str = "do";
      let body = node.body;
      str += body.accept(this, context);
      return str + "while(" + node.test.accept(this, context) + ");";
   }
   public visitForStatementNode(node: ForStatementNode, context: any): any {
      let str = "for(";
      let init = node.init;
      let test = node.test;
      let update = node.update;
      let body = node.body;
      if (init !== null) {
         if (Array.isArray(init)) {
            str += "var ";
            for (let i = 0, len = init.length; i < len; i++) {
               if (i !== 0) {
                  str += ", ";
               }
               str += init[i].accept(this, context);
            }
         } else {
            str += init.accept(this, context);
         }
      }
      str += ";";
      if (test !== null) {
         str += test.accept(this, context);
      }
      str += ";";
      if (update != null) {
         str += update.accept(this, context);
      }
      str += ")";
      str += body.accept(this, context);
      return str;
   }
   public visitForInStatementNode(node: ForInStatementNode, context: any): any {
      let str = "for(";
      let left = node.left;
      let body = node.body;
      if (left !== null) {
         str += left.accept(this, context);
      }
      str += " in " + node.right.accept(this, context) + ")";
      str += body.accept(this, context);
      return str;
   }
   public visitDebuggerStatementNode(node: DebuggerStatementNode, context: any): any {
      return "debugger;";
   }
   public visitFunctionDeclarationNode(node: FunctionDeclarationNode, context: any): any {
      let str = "function " + node.id + "(";
      let params = node.params;
      let body = node.body;
      for (let i = 0, len = params.length; i < len; i++) {
         if (i !== 0) {
            str += ",";
         }
         str += params[i].accept(this, context);
      }
      str += "){";
      for (let i = 0, len = body.length; i < len; i++) {
         str += body[i].accept(this, context);
      }
      return str + "}";
   }
   public visitVariableDeclarationNode(node: VariableDeclarationNode, context: any): any {
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
   public visitVariableDeclaratorNode(node: VariableDeclaratorNode, context: any): any {
      let str = node.id.accept(this, context);
      let init = node.init;
      if (init !== null) {
         str += "=" + init.accept(this, context);
      }
      return str;
   }
   public visitThisExpressionNode(node: ThisExpressionNode, context: any): any {
      return "this";
   }
   public visitArrayExpressionNode(node: ArrayExpressionNode, context: any): any {
      let str = "[";
      let elements = node.elements;
      for (let i = 0, len = elements.length; i < len; i++) {
         if (i !== 0) {
            str += ",";
         }
         str += elements[i].accept(this, context);
      }
      return str + "]";
   }
   public visitObjectExpressionNode(node: ObjectExpressionNode, context: any): any {
      let str = "{";
      let properties = node.properties;
      for (let i = 0, len = properties.length; i < len; i++) {
         let prop = properties[i];
         // @ts-ignore
         let kind = prop.kind;
         // @ts-ignore
         let key = prop.key;
         // @ts-ignore
         let value = prop.value;
         if (i !== 0) {
            str += ",";
         }
         if (kind === "init") {
            str += key.accept(this, context) + ":" + value.accept(this, context);
         } else {
            let params = value.params;
            let body = value.body;
            str += kind + " " + key.accept(this, context) + "(";
            for (let j = 0, paramsLen = params.length; j < paramsLen; j++) {
               if (j !== 0) {
                  str += ",";
               }
               str += params[j].accept(this, context);
            }
            str += "){";
            for (let j = 0, bodyLen = body.length; j < bodyLen; j++) {
               str += body[j].accept(this, context) + " ";
            }
            str += "}";
         }
      }
      return str + "}";
   }
   public visitFunctionExpressionNode(node: FunctionExpressionNode, context: any): any {
      let str = "function";
      let id = node.id;
      let params = node.params;
      let body = node.body;
      if (id !== null) {
         str += " " + id;
      }
      str += "(";
      for (let i = 0, len = params.length; i < len; i++) {
         if (i !== 0) {
            str += ",";
         }
         str += params[i].accept(this, context);
      }
      str += "){";
      for (let i = 0, len = body.length; i < len; i++) {
         str += body[i].accept(this, context);
      }
      return str + "}";
   }
   public visitSequenceExpressionNode(node: SequenceExpressionNode, context: any): any {
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
   public visitUnaryExpressionNode(node: UnaryExpressionNode, context: any): any {
      return node.operator + node.argument.accept(this, context);
   }
   public visitBinaryExpressionNode(node: BinaryExpressionNode, context: any): any {
      return node.left.accept(this, context) + node.operator + node.right.accept(this, context);
   }
   public visitAssignmentExpressionNode(node: AssignmentExpressionNode, context: any): any {
      return node.left.accept(this, context) + node.operator + node.right.accept(this, context);
   }
   public visitUpdateExpressionNode(node: UpdateExpressionNode, context: any): any {
      if (node.prefix) {
         return node.operator + node.argument.accept(this, context);
      }
      return node.argument.accept(this, context) + node.operator;
   }
   public visitLogicalExpressionNode(node: LogicalExpressionNode, context: any): any {
      return node.left.accept(this, context) + node.operator + node.right.accept(this, context);
   }
   public visitConditionalExpressionNode(node: ConditionalExpressionNode, context: any): any {
      return node.test.accept(this, context) + "?" + node.consequent.accept(this, context) + ":" + node.alternate.accept(this, context);
   }
   public visitNewExpressionNode(node: NewExpressionNode, context: any): any {
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
   public visitCallExpressionNode(node: CallExpressionNode, context: any): any {
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
   public visitMemberExpressionNode(node: MemberExpressionNode, context: any): any {
      if (node.computed) {
         return node.object.accept(this, context) + "[" + node.property.accept(this, context) + "]";
      }
      return node.object.accept(this, context) + "." + node.property.accept(this, context);
   }
   public visitSwitchCaseNode(node: SwitchCaseNode, context: any): any {
      let str = "";
      let test = node.test;
      let consequent = node.consequent;
      if (test !== null) {
         str += "case " + test.accept(this, context) + ":";
      } else {
         str += "default:";
      }
      for (let i = 0, len = consequent.length; i < len; i++) {
         str += consequent[i].accept(this, context);
      }
      return str;
   }
   public visitCatchClauseNode(node: CatchClauseNode, context: any): any {
      let str = "catch (" + node.param.accept(this, context) + ")";
      for (let i = 0; i < node.body.length; ++i) {
         str += node.body[i].accept(this, context);
      }
      return str;
   }
   public visitIdentifierNode(node: IdentifierNode, context: any): any {
      return node.name;
   }
   public visitLiteralNode(node: LiteralNode, context: any): any {
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
   abstract accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown;
}

export class ProgramNode extends Node {
   public body: Node[];
   constructor(body: Node[], loc: SourceLocation) {
      super("Program", loc);
      this.body = body;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitProgramNode(this, context);
   }
}

export class EmptyStatementNode extends Node {
   constructor(loc: SourceLocation) {
      super("EmptyStatement", loc);
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitEmptyStatementNode(this, context);
   }
}

export class BlockStatementNode extends Node {
   public body: Node[];
   constructor(body: Node[], loc: SourceLocation) {
      super("BlockStatement", loc);
      this.body = body;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitBlockStatementNode(this, context);
   }
}

export class ExpressionStatementNode extends Node {
   public expression: Node;
   constructor(expression: Node, loc: SourceLocation) {
      super("ExpressionStatement", loc);
      this.expression = expression;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitExpressionStatementNode(this, context);
   }
}

export class IfStatementNode extends Node {
   public test: Node;
   public consequent: Node;
   public alternate: Node | null;
   constructor(test: Node, consequent: Node, alternate: Node | null, loc: SourceLocation) {
      super("IfStatement", loc);
      this.test = test;
      this.consequent = consequent;
      this.alternate = alternate;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitIfStatementNode(this, context);
   }
}

export class LabeledStatementNode extends Node {
   public label: Node;
   public body: Node;
   constructor(label: Node, body: Node, loc: SourceLocation) {
      super("LabeledStatement", loc);
      this.label = label;
      this.body = body;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitLabeledStatementNode(this, context);
   }
}

export class BreakStatementNode extends Node {
   public label: Node | null;
   constructor(label: Node, loc: SourceLocation) {
      super("BreakStatement", loc);
      this.label = label;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitBreakStatementNode(this, context);
   }
}

export class ContinueStatementNode extends Node {
   public label: Node | null;
   constructor(label: Node | null, loc: SourceLocation) {
      super("ContinueStatement", loc);
      this.label = label;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitContinueStatementNode(this, context);
   }
}

export class WithStatementNode extends Node {
   public object: Node;
   public body: Node;
   constructor(object: Node, body: Node, loc: SourceLocation) {
      super("WithStatement", loc);
      this.object = object;
      this.body = body;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitWithStatementNode(this, context);
   }
}

export class SwitchStatementNode extends Node {
   public discriminant: Node;
   public cases: Node[];
   constructor(discriminant: Node, cases: Node[], loc: SourceLocation) {
      super("SwitchStatement", loc);
      this.discriminant = discriminant;
      this.cases = cases;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitSwitchStatementNode(this, context);
   }
}

export class ReturnStatementNode extends Node {
   public argument: Node | null;
   constructor(argument: Node, loc: SourceLocation) {
      super("ReturnStatement", loc);
      this.argument = argument;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitReturnStatementNode(this, context);
   }
}

export class ThrowStatementNode extends Node {
   public argument: Node | null;
   constructor(argument: Node | null, loc: SourceLocation) {
      super("ThrowStatement", loc);
      this.argument = argument;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitThrowStatementNode(this, context);
   }
}

export class TryStatementNode extends Node {
   public block: Node;
   public handlers: Node[] | null;
   public finalizer: Node | null;
   constructor(block: Node, handlers: Node[] | null, finalizer: Node | null, loc: SourceLocation) {
      super("TryStatement", loc);
      this.block = block;
      this.handlers = handlers;
      this.finalizer = finalizer;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitTryStatementNode(this, context);
   }
}

export class WhileStatementNode extends Node {
   public test: Node;
   public body: Node;
   constructor(test: Node, body: Node, loc: SourceLocation) {
      super("WhileStatement", loc);
      this.test = test;
      this.body = body;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitWhileStatementNode(this, context);
   }
}

export class DoWhileStatementNode extends Node {
   public body: Node;
   public test: Node;
   constructor(body: Node, test: Node, loc: SourceLocation) {
      super("DoWhileStatement", loc);
      this.body = body;
      this.test = test;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitDoWhileStatementNode(this, context);
   }
}

export class ForStatementNode extends Node {
   public init: Node | Node[] | null;
   public test: Node;
   public update: Node;
   public body: Node;
   constructor(init: Node | Node[] | null, test: Node, update: Node, body: Node, loc: SourceLocation) {
      super("ForStatement", loc);
      this.init = init;
      this.test = test;
      this.update = update;
      this.body = body;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitForStatementNode(this, context);
   }
}

export class ForInStatementNode extends Node {
   public left: Node;
   public right: Node;
   public body: Node;
   constructor(left: Node, right: Node, body: Node, loc: SourceLocation) {
      super("ForInStatement", loc);
      this.left = left;
      this.right = right;
      this.body = body;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitForInStatementNode(this, context);
   }
}

export class DebuggerStatementNode extends Node {
   constructor(discriminant: Node, cases: Node[], loc: SourceLocation) {
      super("DebuggerStatement", loc);
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitDebuggerStatementNode(this, context);
   }
}

export class FunctionDeclarationNode extends Node {
   public id: string;
   public params: Node[];
   public body: Node[];
   public generator: Node;
   public expression: Node;
   constructor(id: string, params: Node[], body: Node[], generator: Node, expression: Node, loc: SourceLocation) {
      super("FunctionDeclaration", loc);
      this.id = id;
      this.params = params;
      this.body = body;
      this.generator = generator;
      this.expression = expression;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitFunctionDeclarationNode(this, context);
   }
}

export class VariableDeclarationNode extends Node {
   public declarations: Node[];
   public kind: Node;
   constructor(declarations: Node[], kind: Node, loc: SourceLocation) {
      super("VariableDeclaration", loc);
      this.declarations = declarations;
      this.kind = kind;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitVariableDeclarationNode(this, context);
   }
}

export class VariableDeclaratorNode extends Node {
   public id: Node;
   public init: Node | null;
   constructor(id: Node, init: Node | null, loc: SourceLocation) {
      super("VariableDeclarator", loc);
      this.id = id;
      this.init = init;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitVariableDeclaratorNode(this, context);
   }
}

export class ThisExpressionNode extends Node {
   constructor(discriminant: Node, cases: Node[], loc: SourceLocation) {
      super("ThisExpression", loc);
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitThisExpressionNode(this, context);
   }
}

export class ArrayExpressionNode extends Node {
   public elements: Node[];
   constructor(elements: Node[], loc: SourceLocation) {
      super("ArrayExpression", loc);
      this.elements = elements;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitArrayExpressionNode(this, context);
   }
}

export class ObjectExpressionNode extends Node {
   public properties: Node[];
   constructor(properties: Node[], loc: SourceLocation) {
      super("ObjectExpression", loc);
      this.properties = properties;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitObjectExpressionNode(this, context);
   }
}

export class FunctionExpressionNode extends Node {
   public id: string;
   public params: Node[];
   public body: Node[];
   public generator: Node;
   public expression: Node;
   constructor(id: string, params: Node[], body: Node[], generator: Node, expression: Node, loc: SourceLocation) {
      super("FunctionExpression", loc);
      this.id = id;
      this.params = params;
      this.body = body;
      this.generator = generator;
      this.expression = expression;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitFunctionExpressionNode(this, context);
   }
}

export class SequenceExpressionNode extends Node {
   public expressions: Node[];
   constructor(expressions: Node[], loc: SourceLocation) {
      super("SequenceExpression", loc);
      this.expressions = expressions;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
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
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
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
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
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
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitBinaryExpressionNode(this, context);
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
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
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
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
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
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
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
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
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
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
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
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitMemberExpressionNode(this, context);
   }
}

export class SwitchCaseNode extends Node {
   public test: Node;
   public consequent: Node[];
   constructor(test: Node, consequent: Node[], loc: SourceLocation) {
      super("SwitchCase", loc);
      this.test = test;
      this.consequent = consequent;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitSwitchCaseNode(this, context);
   }
}

export class CatchClauseNode extends Node {
   public param: Node;
   public guard: null;
   public body: Node[];
   constructor(param: Node, guard: Node, body: Node[], loc: SourceLocation) {
      super("CatchClause", loc);
      this.param = param;
      /* Firefox specific */
      this.guard = null;
      this.body = body;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitCatchClauseNode(this, context);
   }
}

export class IdentifierNode extends Node {
   public name: string;
   constructor(name: string, loc: SourceLocation) {
      super("Identifier", loc);
      this.name = name;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitIdentifierNode(this, context);
   }
}

export class LiteralNode extends Node {
   public value: string;
   constructor(value: string, loc: SourceLocation) {
      super("Literal", loc);
      this.value = value;
   }
   public accept(visitor: IExpressionVisitor<unknown, unknown>, context: unknown): unknown {
      return visitor.visitLiteralNode(this, context);
   }
}

const ParserMixin = {
   nodes: {
      ProgramNode: ProgramNode,
      EmptyStatementNode: EmptyStatementNode,
      BlockStatementNode: BlockStatementNode,
      ExpressionStatementNode: ExpressionStatementNode,
      IfStatementNode: IfStatementNode,
      LabeledStatementNode: LabeledStatementNode,
      BreakStatementNode: BreakStatementNode,
      ContinueStatementNode: ContinueStatementNode,
      WithStatementNode: WithStatementNode,
      SwitchStatementNode: SwitchStatementNode,
      ReturnStatementNode: ReturnStatementNode,
      ThrowStatementNode: ThrowStatementNode,
      TryStatementNode: TryStatementNode,
      WhileStatementNode: WhileStatementNode,
      DoWhileStatementNode: DoWhileStatementNode,
      ForStatementNode: ForStatementNode,
      ForInStatementNode: ForInStatementNode,
      DebuggerStatementNode: DebuggerStatementNode,
      FunctionDeclarationNode: FunctionDeclarationNode,
      VariableDeclarationNode: VariableDeclarationNode,
      VariableDeclaratorNode: VariableDeclaratorNode,
      ThisExpressionNode: ThisExpressionNode,
      ArrayExpressionNode: ArrayExpressionNode,
      ObjectExpressionNode: ObjectExpressionNode,
      FunctionExpressionNode: FunctionExpressionNode,
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
      SwitchCaseNode: SwitchCaseNode,
      CatchClauseNode: CatchClauseNode,
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

interface IParser {
   parse(data: string): ProgramNode;
}

Object.assign(RawParser.prototype, ParserMixin);
export const Parser: new () => IParser = RawParser;
