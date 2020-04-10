/* global require, describe, it */

const { assert } = require('chai');
const { default: TreeBuilder } = require('engine/html/TreeBuilder');
const { Tokenizer } = require('engine/html/Tokenizer');
const { SourceFile } = require("engine/html/base/SourceFile");
const { SourceReader } = require("engine/html/base/SourceReader");
const { MarkupVisitor } = require("engine/html/base/Nodes");
const { ERROR_HANDLER } = require('../ErrorHandler');

const dummyDescriptor = function() { return { }; };
const CONTEXT = { };
const visitor = new MarkupVisitor();

function createTree(html, options) {
   let reader = new SourceReader(new SourceFile(html));
   let builder = new TreeBuilder(dummyDescriptor, ERROR_HANDLER);
   let tokenizer = new Tokenizer(builder, options, ERROR_HANDLER);
   tokenizer.start();
   tokenizer.tokenize(reader);
   return builder.getTree();
}

describe('engine/html/TreeBuilder', function() {
   it('Tag', function () {
      const html = '<tag my:s="value">Hello!</tag>';
      const tree = createTree(html);
      const markup = visitor.visitAll(tree, CONTEXT);
      assert.strictEqual(markup, html);
   });
   it('Self closing tag', function () {
      const html = '<tag my:s="value" />';
      const tree = createTree(html);
      const markup = visitor.visitAll(tree, CONTEXT);
      assert.strictEqual(markup, html);
   });
   it('Text', function () {
      const html = 'Hello!';
      const tree = createTree(html);
      const markup = visitor.visitAll(tree, CONTEXT);
      assert.strictEqual(markup, html);
   });
   it('Comment', function() {
      const html = '<!-- comment -->';
      const tree = createTree(html, { allowComments: true });
      const markup = visitor.visitAll(tree, CONTEXT);
      assert.strictEqual(markup, html);
   });
   it('CDATA', function() {
      const html = '<![CDATA[hello]]>';
      const tree = createTree(html, { allowCDATA: true });
      const markup = visitor.visitAll(tree, CONTEXT);
      assert.strictEqual(markup, html);
   });
   it('DOCTYPE', function() {
      const html = '<!DOCTYPE html>';
      const tree = createTree(html);
      const markup = visitor.visitAll(tree, CONTEXT);
      assert.strictEqual(markup, html);
   });
   it('Tree', function() {
      const html = `<aaa><bbb b="1">e<ccc c="2">f<ddd d="3">g</ddd>h</ccc>i</bbb></aaa>`;
      const tree = createTree(html, { allowComments: true });
      const markup = visitor.visitAll(tree, CONTEXT);
      assert.strictEqual(markup, html);
   });
   it('Many roots', function() {
      const html = '<a aa="aaa">aaaa</a><b bb="bbb">bbbb</b><c cc="ccc">cccc</c>';
      const tree = createTree(html, { allowComments: true });
      const markup = visitor.visitAll(tree, CONTEXT);
      assert.strictEqual(markup, html);
   });
});
