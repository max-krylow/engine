/// <amd-module name="engine/html/Tokenizer" />

import Location  from "../core/utils/Location";

const NULL: string = '\u0000';
const AMPERSAND: string = '&';
const LESS_THAN_SIGN: string = '<';
const EXCLAMATION_MARK: string = '!';
const SOLIDUS: string = '/';
const QUESTION_MARK: string = '?';
const GREATER_THAN_SIGN: string = '>';
const CHARACTER_TABULATION: string = '\t';
const LINE_FEED: string = '\n';
const FORM_FEED: string = '\f';
const SPACE: string = ' ';
const QUOTATION_MARK: string = '"';
const APOSTROPHE: string = "'";
const EQUALS_SIGN: string = '=';
const GRAVE_ACCENT: string = '`';
const HYPHEN_MINUS: string = '-';
const LSQB: string = '[';
const RSQB: string = ']';
const CDATA_LSQB = 'CDATA[';
const OCTYPE = 'OCTYPE';

interface ITokenizerOptions {
   html4: boolean;
   allowComments: boolean;
   allowCDATA: boolean;
   tagNameToLowerCase: boolean;
}

interface IAttributeValue {
   readonly location: Location;
   readonly value: string | null;
}

interface IAttributes {
   [attribute: string]: IAttributeValue;
}

interface IHandler {
   onOpenTag(name: string, attributes: IAttributes, selfClosing: boolean, location?: Location): void;
   onCloseTag(name: string, location?: Location): void;
   onText(data: string, location?: Location): void;
   onComment(data: string, location?: Location): void;
   onCDATA(data: string, location?: Location): void;
   onDoctype(data: string, location?: Location): void;
   onEOF(): void;
}

interface IErrorHandler {
   warn(message: string, location?: Location): void;
   error(message: string, location?: Location): void;
}

enum TokenizerState {
   DATA = 1,
   CHARACTER_REFERENCE,
   RCDATA,
   RAWTEXT,
   RCDATA_RAWTEXT_LESS_THAN_SIGN,
   NON_DATA_END_TAG_NAME,
   SCRIPT_DATA,
   PLAINTEXT,
   TAG_OPEN,
   END_TAG_OPEN,
   TAG_NAME,
   SCRIPT_DATA_LESS_THAN_SIGN,
   SCRIPT_DATA_END_TAG_OPEN,
   SCRIPT_DATA_END_TAG_NAME,
   SCRIPT_DATA_ESCAPE_START,
   SCRIPT_DATA_ESCAPE_START_DASH,
   SCRIPT_DATA_ESCAPED,
   SCRIPT_DATA_ESCAPED_DASH,
   SCRIPT_DATA_ESCAPED_DASH_DASH,
   SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN,
   SCRIPT_DATA_ESCAPED_END_TAG_OPEN,
   SCRIPT_DATA_ESCAPED_END_TAG_NAME,
   SCRIPT_DATA_DOUBLE_ESCAPE_START,
   SCRIPT_DATA_DOUBLE_ESCAPED,
   SCRIPT_DATA_DOUBLE_ESCAPED_DASH,
   SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH,
   SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN,
   SCRIPT_DATA_DOUBLE_ESCAPE_END,
   BEFORE_ATTRIBUTE_NAME,
   ATTRIBUTE_NAME,
   AFTER_ATTRIBUTE_NAME,
   BEFORE_ATTRIBUTE_VALUE,
   ATTRIBUTE_VALUE_DOUBLE_QUOTED,
   ATTRIBUTE_VALUE_SINGLE_QUOTED,
   ATTRIBUTE_VALUE_UNQUOTED,
   AFTER_ATTRIBUTE_VALUE_QUOTED,
   SELF_CLOSING_START_TAG,
   BOGUS_COMMENT,
   BOGUS_COMMENT_HYPHEN,
   MARKUP_DECLARATION_OPEN,
   MARKUP_DECLARATION_HYPHEN,
   MARKUP_DECLARATION_OCTYPE,
   CDATA_START,
   COMMENT_START,
   COMMENT_START_DASH,
   COMMENT,
   COMMENT_END_DASH,
   COMMENT_END,
   COMMENT_END_BANG,
   DOCTYPE,
   CDATA_SECTION,
   CDATA_RSQB,
   CDATA_RSQB_RSQB
}

class Tokenizer {
   private tokenHandler: IHandler;
   private errorHandler: IErrorHandler;

   private buffer: string;
   private reconsume: boolean;
   private position: number;
   private column: number;
   private line: number;
   private lastLF: boolean;

   private state: TokenizerState;
   private returnState: TokenizerState;
   private saveState: TokenizerState;
   private returnStateSave: TokenizerState;

   private charBuffer: string;
   private refBuffer: string;
   private additional: string;

   private endTagExpectation: string;
   private endTag: boolean;
   private containsHyphen: boolean;
   private tagName: string;
   private selfClosing: boolean;

   private attributeName: string;
   private attributes: IAttributes;

   private readonly html4: boolean;
   private readonly allowComments: boolean;
   private readonly allowCDATA: boolean;
   private readonly tagNameToLowerCase: boolean;

   constructor(tokenHandler: IHandler, options?: ITokenizerOptions) {
      this.tokenHandler = tokenHandler;
      this.html4 = !!(options && options.html4);
      this.allowComments = !!(options && options.allowComments);
      this.allowCDATA = !!(options && options.allowCDATA);
      this.tagNameToLowerCase = !!(options && options.tagNameToLowerCase);
   }

   public setErrorHandler(errorHandler: IErrorHandler): void {
      this.errorHandler = errorHandler;
   }

   public getErrorHandler(): IErrorHandler {
      return this.errorHandler;
   }

   public setState(state: TokenizerState): void {
      this.state = state;
   }

   public getState(): TokenizerState {
      return this.state;
   }

   public start(): void {
      this.state = TokenizerState.DATA;
      this.returnState = TokenizerState.DATA;
      this.reconsume = false;
      this.position = 0;
      this.line = 0;
      this.column = 0;
      this.charBuffer = '';
      this.tagName = '';
      this.selfClosing = false;
      this.lastLF = false;
   }

