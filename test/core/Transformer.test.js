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

const html = `<div class="mcc-index {{ _options.data.faded ? 'faded' : '' }}">
   <ws:if data="{{ _options.data.trustability.class < 3 && _options.data.creditValue > 0 }}">
      {[ Текст 1 ]} ({{ _options.data.current }} &#8381;) {[ Текст 2 ]}:
   </ws:if>
   <ws:else>
      <Controls.dataSource:error.Container
         name="errorContainer"
         viewConfig="{{ _error }}">
         <div attr:class="mcc-Patents">
            <Controls.list:View
               markerVisibility="hidden"
               readOnly="{{ true }}"
               source="{{ _source }}"
               navigation="{{ _navigation }}">
               <ws:filter
                  ContractorId="{{ _options.sppId }}"
                  PropertyStateId="{{ _options.type }}" />
               <ws:itemTemplate>
                  <ws:partial attr:class='mcc-ListItemBordered' template="Controls/list:ItemTemplate">
                     <ws:contentTemplate>
                        <ws:partial template="wml!pages/itemTpl" />
                     </ws:contentTemplate>
                  </ws:partial>
               </ws:itemTemplate>
            </Controls.list:View>
         </div>
      </Controls.dataSource:error.Container>
   </ws:else>
   <div class="mcc-index-trustability flex-row">
      <div class="sber-logo"></div>
      <div class="flex-col">
         <span>{[ Текст 0 ]}</span>
         <span if="{{ _options.data.trustability.class === 1 }}" class="gray">{[ Текст 3 ]}</span>
         <span if="{{ _options.data.trustability.class === 2 }}" class="gray">{[ Текст 4 ]}</span>
         <span if="{{ _options.data.trustability.class === 3 }}" class="gray">{[ Текст 5 ]}</span>
      </div>
   </div>
   <div if="{{ _options.data.trustability.class < 3 && _options.data.trustability.capitalValue > 0 }}" class="mcc-index-trustability-block flex-col">
      <span class="text16 bold">{{ _options.data.trustability.capital }} &#8381;</span>
      <span class="gray">{[ Текст 6 ]}</span>
   </div>
   <div if="{{ _options.data.trustability.class < 3 && _options.data.trustability.investmentValue > 0 }}"
        class="mcc-index-trustability-block flex-col">
      <span class="text16 bold">{{ _options.data.trustability.investment }} &#8381;</span>
      <span class="gray">{[ Текст 7 ]}</span>
   </div>
   <div if="{{ _options.data.trustability.class == 3 || _options.data.trustability.creditValue < 0 }}"
        class="mcc-index-trustability-block flex-col">
      <span class="text16">{[ Текс 8 ]}</span>
      <span if="{{ _options.data.trustability.creditValue < 0 }}" class="gray">{[ Текст 9 ]}</span>
   </div>
</div>`;

describe('engine/core/Transformer', function() {
   it('develop', function() {
      const tree = parse(html);
      const ast = transformer.visitAll(tree, CONTEXT);
   });
});
