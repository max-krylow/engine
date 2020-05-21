/* global require, describe, it */

const { assert } = require('chai');
const { SourceFile } = require("engine/html/base/SourceFile");
const { SourceReader } = require("engine/html/base/SourceReader");
const { TransformVisitor } = require("engine/core/Transformer");
const { Parser } = require("engine/html/Parser");
const { getTagNodeDescription } = require('engine/html/NodeDescription');
const { ERROR_HANDLER } = require('../ErrorHandler');

const transformer = new TransformVisitor();
const CONTEXT = { };
const parser = new Parser({
   nodeDescriptor: getTagNodeDescription
}, ERROR_HANDLER);

function parse(html) {
   let reader = new SourceReader(new SourceFile(html));
   return parser.parse(reader);
}

describe('engine/core/Transformer', function() {
   it('HTML element', function() {
      const tree = parse('<div>123</div>');
      const ast = transformer.visitAll(tree, CONTEXT);
   });
   it('Conditional directive', function() {
      const tree = parse('<ws:if data="{{ true }}">123</ws:if>');
      const ast = transformer.visitAll(tree, CONTEXT);
   });
});
