const { Traverser } = require('engine/core/Traverser');
const { Annotator } = require('engine/core/Annotator');
const { ERROR_HANDLER } = require('../ErrorHandler');

function traverseAndAnnotate(html) {
   const options = {
      allowComments: true,
      allowCDATA: true
   };
   const traverser = new Traverser(options, ERROR_HANDLER);
   const annotator = new Annotator();
   const traversed = traverser.traverse(html, {
      filePath: 'Annotator.wml'
   });
   return annotator.annotate(traversed.ast, {
      module: 'Annotator'
   });
}

describe('engine/core/Annotatator', () => {
   describe('HTML', () => {
      it('Element', () => {
         const html = '<input class="item-{{item.enabled}}" on:click="handler()" bind:value="_value">';
         const annotatedAst = traverseAndAnnotate(html);
         debugger;
      });
      it('Comment', () => {
         const html = '<!--text-->';
         const annotatedAst = traverseAndAnnotate(html);
         debugger;
      });
      it('Doctype', () => {
         const html = '<!DOCTYPE html>';
         const annotatedAst = traverseAndAnnotate(html);
         debugger;
      });
      it('CDATA', () => {
         const html = '<![CDATA[data]]>';
         const annotatedAst = traverseAndAnnotate(html);
         debugger;
      });
   });
   describe('Wasaby', () => {
      it('Localization in attribute', () => {
         const html = '<input placeholder="{[Placeholder]}">';
         const annotatedAst = traverseAndAnnotate(html);
         debugger;
      });
      it('Localization in text', () => {
         const html = '<div>{[Text]}</div>';
         const annotatedAst = traverseAndAnnotate(html);
         debugger;
      });
      it('Component', () => {
         const html = '<Components.Input attr:class="item-{{item.enabled}}" on:click="handler()" bind:value="_value" collection="{{collection}}">123</Components.Input>';
         const annotatedAst = traverseAndAnnotate(html);
         debugger;
      });
      it('Directive ws:for', () => {
         const html = '<ws:for data="i = 0;i < 10;i++;">{{2 * i + 1;}}</ws:for>';
         const annotatedAst = traverseAndAnnotate(html);
         debugger;
      });
      it('Directive ws:foreach', () => {
         const html = '<ws:foreach data="item in collection;">{{item.get("data");}}</ws:foreach>';
         const annotatedAst = traverseAndAnnotate(html);
         debugger;
      });
      it('Directive ws:if', () => {
         const html = '<ws:if data="condition;">Hello</ws:if>';
         const annotatedAst = traverseAndAnnotate(html);
         debugger;
      });
      it('Directive ws:else', () => {
         const html = '<ws:else>Hello</ws:else>';
         const annotatedAst = traverseAndAnnotate(html);
         debugger;
      });
      it('Directive ws:template', () => {
         const html = '<ws:template name="tmpl"><div>Hello</div></ws:template>';
         const annotatedAst = traverseAndAnnotate(html);
         debugger;
      });
      it('Directive ws:partial', () => {
         const html = '<ws:partial template="tmpl" attr:class="className" on:click="handler(arg);" text="string" bind:value="_value;"><div>Hello</div></ws:partial>';
         const annotatedAst = traverseAndAnnotate(html);
         debugger;
      });
   });
});
