/* global require, describe, it */

const { assert } = require('chai');
const { SourceFile } = require("engine/html/base/SourceFile");
const { SourceReader } = require("engine/html/base/SourceReader");
const { MarkupVisitor } = require("engine/html/base/Nodes");
const { Parser } = require("engine/html/Parser");
const { getTagNodeDescription } = require('engine/html/NodeDescription');
const { ERROR_HANDLER } = require('../ErrorHandler');

const visitor = new MarkupVisitor();
const parser = new Parser({
   nodeDescriptor: getTagNodeDescription
}, ERROR_HANDLER);

function parse(html) {
   let reader = new SourceReader(new SourceFile(html));
   return parser.parse(reader);
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

describe('engine/html/Parser', function() {
   it('Markup', function() {
      const tree = parse(html1);
      const markup = visitor.visitAll(tree);
      assert.strictEqual(markup, html1);
   });
   it('Void elements', function() {
      const tree = parse(html2);
      const markup = visitor.visitAll(tree);
      assert.strictEqual(markup, html2);
   });
});
