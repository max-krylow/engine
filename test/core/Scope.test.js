const { Scope } = require('engine/core/Scope');
const { TemplateNode } = require('engine/core/Ast');
const { assert } = require('chai');

function assertDependencies(actual, standard) {
   const standardString = standard.sort().join(',');
   const actualString = actual.sort().join(',');
   assert.strictEqual(standardString, actualString);
}

function sortDictionary(dictionary) {
   return dictionary.sort(function(a, b) {
      if (a.text < b.text) {
         return -1;
      }
      if (a.text > b.text) {
         return 1;
      }
      if (a.context < b.context) {
         return -1;
      }
      if (a.context > b.context) {
         return 1;
      }
      return 0;
   });
}

function assertDictionary(standard, actual) {
   const sortedStandard = sortDictionary(standard);
   const sortedActual = sortDictionary(actual);
   assert.strictEqual(sortedStandard.length, sortedActual.length);
   for (let i = 0; i < sortedStandard.length; ++i) {
      assert.strictEqual(sortedStandard[i].text, sortedStandard[i].text);
      assert.strictEqual(sortedStandard[i].module, sortedStandard[i].module);
      assert.strictEqual(sortedStandard[i].context, sortedStandard[i].context);
   }
}

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
   describe('Translations', () => {
      it('.registerTranslation', () => {
         const standard = [{
            module: 'test',
            text: 'first',
            context: ''
         }, {
            module: 'test',
            text: 'second',
            context: 'context'
         }, {
            module: 'test',
            text: 'third',
            context: ''
         }];
         const scope = new Scope();
         for (let i = 0; i < standard.length; ++i) {
            scope.registerTranslation(standard[i].module, standard[i].text, standard[i].context);
         }
         assertDictionary(scope.getTranslations(), standard);
      });
      it('.registerTranslation inherited', () => {
         const standard = [{
            module: 'test',
            text: 'first',
            context: ''
         }, {
            module: 'test',
            text: 'second',
            context: 'context'
         }, {
            module: 'test',
            text: 'third',
            context: ''
         }];
         const scope1 = new Scope();
         const scope2 = new Scope(scope1);
         const scope3 = new Scope(scope2);
         scope3.registerTranslation(standard[0].module, standard[0].text, standard[0].context);
         scope2.registerTranslation(standard[0].module, standard[0].text, standard[0].context);
         scope1.registerTranslation(standard[0].module, standard[0].text, standard[0].context);
         assertDictionary(scope3.getTranslations(), standard);
         assert.strictEqual(scope1.getTranslations(), scope2.getTranslations());
         assert.strictEqual(scope3.getTranslations(), scope2.getTranslations());
      });
      describe('Dependencies', () => {
         it('.registerDependency', () => {
            const standard = [
               'first',
               'second',
               'third'
            ];
            const scope = new Scope();
            for (let i = 0; i < standard.length; ++i) {
               scope.registerDependency(standard[i]);
            }
            assertDependencies(scope.getDependencies(), standard);
         });
         it('.registerDependency inherited', () => {
            const standard = [
               'first',
               'second',
               'third'
            ];
            const scope1 = new Scope();
            const scope2 = new Scope(scope1);
            const scope3 = new Scope(scope2);
            scope3.registerDependency(standard[0]);
            scope2.registerDependency(standard[1]);
            scope1.registerDependency(standard[2]);
            assertDependencies(scope3.getDependencies(), standard);
            assert.strictEqual(scope1.getDependencies(), scope2.getDependencies());
            assert.strictEqual(scope3.getDependencies(), scope2.getDependencies());
         });
      });
   });
});