   public tokenize(buffer: string): void {
      this.buffer = buffer;
      let char;
      let index;
      let treatAsDefault;
      while (this.position < this.buffer.length) {
         char = this.consumeChar();
         switch (this.state) {
            case TokenizerState.DATA:
               // Consume the next input character.
               switch (char) {
                  case AMPERSAND:
                     this.flushCharBuffer();
                     this.appendCharRefBuffer(char);
                     this.setAdditional(NULL);
                     this.returnState = this.state;
                     this.state = TokenizerState.CHARACTER_REFERENCE;
                     break;
                  case LESS_THAN_SIGN:
                     this.flushCharBuffer();
                     this.state = TokenizerState.TAG_OPEN;
                     break;
                  case NULL:
                     // Parse error. Emit the current input character as a character token.
                     break;
                  default:
                     // Emit the current input character as a character token.
                     this.appendCharBuffer(char);
                     break;
               }
               break;
            case TokenizerState.CHARACTER_REFERENCE:
               // Attempt to consume a character reference, with no additional allowed character.
               // If nothing is returned, emit a U+0026 AMPERSAND character (&) token.
               // Otherwise, emit the character token that was returned.
               // Finally, switch to the data state.
               this.state = TokenizerState.DATA;
               break;
            case TokenizerState.RCDATA:
               // Consume the next input character.
               switch (char) {
                  case AMPERSAND:
                     this.flushCharBuffer();
                     this.appendCharRefBuffer(char);
                     this.setAdditional(NULL);
                     this.returnState = this.state;
                     this.state = TokenizerState.CHARACTER_REFERENCE;
                     break;
                  case LESS_THAN_SIGN:
                     this.flushCharBuffer();
                     this.returnState = this.state;
                     this.state = TokenizerState.RCDATA_RAWTEXT_LESS_THAN_SIGN;
                     break;
                  case NULL:
                     // Parse error. Emit a U+FFFD REPLACEMENT CHARACTER character token.
                     // emitReplacementCharacter
                     break;
                  default:
                     // Emit the current input character as a character token.
                     this.appendCharBuffer(char);
                     break;
               }
               break;
            case TokenizerState.RAWTEXT:
               // Consume the next input character.
               switch (char) {
                  case LESS_THAN_SIGN:
                     this.flushCharBuffer();
                     this.returnState = this.state;
                     this.state = TokenizerState.RCDATA_RAWTEXT_LESS_THAN_SIGN;
                     break;
                  case NULL:
                     // Parse error. Emit a U+FFFD REPLACEMENT CHARACTER character token.
                     // emitReplacementCharacter
                     break;
                  default:
                     // Emit the current input character as a character token.
                     this.appendCharBuffer(char);
                     break;
               }
               break;
            case TokenizerState.RCDATA_RAWTEXT_LESS_THAN_SIGN:
               switch (char) {
                  case SOLIDUS:
                     // Set the temporary buffer to the empty string.
                     this.cleanCharBuffer();
                     this.state = TokenizerState.NON_DATA_END_TAG_NAME;
                     break;
                  default:
                     // Emit a U+003C LESS-THAN SIGN character token
                     // and reconsume the current input character in the RCDATA state.
                     this.appendCharBuffer(LESS_THAN_SIGN);
                     this.reconsume = true;
                     this.state = this.returnState;
                     break;
               }
               break;
            case TokenizerState.NON_DATA_END_TAG_NAME:
               // Consume the next input character.
               if (this.endTagExpectation == null) {
                  this.appendCharBuffer('</');
                  this.reconsume = true;
                  this.state = this.returnState;
                  break;
               } else if (index < this.endTagExpectation.length) {
                  if (char != this.endTagExpectation[index]) {
                     this.error('errHtml4LtSlashInRcdata');
                     this.appendCharBuffer('</');
                     this.flushCharBuffer();
                     this.reconsume = true;
                     this.state = this.returnState;
                     break;
                  }
                  this.appendCharBuffer(char);
                  index++;
                  break;
               } else {
                  this.endTag = true;
                  this.tagName = this.endTagExpectation;
                  switch (char) {
                     case LINE_FEED:
                     case SPACE:
                     case CHARACTER_TABULATION:
                        /*
                         * U+0009 CHARACTER TABULATION U+000A LINE
                         * FEED (LF) U+000C FORM FEED (FF) U+0020
                         * SPACE If the current end tag token is an
                         * appropriate end tag token, then switch to
                         * the before attribute name state.
                         */
                        this.cleanCharBuffer();
                        this.state = TokenizerState.BEFORE_ATTRIBUTE_NAME;
                        break;
                     case '/':
                        /*
                         * U+002F SOLIDUS (/) If the current end tag
                         * token is an appropriate end tag token,
                         * then switch to the self-closing start tag
                         * state.
                         */
                        this.cleanCharBuffer();
                        this.state = TokenizerState.SELF_CLOSING_START_TAG;
                        break;
                     case '>':
                        /*
                         * U+003E GREATER-THAN SIGN (>) If the
                         * current end tag token is an appropriate
                         * end tag token, then emit the current tag
                         * token and switch to the data state.
                         */
                        this.cleanCharBuffer();
                        this.emitTagToken();
                        this.state = TokenizerState.SELF_CLOSING_START_TAG;
                        this.state = this.saveState;
                        // TODO: shouldSuspend
                        break;
                     default:
                        /*
                         * Emit a U+003C LESS-THAN SIGN character
                         * token, a U+002F SOLIDUS character token,
                         * a character token for each of the
                         * characters in the temporary buffer (in
                         * the order they were added to the buffer),
                         * and reconsume the current input character
                         * in the RAWTEXT state.
                         */
                        this.error('errWarnLtSlashInRcdata');
                        this.appendCharBuffer('</');
                        this.flushCharBuffer();
                        this.reconsume = true;
                        this.state = this.returnState;
                        break;
                  }
               }
               break;
            case TokenizerState.SCRIPT_DATA:
               // Consume the next input character.
               switch (char) {
                  case LESS_THAN_SIGN:
                     this.state = TokenizerState.SCRIPT_DATA_LESS_THAN_SIGN;
                     break;
                  case NULL:
                     // Parse error. Emit a U+FFFD REPLACEMENT CHARACTER character token.
                     // emitReplacementCharacter
                     break;
                  default:
                     // Emit the current input character as a character token.
                     break;
               }
               break;
            // @ts-ignore
            case TokenizerState.PLAINTEXT:
               // Consume the next input character.
               switch (char) {
                  case NULL:
                     // Parse error. Emit a U+FFFD REPLACEMENT CHARACTER character token.
                     // emitReplacementCharacter
                     break;
                  default:
                     // Emit the current input character as a character token.
                     this.appendCharBuffer(char);
                     break;
               }
               break;
            case TokenizerState.TAG_OPEN:
               // Consume the next input character.
               if (char >= 'A' && char <= 'Z') {
                  // Create a new start tag token, set its tag name to the lowercase version of
                  // the current input character (add 0x0020 to the character's code point),
                  // then switch to the tag name state. (Don't emit the token yet;
                  // further details will be filled in before it is emitted.)
                  this.cleanCharBuffer();
                  this.appendCharBuffer(char);
                  this.endTag = false;
                  this.containsHyphen = false;
                  this.state = TokenizerState.TAG_NAME;
                  break;
               }
               if (char >= 'a' && char <= 'z') {
                  // Create a new start tag token, set its tag name to the current input character,
                  // then switch to the tag name state. (Don't emit the token yet;
                  // further details will be filled in before it is emitted.)
                  this.cleanCharBuffer();
                  this.appendCharBuffer(char);
                  this.endTag = false;
                  this.containsHyphen = false;
                  this.state = TokenizerState.TAG_NAME;
                  break;
               }
               switch (char) {
                  case EXCLAMATION_MARK:
                     this.state = TokenizerState.MARKUP_DECLARATION_OPEN;
                     break;
                  case SOLIDUS:
                     this.state = TokenizerState.END_TAG_OPEN;
                     break;
                  case QUESTION_MARK:
                     // Parse error. Switch to the bogus comment state.
                     this.error('errProcessingInstruction');
                     this.cleanCharBuffer();
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.BOGUS_COMMENT;
                     break;
                  case GREATER_THAN_SIGN:
                     this.error('errLtGt');
                     this.appendCharBuffer('<>');
                     this.state = TokenizerState.DATA;
                     break;
                  default:
                     // Parse error. Emit a U+003C LESS-THAN SIGN character token and
                     // reconsume the current input character in the data state.
                     this.error('errBadCharAfterLt');
                     this.reconsume = true;
                     this.appendCharBuffer(LESS_THAN_SIGN);
                     this.state = TokenizerState.DATA;
                     break;
               }
               break;
            case TokenizerState.END_TAG_OPEN:
               // Consume the next input character.
               if (char >= 'A' && char <= 'Z') {
                  // Create a new end tag token, set its tag name to the lowercase version of
                  // the current input character (add 0x0020 to the character's code point),
                  // then switch to the tag name state. (Don't emit the token yet;
                  // further details will be filled in before it is emitted.)
                  this.endTag = true;
                  this.cleanCharBuffer();
                  this.appendCharBuffer(char);
                  this.containsHyphen = false;
                  this.state = TokenizerState.TAG_NAME;
                  break;
               }
               if (char >= 'a' && char <= 'z') {
                  // Create a new end tag token, set its tag name to the current input character,
                  // then switch to the tag name state. (Don't emit the token yet;
                  // further details will be filled in before it is emitted.)
                  this.endTag = true;
                  this.cleanCharBuffer();
                  this.appendCharBuffer(char);
                  this.containsHyphen = false;
                  this.state = TokenizerState.TAG_NAME;
                  break;
               }
               switch (char) {
                  case GREATER_THAN_SIGN:
                     // Parse error. Switch to the data state.
                     this.error('errLtSlashGt');
                     this.state = TokenizerState.DATA;
                     break;
                  default:
                     // Parse error. Switch to the bogus comment state.
                     this.error('errGarbageAfterLtSlash');
                     this.cleanCharBuffer();
                     this.appendCharBuffer(char);
                     this.containsHyphen = false;
                     this.state = TokenizerState.BOGUS_COMMENT;
                     break;
               }
               break;
            case TokenizerState.TAG_NAME:
               // Consume the next input character.
               if (char >= 'A' && char <= 'Z') {
                  // Append the lowercase version of the current input character
                  // (add 0x0020 to the character's code point) to the current tag token's tag name.
                  this.state = TokenizerState.TAG_NAME;
                  this.appendCharBuffer(char);
                  break;
               }
               switch (char) {
                  case CHARACTER_TABULATION:
                  case LINE_FEED:
                  case FORM_FEED:
                  case SPACE:
                     this.charBufferToTagName();
                     this.state = TokenizerState.BEFORE_ATTRIBUTE_NAME;
                     break;
                  case SOLIDUS:
                     this.charBufferToTagName();
                     this.state = TokenizerState.SELF_CLOSING_START_TAG;
                     break;
                  case GREATER_THAN_SIGN:
                     // Emit the current tag token.
                     this.charBufferToTagName();
                     this.emitTagToken();
                     // TODO: shouldSuspend
                     this.state = TokenizerState.DATA;
                     break;
                  default:
                     // Append the current input character to the current tag token's tag name.
                     this.appendCharBuffer(char);
                     break;
               }
               break;
            case TokenizerState.SCRIPT_DATA_LESS_THAN_SIGN:
               // Consume the next input character.
               switch (char) {
                  case SOLIDUS:
                     // Set the temporary buffer to the empty string.
                     // Switch to the script data end tag open state.
                     this.state = TokenizerState.SCRIPT_DATA_END_TAG_OPEN;
                     break;
                  case EXCLAMATION_MARK:
                     // Switch to the script data escape start state.
                     // Emit a U+003C LESS-THAN SIGN character token
                     // and a U+0021 EXCLAMATION MARK character token.
                     this.state = TokenizerState.SCRIPT_DATA_ESCAPE_START;
                     break;
                  default:
                     // Emit a U+003C LESS-THAN SIGN character token
                     // and reconsume the current input character in the script data state.
                     this.reconsume = true;
                     this.state = TokenizerState.SCRIPT_DATA;
                     break;
               }
               break;
            case TokenizerState.SCRIPT_DATA_END_TAG_OPEN:
               // Consume the next input character.
               if (char >= 'A' && char <= 'Z') {
                  // Create a new end tag token, and set its tag name to the lowercase version of
                  // the current input character (add 0x0020 to the character's code point).
                  // Append the current input character to the temporary buffer.
                  // Finally, switch to the script data end tag name state. (Don't emit the token yet;
                  // further details will be filled in before it is emitted.)
                  this.state = TokenizerState.SCRIPT_DATA_END_TAG_NAME;
                  break;
               }
               else if (char >= 'a' && char <= 'z') {
                  // Create a new end tag token, and set its tag name to the current input character.
                  // Append the current input character to the temporary buffer.
                  // Finally, switch to the script data end tag name state. (Don't emit the token yet;
                  // further details will be filled in before it is emitted.)
                  this.state = TokenizerState.SCRIPT_DATA_END_TAG_NAME;
                  break;
               }
               else {
                  // Emit a U+003C LESS-THAN SIGN character token, a U+002F SOLIDUS character token,
                  // and reconsume the current input character in the script data state.
                  this.reconsume = true;
                  this.state = TokenizerState.SCRIPT_DATA;
               }
               break;
            case TokenizerState.SCRIPT_DATA_END_TAG_NAME:
               // Consume the next input character.
               if (char >= 'A' && char <= 'Z') {
                  // Append the lowercase version of the current input character
                  // (add 0x0020 to the character's code point) to the current tag token's tag name.
                  // Append the current input character to the temporary buffer.
                  break;
               }
               if (char >= 'a' && char <= 'z') {
                  // Append the current input character to the current tag token's tag name.
                  // Append the current input character to the temporary buffer.
                  break;
               }
               treatAsDefault = false;
               switch (char) {
                  case CHARACTER_TABULATION:
                  case LINE_FEED:
                  case FORM_FEED:
                  case SPACE:
                     // If the current end tag token is an appropriate end tag token,
                     // then switch to the before attribute name state.
                     // Otherwise, treat it as per the "anything else" entry below.
                     if (this.buffer.indexOf('random')) {
                        this.state = TokenizerState.BEFORE_ATTRIBUTE_NAME;
                        break;
                     }
                     treatAsDefault = true;
                     break;
                  case SOLIDUS:
                     // If the current end tag token is an appropriate end tag token,
                     // then switch to the self-closing start tag state.
                     // Otherwise, treat it as per the "anything else" entry below.
                     if (this.buffer.indexOf('random')) {
                        this.state = TokenizerState.SELF_CLOSING_START_TAG;
                        break;
                     }
                     treatAsDefault = true;
                     break;
                  case GREATER_THAN_SIGN:
                     // If the current end tag token is an appropriate end tag token,
                     // then emit the current tag token and switch to the data state.
                     // Otherwise, treat it as per the "anything else" entry below.
                     if (this.buffer.indexOf('random')) {
                        this.state = TokenizerState.DATA;
                        break;
                     }
                     treatAsDefault = true;
                     break;
                  default:
                     treatAsDefault = true;
                     break;
               }
               if (treatAsDefault) {
                  // Emit a U+003C LESS-THAN SIGN character token, a U+002F SOLIDUS character token,
                  // a character token for each of the characters in the temporary buffer
                  // (in the order they were added to the buffer),
                  // and reconsume the current input character in the script data state.
                  this.reconsume = true;
                  this.state = TokenizerState.SCRIPT_DATA;
               }
               break;
            case TokenizerState.SCRIPT_DATA_ESCAPE_START:
               // Consume the next input character.
               switch (char) {
                  case HYPHEN_MINUS:
                     // Switch to the script data escape start dash state.
                     // Emit a U+002D HYPHEN-MINUS character token.
                     this.state = TokenizerState.SCRIPT_DATA_ESCAPE_START_DASH;
                     break;
                  default:
                     // Reconsume the current input character in the script data state.
                     this.reconsume = true;
                     this.state = TokenizerState.SCRIPT_DATA;
                     break;
               }
               break;
            case TokenizerState.SCRIPT_DATA_ESCAPE_START_DASH:
               // Consume the next input character.
               switch (char) {
                  case HYPHEN_MINUS:
                     // Switch to the script data escaped dash dash state.
                     // Emit a U+002D HYPHEN-MINUS character token.
                     this.state = TokenizerState.SCRIPT_DATA_ESCAPED_DASH_DASH;
                     break;
                  default:
                     // Reconsume the current input character in the script data state.
                     this.reconsume = true;
                     this.state = TokenizerState.SCRIPT_DATA;
                     break;
               }
               break;
            case TokenizerState.SCRIPT_DATA_ESCAPED:
               // Consume the next input character.
               switch (char) {
                  case HYPHEN_MINUS:
                     // Switch to the script data escaped dash state.
                     // Emit a U+002D HYPHEN-MINUS character token.
                     this.state = TokenizerState.SCRIPT_DATA_ESCAPED_DASH;
                     break;
                  case LESS_THAN_SIGN:
                     this.state = TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN;
                     break;
                  case NULL:
                     // Parse error. Switch to the script data escaped state.
                     // Emit a U+FFFD REPLACEMENT CHARACTER character token.
                     // emitReplacementCharacter
                     this.state = TokenizerState.SCRIPT_DATA_ESCAPED;
                     break;
                  default:
                     // Switch to the script data escaped state.
                     // Emit the current input character as a character token.
                     this.state = TokenizerState.SCRIPT_DATA_ESCAPED;
                     break;
               }
               break;
            case TokenizerState.SCRIPT_DATA_ESCAPED_DASH:
               // Consume the next input character.
               switch (char) {
                  case HYPHEN_MINUS:
                     // Emit a U+002D HYPHEN-MINUS character token.
                     this.state = TokenizerState.SCRIPT_DATA_ESCAPED_DASH_DASH;
                     break;
                  case LESS_THAN_SIGN:
                     // Switch to the script data escaped less-than sign state.
                     this.state = TokenizerState.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
                     break;
                  case NULL:
                     // Parse error. Switch to the script data escaped state.
                     // Emit a U+FFFD REPLACEMENT CHARACTER character token.
                     // emitReplacementCharacter
                     this.state = TokenizerState.SCRIPT_DATA_ESCAPED;
                     break;
                  default:
                     // Switch to the script data escaped state.
                     // Emit the current input character as a character token.
                     this.state = TokenizerState.SCRIPT_DATA_ESCAPED;
                     break;
               }
               break;
            case TokenizerState.SCRIPT_DATA_ESCAPED_DASH_DASH:
               // Consume the next input character.
               switch (char) {
                  case HYPHEN_MINUS:
                     // Emit a U+002D HYPHEN-MINUS character token.
                     break;
                  case LESS_THAN_SIGN:
                     // Switch to the script data escaped less-than sign state.
                     this.state = TokenizerState.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
                     break;
                  case GREATER_THAN_SIGN:
                     // Switch to the script data state.
                     // Emit a U+003E GREATER-THAN SIGN character token.
                     this.state = TokenizerState.SCRIPT_DATA;
                     break;
                  case NULL:
                     // Parse error. Switch to the script data escaped state.
                     // Emit a U+FFFD REPLACEMENT CHARACTER character token.
                     // emitReplacementCharacter
                     this.state = TokenizerState.SCRIPT_DATA_ESCAPED;
                     break;
                  default:
                     // Switch to the script data escaped state.
                     // Emit the current input character as a character token.
                     this.state = TokenizerState.SCRIPT_DATA_ESCAPED;
                     break;
               }
               break;
            case TokenizerState.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN:
               // Consume the next input character.
               if (char >= 'A' && char <= 'Z') {
                  // Set the temporary buffer to the empty string.
                  // Append the lowercase version of the current input character
                  // (add 0x0020 to the character's code point) to the temporary buffer.
                  // Switch to the script data double escape start state.
                  // Emit a U+003C LESS-THAN SIGN character token
                  // and the current input character as a character token.
                  this.state = TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPE_START;
                  break;
               }
               if (char >= 'a' && char <= 'z') {
                  // Set the temporary buffer to the empty string.
                  // Append the current input character to the temporary buffer.
                  // Switch to the script data double escape start state.
                  // Emit a U+003C LESS-THAN SIGN character token
                  // and the current input character as a character token.
                  this.state = TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPE_START;
                  break;
               }
               switch (char) {
                  case SOLIDUS:
                     // Set the temporary buffer to the empty string.
                     // Switch to the script data escaped end tag open state.
                     this.state = TokenizerState.SCRIPT_DATA_ESCAPED_END_TAG_OPEN;
                     break;
                  default:
                     // Emit a U+003C LESS-THAN SIGN character token
                     // and reconsume the current input character in the script data escaped state.
                     this.reconsume = true;
                     this.state = TokenizerState.SCRIPT_DATA_ESCAPED;
                     break;
               }
               break;
            case TokenizerState.SCRIPT_DATA_ESCAPED_END_TAG_OPEN:
               // Consume the next input character.
               if (char >= 'A' && char <= 'Z') {
                  // Create a new end tag token, and set its tag name
                  // to the lowercase version of the current input character
                  // (add 0x0020 to the character's code point).
                  // Append the current input character to the temporary buffer.
                  // Finally, switch to the script data escaped end tag name state.
                  // (Don't emit the token yet; further details will be filled in before it is emitted.)
                  this.state = TokenizerState.SCRIPT_DATA_ESCAPED_END_TAG_NAME;
                  break;
               }
               else if (char >= 'a' && char <= 'z') {
                  // Create a new end tag token, and set its tag name to the current input character.
                  // Append the current input character to the temporary buffer.
                  // Finally, switch to the script data escaped end tag name state.
                  // (Don't emit the token yet; further details will be filled in before it is emitted.)
                  this.state = TokenizerState.SCRIPT_DATA_ESCAPED_END_TAG_NAME;
                  break;
               }
               else {
                  // Emit a U+003C LESS-THAN SIGN character token, a U+002F SOLIDUS character token,
                  // and reconsume the current input character in the script data escaped state.
                  this.reconsume = true;
                  this.state = TokenizerState.SCRIPT_DATA_ESCAPED;
               }
               break;
            case TokenizerState.SCRIPT_DATA_ESCAPED_END_TAG_NAME:
               // Consume the next input character.
               if (char >= 'A' && char <= 'Z') {
                  // Append the lowercase version of the current input character
                  // (add 0x0020 to the character's code point) to the current tag token's tag name.
                  // Append the current input character to the temporary buffer.
                  break;
               }
               if (char >= 'a' && char <= 'z') {
                  // Append the current input character to the current tag token's tag name.
                  // Append the current input character to the temporary buffer.
                  this.state = TokenizerState.SCRIPT_DATA_ESCAPED_END_TAG_NAME;
                  break;
               }
               treatAsDefault = false;
               switch (char) {
                  case CHARACTER_TABULATION:
                  case LINE_FEED:
                  case FORM_FEED:
                  case SPACE:
                     // If the current end tag token is an appropriate end tag token,
                     // then switch to the before attribute name state.
                     // Otherwise, treat it as per the "anything else" entry below.
                     if (this.buffer.indexOf('random')) {
                        this.state = TokenizerState.BEFORE_ATTRIBUTE_NAME;
                        break;
                     }
                     treatAsDefault = true;
                     break;
                  case SOLIDUS:
                     // If the current end tag token is an appropriate end tag token,
                     // then switch to the self-closing start tag state.
                     // Otherwise, treat it as per the "anything else" entry below.
                     if (this.buffer.indexOf('random')) {
                        this.state = TokenizerState.SELF_CLOSING_START_TAG;
                        break;
                     }
                     treatAsDefault = true;
                     break;
                  case GREATER_THAN_SIGN:
                     // If the current end tag token is an appropriate end tag token,
                     // then emit the current tag token and switch to the data state.
                     // Otherwise, treat it as per the "anything else" entry below.
                     if (this.buffer.indexOf('random')) {
                        this.state = TokenizerState.DATA;
                        break;
                     }
                     treatAsDefault = true;
                     break;
                  default:
                     treatAsDefault = true;
                     break;
               }
               if (treatAsDefault) {
                  // Emit a U+003C LESS-THAN SIGN character token, a U+002F SOLIDUS character token,
                  // a character token for each of the characters in the temporary buffer
                  // (in the order they were added to the buffer),
                  // and reconsume the current input character in the script data escaped state.
                  this.reconsume = true;
                  this.state = TokenizerState.SCRIPT_DATA_ESCAPED;
               }
               break;
            case TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPE_START:
               // Consume the next input character.
               if (char >= 'A' && char <= 'Z') {
                  // Append the lowercase version of the current input character
                  // (add 0x0020 to the character's code point) to the temporary buffer.
                  // Emit the current input character as a character token.
                  break;
               }
               if (char >= 'a' && char <= 'z') {
                  // Append the current input character to the temporary buffer.
                  // Emit the current input character as a character token.
                  break;
               }
               switch (char) {
                  case CHARACTER_TABULATION:
                  case LINE_FEED:
                  case FORM_FEED:
                  case SPACE:
                  case SOLIDUS:
                  case GREATER_THAN_SIGN:
                     // If the temporary buffer is the string "script",
                     // then switch to the script data double escaped state.
                     // Otherwise, switch to the script data escaped state.
                     // Emit the current input character as a character token.
                     if (this.buffer.indexOf('random')) {
                        this.state = TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPED;
                     }
                     else {
                        this.state = TokenizerState.SCRIPT_DATA_ESCAPED;
                     }
                     break;
                  default:
                     // Reconsume the current input character in the script data escaped state.
                     this.reconsume = true;
                     this.state = TokenizerState.SCRIPT_DATA_ESCAPED;
                     break;
               }
               break;
            case TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPED:
               // Consume the next input character.
               switch (char) {
                  case HYPHEN_MINUS:
                     // Switch to the script data double escaped dash state.
                     // Emit a U+002D HYPHEN-MINUS character token.
                     this.state = TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPED_DASH;
                     break;
                  case LESS_THAN_SIGN:
                     // Switch to the script data double escaped less-than sign state.
                     // Emit a U+003C LESS-THAN SIGN character token.
                     this.state = TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN;
                     break;
                  case NULL:
                     // Parse error. Emit a U+FFFD REPLACEMENT CHARACTER character token.
                     // emitReplacementCharacter
                     break;
                  default:
                     // Emit the current input character as a character token.
                     break;
               }
               break;
            case TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPED_DASH:
               // Consume the next input character.
               switch (char) {
                  case HYPHEN_MINUS:
                     // Switch to the script data double escaped dash dash state.
                     // Emit a U+002D HYPHEN-MINUS character token.
                     this.state = TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH;
                     break;
                  case LESS_THAN_SIGN:
                     // Switch to the script data double escaped less-than sign state.
                     // Emit a U+003C LESS-THAN SIGN character token.
                     this.state = TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN;
                     break;
                  case NULL:
                     // Parse error. Switch to the script data double escaped state.
                     // Emit a U+FFFD REPLACEMENT CHARACTER character token.
                     // emitReplacementCharacter
                     this.state = TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPED;
                     break;
                  default:
                     // Switch to the script data double escaped state.
                     // Emit the current input character as a character token.
                     this.state = TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPED;
                     break;
               }
               break;
            case TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH:
               // Consume the next input character.
               switch (char) {
                  case HYPHEN_MINUS:
                     // Emit a U+002D HYPHEN-MINUS character token.
                     break;
                  case LESS_THAN_SIGN:
                     // Switch to the script data double escaped less-than sign state.
                     // Emit a U+003C LESS-THAN SIGN character token.
                     this.state = TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN;
                     break;
                  case GREATER_THAN_SIGN:
                     // Switch to the script data state. Emit a U+003E GREATER-THAN SIGN character token.
                     this.state = TokenizerState.SCRIPT_DATA;
                     break;
                  case NULL:
                     // Parse error. Switch to the script data double escaped state.
                     // Emit a U+FFFD REPLACEMENT CHARACTER character token.
                     // emitReplacementCharacter
                     this.state = TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPED;
                     break;
                  default:
                     // Switch to the script data double escaped state.
                     // Emit the current input character as a character token.
                     this.state = TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPED;
                     break;
               }
               break;
            case TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN:
               // Consume the next input character.
               switch (char) {
                  case SOLIDUS:
                     // Set the temporary buffer to the empty string.
                     // Switch to the script data double escape end state.
                     // Emit a U+002F SOLIDUS character token.
                     this.state = TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPE_END;
                     break;
                  default:
                     // Reconsume the current input character in the script data double escaped state.
                     this.reconsume = true;
                     this.state = TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPED;
                     break;
               }
               break;
            case TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPE_END:
               // Consume the next input character.
               if (char >= 'A' && char <= 'Z') {
                  // Append the lowercase version of the current input character
                  // (add 0x0020 to the character's code point) to the temporary buffer.
                  // Emit the current input character as a character token.
                  break;
               }
               if (char >= 'a' && char <= 'z') {
                  // Append the current input character to the temporary buffer.
                  // Emit the current input character as a character token.
                  break;
               }
               switch (char) {
                  case CHARACTER_TABULATION:
                  case LINE_FEED:
                  case FORM_FEED:
                  case SPACE:
                  case SOLIDUS:
                  case GREATER_THAN_SIGN:
                     // If the temporary buffer is the string "script", then switch to the script data escaped state.
                     // Otherwise, switch to the script data double escaped state.
                     // Emit the current input character as a character token.
                     if (this.buffer.indexOf('random')) {
                        this.state = TokenizerState.SCRIPT_DATA_ESCAPED;
                     }
                     else {
                        this.state = TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPED;
                     }
                     break;
                  default:
                     // Reconsume the current input character in the script data double escaped state.
                     this.reconsume = true;
                     this.state = TokenizerState.SCRIPT_DATA_DOUBLE_ESCAPED;
                     break;
               }
               break;
            case TokenizerState.BEFORE_ATTRIBUTE_NAME:
               // Consume the next input character.
               if (char >= 'A' && char <= 'Z') {
                  // Start a new attribute in the current tag token.
                  // Set that attribute's name to the lowercase version of the current input character
                  // (add 0x0020 to the character's code point), and its value to the empty string.
                  // Switch to the attribute name state.
                  this.state = TokenizerState.ATTRIBUTE_NAME;
                  break;
               }
               switch (char) {
                  case CHARACTER_TABULATION:
                  case LINE_FEED:
                  case FORM_FEED:
                  case SPACE:
                     // Ignore the character.
                     break;
                  case SOLIDUS:
                     this.state = TokenizerState.SELF_CLOSING_START_TAG;
                     break;
                  case GREATER_THAN_SIGN:
                     // Switch to the data state. Emit the current tag token.
                     this.emitTagToken();
                     this.state = TokenizerState.DATA;
                     break;
                  case NULL:
                     // Parse error. Start a new attribute in the current tag token.
                     // Set that attribute's name to a U+FFFD REPLACEMENT CHARACTER character,
                     // and its value to the empty string.
                     // Switch to the attribute name state.
                     // emitReplacementCharacter
                     this.state = TokenizerState.ATTRIBUTE_NAME;
                     break;
                  case QUOTATION_MARK:
                  case APOSTROPHE:
                  case LESS_THAN_SIGN:
                  case EQUALS_SIGN:
                     // Parse error. Treat it as per the "anything else" entry below.
                     this.error('errBadCharBeforeAttributeNameOrNull');
                  // fallthrough
                  default:
                     // Start a new attribute in the current tag token.
                     // Set that attribute's name to the current input character,
                     // and its value to the empty string.
                     // Switch to the attribute name state.
                     this.cleanCharBuffer();
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.ATTRIBUTE_NAME;
                     break;
               }
               break;
            case TokenizerState.ATTRIBUTE_NAME:
               // Consume the next input character.
               if (char >= 'A' && char <= 'Z') {
                  // Append the lowercase version of the current input character
                  // (add 0x0020 to the character's code point) to the current attribute's name.
                  this.state = TokenizerState.ATTRIBUTE_NAME;
                  break;
               }
               switch (char) {
                  case CHARACTER_TABULATION:
                  case LINE_FEED:
                  case FORM_FEED:
                  case SPACE:
                     this.attributeNameComplete();
                     this.state = TokenizerState.AFTER_ATTRIBUTE_NAME;
                     break;
                  case SOLIDUS:
                     this.attributeNameComplete();
                     this.addAttributeWithoutValue();
                     this.state = TokenizerState.SELF_CLOSING_START_TAG;
                     break;
                  case EQUALS_SIGN:
                     this.attributeNameComplete();
                     this.state = TokenizerState.BEFORE_ATTRIBUTE_VALUE;
                     break;
                  case GREATER_THAN_SIGN:
                     // Emit the current tag token.
                     this.attributeNameComplete();
                     this.addAttributeWithoutValue();
                     this.emitTagToken();
                     // TODO: shouldSuspend
                     this.state = TokenizerState.DATA;
                     break;
                  case NULL:
                     // Parse error. Append a U+FFFD REPLACEMENT CHARACTER character to the current attribute's name.
                     break;
                  case QUOTATION_MARK:
                  case APOSTROPHE:
                  case LESS_THAN_SIGN:
                     // Parse error. Treat it as per the "anything else" entry below.
                     this.error('errQuoteOrLtInAttributeNameOrNull');
                  // fallthrough
                  default:
                     // Append the current input character to the current attribute's name.
                     this.appendCharBuffer(char);
                     break;
               }
               // When the user agent leaves the attribute name state (and before emitting the tag token,
               // if appropriate), the complete attribute's name must be compared to the other attributes
               // on the same token; if there is already an attribute on the token with the exact same name,
               // then this is a parse error and the new attribute must be dropped,
               // along with the value that gets associated with it (if any).
               break;
            case TokenizerState.AFTER_ATTRIBUTE_NAME:
               // Consume the next input character.
               if (char >= 'A' && char <= 'Z') {
                  // Start a new attribute in the current tag token.
                  // Set that attribute's name to the lowercase version of the current input character
                  // (add 0x0020 to the character's code point), and its value to the empty string.
                  // Switch to the attribute name state.
                  this.state = TokenizerState.ATTRIBUTE_NAME;
                  this.cleanCharBuffer();
                  this.appendCharBuffer(char);
                  break;
               }
               switch (char) {
                  case CHARACTER_TABULATION:
                  case LINE_FEED:
                  case FORM_FEED:
                  case SPACE:
                     // Ignore the character.
                     break;
                  case SOLIDUS:
                     this.addAttributeWithoutValue();
                     this.state = TokenizerState.SELF_CLOSING_START_TAG;
                     break;
                  case EQUALS_SIGN:
                     this.state = TokenizerState.BEFORE_ATTRIBUTE_VALUE;
                     break;
                  case GREATER_THAN_SIGN:
                     // Emit the current tag token.
                     this.addAttributeWithoutValue();
                     this.emitTagToken();
                     // TODO: shouldSuspend
                     this.state = TokenizerState.DATA;
                     break;
                  case NULL:
                     // Parse error. Start a new attribute in the current tag token.
                     // Set that attribute's name to a U+FFFD REPLACEMENT CHARACTER character,
                     // and its value to the empty string.
                     // Switch to the attribute name state.
                     // emitReplacementCharacter
                     this.state = TokenizerState.ATTRIBUTE_NAME;
                     break;
                  case QUOTATION_MARK:
                  case APOSTROPHE:
                  case LESS_THAN_SIGN:
                     // Parse error. Treat it as per the "anything else" entry below.
                     this.error('errQuoteOrLtInAttributeNameOrNull');
                  // fallthrough
                  default:
                     // Start a new attribute in the current tag token.
                     // Set that attribute's name to the current input character,
                     // and its value to the empty string.
                     // Switch to the attribute name state.
                     this.addAttributeWithoutValue();
                     this.cleanCharBuffer();
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.ATTRIBUTE_NAME;
                     break;
               }
               break;
            case TokenizerState.BEFORE_ATTRIBUTE_VALUE:
               // Consume the next input character.
               switch (char) {
                  case CHARACTER_TABULATION:
                  case LINE_FEED:
                  case FORM_FEED:
                  case SPACE:
                     // Ignore the character.
                     break;
                  case QUOTATION_MARK:
                     this.cleanCharBuffer();
                     this.state = TokenizerState.ATTRIBUTE_VALUE_DOUBLE_QUOTED;
                     break;
                  case AMPERSAND:
                     // Reconsume this current input character.
                     this.cleanCharBuffer();
                     this.state = TokenizerState.ATTRIBUTE_VALUE_UNQUOTED;
                     this.warn('noteUnquotedAttributeValue');
                     this.reconsume = true;
                     break;
                  case APOSTROPHE:
                     this.cleanCharBuffer();
                     this.state = TokenizerState.ATTRIBUTE_VALUE_SINGLE_QUOTED;
                     break;
                  case NULL:
                     // Parse error. Append a U+FFFD REPLACEMENT CHARACTER character to the current attribute's value.
                     // Switch to the attribute value (unquoted) state.
                     // emitReplacementCharacter
                     this.state = TokenizerState.ATTRIBUTE_VALUE_UNQUOTED;
                     break;
                  case GREATER_THAN_SIGN:
                     // Parse error. Switch to the data state. Emit the current tag token.
                     this.error('errAttributeValueMissing');
                     this.addAttributeWithoutValue();
                     this.emitTagToken();
                     // TODO: shouldSuspend
                     this.state = TokenizerState.DATA;
                     break;
                  case LESS_THAN_SIGN:
                  case EQUALS_SIGN:
                  case GRAVE_ACCENT:
                     // Parse error. Treat it as per the "anything else" entry below.
                     this.error('errLtOrEqualsOrGraveInUnquotedAttributeOrNull');
                  // fallthrough
                  default:
                     // Append the current input character to the current attribute's value.
                     // Switch to the attribute value (unquoted) state.
                     this.error('errHtml4NonNameInUnquotedAttribute');
                     this.cleanCharBuffer();
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.ATTRIBUTE_VALUE_UNQUOTED;
                     this.warn('noteUnquotedAttributeValue');
                     break;
               }
               break;
            case TokenizerState.ATTRIBUTE_VALUE_DOUBLE_QUOTED:
               // Consume the next input character.
               switch (char) {
                  case QUOTATION_MARK:
                     this.addAttributeWithValue();
                     this.state = TokenizerState.AFTER_ATTRIBUTE_VALUE_QUOTED;
                     break;
                  case AMPERSAND:
                     // Switch to the character reference in attribute value state,
                     // with the additional allowed character being U+0022 QUOTATION MARK (").
                     this.appendCharRefBuffer(char);
                     this.setAdditional(QUOTATION_MARK);
                     this.returnState = this.state;
                     this.state = TokenizerState.CHARACTER_REFERENCE;
                     break;
                  case NULL:
                     // Parse error. Append a U+FFFD REPLACEMENT CHARACTER character to the current attribute's value.
                     // emitReplacementCharacter
                     break;
                  default:
                     // Append the current input character to the current attribute's value.
                     this.appendCharBuffer(char);
                     break;
               }
               break;
            case TokenizerState.ATTRIBUTE_VALUE_SINGLE_QUOTED:
               // Consume the next input character.
               switch (char) {
                  case APOSTROPHE:
                     this.addAttributeWithValue();
                     this.state = TokenizerState.AFTER_ATTRIBUTE_VALUE_QUOTED;
                     break;
                  case AMPERSAND:
                     // Switch to the character reference in attribute value state,
                     // with the additional allowed character being U+0027 APOSTROPHE (').
                     this.appendCharRefBuffer(char);
                     this.setAdditional(APOSTROPHE);
                     this.returnState = this.state;
                     this.state = TokenizerState.CHARACTER_REFERENCE;
                     break;
                  case NULL:
                     // Parse error. Append a U+FFFD REPLACEMENT CHARACTER character to the current attribute's value.
                     // emitReplacementCharacter
                     break;
                  default:
                     // Append the current input character to the current attribute's value.
                     this.appendCharBuffer(char);
                     break;
               }
               break;
            case TokenizerState.ATTRIBUTE_VALUE_UNQUOTED:
               // Consume the next input character.
               switch (char) {
                  case CHARACTER_TABULATION:
                  case LINE_FEED:
                  case FORM_FEED:
                  case SPACE:
                     this.addAttributeWithValue();
                     this.state = TokenizerState.BEFORE_ATTRIBUTE_NAME;
                     break;
                  case AMPERSAND:
                     // Switch to the character reference in attribute value state,
                     // with the additional allowed character being U+003E GREATER-THAN SIGN (>).
                     this.appendCharRefBuffer(char);
                     this.setAdditional(GREATER_THAN_SIGN);
                     this.returnState = this.state;
                     this.state = TokenizerState.CHARACTER_REFERENCE;
                     break;
                  case GREATER_THAN_SIGN:
                     // Switch to the data state. Emit the current tag token.
                     this.addAttributeWithValue();
                     this.emitTagToken();
                     this.state = TokenizerState.DATA;
                     // TODO: shouldSuspend
                     break;
                  case NULL:
                     // Parse error. Append a U+FFFD REPLACEMENT CHARACTER character to the current attribute's value.
                     break;
                  case QUOTATION_MARK:
                  case APOSTROPHE:
                  case LESS_THAN_SIGN:
                  case EQUALS_SIGN:
                  case GRAVE_ACCENT:
                     // Parse error. Treat it as per the "anything else" entry below.
                     this.error('errUnquotedAttributeValOrNull');
                     // fallthrough
                  default:
                     // Append the current input character to the current attribute's value.
                     this.error('errHtml4NonNameInUnquotedAttribute');
                     this.appendCharBuffer(char);
                     break;
               }
               break;
            case TokenizerState.AFTER_ATTRIBUTE_VALUE_QUOTED:
               // Consume the next input character.
               switch (char) {
                  case CHARACTER_TABULATION:
                  case LINE_FEED:
                  case FORM_FEED:
                  case SPACE:
                     this.state = TokenizerState.BEFORE_ATTRIBUTE_NAME;
                     break;
                  case SOLIDUS:
                     this.state = TokenizerState.SELF_CLOSING_START_TAG;
                     break;
                  case GREATER_THAN_SIGN:
                     // Emit the current tag token.
                     this.emitTagToken();
                     // TODO: shouldSuspend
                     this.state = TokenizerState.DATA;
                     break;
                  default:
                     // Parse error. Reconsume the character in the before attribute name state.
                     this.error('errNoSpaceBetweenAttributes');
                     this.reconsume = true;
                     this.state = TokenizerState.BEFORE_ATTRIBUTE_NAME;
                     break;
               }
               break;
            case TokenizerState.SELF_CLOSING_START_TAG:
               // Consume the next input character.
               switch (char) {
                  case GREATER_THAN_SIGN:
                     // Set the self-closing flag of the current tag token.
                     // Switch to the data state. Emit the current tag token.
                     this.error('errHtml4XmlVoidSyntax');
                     this.selfClosing = true;
                     this.emitTagToken();
                     // TODO: shouldSuspend
                     this.state = TokenizerState.DATA;
                     break;
                  default:
                     // Parse error. Reconsume the character in the before attribute name state.
                     this.error('errSlashNotFollowedByGt');
                     this.reconsume = true;
                     this.state = TokenizerState.BEFORE_ATTRIBUTE_NAME;
                     break;
               }
               break;
            case TokenizerState.BOGUS_COMMENT:
               // Consume every character up to and including the first U+003E GREATER-THAN SIGN character (>)
               // or the end of the file (EOF), whichever comes first.
               // Emit a comment token whose data is the concatenation of all the characters starting from
               // and including the character that caused the state machine to switch into the bogus comment state,
               // up to and including the character immediately before the last consumed character
               // (i.e. up to the character just before the U+003E or EOF character),
               // but with any U+0000 NULL characters replaced by U+FFFD REPLACEMENT CHARACTER characters.
               // (If the comment was started by the end of the file (EOF), the token is empty.)
               // Switch to the data state.
               // If the end of the file was reached, reconsume the EOF character.
               switch (char) {
                  case GREATER_THAN_SIGN:
                     this.emitComment(0);
                     this.state = TokenizerState.DATA;
                     break;
                  case HYPHEN_MINUS:
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.BOGUS_COMMENT_HYPHEN;
                     break;
                  case NULL:
                     // Parse error. Append a U+FFFD REPLACEMENT CHARACTER character to the current attribute's value.
                     break;
                  default:
                     this.appendCharBuffer(char);
                     break;
               }
               break;
            case TokenizerState.BOGUS_COMMENT_HYPHEN:
               switch (char) {
                  case GREATER_THAN_SIGN:
                     this.emitComment(0);
                     this.state = TokenizerState.DATA;
                     break;
                  case HYPHEN_MINUS:
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.BOGUS_COMMENT_HYPHEN;
                     break;
                  case NULL:
                     // Parse error. Append a U+FFFD REPLACEMENT CHARACTER character to the current attribute's value.
                     break;
                  default:
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.BOGUS_COMMENT;
                     break;
               }
               break;
            case TokenizerState.MARKUP_DECLARATION_OPEN:
               // If the next two characters are both U+002D HYPHEN-MINUS characters (-),
               // consume those two characters, create a comment token whose data is the empty string,
               // and switch to the comment start state.
               // Otherwise, if the next seven characters are an ASCII case-insensitive match for the word "DOCTYPE",
               // then consume those characters and switch to the DOCTYPE state.
               // Otherwise, if the current node is not an element in the HTML namespace and
               // the next seven characters are an case-sensitive match for the string "[CDATA["
               // (the five uppercase letters "CDATA" with a U+005B LEFT SQUARE BRACKET character before and after),
               // then consume those characters and switch to the CDATA section state.
               // Otherwise, this is a parse error. Switch to the bogus comment state.
               // The next character that is consumed, if any, is the first character that will be in the comment.
               switch (char) {
                  case HYPHEN_MINUS:
                     this.cleanCharBuffer();
                     this.state = TokenizerState.MARKUP_DECLARATION_HYPHEN;
                     break;
                  case 'd':
                  case 'D':
                     this.cleanCharBuffer();
                     this.state = TokenizerState.MARKUP_DECLARATION_OCTYPE;
                     index = 0;
                     break;
                  case LSQB:
                     if (this.isCDATAAllowed()) {
                        this.cleanCharBuffer();
                        this.state = TokenizerState.CDATA_START;
                        index = 0;
                        break;
                     }
                     // fallthrough
                  default:
                     this.error('errBogusComment');
                     this.cleanCharBuffer();
                     this.reconsume = true;
                     this.state = TokenizerState.BOGUS_COMMENT;
                     break;
               }
               break;
            case TokenizerState.MARKUP_DECLARATION_HYPHEN:
               if (char === HYPHEN_MINUS) {
                  this.state = TokenizerState.COMMENT_START;
                  break;
               }
               this.error('errBogusComment');
               this.reconsume = true;
               this.state = TokenizerState.BOGUS_COMMENT;
               break;
            case TokenizerState.MARKUP_DECLARATION_OCTYPE:
               if (index < OCTYPE.length && char === OCTYPE[index]) {
                  char = char.toUpperCase();
                  if (char === OCTYPE[index]) {
                     index++;
                  } else {
                     this.error('errBogusComment');
                     this.reconsume = true;
                     this.state = TokenizerState.BOGUS_COMMENT;
                  }
               } else {
                  this.state = TokenizerState.DOCTYPE;
                  index = Number.MAX_VALUE;
               }
               break;
            case TokenizerState.COMMENT_START:
               // Consume the next input character.
               switch (char) {
                  case HYPHEN_MINUS:
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.COMMENT_START_DASH;
                     break;
                  case NULL:
                     // Parse error. Append a U+FFFD REPLACEMENT CHARACTER character to the comment token's data.
                     // Switch to the comment state.
                     // emitReplacementCharacter
                     this.state = TokenizerState.COMMENT;
                     break;
                  case GREATER_THAN_SIGN:
                     // Parse error. Switch to the data state. Emit the comment token.
                     this.error('errPrematureEndOfComment');
                     this.emitComment(0);
                     this.state = TokenizerState.DATA;
                     break;
                  default:
                     // Append the current input character to the comment token's data. Switch to the comment state.
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.COMMENT;
                     break;
               }
               break;
            case TokenizerState.COMMENT_START_DASH:
               // Consume the next input character.
               switch (char) {
                  case HYPHEN_MINUS:
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.COMMENT_END;
                     break;
                  case NULL:
                     // Parse error. Append a U+002D HYPHEN-MINUS character (-)
                     // and a U+FFFD REPLACEMENT CHARACTER character to the comment token's data.
                     // Switch to the comment state.
                     this.state = TokenizerState.COMMENT;
                     // emitReplacementCharacter
                     break;
                  case GREATER_THAN_SIGN:
                     // Parse error. Switch to the data state. Emit the comment token.
                     this.errorHandler.error('errPrematureEndOfComment');
                     this.emitComment(1);
                     this.state = TokenizerState.DATA;
                     break;
                  default:
                     // Append a U+002D HYPHEN-MINUS character (-)
                     // and the current input character to the comment token's data.
                     // Switch to the comment state.
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.DATA;
                     break;
               }
               break;
            case TokenizerState.COMMENT:
               // Consume the next input character.
               switch (char) {
                  case HYPHEN_MINUS:
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.COMMENT_END_DASH;
                     break;
                  case NULL:
                     // Parse error. Append a U+FFFD REPLACEMENT CHARACTER character to the comment token's data.
                     // emitReplacementCharacter
                     break;
                  default:
                     // Append the current input character to the comment token's data.
                     this.appendCharBuffer(char);
                     break;
               }
               break;
            case TokenizerState.COMMENT_END_DASH:
               // Consume the next input character.
               switch (char) {
                  case HYPHEN_MINUS:
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.COMMENT_END;
                     break;
                  case NULL:
                     // Parse error. Append a U+002D HYPHEN-MINUS character (-)
                     // and a U+FFFD REPLACEMENT CHARACTER character to the comment token's data.
                     // Switch to the comment state.
                     // emitReplacementCharacter
                     this.state = TokenizerState.COMMENT;
                     break;
                  default:
                     // Append a U+002D HYPHEN-MINUS character (-)
                     // and the current input character to the comment token's data.
                     // Switch to the comment state.
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.COMMENT;
                     break;
               }
               break;
            case TokenizerState.COMMENT_END:
               // Consume the next input character.
               switch (char) {
                  case GREATER_THAN_SIGN:
                     // Emit the comment token.
                     this.emitComment(2);
                     this.state = TokenizerState.DATA;
                     break;
                  case NULL:
                     // Parse error. Append two U+002D HYPHEN-MINUS characters (-)
                     // and a U+FFFD REPLACEMENT CHARACTER character to the comment token's data.
                     // Switch to the comment state.
                     this.state = TokenizerState.COMMENT;
                     break;
                  case EXCLAMATION_MARK:
                     // Parse error. Switch to the comment end bang state.
                     this.error('errHyphenHyphenBang');
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.COMMENT_END_BANG;
                     break;
                  case HYPHEN_MINUS:
                     // Parse error. Append a U+002D HYPHEN-MINUS character (-) to the comment token's data.
                     this.error('errConsecutiveHyphens');
                     this.appendCharBuffer(char);
                     break;
                  default:
                     // Parse error. Append two U+002D HYPHEN-MINUS characters (-)
                     // and the current input character to the comment token's data.
                     // Switch to the comment state.
                     this.error('errConsecutiveHyphens');
                     this.appendCharBuffer('--');
                     this.appendCharBuffer(char);
                     this.reconsume = true;
                     this.state = TokenizerState.COMMENT;
                     break;
               }
               break;
            case TokenizerState.COMMENT_END_BANG:
               // Consume the next input character.
               switch (char) {
                  case HYPHEN_MINUS:
                     // Append two U+002D HYPHEN-MINUS characters (-)
                     // and a U+0021 EXCLAMATION MARK character (!) to the comment token's data.
                     // Switch to the comment end dash state.
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.COMMENT_END_DASH;
                     break;
                  case GREATER_THAN_SIGN:
                     // Emit the comment token.
                     this.emitComment(3);
                     this.state = TokenizerState.DATA;
                     break;
                  case NULL:
                     // Parse error. Append two U+002D HYPHEN-MINUS characters (-),
                     // a U+0021 EXCLAMATION MARK character (!),
                     // and a U+FFFD REPLACEMENT CHARACTER character to the comment token's data.
                     // Switch to the comment state.
                     this.state = TokenizerState.COMMENT;
                     break;
                  default:
                     // Append two U+002D HYPHEN-MINUS characters (-),
                     // a U+0021 EXCLAMATION MARK character (!),
                     // and the current input character to the comment token's data.
                     // Switch to the comment state.
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.COMMENT;
                     break;
               }
               break;
            case TokenizerState.DOCTYPE:
               // Consume the next input character.
               switch (char) {
                  case GREATER_THAN_SIGN:
                     // Switch to the data state. Emit the current DOCTYPE token.
                     this.emitDoctype();
                     this.state = TokenizerState.DATA;
                     break;
                  default:
                     // Append the current input character.
                     this.appendCharBuffer(char);
                     break;
               }
               break;
            case TokenizerState.CDATA_START:
               if (index < CDATA_LSQB.length && char === CDATA_LSQB[index]) {
                  char = char.toUpperCase();
                  if (char === CDATA_LSQB[index]) {
                     index++;
                  } else {
                     this.error('errBogusComment');
                     this.reconsume = true;
                     this.state = TokenizerState.BOGUS_COMMENT;
                  }
               } else {
                  this.state = TokenizerState.CDATA_SECTION;
                  this.reconsume = true;
                  index = Number.MAX_VALUE;
               }
               break;
            case TokenizerState.CDATA_SECTION:
               // Consume every character up to the next occurrence of the three character sequence
               // U+005D RIGHT SQUARE BRACKET
               // U+005D RIGHT SQUARE BRACKET
               // U+003E GREATER-THAN SIGN (]]>), or the end of the file (EOF), whichever comes first.
               // Emit a series of character tokens consisting of all the characters consumed
               // except the matching three character sequence at the end
               // (if one was found before the end of the file).
               // Switch to the data state.
               // If the end of the file was reached, reconsume the EOF character.
               switch (char) {
                  case RSQB:
                     this.state = TokenizerState.CDATA_RSQB;
                     break;
                  case NULL:
                     // Parse error. Append a U+FFFD REPLACEMENT CHARACTER character
                     // to the current DOCTYPE token's system identifier.
                     // emitReplacementCharacter
                     break;
                  default:
                     this.appendCharBuffer(char);
                     break;
               }
               break;
            case TokenizerState.CDATA_RSQB:
               switch (char) {
                  case RSQB:
                     this.state = TokenizerState.CDATA_RSQB_RSQB;
                     break;
                  case NULL:
                     // Parse error. Append a U+FFFD REPLACEMENT CHARACTER character
                     // to the current DOCTYPE token's system identifier.
                     // emitReplacementCharacter
                     break;
                  default:
                     this.reconsume = true;
                     this.appendCharBuffer(RSQB);
                     this.state = TokenizerState.CDATA_SECTION;
                     break;
               }
               break;
            case TokenizerState.CDATA_RSQB_RSQB:
               switch (char) {
                  case GREATER_THAN_SIGN:
                     this.emitCDATA();
                     this.state = TokenizerState.DATA;
                     break;
                  case NULL:
                     // Parse error. Append a U+FFFD REPLACEMENT CHARACTER character
                     // to the current DOCTYPE token's system identifier.
                     // emitReplacementCharacter
                     break;
                  default:
                     this.reconsume = true;
                     this.appendCharBuffer(RSQB);
                     this.appendCharBuffer(RSQB);
                     this.state = TokenizerState.CDATA_SECTION;
                     break;
               }
               break;
         }
      }
      this.finalize();
   }

