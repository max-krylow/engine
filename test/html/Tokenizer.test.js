/* global require, describe, it */

const { assert } = require('chai');

const { Tokenizer } = require('engine/html/Tokenizer');
const { TokenizerState } = require('engine/html/Tokenizer');
const { Source } = require("engine/core/Source");
const { SourceReader } =  require("engine/core/SourceReader");
const { MetaInfo } =  require("engine/core/MetaInfo");

function assertAttributes(standard, actual) {
   const keys = Object.keys(standard);
   assert.strictEqual(keys.length, Object.keys(actual).length);
   for (let i; i < keys.length; ++i) {
      const name = keys[i];
      assert.strictEqual(standard[name].value, actual[name].value)
   }
}

let stack;

const meta = new MetaInfo('test/core/SourceReader.test.ts');

function createReader(data) {
   return new SourceReader(new Source(data, meta));
}

const handler = {
   onOpenTag: function (name, attr, selfClosing) {
      assert.isTrue(stack.length > 0);
      let node = stack.shift();
      assert.strictEqual(node.type, 'OpenTag');
      assert.strictEqual(node.name, name);
      assertAttributes(node.attr || {}, attr || {});
      assert.strictEqual(node.selfClosing, selfClosing);
   },
   onCloseTag: function (name) {
      assert.isTrue(stack.length > 0);
      let node = stack.shift();
      assert.strictEqual(node.type, 'CloseTag');
      assert.strictEqual(node.name, name);
   },
   onText: function (data) {
      assert.isTrue(stack.length > 0);
      let node = stack.shift();
      assert.strictEqual(node.type, 'Text');
      assert.strictEqual(node.data, data);
   },
   onComment: function (data) {
      assert.isTrue(stack.length > 0);
      let node = stack.shift();
      assert.strictEqual(node.type, 'Comment');
      assert.strictEqual(node.data, data);
   },
   onCDATA: function (data) {
      assert.isTrue(stack.length > 0);
      let node = stack.shift();
      assert.strictEqual(node.type, 'CDATA');
      assert.strictEqual(node.data, data);
   },
   onDoctype: function (data) {
      assert.isTrue(stack.length > 0);
      let node = stack.shift();
      assert.strictEqual(node.type, 'Doctype');
      assert.strictEqual(node.data, data);
   },
   onEOF: function () {
      assert.isTrue(stack.length > 0);
      let node = stack.shift();
      assert.strictEqual(node.type, 'EOF');
   }
};

// https://www.w3.org/TR/2011/WD-html5-20110525/syntax.html#elements-0

