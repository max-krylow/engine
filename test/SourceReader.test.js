/* global require, describe, it */
const { assert } = require("chai");
const { Source } = require("engine/core/Source");
const { SourceReader } =  require("engine/core/SourceReader");
const { MetaInfo } =  require("engine/core/MetaInfo");

const meta = new MetaInfo('test/core/SourceReader.test.ts');
const EOF = null;

function createReader(data) {
   return new SourceReader(new Source(data, meta));
}

describe('core/SourceReader', () => {
   it('.consume()', () => {
      let reader = createReader('ab');
      assert.strictEqual(reader.consume(), 'a');
      assert.strictEqual(reader.consume(), 'b');
      assert.strictEqual(reader.consume(), EOF);
   });
   it('.consume() preprocessed', () => {
      let reader = createReader('a\nb\n\rc\r\nd');
      assert.strictEqual(reader.consume(), 'a');
      assert.strictEqual(reader.consume(), '\n');
      assert.strictEqual(reader.consume(), 'b');
      assert.strictEqual(reader.consume(), '\n');
      assert.strictEqual(reader.consume(), 'c');
      assert.strictEqual(reader.consume(), '\n');
      assert.strictEqual(reader.consume(), 'd');
      assert.strictEqual(reader.consume(), EOF);
   });
   it('.reconsume() before first', () => {
      let reader = createReader('ab');
      reader.reconsume();
      assert.strictEqual(reader.consume(), 'a');
      assert.strictEqual(reader.consume(), 'b');
      assert.strictEqual(reader.consume(), EOF);
   });
   it('.reconsume()', () => {
      let reader = createReader('ab');
      assert.strictEqual(reader.consume(), 'a');
      reader.reconsume();
      assert.strictEqual(reader.consume(), 'a');
      assert.strictEqual(reader.consume(), 'b');
      assert.strictEqual(reader.consume(), EOF);
   });
   it('.reconsume() after EOF', () => {
      let reader = createReader('ab');
      assert.strictEqual(reader.consume(), 'a');
      assert.strictEqual(reader.consume(), 'b');
      assert.strictEqual(reader.consume(), EOF);
      reader.reconsume();
      assert.strictEqual(reader.consume(), EOF);
   });
   it('.getColumn()',  () => {
      let reader = createReader('ab');

      assert.strictEqual(reader.consume(), 'a');
      assert.strictEqual(reader.getColumn(), 0);

      assert.strictEqual(reader.consume(), 'b');
      assert.strictEqual(reader.getColumn(), 1);

      assert.strictEqual(reader.consume(), EOF);
      assert.strictEqual(reader.getColumn(), 2);
   });
   it('.getColumn() re-consumed',  () => {
      let reader = createReader('ab');

      assert.strictEqual(reader.consume(), 'a');
      assert.strictEqual(reader.getColumn(), 0);

      assert.strictEqual(reader.consume(), 'b');
      assert.strictEqual(reader.getColumn(), 1);

      reader.reconsume();
      assert.strictEqual(reader.consume(), 'b');
      assert.strictEqual(reader.getColumn(), 1);

      assert.strictEqual(reader.consume(), EOF);
      assert.strictEqual(reader.getColumn(), 2);
   });
   it('.getColumn() after EOF',  () => {
      let reader = createReader('a');

      assert.strictEqual(reader.consume(), 'a');
      assert.strictEqual(reader.getColumn(), 0);

      assert.strictEqual(reader.consume(), EOF);
      assert.strictEqual(reader.getColumn(), 1);

      assert.strictEqual(reader.consume(), EOF);
      assert.strictEqual(reader.getColumn(), 1);
   });
   it('.getLine()',  () => {
      let reader = createReader('a\nb\nc');

      assert.strictEqual(reader.consume(), 'a');
      assert.strictEqual(reader.getLine(), 0);

      assert.strictEqual(reader.consume(), '\n');
      assert.strictEqual(reader.getLine(), 0);

      assert.strictEqual(reader.consume(), 'b');
      assert.strictEqual(reader.getLine(), 1);

      assert.strictEqual(reader.consume(), '\n');
      assert.strictEqual(reader.getLine(), 1);

      assert.strictEqual(reader.consume(), 'c');
      assert.strictEqual(reader.getLine(), 2);

      assert.strictEqual(reader.consume(), EOF);
      assert.strictEqual(reader.getLine(), 2);
   });
   it('.getLine() re-consumed',  () => {
      let reader = createReader('a\nb');

      assert.strictEqual(reader.consume(), 'a');
      assert.strictEqual(reader.getLine(), 0);

      assert.strictEqual(reader.consume(), '\n');
      assert.strictEqual(reader.getLine(), 0);

      reader.reconsume();
      assert.strictEqual(reader.consume(), '\n');
      assert.strictEqual(reader.getLine(), 0);

      assert.strictEqual(reader.consume(), 'b');
      assert.strictEqual(reader.getLine(), 1);

      assert.strictEqual(reader.consume(), EOF);
      assert.strictEqual(reader.getLine(), 1);
   });
});