   private flushCharBuffer(): void {
      if (this.charBuffer.length > 0) {
         this.tokenHandler.onText(this.charBuffer);
         this.cleanCharBuffer();
      }
   }

   private cleanCharBuffer(): void {
      this.charBuffer = '';
   }

   private appendCharBuffer(char: string): void {
      this.charBuffer += char;
   }

   private appendCharRefBuffer(char: string): void {
      this.refBuffer += char;
   }

   private setAdditional(additional: string): void {
      this.additional = additional;
   }

   private error(message: string): void {
      if (this.errorHandler && typeof this.errorHandler.error === 'function') {
         this.errorHandler.error(message);
      }
   }

   private warn(message: string): void {
      if (this.errorHandler && typeof this.errorHandler.warn === 'function') {
         this.errorHandler.warn(message);
      }
   }

   private charBufferToTagName(): void {
      this.tagName = this.charBuffer;
      this.cleanCharBuffer();
   }

   private emitTagToken(): void {
      if (this.endTag) {
         this.tokenHandler.onCloseTag(this.tagName);
      } else {
         this.tokenHandler.onOpenTag(this.tagName, this.attributes, this.selfClosing);
      }
      this.tagName = '';
      this.attributes = undefined;
      this.selfClosing = false;
   }

   private emitComment(provisionalHyphens: number): void {
      const data = this.charBuffer.substr(0, this.charBuffer.length - provisionalHyphens);
      if (this.allowComments) {
         this.tokenHandler.onComment(data);
      }
      this.cleanCharBuffer();
   }

