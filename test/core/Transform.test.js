/* global require, describe, it */

const { assert } = require('chai');
const { SourceFile } = require("engine/html/base/SourceFile");
const { SourceReader } = require("engine/html/base/SourceReader");
const { TransformVisitor } = require("engine/core/Transform");
const { Parser } = require("engine/html/Parser");
const { getTagNodeDescription } = require('engine/html/NodeDescription');
const { ERROR_HANDLER } = require('../ErrorHandler');
const { MarkupVisitor } = require('engine/core/Ast');
const { StringVisitor, Parser: ExpressionParser } = require("engine/expression/Parser");

function traverseAndStringify(html) {
   const transformer = new TransformVisitor(new ExpressionParser());
   const parser = new Parser({
      nodeDescriptor: getTagNodeDescription,
      allowComments: true,
      allowCDATA: true
   }, ERROR_HANDLER);
   let reader = new SourceReader(new SourceFile(html));
   const tree = parser.parse(reader);
   const ast = transformer.transform(tree);
   const visitor = new MarkupVisitor(new StringVisitor());
   return visitor.visitAll(ast);
}

describe('engine/core/Transform', () => {
   describe('HTML', () => {
      it('Text', () => {
         const html = 'text';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, html);
      });
      it('Text 2', () => {
         const html = '\n\r\n\r\n\r\r\r\n\n\n\r\n\r';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, '');
      });
      it('Comment', () => {
         const html = '<!--data-->';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, html);
      });
      it('CDATA', () => {
         const html = '<![CDATA[data]]>';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, html);
      });
      it('DOCTYPE', () => {
         const html = '<!DOCTYPE html>';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, html);
      });
      it('Element', () => {
         const html = '<div class="text" bind:value="_value;" on:click="handler(arg);"></div>';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, html);
      });
   });
   describe('Wasaby', () => {
      it('Localization', () => {
         const html = '{[Text]}';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, html);
      });
      it('Localization with context', () => {
         const html = '{[Context@@Text]}';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, html);
      });
      it('Expression', () => {
         const html = '{{item.get("data");}}';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, html);
      });
      it('Mixed text', () => {
         const html = '{{a1;}} | a2 | {[a3]}';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, html);
      });
      it('ws:for', () => {
         const html = '<ws:for data="i = 0;i < 10;i++;">{{2 * i + 1;}}</ws:for>';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, html);
      });
      it('ws:foreach 1', () => {
         const html = '<ws:foreach data="item in collection;">{{item.get("data");}}</ws:foreach>';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, html);
      });
      it('ws:foreach 2', () => {
         const html = '<ws:foreach data="index,item in collection;">{{index;}} - {{item.get("data");}}</ws:foreach>';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, html);
      });
      it('ws:if', () => {
         const html = '<ws:if data="condition;">First</ws:if>';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, html);
      });
      it('ws:else 1', () => {
         const html = '<ws:if data="condition;">First</ws:if><ws:else>Second</ws:else>';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, html);
      });
      it('ws:else 2', () => {
         const html = '<ws:if data="condition;">First</ws:if><ws:else data="other;">Second</ws:else>';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, html);
      });
      it('ws:else 3', () => {
         const html = '<ws:if data="condition;">First</ws:if><ws:else data="other;">Second</ws:else><ws:else>Third</ws:else>';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, html);
      });
      it('ws:template', () => {
         const html = '<ws:template name="tmpl"><div>Hello</div></ws:template>';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, html);
      });
      it('ws:partial', () => {
         const html = '<ws:template name="tmpl"><div>Hello</div></ws:template><ws:partial template="tmpl" attr:class="className" on:click="handler(arg);" text="string" bind:value="_value;"><div>Hello</div></ws:partial>';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, html);
      });
      it('Component', () => {
         const html = '<User.Component attr:class="className" on:click="handler(arg);" text="string" bind:value="_value;"><div>Hello</div></User.Component>';
         const actual = traverseAndStringify(html);
         assert.strictEqual(actual, html);
      });
   });
   describe('Stress', () => {
      it('ws:if unexpected attribute', () => {
         try {
            const html = '<ws:if data="condition;" value="123">Hello</ws:if>';
            traverseAndStringify(html);
         } catch (error) {
            assert.strictEqual(error.message, 'Unexpected attribute "value" on tag "ws:if". Ignore this attribute');
         }
      });
      it('ws:if expected attribute', () => {
         try {
            const html = '<ws:if>First</ws:if>';
            traverseAndStringify(html);
         } catch (error) {
            assert.strictEqual(error.message, 'Expected attribute "data" on tag "ws:if". Ignore this tag');
         }
      });
      it('ws:if expected attribute has value', () => {
         try {
            const html = '<ws:if data>First</ws:if>';
            traverseAndStringify(html);
         } catch (error) {
            assert.strictEqual(error.message, 'Expected attribute "data" on tag "ws:if" has value. Ignore this tag');
         }
      });
      it('ws:else expected ws:if', () => {
         try {
            const html = '<ws:else data>Second</ws:else>';
            traverseAndStringify(html);
         } catch (error) {
            assert.strictEqual(error.message, 'Unexpected tag "ws:else" without tag "ws:if" before. Ignore this tag');
         }
      });
      it('ws:else expected ws:else has data', () => {
         try {
            const html = '<ws:if data="condition;">First</ws:if><ws:else>Second</ws:else><ws:else>Third</ws:else>';
            traverseAndStringify(html);
         } catch (error) {
            assert.strictEqual(error.message, 'Unexpected tag "ws:else" before tag "ws:else" without attribute "data". Ignore this tag');
         }
      });
      it('ws:else expected attribute', () => {
         try {
            const html = '<ws:if data="condition;">First</ws:if><ws:else data>Second</ws:else>';
            traverseAndStringify(html);
         } catch (error) {
            assert.strictEqual(error.message, 'Expected attribute "data" on tag "ws:else" has value. Ignore this tag');
         }
      });
      it('ws:for unexpected attribute', () => {
         try {
            const html = '<ws:for data=";;" value="123">Hello</ws:for>';
            traverseAndStringify(html);
         } catch (error) {
            assert.strictEqual(error.message, 'Unexpected attribute "value" on tag "ws:for". Ignore this attribute');
         }
      });
      it('ws:for expected attribute', () => {
         try {
            const html = '<ws:for>Hello</ws:for>';
            traverseAndStringify(html);
         } catch (error) {
            assert.strictEqual(error.message, 'Expected attribute "data" on tag "ws:for". Ignore this tag');
         }
      });
      it('ws:partial expected attribute', () => {
         try {
            const html = '<ws:partial />';
            traverseAndStringify(html);
         } catch (error) {
            assert.strictEqual(error.message, 'Expected attribute "template" on tag "ws:partial". Ignore this tag');
         }
      });
      it('ws:partial must be declared', () => {
         try {
            const html = '<ws:partial template="tmpl" attr:class="className" on:click="handler(arg);" text="string" bind:value="_value;"><div>Hello</div></ws:partial>';
            traverseAndStringify(html);
         } catch (error) {
            assert.strictEqual(error.message, 'Template with name "tmpl" has not been declared in this scope');
         }
      });
   });
});
