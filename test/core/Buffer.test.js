/* global require, describe, it */

const { assert } = require('chai');
const BufferLib = require('engine/core/utils/Buffer');
const Buffer = BufferLib.default;

const EOF = null;

describe('core/Buffer', function() {
   it('.consume()', function() {
      let buffer = new Buffer('ab');
      assert.strictEqual(buffer.consume(), 'a');
      assert.strictEqual(buffer.consume(), 'b');
      assert.strictEqual(buffer.consume(), EOF);
   });
   it('.consume() preprocessed', function() {
      let buffer = new Buffer('a\nb\n\rc\r\nd');
      assert.strictEqual(buffer.consume(), 'a');
      assert.strictEqual(buffer.consume(), '\n');
      assert.strictEqual(buffer.consume(), 'b');
      assert.strictEqual(buffer.consume(), '\n');
      assert.strictEqual(buffer.consume(), 'c');
      assert.strictEqual(buffer.consume(), '\n');
      assert.strictEqual(buffer.consume(), 'd');
      assert.strictEqual(buffer.consume(), EOF);
   });
   it('.reconsume() before first', function() {
      let buffer = new Buffer('ab');
      buffer.reconsume();
      assert.strictEqual(buffer.consume(), 'a');
      assert.strictEqual(buffer.consume(), 'b');
      assert.strictEqual(buffer.consume(), EOF);
   });
   it('.reconsume()', function() {
      let buffer = new Buffer('ab');
      assert.strictEqual(buffer.consume(), 'a');
      buffer.reconsume();
      assert.strictEqual(buffer.consume(), 'a');
      assert.strictEqual(buffer.consume(), 'b');
      assert.strictEqual(buffer.consume(), EOF);
   });
   it('.reconsume() after EOF', function() {
      let buffer = new Buffer('ab');
      assert.strictEqual(buffer.consume(), 'a');
      assert.strictEqual(buffer.consume(), 'b');
      assert.strictEqual(buffer.consume(), EOF);
      buffer.reconsume();
      assert.strictEqual(buffer.consume(), EOF);
   });
   it('.getColumn()',  function() {
      let buffer = new Buffer('ab');

      assert.strictEqual(buffer.consume(), 'a');
      assert.strictEqual(buffer.getColumn(), 0);

      assert.strictEqual(buffer.consume(), 'b');
      assert.strictEqual(buffer.getColumn(), 1);

      assert.strictEqual(buffer.consume(), EOF);
      assert.strictEqual(buffer.getColumn(), 2);
   });
   it('.getColumn() re-consumed',  function() {
      let buffer = new Buffer('ab');

      assert.strictEqual(buffer.consume(), 'a');
      assert.strictEqual(buffer.getColumn(), 0);

      assert.strictEqual(buffer.consume(), 'b');
      assert.strictEqual(buffer.getColumn(), 1);

      buffer.reconsume();
      assert.strictEqual(buffer.consume(), 'b');
      assert.strictEqual(buffer.getColumn(), 1);

      assert.strictEqual(buffer.consume(), EOF);
      assert.strictEqual(buffer.getColumn(), 2);
   });
   it('.getColumn() after EOF',  function() {
      let buffer = new Buffer('a');

      assert.strictEqual(buffer.consume(), 'a');
      assert.strictEqual(buffer.getColumn(), 0);

      assert.strictEqual(buffer.consume(), EOF);
      assert.strictEqual(buffer.getColumn(), 1);

      assert.strictEqual(buffer.consume(), EOF);
      assert.strictEqual(buffer.getColumn(), 1);
   });
   it('.getLine()',  function() {
      let buffer = new Buffer('a\nb\nc');

      assert.strictEqual(buffer.consume(), 'a');
      assert.strictEqual(buffer.getLine(), 0);

      assert.strictEqual(buffer.consume(), '\n');
      assert.strictEqual(buffer.getLine(), 0);

      assert.strictEqual(buffer.consume(), 'b');
      assert.strictEqual(buffer.getLine(), 1);

      assert.strictEqual(buffer.consume(), '\n');
      assert.strictEqual(buffer.getLine(), 1);

      assert.strictEqual(buffer.consume(), 'c');
      assert.strictEqual(buffer.getLine(), 2);

      assert.strictEqual(buffer.consume(), EOF);
      assert.strictEqual(buffer.getLine(), 2);
   });
   it('.getLine() re-consumed',  function() {
      let buffer = new Buffer('a\nb');

      assert.strictEqual(buffer.consume(), 'a');
      assert.strictEqual(buffer.getLine(), 0);

      assert.strictEqual(buffer.consume(), '\n');
      assert.strictEqual(buffer.getLine(), 0);

      buffer.reconsume();
      assert.strictEqual(buffer.consume(), '\n');
      assert.strictEqual(buffer.getLine(), 0);

      assert.strictEqual(buffer.consume(), 'b');
      assert.strictEqual(buffer.getLine(), 1);

      assert.strictEqual(buffer.consume(), EOF);
      assert.strictEqual(buffer.getLine(), 1);
   });
});
