/* global require, describe, it */

const { assert } = require('chai');
const { default: TreeBuilder } = require('engine/html/TreeBuilder');
const { Tokenizer } = require('engine/html/Tokenizer');
const { getTagNodeDescription } = require('engine/html/NodeDescription');
const { SourceFile } = require("engine/html/base/SourceFile");
const { SourceReader } = require("engine/html/base/SourceReader");
const { MarkupVisitor } = require("engine/html/base/Nodes");
const { ERROR_HANDLER } = require('../ErrorHandler');

const visitor = new MarkupVisitor();
const CONTEXT = { };


function createTree(html, options) {
   let reader = new SourceReader(new SourceFile(html));
   let builder = new TreeBuilder(getTagNodeDescription, ERROR_HANDLER);
   let tokenizer = new Tokenizer(builder, options, ERROR_HANDLER);
   tokenizer.start();
   tokenizer.tokenize(reader);
   return builder.getTree();
}

const html1 = `<html>
   <head>
      <title>Html</title>
      <script>const A = 1;</script>
      <style>head: {  }</style>
      <script>const B = 2;</script>
      <style>body: {  }; div, span { }</style>
      <script>const C = 3;</script>
      <style>body: {  }; div > div > div { }</style>
   </head>
   <body>
      <div a="111">
        <br>First<br>
         <div b="true">
            <br>Second<br>
            <textarea>
                <br>Hello!<br>
            </textarea>
         </div>
      </div>
   </body>
</html>`;

const html2 = `<div><br><br></div>`;

describe('engine/html/TreeBuilder (html)', function() {
   it('Markup', function() {
      const tree = createTree(html1);
      const markup = visitor.visitAll(tree, CONTEXT);
      assert.strictEqual(markup, html1);
   });
   it('Void elements', function() {
      const tree = createTree(html2);
      const markup = visitor.visitAll(tree, CONTEXT);
      assert.strictEqual(markup, html2);
   });
});
