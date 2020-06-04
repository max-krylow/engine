/* global require, describe, it */

const { assert } = require('chai');
const { SourceFile } = require("engine/html/base/SourceFile");
const { SourceReader } = require("engine/html/base/SourceReader");
const { TransformVisitor } = require("engine/core/Transformer");
const { Parser } = require("engine/html/Parser");
const { getTagNodeDescription } = require('engine/html/NodeDescription');
const { ERROR_HANDLER } = require('../ErrorHandler');

function traverse(html) {
   const transformer = new TransformVisitor();
   const CONTEXT = { };
   const parser = new Parser({
      nodeDescriptor: getTagNodeDescription
   }, ERROR_HANDLER);
   let reader = new SourceReader(new SourceFile(html));
   const tree = parser.parse(reader);
   return transformer.visitAll(tree, CONTEXT);
}

const html = `
<div
    attr:style="display: flex; justify-content: space-around;"
    class="controls-text-label_theme-{{_options.theme}} controlsDemo__mb1">
   <Controls.scroll:Container scn="1" attr:style="width: 50%; height: 600px;">
      <Controls.list:View
         keyProperty="key"
         displayProperty="title"
         source="{{ _viewSource }}"
         multiSelectVisibility="{{ _multiSelectVisibility }}"
         itemActions="{{ _itemActions }}"
         navigation="{{ _navigation }}"
         name="listView"
         bind:position="_position"
         useNewModel="{{ true }}">
         <!--<Controls.Calendar.MonthView month="{{_month}}" captionType="text"/>-->
         <ws:if data=" _multiSelectVisibility === 'hidden' ">
            <ws:partial template="Controls/list:EditingTemplate" 
                   value="{{ itemTemplate.item.contents.title }}"
                   enabled="{{ true }}">
               <Controls.input:Text
                       bind:value="itemTemplate.item.contents.title"
                       selectOnClick="{{ false }}"
                       on:click="_changeMonth(1)" />
            </ws:partial>
         </ws:if>
         <ws:else>
            <ws:partial template="Controls/dropdown:ItemTemplate"
                        itemData="{{itemData}}"
                        marker="{{false}}"
                        bind:value="_value"
                        multiLine="{{true}}">
               <div class="ControlsDemo-ComboboxVDOM__myTempalteMultiline">
                  {{itemData.getPropValue(itemData.item, 'title')}}
               </div>
            </ws:partial>
         </ws:else>
      </Controls.list:View>
   </Controls.scroll:Container>
</div>

`;

describe('engine/core/Transformer', function() {
   it('HTML element', function() {
      const ast = traverse(html);
   });
   it('Conditional directive', function() {
      const ast = traverse('<ws:if data="true">123</ws:if>');
   });
});