   private attributeNameComplete(): void {
      this.attributeName = this.charBuffer;
      this.cleanCharBuffer();
      if (!this.attributes) {
         this.attributes = { };
      }
      if (this.attributes[this.attributeName]) {
         this.error('errDuplicateAttribute');
         this.attributeName = null;
      }
   }

   private addAttributeWithoutValue(): void {
      this.warn('noteAttributeWithoutValue');
      if (this.attributeName) {
         this.attributes[this.attributeName] = {
            location: null,
            value: 'true'
         } as IAttributeValue;
      }
      this.attributeName = null;
      this.cleanCharBuffer();
   }

   private addAttributeWithValue(): void {
      if (this.attributeName) {
         this.attributes[this.attributeName] = {
            location: null,
            value: this.charBuffer
         } as IAttributeValue;
      }
      this.attributeName = null;
      this.cleanCharBuffer();
   }

   private isCDATAAllowed(): boolean {
      return this.allowCDATA;
   }

   private consumeChar(): string | null {
      if (this.reconsume) {
         this.reconsume = false;
         this.position--;
      }
      if (this.position < this.buffer.length) {
         ++this.column;
         if (this.lastLF) {
            this.lastLF = false;
            this.column = 0;
            ++this.line;
         }
      }
      const char = this.buffer[this.position++] || null;
      if (char === LINE_FEED) {
         this.lastLF = true;
      }
      return char;
   }

