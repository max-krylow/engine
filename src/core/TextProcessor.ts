/// <amd-module name="engine/core/TextProcessor" />

import * as AstNodes from "./Ast";
import { splitLocalizationText } from "./i18n";
import { IParser } from "../expression/Parser";

const EMPTY_STRING = '';

/**
 * Regular expression for finding variables/expression inside of AST
 */
const VARIABLES_PATTERN = /\{\{ ?([\s\S]*?) ?\}\}/g;
const LOCALIZATION_PATTERN = /\{\[ ?([\s\S]*?) ?\]\}/g;

/**
 * Safe replacing
 */
const SAFE_REPLACE_CASE_PATTERN = /\r|\n|\t|\/\*[\s\S]*?\*\//g;

/**
 * Safe whitespaces replacing
 */
const SAFE_WHITESPACE_REMOVE_PATTERN = / +(?= )/g;

/**
 *
 */
declare type TWrapper = (data: string) => AstNodes.TText;

function createLocalizationNode(data: string): AstNodes.LocalizationNode {
   const { text, context } = splitLocalizationText(data);
   return new AstNodes.LocalizationNode(text, context);
}

function createTextNode(data: string): AstNodes.TextNode {
   return new AstNodes.TextNode(data);
}

/**
 *
 * @param nodes
 * @param regex
 * @param targetWrapper
 * @param defaultWrapper
 */
function markDataByRegex(
   nodes: AstNodes.TText[],
   regex: RegExp,
   targetWrapper: TWrapper,
   defaultWrapper: TWrapper
): AstNodes.TText[] {
   let item;
   let value;
   let last;
   const data = [];
   for (let idx = 0; idx < nodes.length; ++idx) {
      if (!(nodes[idx] instanceof AstNodes.TextNode)) {
         data.push(nodes[idx]);
         continue;
      }

      const stringData = (nodes[idx] as AstNodes.TextNode).content;

      regex.lastIndex = 0;
      last = 0;
      while ((item = regex.exec(stringData))) {
         if (last < item.index) {
            value = stringData.slice(last, item.index);
            data.push(defaultWrapper(value));
         }
         data.push(targetWrapper(item[1]));
         last = item.index + item[0].length;
      }

      if (last === 0) {
         data.push(nodes[idx]);
      } else if (last < stringData.length) {
         value = stringData.slice(last);
         data.push(defaultWrapper(value));
      }
   }
   return data;
}

/**
 *
 * @param text
 * @param expressionParser
 */
export function processTextData(text: string, expressionParser: IParser): AstNodes.TText[] {
   SAFE_REPLACE_CASE_PATTERN.lastIndex = 0;
   SAFE_WHITESPACE_REMOVE_PATTERN.lastIndex = 0;

   const originText = text
      .replace(SAFE_REPLACE_CASE_PATTERN, ' ')
      .replace(SAFE_WHITESPACE_REMOVE_PATTERN, EMPTY_STRING);

   const processedText = [new AstNodes.TextNode(originText)];

   const processedExpressions = markDataByRegex(
      processedText,
      VARIABLES_PATTERN,
      (data: string) => new AstNodes.ExpressionNode(expressionParser.parse(data)),
      createTextNode
   );

   return markDataByRegex(
      processedExpressions,
      LOCALIZATION_PATTERN,
      createLocalizationNode,
      createTextNode
   );
}