describe('engine/html/Tokenizer', function () {
   describe('DATA', function () {
      it('Open tag, selfClosing=false', function () {
         let reader = createReader('<tag>');
         stack = [{
            type: 'OpenTag',
            name: 'tag',
            selfClosing: false
         }, {
            type: 'EOF'
         }];
         let tokenizer = new Tokenizer(handler);
         tokenizer.start();
         tokenizer.tokenize(reader);
      });
      it('Open tag, selfClosing=true', function () {
         let reader = createReader('<tag />');
         stack = [{
            type: 'OpenTag',
            name: 'tag',
            selfClosing: true
         }, {
            type: 'EOF'
         }];
         let tokenizer = new Tokenizer(handler);
         tokenizer.start();
         tokenizer.tokenize(reader);
      });
      it('Attributes', function () {
         let reader = createReader('<tag a=1 b=\'2\' c="3" d>');
         stack = [{
            type: 'OpenTag',
            name: 'tag',
            attr: {
               a: '1',
               b: '2',
               c: '3',
               d: ''
            },
            selfClosing: false
         }, {
            type: 'EOF'
         }];
         let tokenizer = new Tokenizer(handler);
         tokenizer.start();
         tokenizer.tokenize(reader);
      });
      it('Tags pair', function () {
         let reader = createReader('<tag></tag>');
         stack = [{
            type: 'OpenTag',
            name: 'tag',
            selfClosing: false
         }, {
            type: 'CloseTag',
            name: 'tag'
         }, {
            type: 'EOF'
         }];
         let tokenizer = new Tokenizer(handler);
         tokenizer.start();
         tokenizer.tokenize(reader);
      });
      it('Comment, allowComments=false', function () {
         let reader = createReader('<!-- abc -->');
         stack = [{
            type: 'EOF'
         }];
         let tokenizer = new Tokenizer(handler);
         tokenizer.start();
         tokenizer.tokenize(reader);
      });
      it('Comment, allowComments=true', function () {
         let reader = createReader('<!-- abc -->');
         stack = [{
            type: 'Comment',
            data: ' abc '
         }, {
            type: 'EOF'
         }];
         let tokenizer = new Tokenizer(handler, { allowComments: true });
         tokenizer.start();
         tokenizer.tokenize(reader);
      });
      it('Text', function () {
         let reader = createReader('1 < 2');
         stack = [{
            type: 'Text',
            data: '1 '
         }, {
            type: 'Text',
            data: '< 2'
         }, {
            type: 'EOF'
         }];
         let tokenizer = new Tokenizer(handler);
         tokenizer.start();
         tokenizer.tokenize(reader);
      });
      it('CDATA, allowCDATA=false', function () {
         let reader = createReader('<![CDATA[a]]>');
         stack = [{
            type: 'EOF'
         }];
         let tokenizer = new Tokenizer(handler);
         tokenizer.start();
         tokenizer.tokenize(reader);
      });
      it('CDATA, allowCDATA=true', function () {
         let reader = createReader('<![CDATA[ a ]] ]]>');
         stack = [{
            type: 'CDATA',
            data: ' a ]] '
         }, {
            type: 'EOF'
         }];
         let tokenizer = new Tokenizer(handler, { allowCDATA: true });
         tokenizer.start();
         tokenizer.tokenize(reader);
      });
      it('Bogus comment', function () {
         let reader = createReader('<!- -->');
         stack = [{
            type: 'Comment',
            data: ' --'
         }, {
            type: 'EOF'
         }];
         let tokenizer = new Tokenizer(handler, { allowComments: true });
         tokenizer.start();
         tokenizer.tokenize(reader);
      });
      it('Doctype', function() {
         let reader = createReader('<!DOCTYPE html>');
         stack = [{
            type: 'Doctype',
            data: 'html'
         }, {
            type: 'EOF'
         }];
         let tokenizer = new Tokenizer(handler);
         tokenizer.start();
         tokenizer.tokenize(reader);
      });
   });
   it('PLAINTEXT', function() {
      // For elements: <plaintext>
      let reader = createReader('<tag> 1 < a < 2 <tag>');
      stack = [{
         type: 'Text',
         data: '<tag> 1 < a < 2 <tag>'
      }, {
         type: 'EOF'
      }];
      let tokenizer = new Tokenizer(handler);
      tokenizer.start();
      tokenizer.setState(TokenizerState.PLAINTEXT);
      tokenizer.tokenize(reader);
   });
   it('RCDATA', function() {
      // For elements: <textarea>, <title>
      let reader = createReader('< 1\n2\n3 ></textarea>');
      stack = [{
         type: 'Text',
         data: '< 1\n2\n3 >'
      }, {
         type: 'CloseTag',
         name: 'textarea'
      }, {
         type: 'EOF'
      }];
      let tokenizer = new Tokenizer(handler);
      tokenizer.start();
      tokenizer.setState(TokenizerState.RCDATA, 'textarea');
      tokenizer.tokenize(reader);
   });
   it('RAWTEXT', function() {
      // For elements: <style>, <xmp>, <iframe>, <noembed>, <noframes>
      let reader = createReader('.a < b { }</style>');
      stack = [{
         type: 'Text',
         data: '.a '
      }, {
         type: 'Text',
         data: '< b { }'
      }, {
         type: 'CloseTag',
         name: 'style'
      }, {
         type: 'EOF'
      }];
      let tokenizer = new Tokenizer(handler);
      tokenizer.start();
      tokenizer.setState(TokenizerState.RAWTEXT, 'style');
      tokenizer.tokenize(reader);
   });
   it('SCRIPT_DATA', function() {
      // For elements: <script>
      let reader = createReader('for(var i=0;i<0;){++i;}</script>');
      stack = [{
         type: 'Text',
         data: 'for(var i=0;i'
      }, {
         type: 'Text',
         data: '<0;){++i;}'
      }, {
         type: 'CloseTag',
         name: 'script'
      }, {
         type: 'EOF'
      }];
      let tokenizer = new Tokenizer(handler);
      tokenizer.start();
      tokenizer.setState(TokenizerState.SCRIPT_DATA, 'script');
      tokenizer.tokenize(reader);
   });
});
