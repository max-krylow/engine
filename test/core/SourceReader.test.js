/* global require, describe, it */
const { assert } = require("chai");
const { Source } = require("engine/core/Source");
const { SourceReader } = require("engine/core/SourceReader");
const { MetaInfo } = require("engine/core/MetaInfo");
const { default: Position } = require("engine/core/utils/Position");
const { default: Location } = require("engine/core/utils/Location");

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
   it('.hasNext()', () => {
      let reader = createReader('ab');
      assert.isTrue(reader.hasNext());
      assert.strictEqual(reader.consume(), 'a');
      assert.isTrue(reader.hasNext());
      assert.strictEqual(reader.consume(), 'b');
      assert.isFalse(reader.hasNext());
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
   it('.getPosition().column',  () => {
      let reader = createReader('ab');

      assert.strictEqual(reader.consume(), 'a');
      assert.strictEqual(reader.getPosition().column, 0);

      assert.strictEqual(reader.consume(), 'b');
      assert.strictEqual(reader.getPosition().column, 1);

      assert.strictEqual(reader.consume(), EOF);
      assert.strictEqual(reader.getPosition().column, 2);
   });
   it('.getPosition().column re-consumed',  () => {
      let reader = createReader('ab');

      assert.strictEqual(reader.consume(), 'a');
      assert.strictEqual(reader.getPosition().column, 0);

      assert.strictEqual(reader.consume(), 'b');
      assert.strictEqual(reader.getPosition().column, 1);

      reader.reconsume();
      assert.strictEqual(reader.consume(), 'b');
      assert.strictEqual(reader.getPosition().column, 1);

      assert.strictEqual(reader.consume(), EOF);
      assert.strictEqual(reader.getPosition().column, 2);
   });
   it('.getPosition().column after EOF',  () => {
      let reader = createReader('a');

      assert.strictEqual(reader.consume(), 'a');
      assert.strictEqual(reader.getPosition().column, 0);

      assert.strictEqual(reader.consume(), EOF);
      assert.strictEqual(reader.getPosition().column, 1);

      assert.strictEqual(reader.consume(), EOF);
      assert.strictEqual(reader.getPosition().column, 1);
   });
   it('.getPosition().line',  () => {
      let reader = createReader('a\nb\nc');

      assert.strictEqual(reader.consume(), 'a');
      assert.strictEqual(reader.getPosition().line, 0);

      assert.strictEqual(reader.consume(), '\n');
      assert.strictEqual(reader.getPosition().line, 0);

      assert.strictEqual(reader.consume(), 'b');
      assert.strictEqual(reader.getPosition().line, 1);

      assert.strictEqual(reader.consume(), '\n');
      assert.strictEqual(reader.getPosition().line, 1);

      assert.strictEqual(reader.consume(), 'c');
      assert.strictEqual(reader.getPosition().line, 2);

      assert.strictEqual(reader.consume(), EOF);
      assert.strictEqual(reader.getPosition().line, 2);
   });
   it('.getPosition().line re-consumed',  () => {
      let reader = createReader('a\nb');

      assert.strictEqual(reader.consume(), 'a');
      assert.strictEqual(reader.getPosition().line, 0);

      assert.strictEqual(reader.consume(), '\n');
      assert.strictEqual(reader.getPosition().line, 0);

      reader.reconsume();
      assert.strictEqual(reader.consume(), '\n');
      assert.strictEqual(reader.getPosition().line, 0);

      assert.strictEqual(reader.consume(), 'b');
      assert.strictEqual(reader.getPosition().line, 1);

      assert.strictEqual(reader.consume(), EOF);
      assert.strictEqual(reader.getPosition().line, 1);
   });
   it('.getSpan()', function () {
      const source = new Source('abcde', meta);
      const location = new Location(new Position(0, 0, 2), new Position(0, 0, 3));
      assert.strictEqual(source.getSpan(location), 'cd');
   });
});
