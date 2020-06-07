const { WhitespaceVisitor } = require('engine/html/base/Nodes');
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
const whitespace = new WhitespaceVisitor();

function createTree(html, options) {
   const reader = new SourceReader(new SourceFile(html));
   const builder = new TreeBuilder(dummyDescriptor, ERROR_HANDLER);
   const tokenizer = new Tokenizer(builder, options, ERROR_HANDLER);
   tokenizer.start();
   tokenizer.tokenize(reader);
   const tree = builder.getTree();
   return whitespace.visitAll(tree);
}

describe('engine/html/base/Nodes', function () {
   describe('WhitespaceVisitor', function () {
      it('Text', () => {
         const html = `
            simple
            text
         `;
         const standard = 'simple text';
         const tree = createTree(html);
         const markup = visitor.visitAll(tree, CONTEXT);
         assert.strictEqual(markup, standard);
      });
      it('Elements', () => {
         const html = `
<div>
   1
   <div>
      2
      <div>
        text
      </div>
      3
   </div>
   4
</div>
         `;
         const standard = '<div>1<div>2<div>text</div>3</div>4</div>';
         const tree = createTree(html);
         const markup = visitor.visitAll(tree, CONTEXT);
         assert.strictEqual(markup, standard);
      });
      it('Elements ignored', () => {
         const html = `
<div>
   1
   <div>
      2
      <textarea> \n text \n </textarea>
      3
   </div>
   4
</div>
         `;
         const standard = '<div>1<div>2<textarea> \n text \n </textarea>3</div>4</div>';
         const tree = createTree(html);
         const markup = visitor.visitAll(tree, CONTEXT);
         assert.strictEqual(markup, standard);
      });
   });
});