   private emitCDATA(): void {
      this.tokenHandler.onCDATA(this.charBuffer);
      this.cleanCharBuffer();
   }

   private emitDoctype(): void {
      this.tokenHandler.onDoctype(this.charBuffer);
      this.cleanCharBuffer();
   }

   private finalize(): void {
      let state = this.saveState;
      let returnState = this.returnStateSave;
      finalizeLoop: while (true) {
         switch (state) {
            case TokenizerState.SCRIPT_DATA_LESS_THAN_SIGN:
            case TokenizerState.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN:
               this.appendCharBuffer('<');
               break finalizeLoop;
            case TokenizerState.TAG_OPEN:
               this.error('errEofAfterLt');
               this.appendCharBuffer('<');
               break finalizeLoop;
            case TokenizerState.RCDATA_RAWTEXT_LESS_THAN_SIGN:
               this.appendCharBuffer('<');
               break finalizeLoop;
            case TokenizerState.NON_DATA_END_TAG_NAME:
               this.appendCharBuffer('<>');
               this.flushCharBuffer();
               break finalizeLoop;
            case TokenizerState.END_TAG_OPEN:
               this.error('errEofAfterLt');
               this.appendCharBuffer('<>');
               break finalizeLoop;
            case TokenizerState.TAG_NAME:
               this.error('errEofInTagName');
               break finalizeLoop;
            case TokenizerState.BEFORE_ATTRIBUTE_NAME:
            case TokenizerState.AFTER_ATTRIBUTE_VALUE_QUOTED:
            case TokenizerState.SELF_CLOSING_START_TAG:
               this.error('errEofWithoutGt');
               break finalizeLoop;
            case TokenizerState.ATTRIBUTE_NAME:
               this.error('errEofInAttributeName');
               break;
            case TokenizerState.AFTER_ATTRIBUTE_NAME:
            case TokenizerState.BEFORE_ATTRIBUTE_VALUE:
               this.error('errEofWithoutGt');
               break finalizeLoop;
            case TokenizerState.ATTRIBUTE_VALUE_DOUBLE_QUOTED:
            case TokenizerState.ATTRIBUTE_VALUE_SINGLE_QUOTED:
            case TokenizerState.ATTRIBUTE_VALUE_UNQUOTED:
               this.error('errEofInAttributeValue');
               break finalizeLoop;
            case TokenizerState.BOGUS_COMMENT:
               this.emitComment(0);
               break finalizeLoop;
            case TokenizerState.BOGUS_COMMENT_HYPHEN:
               this.emitComment(0);
               break finalizeLoop;
            case TokenizerState.MARKUP_DECLARATION_OPEN:
            case TokenizerState.MARKUP_DECLARATION_HYPHEN:
               this.error('errBogusComment');
               this.emitComment(0);
               break finalizeLoop;
            case TokenizerState.MARKUP_DECLARATION_OCTYPE:
               // if (index < 6) {
               //    errBogusComment();
               //    emitComment(0, 0);
               // } else {
               //    errEofInDoctype();
               //    doctypeName = "";
               //    if (systemIdentifier != null) {
               //       Portability.releaseString(systemIdentifier);
               //       systemIdentifier = null;
               //    }
               //    if (publicIdentifier != null) {
               //       Portability.releaseString(publicIdentifier);
               //       publicIdentifier = null;
               //    }
               //    forceQuirks = true;
               //    emitDoctypeToken(0);
               // }
               break finalizeLoop;
            case TokenizerState.COMMENT_START:
            case TokenizerState.COMMENT:
               this.error('errEofInComment');
               this.emitComment(0);
               break finalizeLoop;
            case TokenizerState.COMMENT_END:
               this.error('errEofInComment');
               this.emitComment(2);
               break finalizeLoop;
            case TokenizerState.COMMENT_END_DASH:
            case TokenizerState.COMMENT_START_DASH:
               this.error('errEofInComment');
               this.emitComment(1);
               break finalizeLoop;
            case TokenizerState.COMMENT_END_BANG:
               this.error('errEofInComment');
               this.emitComment(3);
               break finalizeLoop;
            case TokenizerState.DOCTYPE:
               this.error('errEofInDoctype');
               this.emitDoctype();
               break finalizeLoop;
            case TokenizerState.CHARACTER_REFERENCE:
               // emitOrAppendCharRefBuf(returnState);
               state = returnState;
               continue;
            // case TokenizerState.CHARACTER_REFERENCE_HILO_LOOKUP:
            //    break finalizeLoop;
            // case TokenizerState.CHARACTER_REFERENCE_TAIL:
            //    break finalizeLoop;
            // case TokenizerState.CONSUME_NCR:
            // case TokenizerState.DECIMAL_NRC_LOOP:
            // case TokenizerState.HEX_NCR_LOOP:
            //    break finalizeLoop;
            case TokenizerState.CDATA_RSQB:
               this.appendCharBuffer('<');
               break finalizeLoop;
            case TokenizerState.CDATA_RSQB_RSQB:
               this.appendCharBuffer('<>');
               break finalizeLoop;
            case TokenizerState.DATA:
            default:
               break finalizeLoop;
         }
      }
      this.flushCharBuffer();
      this.tokenHandler.onEOF();
   }
}

export {
   ITokenizerOptions,
   IAttributeValue,
   IAttributes,
   IHandler,
   IErrorHandler,
   TokenizerState,
   Tokenizer
}
