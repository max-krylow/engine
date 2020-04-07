/* global require, describe, it */

const { assert } = require('chai');

const { TreeBuilder } = require('engine/html/TreeBuilder');
const { Tokenizer } = require('engine/html/Tokenizer');
const { Source } = require("engine/core/Source");
const { SourceReader } =  require("engine/core/SourceReader");
const { MetaInfo } =  require("engine/core/MetaInfo");

const meta = new MetaInfo('test/html/TreeBuilder.test.js');

function createTree(html, options) {
   let reader = new SourceReader(new Source(html, meta));
   let builder = new TreeBuilder();
   let tokenizer = new Tokenizer(builder, options);
   tokenizer.start();
   tokenizer.tokenize(reader);
   return builder.getTree();
}

describe('engine/html/TreeBuilder', function() {
   it('Tag', function () {
      const html = '<tag my:s="value">Hello!</tag>';
      const tree = createTree(html);
      assert.strictEqual(tree.toString(), html);
   });
   it('Self closing tag', function () {
      const html = '<tag my:s="value" />';
      const tree = createTree(html);
      assert.strictEqual(tree.toString(), html);
   });
   it('Text', function () {
      const html = 'Hello!';
      const tree = createTree(html);
      assert.strictEqual(tree.toString(), html);
   });
   it('Comment', function() {
      const html = '<!-- comment -->';
      const tree = createTree(html, { allowComments: true });
      assert.strictEqual(tree.toString(), html);
   });
   it('CDATA', function() {
      const html = '<![CDATA[hello]]>';
      const tree = createTree(html, { allowCDATA: true });
      assert.strictEqual(tree.toString(), html);
   });
   it('DOCTYPE', function() {
      const html = '<!DOCTYPE html>';
      const tree = createTree(html);
      assert.strictEqual(tree.toString(), html);
   });
   it('Tree', function() {
      const html = `<aaa><bbb b="1">e<ccc c="2">f<ddd d="3">g</ddd>h</ccc>i</bbb></aaa>`;
      const tree = createTree(html, { allowComments: true });
      assert.strictEqual(tree.toString(), html);
   });
   it('Many roots', function() {
      const first = `<a aa="aaa">aaaa</a>`;
      const second = `<b bb="bbb">bbbb</b>`;
      const third = `<c cc="ccc">cccc</c>`;
      const html = first + second + third;
      const tree = createTree(html, { allowComments: true });
      assert.strictEqual(tree.length, 3);
      assert.strictEqual(tree[0].toString(), first);
      assert.strictEqual(tree[1].toString(), second);
      assert.strictEqual(tree[2].toString(), third);
   });
});