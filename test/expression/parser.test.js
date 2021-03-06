/* global require, describe, it */

const { assert } = require('chai');
const { Parser, StringVisitor } = require("engine/expression/Parser");

function parseAndStringify(expression) {
   const parser = new Parser();
   const visitor = new StringVisitor();
   const actual = parser.parse(expression);
   return actual.accept(visitor);
}

describe('engine/expression/Parser', () => {
   describe('Specification', () => {
      it('EmptyStatement', () => {
         const expression = ';';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('Boolean literal', () => {
         const expression = 'true';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('Boolean literal 2', () => {
         const expression = 'false';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('Number literal - Integer notation', () => {
         const expression = '-123';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('Number literal - Real notation', () => {
         const expression = '-1.23';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('Number literal - Exponent notation', () => {
         const expression = '-1e3';
         const actual = parseAndStringify(expression);
         const standard = '-1000';
         assert.strictEqual(actual, standard);
      });
      it('Number literal - Octal notation', () => {
         const expression = '064316461';
         const actual = parseAndStringify(expression);
         const standard = '13737265';
         assert.strictEqual(actual, standard);
      });
      it('Number literal - Hexadecimal notation', () => {
         const expression = '0x58a7b4c';
         const actual = parseAndStringify(expression);
         const standard = '92961612';
         assert.strictEqual(actual, standard);
      });
      it('String literal', () => {
         const expression = '"string"';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('Array literal', () => {
         const expression = '[1,2,3]';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('Object literal 1', () => {
         const expression = '{}';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('Object literal 2', () => {
         const expression = '{a:1}';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('Object literal 3', () => {
         const expression = '{a:1,b:true,c:[]}';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('Identifier', () => {
         const expression = 'identifier';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('MemberExpression', () => {
         const expression = 'tree.node.leaf';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('MemberExpression Program', () => {
         const expression = 'tree[node].leaf';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('CallExpression', () => {
         const expression = 'func(arg)';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('CallExpression 2', () => {
         const expression = 'func(arg1,arg2,arg3)';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('ConditionalExpression', () => {
         const expression = 'condition?true:false';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('LogicalExpression', () => {
         const expression = 'first&&second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('LogicalExpression 2', () => {
         const expression = 'first||second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('UpdateExpression postfix 1', () => {
         const expression = 'identifier++';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('UpdateExpression prefix 1', () => {
         const expression = '++identifier';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('UpdateExpression postfix 2', () => {
         const expression = 'identifier--';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('UpdateExpression prefix 2', () => {
         const expression = '--identifier';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 1', () => {
         const expression = 'first & second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 2', () => {
         const expression = 'first | second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 3', () => {
         const expression = 'first ^ second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 4', () => {
         const expression = 'first == second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 5', () => {
         const expression = 'first === second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 6', () => {
         const expression = 'first != second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 7', () => {
         const expression = 'first !== second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 8', () => {
         const expression = 'first > second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 9', () => {
         const expression = 'first < second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 10', () => {
         const expression = 'first >= second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 11', () => {
         const expression = 'first <= second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 12', () => {
         const expression = 'first << second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 13', () => {
         const expression = 'first >> second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 14', () => {
         const expression = 'first >>> second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 15', () => {
         const expression = 'first + second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 16', () => {
         const expression = 'first - second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 17', () => {
         const expression = 'first * second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 18', () => {
         const expression = 'first / second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 19', () => {
         const expression = 'first % second';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 20', () => {
         const expression = 'index,item in collection';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('BinaryExpression 21', () => {
         const expression = 'ident instanceof Object';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('UnaryExpression 1', () => {
         const expression = '-identifier';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('UnaryExpression 2', () => {
         const expression = '+identifier';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('UnaryExpression 3', () => {
         const expression = 'delete identifier["property"]';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('UnaryExpression 4', () => {
         const expression = 'typeof identifier';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('UnaryExpression 5', () => {
         const expression = 'void 0';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('UnaryExpression 6', () => {
         const expression = '!identifier';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('UnaryExpression 7', () => {
         const expression = '~identifier';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('SequenceExpression', () => {
         const expression = 'a,b,c,d,e,f';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('ObjectExpression', () => {
         const expression = 'var object = {property:value}';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('ArrayExpression 1', () => {
         const expression = 'var array = [1,true,{},[1]]';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('ArrayExpression 2', () => {
         const expression = '[]';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('ArrayExpression 2', () => {
         const expression = '[,]';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('ArrayExpression 3', () => {
         const expression = '[1,true,{},[1]]';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('ArrayExpression 4', () => {
         const expression = '[1,true,{},[1],]';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('ArrayExpression 5', () => {
         const expression = '[1,true,{},[1],,,]';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('ThisExpression', () => {
         const expression = 'this.update()';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('AssignmentExpression', () => {
         const expression = 'identifier = value';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('AssignmentExpression 2', () => {
         const expression = 'object[property] = item.value';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('AssignmentExpression 3', () => {
         const expression = 'identifier += value';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('AssignmentExpression 4', () => {
         const expression = 'identifier -= value';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('AssignmentExpression 5', () => {
         const expression = 'identifier *= value';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('AssignmentExpression 6', () => {
         const expression = 'identifier /= value';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('AssignmentExpression 7', () => {
         const expression = 'identifier %= value';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('AssignmentExpression 8', () => {
         const expression = 'identifier &= value';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('AssignmentExpression 9', () => {
         const expression = 'identifier |= value';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('AssignmentExpression 10', () => {
         const expression = 'identifier ^= value';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('AssignmentExpression 11', () => {
         const expression = 'identifier <<= value';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('AssignmentExpression 12', () => {
         const expression = 'identifier >>= value';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('AssignmentExpression 13', () => {
         const expression = 'identifier >>>= value';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('VariableDeclaration', () => {
         const expression = 'var a = 1,b = true,c = "string"';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('VariableDeclaration', () => {
         const expression = 'var a,b,c';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('NewExpression 1', () => {
         const expression = 'item = new Class()';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('NewExpression 2', () => {
         const expression = 'new Class()';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('NewExpression 3', () => {
         const expression = 'new Class(true)';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('NewExpression 4', () => {
         const expression = 'new Library.Class()';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('NewExpression 5', () => {
         const expression = 'new Library.Class(config)';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
      it('NewExpression with arguments', () => {
         const expression = 'item = new Class(arg1,arg2,arg3)';
         assert.strictEqual(parseAndStringify(expression), expression);
      });
   });
   describe('Forbidden operators', () => {
      it('IfStatement', (done) => {
         try {
            parseAndStringify('if (true) { }');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('LabeledStatement', (done) => {
         try {
            parseAndStringify('label: value');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('BreakStatement', (done) => {
         try {
            parseAndStringify('break label');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('ContinueStatement', (done) => {
         try {
            parseAndStringify('continue label');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('WithStatement', (done) => {
         try {
            parseAndStringify('with (file) file.send()');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('SwitchStatement', (done) => {
         try {
            parseAndStringify('switch (value) { }');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('ReturnStatement', (done) => {
         try {
            parseAndStringify('return null');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('ThrowStatement', (done) => {
         try {
            parseAndStringify('throw new Error("what a terrible failure")');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('TryStatement', (done) => {
         try {
            parseAndStringify('try { } catch (error) { }');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('WhileStatement', (done) => {
         try {
            parseAndStringify('while (condition) { }');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('DoWhileStatement', (done) => {
         try {
            parseAndStringify('do { } while (condition)');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('ForStatement', (done) => {
         try {
            parseAndStringify('for(;;) { }');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('ForInStatement', (done) => {
         try {
            parseAndStringify('for (i in j) { }');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('DebuggerStatement', (done) => {
         try {
            parseAndStringify('debugger');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('FunctionDeclaration', (done) => {
         try {
            parseAndStringify('function name() { }');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('FunctionExpression', (done) => {
         try {
            parseAndStringify('var func = function() { }');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('SwitchCase', (done) => {
         try {
            parseAndStringify('case "value": break');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('CatchClause', (done) => {
         try {
            parseAndStringify('catch (error) { }');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('ReservedWord 1', (done) => {
         try {
            parseAndStringify('class = 5');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('ReservedWord 2', (done) => {
         try {
            parseAndStringify('const');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('ReservedWord 3', (done) => {
         try {
            parseAndStringify('enum');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('ReservedWord 4', (done) => {
         try {
            parseAndStringify('export');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('ReservedWord 5', (done) => {
         try {
            parseAndStringify('extends');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('ReservedWord 6', (done) => {
         try {
            parseAndStringify('import');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
      it('ReservedWord 7', (done) => {
         try {
            parseAndStringify('super');
         } catch (error) {
            done();
            return;
         }
         done(new Error('This test must be failed with parse error'));
      });
   });
   describe('Node types', () => {
      it('NaN literal', () => {
         const expression = 'NaN';
         const parser = new Parser();
         const actual = parser.parse(expression);
         assert.strictEqual(actual.type, 'Program');
         assert.strictEqual(actual.body.length, 1);
         assert.strictEqual(actual.body[0].type, 'ExpressionStatement');
         assert.strictEqual(actual.body[0].expression.type, 'Literal');
         assert.isNaN(actual.body[0].expression.value);
      });
      it('Null literal', () => {
         const expression = 'null';
         const parser = new Parser();
         const actual = parser.parse(expression);
         assert.strictEqual(actual.type, 'Program');
         assert.strictEqual(actual.body.length, 1);
         assert.strictEqual(actual.body[0].type, 'ExpressionStatement');
         assert.strictEqual(actual.body[0].expression.type, 'Literal');
         assert.strictEqual(actual.body[0].expression.value, null);
      });
   });
});
