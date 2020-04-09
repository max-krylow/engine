/* global require, describe, it */

const { assert } = require('chai');

const { TreeBuilder } = require('engine/html/TreeBuilder');
const { Tokenizer } = require('engine/html/Tokenizer');
const { Source } = require("engine/core/Source");
const { SourceReader } =  require("engine/core/SourceReader");
const { getTagNodeDescription } = require('engine/html/NodeDescription');


const errorHandler = {
   debug: console.log.bind(console),
   info: console.log.bind(console),
   warn: console.warn.bind(console),
   error: console.error.bind(console),
   fatal: console.error.bind(console)
};

function createTree(html, options) {
   let reader = new SourceReader(new Source(html));
   let builder = new TreeBuilder(getTagNodeDescription, errorHandler);
   let tokenizer = new Tokenizer(builder, options, errorHandler);
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
      assert.strictEqual(tree.toString(), html1);
   });
   it('Void elements', function() {
      const tree = createTree(html2);
      assert.strictEqual(tree.toString(), html2);
   });
});
