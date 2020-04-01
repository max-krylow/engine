/* global require, describe, it */

const { assert } = require('chai');

const TokenizerLib = require('engine/html/Tokenizer');
const Tokenizer = TokenizerLib.Tokenizer;
const TokenizerState = TokenizerLib.TokenizerState;

function assertAttributes(standard, actual) {
   const keys = Object.keys(standard);
   assert.strictEqual(keys.length, Object.keys(actual).length);
   for (let i; i < keys.length; ++i) {
      const name = keys[i];
      assert.strictEqual(standard[name].value, actual[name].value)
   }
}

let stack;

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
         const source = '<tag>';
         stack = [{
            type: 'OpenTag',
            name: 'tag',
            selfClosing: false
         }, {
            type: 'EOF'
         }];
         let tokenizer = new Tokenizer(handler);
         tokenizer.start();
         tokenizer.tokenize(source);
      });
      it('Open tag, selfClosing=true', function () {
         const source = '<tag />';
         stack = [{
            type: 'OpenTag',
            name: 'tag',
            selfClosing: true
         }, {
            type: 'EOF'
         }];
         let tokenizer = new Tokenizer(handler);
         tokenizer.start();
         tokenizer.tokenize(source);
      });
      it('Attributes', function () {
         const source = '<tag a=1 b=\'2\' c="3" d>';
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
         tokenizer.tokenize(source);
      });
      it('Tags pair', function () {
         const source = '<tag></tag>';
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
         tokenizer.tokenize(source);
      });
      it('Comment, allowComments=false', function () {
         const source = '<!-- abc -->';
         stack = [{
            type: 'EOF'
         }];
         let tokenizer = new Tokenizer(handler);
         tokenizer.start();
         tokenizer.tokenize(source);
      });
      it('Comment, allowComments=true', function () {
         const source = '<!-- abc -->';
         stack = [{
            type: 'Comment',
            data: ' abc '
         }, {
            type: 'EOF'
         }];
         let tokenizer = new Tokenizer(handler, { allowComments: true });
         tokenizer.start();
         tokenizer.tokenize(source);
      });
      it('Text', function () {
         const source = '1 < 2';
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
         tokenizer.tokenize(source);
      });
      it('CDATA, allowCDATA=false', function () {
         const source = '<![CDATA[a]]>';
         stack = [{
            type: 'EOF'
         }];
         let tokenizer = new Tokenizer(handler);
         tokenizer.start();
         tokenizer.tokenize(source);
      });
      it('CDATA, allowCDATA=true', function () {
         const source = '<![CDATA[ a ]] ]]>';
         stack = [{
            type: 'CDATA',
            data: ' a ]] '
         }, {
            type: 'EOF'
         }];
         let tokenizer = new Tokenizer(handler, { allowCDATA: true });
         tokenizer.start();
         tokenizer.tokenize(source);
      });
      it('Bogus comment', function () {
         const source = '<!- -->';
         stack = [{
            type: 'Comment',
            data: ' --'
         }, {
            type: 'EOF'
         }];
         let tokenizer = new Tokenizer(handler, { allowComments: true });
         tokenizer.start();
         tokenizer.tokenize(source);
      });
      it('Doctype', function() {
         const source = '<!DOCTYPE html>';
         stack = [{
            type: 'Doctype',
            data: 'html'
         }, {
            type: 'EOF'
         }];
         let tokenizer = new Tokenizer(handler);
         tokenizer.start();
         tokenizer.tokenize(source);
      });
   });
   it('PLAINTEXT', function() {
      const source = '<tag> 1 < a < 2 <tag>';
      stack = [{
         type: 'Text',
         data: '<tag> 1 < a < 2 <tag>'
      }, {
         type: 'EOF'
      }];
      let tokenizer = new Tokenizer(handler);
      tokenizer.start();
      tokenizer.setState(TokenizerState.PLAINTEXT);
      tokenizer.tokenize(source);
   });
   it('RCDATA', function() {
      const source = '< 1\n2\n3 >';
      stack = [{
         type: 'Text',
         data: '< 1\n2\n3 >'
      }, {
         type: 'EOF'
      }];
      let tokenizer = new Tokenizer(handler);
      tokenizer.start();
      tokenizer.setState(TokenizerState.RCDATA);
      tokenizer.tokenize(source);
   });
   it('RAWTEXT', function() {
      const source = '.a < b { }';
      stack = [{
         type: 'Text',
         data: '.a '
      }, {
         type: 'Text',
         data: '< b { }'
      }, {
         type: 'EOF'
      }];
      let tokenizer = new Tokenizer(handler);
      tokenizer.start();
      tokenizer.setState(TokenizerState.RAWTEXT);
      tokenizer.tokenize(source);
   });
});
