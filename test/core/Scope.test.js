const { Scope } = require('engine/core/Scope');
const { TemplateNode } = require('engine/core/Ast');
const { assert } = require('chai');

describe('engine/core/Scope', () => {
   describe('Templates', () => {
      it('.registerTemplate', () => {
         const template = new TemplateNode('default');
         const scope = new Scope();
         scope.registerTemplate(template);
         assert.strictEqual(scope.getTemplateNode('default'), template);
         assert.strictEqual(scope.getTemplateUsages('default'), 0);
      });
      it('.registerTemplate error', () => {
         const template = new TemplateNode('default');
         const scope = new Scope();
         scope.registerTemplate(template);
         assert.strictEqual(scope.getTemplateNode('default'), template);
         assert.strictEqual(scope.getTemplateUsages('default'), 0);
         try {
            scope.registerTemplate(template);
         } catch (error) {
            assert.strictEqual(error.message, 'Template with name "default" has already been declared in this scope');
            return;
         }
         throw new Error('Expected exception to be thrown');
      });
      it('.getTemplateNode error', () => {
         const scope = new Scope();
         try {
            scope.getTemplateNode('default');
         } catch (error) {
            assert.strictEqual(error.message, 'Template with name "default" has not been declared in this scope');
            return;
         }
         throw new Error('Expected exception to be thrown');
      });
      it('.getTemplateUsages error', () => {
         const scope = new Scope();
         try {
            scope.getTemplateUsages('default');
         } catch (error) {
            assert.strictEqual(error.message, 'Template with name "default" has not been declared in this scope');
            return;
         }
         throw new Error('Expected exception to be thrown');
      });
      it('.registerTemplate', () => {
         const template = new TemplateNode('default');
         const scope = new Scope();
         scope.registerTemplate(template);
         scope.registerTemplateUsage('default');
         assert.strictEqual(scope.getTemplateNode('default'), template);
         assert.strictEqual(scope.getTemplateUsages('default'), 1);
      });
      it('.registerTemplate error', () => {
         const scope = new Scope();
         try {
            scope.registerTemplateUsage('default');
         } catch (error) {
            assert.strictEqual(error.message, 'Template with name "default" has not been declared in this scope');
            return;
         }
         throw new Error('Expected exception to be thrown');
      });
   });
});
