/// <amd-module name="engine/html/Tokenizer" />

/**
 * @file src/html/Tokenizer.ts
 * @link https://www.w3.org/TR/2011/WD-html5-20110525/tokenization.html#tokenization
 * @link https://www.w3.org/TR/2011/WD-html5-20110525/content-models.html
 */
import { SourceLocation, SourcePosition, ISourceReader } from "./base/SourceReader";
import { IErrorHandler } from "../utils/ErrorHandler";
import { ITokenizer, ITokenHandler } from "./base/ITokenizer";
import Characters from "./base/Characters";
import { ContentModel } from "./base/ContentModel";
import { Attribute, IAttributes } from "./base/Nodes";

const CDATA: string = 'CDATA[';
const DOCTYPE: string = 'OCTYPE';

/**
 *
 */
export interface ITokenizerOptions {
   /**
    *
    */
   html4: boolean;
   /**
    *
    */
   allowComments: boolean;
   /**
    *
    */
   allowCDATA: boolean;
   /**
    *
    */
   tagNameToLowerCase: boolean;
}

/**
 * Html tokenizer states.
 */
enum TokenizerState {
   // Data content model
   DATA,
   TAG_OPEN,
   END_TAG_OPEN,
   TAG_NAME,
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
   CDATA_RSQB_RSQB,

   // Raw text content model
   RAW_TEXT,
   RAW_TEXT_LESS_THAN_SIGN,
   RAW_TEXT_ESCAPE_START,
   RAW_TEXT_ESCAPE_START_DASH,
   RAW_TEXT_ESCAPED,
   RAW_TEXT_ESCAPED_DASH,
   RAW_TEXT_ESCAPED_DASH_DASH,
   RAW_TEXT_ESCAPED_LESS_THAN_SIGN,
   RAW_TEXT_ESCAPED_END_TAG_OPEN,
   RAW_TEXT_ESCAPED_END_TAG_NAME,
   RAW_TEXT_DOUBLE_ESCAPE_START,
   RAW_TEXT_DOUBLE_ESCAPED,
   RAW_TEXT_DOUBLE_ESCAPED_DASH,
   RAW_TEXT_DATA_DOUBLE_ESCAPED_DASH_DASH,
   RAW_TEXT_DOUBLE_ESCAPED_LESS_THAN_SIGN,
   RAW_TEXT_DOUBLE_ESCAPE_END,

   // Escapable content model
   ESCAPABLE_RAW_TEXT,
   ESCAPABLE_RAW_TEXT_LESS_THAN_SIGN,
   ESCAPABLE_RAW_TEXT_END_TAG_NAME
}

/**
 *
 * @param contentModel
 */
function getStateByContentModel(contentModel: ContentModel): TokenizerState {
   switch (contentModel) {
      case ContentModel.RAW_TEXT:
         return TokenizerState.RAW_TEXT;
      case ContentModel.ESCAPABLE_RAW_TEXT:
         return TokenizerState.ESCAPABLE_RAW_TEXT;
      default:
         return TokenizerState.DATA;

   }
}

/**
 *
 */
export class Tokenizer implements ITokenizer {
   private readonly tokenHandler: ITokenHandler;
   private readonly errorHandler: IErrorHandler | undefined;
   private source: ISourceReader | undefined;

   private state: TokenizerState = TokenizerState.DATA;
   private returnState: TokenizerState = TokenizerState.DATA;
   private charBuffer: string = '';
   private index: number = Number.MAX_VALUE;
   private startPosition: SourcePosition | undefined;
   private currentPosition: SourcePosition | undefined;
   private endTagExpectation: string = '';

   private endTag: boolean = false;
   private tagName: string | undefined;
   private selfClosing: boolean = false;
   private attributeName: string | undefined;
   private attributes: IAttributes | undefined;

   private readonly allowComments: boolean = false;
   private readonly allowCDATA: boolean = false;

   /**
    *
    * @param tokenHandler
    * @param options
    * @param errorHandler
    */
   constructor(tokenHandler: ITokenHandler, options?: ITokenizerOptions, errorHandler?: IErrorHandler) {
      this.tokenHandler = tokenHandler;
      this.allowComments = !!(options && options.allowComments);
      this.allowCDATA = !!(options && options.allowCDATA);
      this.errorHandler = errorHandler;
   }

   /**
    *
    * @param contentModel
    * @param endTagExpectation
    */
   public setContentModel(contentModel: ContentModel, endTagExpectation: string): void {
      this.returnState = this.state;
      this.state = getStateByContentModel(contentModel);
      this.endTagExpectation = endTagExpectation;
   }

   /**
    * Initialize without starting tokenize.
    */
   public start(): void {
      this.state = TokenizerState.DATA;
      this.returnState = TokenizerState.DATA;
      this.charBuffer = '';
      this.tagName = '';
      this.selfClosing = false;
      this.index = Number.MAX_VALUE;
      this.endTagExpectation = '';
      this.startPosition = new SourcePosition(0, 0);
      this.currentPosition = undefined;
      this.tokenHandler.onStart(this);
   }

   /**
    * Start tokenize process.
    * @param source
    */
   public tokenize(source: ISourceReader): void {
      this.source = source;
      let char;
      let treatAsDefault;
      while (this.source.hasNext()) {
         char = this.source.consume() as string;
         this.currentPosition = this.source.getPosition();
         switch (this.state) {
            case TokenizerState.DATA:
               // Consume the next input character.
               switch (char) {
                  case Characters.LESS_THAN_SIGN:
                     this.flushCharBuffer();
                     this.state = TokenizerState.TAG_OPEN;
                     break;
                  case Characters.NULL:
                     // Parse error. Emit the current input character as a character token.
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
                  this.state = TokenizerState.TAG_NAME;
                  break;
               }
               switch (char) {
                  case Characters.EXCLAMATION_MARK:
                     this.state = TokenizerState.MARKUP_DECLARATION_OPEN;
                     break;
                  case Characters.SOLIDUS:
                     this.state = TokenizerState.END_TAG_OPEN;
                     break;
                  case Characters.QUESTION_MARK:
                     // Parse error. Switch to the bogus comment state.
                     this.error(`Saw ${this.charBuffer + char}. Probable cause: Attempt to use an XML processing instruction in HTML. XML processing instructions are not supported in HTML`);
                     this.cleanCharBuffer();
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.BOGUS_COMMENT;
                     break;
                  case Characters.GREATER_THAN_SIGN:
                     this.error(`Saw ${this.charBuffer + char}. Probable causes: Unescaped < (escape as &lt;) or mistyped start tag`);
                     this.appendCharBuffer('<>');
                     this.state = TokenizerState.DATA;
                     break;
                  default:
                     // Parse error. Emit a U+003C LESS-THAN SIGN character token and
                     // reconsume the current input character in the data state.
                     this.error(`Bad character "${char}" after <. Probable cause: Unescaped <. Try escaping it as &lt;`);
                     this.source.reconsume();
                     this.appendCharBuffer(Characters.LESS_THAN_SIGN);
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
                  this.state = TokenizerState.TAG_NAME;
                  break;
               }
               switch (char) {
                  case Characters.GREATER_THAN_SIGN:
                     // Parse error. Switch to the data state.
                     this.error(`Saw ${this.charBuffer}. Probable causes: Unescaped < (escape as &lt;) or mistyped end tag`);
                     this.state = TokenizerState.DATA;
                     break;
                  default:
                     // Parse error. Switch to the bogus comment state.
                     this.error(`Garbage after ${this.charBuffer + char}`);
                     this.cleanCharBuffer();
                     this.appendCharBuffer(char);
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
                  case Characters.CHARACTER_TABULATION:
                  case Characters.LINE_FEED:
                  case Characters.FORM_FEED:
                  case Characters.SPACE:
                     this.charBufferToTagName();
                     this.state = TokenizerState.BEFORE_ATTRIBUTE_NAME;
                     break;
                  case Characters.SOLIDUS:
                     this.charBufferToTagName();
                     this.state = TokenizerState.SELF_CLOSING_START_TAG;
                     break;
                  case Characters.GREATER_THAN_SIGN:
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
                  case Characters.CHARACTER_TABULATION:
                  case Characters.LINE_FEED:
                  case Characters.FORM_FEED:
                  case Characters.SPACE:
                     // Ignore the character.
                     break;
                  case Characters.SOLIDUS:
                     this.state = TokenizerState.SELF_CLOSING_START_TAG;
                     break;
                  case Characters.GREATER_THAN_SIGN:
                     // Switch to the data state. Emit the current tag token.
                     this.emitTagToken();
                     this.state = TokenizerState.DATA;
                     break;
                  case Characters.NULL:
                     // Parse error. Start a new attribute in the current tag token.
                     // Set that attribute's name to a U+FFFD REPLACEMENT CHARACTER character,
                     // and its value to the empty string.
                     // Switch to the attribute name state.
                     // emitReplacementCharacter
                     this.state = TokenizerState.ATTRIBUTE_NAME;
                     break;
                  case Characters.QUOTATION_MARK:
                  case Characters.APOSTROPHE:
                  case Characters.LESS_THAN_SIGN:
                  case Characters.EQUALS_SIGN:
                     // Parse error. Treat it as per the "anything else" entry below.
                     this.error(`Saw ${char} when expecting an attribute name`);
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
                  case Characters.CHARACTER_TABULATION:
                  case Characters.LINE_FEED:
                  case Characters.FORM_FEED:
                  case Characters.SPACE:
                     this.attributeNameComplete();
                     this.state = TokenizerState.AFTER_ATTRIBUTE_NAME;
                     break;
                  case Characters.SOLIDUS:
                     this.attributeNameComplete();
                     this.addAttributeWithoutValue();
                     this.state = TokenizerState.SELF_CLOSING_START_TAG;
                     break;
                  case Characters.EQUALS_SIGN:
                     this.attributeNameComplete();
                     this.state = TokenizerState.BEFORE_ATTRIBUTE_VALUE;
                     break;
                  case Characters.GREATER_THAN_SIGN:
                     // Emit the current tag token.
                     this.attributeNameComplete();
                     this.addAttributeWithoutValue();
                     this.emitTagToken();
                     // TODO: shouldSuspend
                     this.state = TokenizerState.DATA;
                     break;
                  case Characters.NULL:
                     // Parse error. Append a U+FFFD REPLACEMENT CHARACTER character to the current attribute's name.
                     break;
                  case Characters.QUOTATION_MARK:
                  case Characters.APOSTROPHE:
                  case Characters.LESS_THAN_SIGN:
                     // Parse error. Treat it as per the "anything else" entry below.
                     this.error(`Quote ${char} in attribute name`);
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
                  case Characters.CHARACTER_TABULATION:
                  case Characters.LINE_FEED:
                  case Characters.FORM_FEED:
                  case Characters.SPACE:
                     // Ignore the character.
                     break;
                  case Characters.SOLIDUS:
                     this.addAttributeWithoutValue();
                     this.state = TokenizerState.SELF_CLOSING_START_TAG;
                     break;
                  case Characters.EQUALS_SIGN:
                     this.state = TokenizerState.BEFORE_ATTRIBUTE_VALUE;
                     break;
                  case Characters.GREATER_THAN_SIGN:
                     // Emit the current tag token.
                     this.addAttributeWithoutValue();
                     this.emitTagToken();
                     // TODO: shouldSuspend
                     this.state = TokenizerState.DATA;
                     break;
                  case Characters.NULL:
                     // Parse error. Start a new attribute in the current tag token.
                     // Set that attribute's name to a U+FFFD REPLACEMENT CHARACTER character,
                     // and its value to the empty string.
                     // Switch to the attribute name state.
                     // emitReplacementCharacter
                     this.state = TokenizerState.ATTRIBUTE_NAME;
                     break;
                  case Characters.QUOTATION_MARK:
                  case Characters.APOSTROPHE:
                  case Characters.LESS_THAN_SIGN:
                     // Parse error. Treat it as per the "anything else" entry below.
                     this.error(`${char} in attribute name`);
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
                  case Characters.CHARACTER_TABULATION:
                  case Characters.LINE_FEED:
                  case Characters.FORM_FEED:
                  case Characters.SPACE:
                     // Ignore the character.
                     break;
                  case Characters.QUOTATION_MARK:
                     this.cleanCharBuffer();
                     this.state = TokenizerState.ATTRIBUTE_VALUE_DOUBLE_QUOTED;
                     break;
                  case Characters.AMPERSAND:
                     // Reconsume this current input character.
                     this.cleanCharBuffer();
                     this.state = TokenizerState.ATTRIBUTE_VALUE_UNQUOTED;
                     this.warn('noteUnquotedAttributeValue');
                     this.source.reconsume();
                     break;
                  case Characters.APOSTROPHE:
                     this.cleanCharBuffer();
                     this.state = TokenizerState.ATTRIBUTE_VALUE_SINGLE_QUOTED;
                     break;
                  case Characters.NULL:
                     // Parse error. Append a U+FFFD REPLACEMENT CHARACTER character to the current attribute's value.
                     // Switch to the attribute value (unquoted) state.
                     // emitReplacementCharacter
                     this.state = TokenizerState.ATTRIBUTE_VALUE_UNQUOTED;
                     break;
                  case Characters.GREATER_THAN_SIGN:
                     // Parse error. Switch to the data state. Emit the current tag token.
                     this.error('Attribute value missing');
                     this.addAttributeWithoutValue();
                     this.emitTagToken();
                     // TODO: shouldSuspend
                     this.state = TokenizerState.DATA;
                     break;
                  case Characters.LESS_THAN_SIGN:
                  case Characters.EQUALS_SIGN:
                  case Characters.GRAVE_ACCENT:
                     // Parse error. Treat it as per the "anything else" entry below.
                     this.error(`${char} at the start of an unquoted attribute value`);
                  // fallthrough
                  default:
                     // Append the current input character to the current attribute's value.
                     // Switch to the attribute value (unquoted) state.
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
                  case Characters.QUOTATION_MARK:
                     this.addAttributeWithValue();
                     this.state = TokenizerState.AFTER_ATTRIBUTE_VALUE_QUOTED;
                     break;
                  case Characters.NULL:
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
                  case Characters.APOSTROPHE:
                     this.addAttributeWithValue();
                     this.state = TokenizerState.AFTER_ATTRIBUTE_VALUE_QUOTED;
                     break;
                  case Characters.NULL:
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
                  case Characters.CHARACTER_TABULATION:
                  case Characters.LINE_FEED:
                  case Characters.FORM_FEED:
                  case Characters.SPACE:
                     this.addAttributeWithValue();
                     this.state = TokenizerState.BEFORE_ATTRIBUTE_NAME;
                     break;
                  case Characters.GREATER_THAN_SIGN:
                     // Switch to the data state. Emit the current tag token.
                     this.addAttributeWithValue();
                     this.emitTagToken();
                     this.state = TokenizerState.DATA;
                     // TODO: shouldSuspend
                     break;
                  case Characters.NULL:
                     // Parse error. Append a U+FFFD REPLACEMENT CHARACTER character to the current attribute's value.
                     break;
                  case Characters.QUOTATION_MARK:
                  case Characters.APOSTROPHE:
                  case Characters.LESS_THAN_SIGN:
                  case Characters.EQUALS_SIGN:
                  case Characters.GRAVE_ACCENT:
                     // Parse error. Treat it as per the "anything else" entry below.
                     this.error(`${char} at the start of an unquoted attribute value`);
                  // fallthrough
                  default:
                     // Append the current input character to the current attribute's value.
                     this.appendCharBuffer(char);
                     break;
               }
               break;
            case TokenizerState.AFTER_ATTRIBUTE_VALUE_QUOTED:
               // Consume the next input character.
               switch (char) {
                  case Characters.CHARACTER_TABULATION:
                  case Characters.LINE_FEED:
                  case Characters.FORM_FEED:
                  case Characters.SPACE:
                     this.state = TokenizerState.BEFORE_ATTRIBUTE_NAME;
                     break;
                  case Characters.SOLIDUS:
                     this.state = TokenizerState.SELF_CLOSING_START_TAG;
                     break;
                  case Characters.GREATER_THAN_SIGN:
                     // Emit the current tag token.
                     this.emitTagToken();
                     // TODO: shouldSuspend
                     this.state = TokenizerState.DATA;
                     break;
                  default:
                     // Parse error. Reconsume the character in the before attribute name state.
                     this.error('No space between attributes');
                     this.source.reconsume();
                     this.state = TokenizerState.BEFORE_ATTRIBUTE_NAME;
                     break;
               }
               break;
            case TokenizerState.SELF_CLOSING_START_TAG:
               // Consume the next input character.
               switch (char) {
                  case Characters.GREATER_THAN_SIGN:
                     // Set the self-closing flag of the current tag token.
                     // Switch to the data state. Emit the current tag token.
                     this.selfClosing = true;
                     this.emitTagToken();
                     // TODO: shouldSuspend
                     this.state = TokenizerState.DATA;
                     break;
                  default:
                     // Parse error. Reconsume the character in the before attribute name state.
                     this.error('A slash was not immediately followed by >');
                     this.source.reconsume();
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
                  case Characters.GREATER_THAN_SIGN:
                     this.emitComment(0);
                     this.state = TokenizerState.DATA;
                     break;
                  case Characters.HYPHEN_MINUS:
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.BOGUS_COMMENT_HYPHEN;
                     break;
                  case Characters.NULL:
                     // Parse error. Append a U+FFFD REPLACEMENT CHARACTER character to the current attribute's value.
                     break;
                  default:
                     this.appendCharBuffer(char);
                     break;
               }
               break;
            case TokenizerState.BOGUS_COMMENT_HYPHEN:
               switch (char) {
                  case Characters.GREATER_THAN_SIGN:
                     this.emitComment(0);
                     this.state = TokenizerState.DATA;
                     break;
                  case Characters.HYPHEN_MINUS:
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.BOGUS_COMMENT_HYPHEN;
                     break;
                  case Characters.NULL:
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
                  case Characters.HYPHEN_MINUS:
                     this.cleanCharBuffer();
                     this.state = TokenizerState.MARKUP_DECLARATION_HYPHEN;
                     break;
                  case 'd':
                  case 'D':
                     this.cleanCharBuffer();
                     this.state = TokenizerState.MARKUP_DECLARATION_OCTYPE;
                     this.index = 0;
                     break;
                  case Characters.LEFT_SQUARE_BRACKET:
                     if (this.isCDATAAllowed()) {
                        this.cleanCharBuffer();
                        this.state = TokenizerState.CDATA_START;
                        this.index = 0;
                        break;
                     }
                  // fallthrough
                  default:
                     this.error('Bogus comment');
                     this.cleanCharBuffer();
                     this.source.reconsume();
                     this.state = TokenizerState.BOGUS_COMMENT;
                     break;
               }
               break;
            case TokenizerState.MARKUP_DECLARATION_HYPHEN:
               if (char === Characters.HYPHEN_MINUS) {
                  this.state = TokenizerState.COMMENT_START;
                  break;
               }
               this.error('Bogus comment');
               this.source.reconsume();
               this.state = TokenizerState.BOGUS_COMMENT;
               break;
            case TokenizerState.MARKUP_DECLARATION_OCTYPE:
               if (this.index < DOCTYPE.length) {
                  char = char.toUpperCase();
                  if (char === DOCTYPE[this.index]) {
                     this.index++;
                  } else {
                     this.error('Bogus comment');
                     this.source.reconsume();
                     this.state = TokenizerState.BOGUS_COMMENT;
                  }
               } else {
                  this.state = TokenizerState.DOCTYPE;
                  this.index = Number.MAX_VALUE;
               }
               break;
            case TokenizerState.COMMENT_START:
               // Consume the next input character.
               switch (char) {
                  case Characters.HYPHEN_MINUS:
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.COMMENT_START_DASH;
                     break;
                  case Characters.NULL:
                     // Parse error. Append a U+FFFD REPLACEMENT CHARACTER character to the comment token's data.
                     // Switch to the comment state.
                     // emitReplacementCharacter
                     this.state = TokenizerState.COMMENT;
                     break;
                  case Characters.GREATER_THAN_SIGN:
                     // Parse error. Switch to the data state. Emit the comment token.
                     this.error('Premature end of comment. Use --> to end a comment properly');
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
                  case Characters.HYPHEN_MINUS:
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.COMMENT_END;
                     break;
                  case Characters.NULL:
                     // Parse error. Append a U+002D HYPHEN-MINUS character (-)
                     // and a U+FFFD REPLACEMENT CHARACTER character to the comment token's data.
                     // Switch to the comment state.
                     this.state = TokenizerState.COMMENT;
                     // emitReplacementCharacter
                     break;
                  case Characters.GREATER_THAN_SIGN:
                     // Parse error. Switch to the data state. Emit the comment token.
                     this.error('errPrematureEndOfComment');
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
                  case Characters.HYPHEN_MINUS:
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.COMMENT_END_DASH;
                     break;
                  case Characters.NULL:
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
                  case Characters.HYPHEN_MINUS:
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.COMMENT_END;
                     break;
                  case Characters.NULL:
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
                  case Characters.GREATER_THAN_SIGN:
                     // Emit the comment token.
                     this.emitComment(2);
                     this.state = TokenizerState.DATA;
                     break;
                  case Characters.NULL:
                     // Parse error. Append two U+002D HYPHEN-MINUS characters (-)
                     // and a U+FFFD REPLACEMENT CHARACTER character to the comment token's data.
                     // Switch to the comment state.
                     this.state = TokenizerState.COMMENT;
                     break;
                  case Characters.EXCLAMATION_MARK:
                     // Parse error. Switch to the comment end bang state.
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.COMMENT_END_BANG;
                     break;
                  case Characters.HYPHEN_MINUS:
                     // Parse error. Append a U+002D HYPHEN-MINUS character (-) to the comment token's data.
                     this.appendCharBuffer(char);
                     break;
                  default:
                     // Parse error. Append two U+002D HYPHEN-MINUS characters (-)
                     // and the current input character to the comment token's data.
                     // Switch to the comment state.
                     this.appendCharBuffer('--');
                     this.appendCharBuffer(char);
                     this.source.reconsume();
                     this.state = TokenizerState.COMMENT;
                     break;
               }
               break;
            case TokenizerState.COMMENT_END_BANG:
               // Consume the next input character.
               switch (char) {
                  case Characters.HYPHEN_MINUS:
                     // Append two U+002D HYPHEN-MINUS characters (-)
                     // and a U+0021 EXCLAMATION MARK character (!) to the comment token's data.
                     // Switch to the comment end dash state.
                     this.appendCharBuffer(char);
                     this.state = TokenizerState.COMMENT_END_DASH;
                     break;
                  case Characters.GREATER_THAN_SIGN:
                     // Emit the comment token.
                     this.emitComment(3);
                     this.state = TokenizerState.DATA;
                     break;
                  case Characters.NULL:
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
                  case Characters.GREATER_THAN_SIGN:
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
               if (this.index < CDATA.length) {
                  char = char.toUpperCase();
                  if (char === CDATA[this.index]) {
                     this.index++;
                  } else {
                     this.error('Bogus comment');
                     this.source.reconsume();
                     this.state = TokenizerState.BOGUS_COMMENT;
                  }
               } else {
                  this.state = TokenizerState.CDATA_SECTION;
                  this.source.reconsume();
                  this.index = Number.MAX_VALUE;
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
                  case Characters.RIGHT_SQUARE_BRACKET:
                     this.state = TokenizerState.CDATA_RSQB;
                     break;
                  case Characters.NULL:
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
                  case Characters.RIGHT_SQUARE_BRACKET:
                     this.state = TokenizerState.CDATA_RSQB_RSQB;
                     break;
                  case Characters.NULL:
                     // Parse error. Append a U+FFFD REPLACEMENT CHARACTER character
                     // to the current DOCTYPE token's system identifier.
                     // emitReplacementCharacter
                     break;
                  default:
                     this.source.reconsume();
                     this.appendCharBuffer(Characters.RIGHT_SQUARE_BRACKET);
                     this.state = TokenizerState.CDATA_SECTION;
                     break;
               }
               break;
            case TokenizerState.CDATA_RSQB_RSQB:
               switch (char) {
                  case Characters.GREATER_THAN_SIGN:
                     this.emitCDATA();
                     this.state = TokenizerState.DATA;
                     break;
                  case Characters.NULL:
                     // Parse error. Append a U+FFFD REPLACEMENT CHARACTER character
                     // to the current DOCTYPE token's system identifier.
                     // emitReplacementCharacter
                     break;
                  default:
                     this.source.reconsume();
                     this.appendCharBuffer(Characters.RIGHT_SQUARE_BRACKET);
                     this.appendCharBuffer(Characters.RIGHT_SQUARE_BRACKET);
                     this.state = TokenizerState.CDATA_SECTION;
                     break;
               }
               break;
            case TokenizerState.RAW_TEXT:
               // Consume the next input character.
               switch (char) {
                  case Characters.LESS_THAN_SIGN:
                     this.flushCharBuffer();
                     this.returnState = this.state;
                     this.state = TokenizerState.RAW_TEXT_LESS_THAN_SIGN;
                     break;
                  case Characters.NULL:
                     // Parse error. Emit a U+FFFD REPLACEMENT CHARACTER character token.
                     // emitReplacementCharacter
                     break;
                  default:
                     // Emit the current input character as a character token.
                     this.appendCharBuffer(char);
                     break;
               }
               break;
            case TokenizerState.RAW_TEXT_LESS_THAN_SIGN:
               // Consume the next input character.
               switch (char) {
                  case Characters.SOLIDUS:
                     // Set the temporary buffer to the empty string.
                     // Switch to the script data end tag open state.
                     this.index = 0;
                     this.cleanCharBuffer();
                     this.state = TokenizerState.ESCAPABLE_RAW_TEXT_END_TAG_NAME;
                     break;
                  case Characters.EXCLAMATION_MARK:
                     // Switch to the script data escape start state.
                     // Emit a U+003C LESS-THAN SIGN character token
                     // and a U+0021 EXCLAMATION MARK character token.
                     this.appendCharBuffer('<');
                     this.state = TokenizerState.RAW_TEXT_ESCAPE_START;
                     break;
                  default:
                     // Emit a U+003C LESS-THAN SIGN character token
                     // and reconsume the current input character in the script data state.
                     this.source.reconsume();
                     this.appendCharBuffer('<');
                     this.state = TokenizerState.RAW_TEXT;
                     break;
               }
               break;
            case TokenizerState.RAW_TEXT_ESCAPE_START:
               // Consume the next input character.
               switch (char) {
                  case Characters.HYPHEN_MINUS:
                     // Switch to the script data escape start dash state.
                     // Emit a U+002D HYPHEN-MINUS character token.
                     this.state = TokenizerState.RAW_TEXT_ESCAPE_START_DASH;
                     break;
                  default:
                     // Reconsume the current input character in the script data state.
                     this.source.reconsume();
                     this.state = TokenizerState.RAW_TEXT;
                     break;
               }
               break;
            case TokenizerState.RAW_TEXT_ESCAPE_START_DASH:
               // Consume the next input character.
               switch (char) {
                  case Characters.HYPHEN_MINUS:
                     // Switch to the script data escaped dash dash state.
                     // Emit a U+002D HYPHEN-MINUS character token.
                     this.state = TokenizerState.RAW_TEXT_ESCAPED_DASH_DASH;
                     break;
                  default:
                     // Reconsume the current input character in the script data state.
                     this.source.reconsume();
                     this.state = TokenizerState.RAW_TEXT;
                     break;
               }
               break;
            case TokenizerState.RAW_TEXT_ESCAPED:
               // Consume the next input character.
               switch (char) {
                  case Characters.HYPHEN_MINUS:
                     // Switch to the script data escaped dash state.
                     // Emit a U+002D HYPHEN-MINUS character token.
                     this.state = TokenizerState.RAW_TEXT_ESCAPED_DASH;
                     break;
                  case Characters.LESS_THAN_SIGN:
                     this.state = TokenizerState.RAW_TEXT_DOUBLE_ESCAPED_LESS_THAN_SIGN;
                     break;
                  case Characters.NULL:
                     // Parse error. Switch to the script data escaped state.
                     // Emit a U+FFFD REPLACEMENT CHARACTER character token.
                     // emitReplacementCharacter
                     this.state = TokenizerState.RAW_TEXT_ESCAPED;
                     break;
                  default:
                     // Switch to the script data escaped state.
                     // Emit the current input character as a character token.
                     this.state = TokenizerState.RAW_TEXT_ESCAPED;
                     break;
               }
               break;
            case TokenizerState.RAW_TEXT_ESCAPED_DASH:
               // Consume the next input character.
               switch (char) {
                  case Characters.HYPHEN_MINUS:
                     // Emit a U+002D HYPHEN-MINUS character token.
                     this.state = TokenizerState.RAW_TEXT_ESCAPED_DASH_DASH;
                     break;
                  case Characters.LESS_THAN_SIGN:
                     // Switch to the script data escaped less-than sign state.
                     this.state = TokenizerState.RAW_TEXT_ESCAPED_LESS_THAN_SIGN;
                     break;
                  case Characters.NULL:
                     // Parse error. Switch to the script data escaped state.
                     // Emit a U+FFFD REPLACEMENT CHARACTER character token.
                     // emitReplacementCharacter
                     this.state = TokenizerState.RAW_TEXT_ESCAPED;
                     break;
                  default:
                     // Switch to the script data escaped state.
                     // Emit the current input character as a character token.
                     this.state = TokenizerState.RAW_TEXT_ESCAPED;
                     break;
               }
               break;
            case TokenizerState.RAW_TEXT_ESCAPED_DASH_DASH:
               // Consume the next input character.
               switch (char) {
                  case Characters.HYPHEN_MINUS:
                     // Emit a U+002D HYPHEN-MINUS character token.
                     break;
                  case Characters.LESS_THAN_SIGN:
                     // Switch to the script data escaped less-than sign state.
                     this.state = TokenizerState.RAW_TEXT_ESCAPED_LESS_THAN_SIGN;
                     break;
                  case Characters.GREATER_THAN_SIGN:
                     // Switch to the script data state.
                     // Emit a U+003E GREATER-THAN SIGN character token.
                     this.state = TokenizerState.RAW_TEXT;
                     break;
                  case Characters.NULL:
                     // Parse error. Switch to the script data escaped state.
                     // Emit a U+FFFD REPLACEMENT CHARACTER character token.
                     // emitReplacementCharacter
                     this.state = TokenizerState.RAW_TEXT_ESCAPED;
                     break;
                  default:
                     // Switch to the script data escaped state.
                     // Emit the current input character as a character token.
                     this.state = TokenizerState.RAW_TEXT_ESCAPED;
                     break;
               }
               break;
            case TokenizerState.RAW_TEXT_ESCAPED_LESS_THAN_SIGN:
               // Consume the next input character.
               if (char >= 'A' && char <= 'Z') {
                  // Set the temporary buffer to the empty string.
                  // Append the lowercase version of the current input character
                  // (add 0x0020 to the character's code point) to the temporary buffer.
                  // Switch to the script data double escape start state.
                  // Emit a U+003C LESS-THAN SIGN character token
                  // and the current input character as a character token.
                  this.state = TokenizerState.RAW_TEXT_DOUBLE_ESCAPE_START;
                  break;
               }
               if (char >= 'a' && char <= 'z') {
                  // Set the temporary buffer to the empty string.
                  // Append the current input character to the temporary buffer.
                  // Switch to the script data double escape start state.
                  // Emit a U+003C LESS-THAN SIGN character token
                  // and the current input character as a character token.
                  this.state = TokenizerState.RAW_TEXT_DOUBLE_ESCAPE_START;
                  break;
               }
               switch (char) {
                  case Characters.SOLIDUS:
                     // Set the temporary buffer to the empty string.
                     // Switch to the script data escaped end tag open state.
                     this.returnState = TokenizerState.RAW_TEXT_ESCAPED;
                     this.state = TokenizerState.RAW_TEXT_ESCAPED_END_TAG_OPEN;
                     break;
                  default:
                     // Emit a U+003C LESS-THAN SIGN character token
                     // and reconsume the current input character in the script data escaped state.
                     this.source.reconsume();
                     this.state = TokenizerState.RAW_TEXT_ESCAPED;
                     break;
               }
               break;
            case TokenizerState.RAW_TEXT_ESCAPED_END_TAG_OPEN:
               // Consume the next input character.
               if (char >= 'A' && char <= 'Z') {
                  // Create a new end tag token, and set its tag name
                  // to the lowercase version of the current input character
                  // (add 0x0020 to the character's code point).
                  // Append the current input character to the temporary buffer.
                  // Finally, switch to the script data escaped end tag name state.
                  // (Don't emit the token yet; further details will be filled in before it is emitted.)
                  this.state = TokenizerState.RAW_TEXT_ESCAPED_END_TAG_NAME;
                  break;
               }
               else if (char >= 'a' && char <= 'z') {
                  // Create a new end tag token, and set its tag name to the current input character.
                  // Append the current input character to the temporary buffer.
                  // Finally, switch to the script data escaped end tag name state.
                  // (Don't emit the token yet; further details will be filled in before it is emitted.)
                  this.state = TokenizerState.RAW_TEXT_ESCAPED_END_TAG_NAME;
                  break;
               }
               else {
                  // Emit a U+003C LESS-THAN SIGN character token, a U+002F SOLIDUS character token,
                  // and reconsume the current input character in the script data escaped state.
                  this.source.reconsume();
                  this.state = TokenizerState.RAW_TEXT_ESCAPED;
               }
               break;
            case TokenizerState.RAW_TEXT_ESCAPED_END_TAG_NAME:
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
                  this.state = TokenizerState.RAW_TEXT_ESCAPED_END_TAG_NAME;
                  break;
               }
               treatAsDefault = false;
               switch (char) {
                  case Characters.CHARACTER_TABULATION:
                  case Characters.LINE_FEED:
                  case Characters.FORM_FEED:
                  case Characters.SPACE:
                     // If the current end tag token is an appropriate end tag token,
                     // then switch to the before attribute name state.
                     // Otherwise, treat it as per the "anything else" entry below.
                     // TODO: release state
                     if (char.indexOf('random')) {
                        this.state = TokenizerState.BEFORE_ATTRIBUTE_NAME;
                        break;
                     }
                     treatAsDefault = true;
                     break;
                  case Characters.SOLIDUS:
                     // If the current end tag token is an appropriate end tag token,
                     // then switch to the self-closing start tag state.
                     // Otherwise, treat it as per the "anything else" entry below.
                     // TODO: release state
                     if (char.indexOf('random')) {
                        this.state = TokenizerState.SELF_CLOSING_START_TAG;
                        break;
                     }
                     treatAsDefault = true;
                     break;
                  case Characters.GREATER_THAN_SIGN:
                     // If the current end tag token is an appropriate end tag token,
                     // then emit the current tag token and switch to the data state.
                     // Otherwise, treat it as per the "anything else" entry below.
                     // TODO: release state
                     if (char.indexOf('random')) {
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
                  this.source.reconsume();
                  this.state = TokenizerState.RAW_TEXT_ESCAPED;
               }
               break;
            case TokenizerState.RAW_TEXT_DOUBLE_ESCAPE_START:
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
                  case Characters.CHARACTER_TABULATION:
                  case Characters.LINE_FEED:
                  case Characters.FORM_FEED:
                  case Characters.SPACE:
                  case Characters.SOLIDUS:
                  case Characters.GREATER_THAN_SIGN:
                     // If the temporary buffer is the string "script",
                     // then switch to the script data double escaped state.
                     // Otherwise, switch to the script data escaped state.
                     // Emit the current input character as a character token.
                     if (this.index < this.endTagExpectation.length) {
                        char = char.toUpperCase();
                        if (char === this.endTagExpectation[this.index]) {
                           this.index++;
                        } else {
                           this.source.reconsume();
                           this.state = TokenizerState.RAW_TEXT_ESCAPED;
                        }
                     } else {
                        this.state = TokenizerState.RAW_TEXT_DOUBLE_ESCAPED;
                        this.index = Number.MAX_VALUE;
                     }
                     break;
                  default:
                     // Reconsume the current input character in the script data escaped state.
                     this.source.reconsume();
                     this.state = TokenizerState.RAW_TEXT_ESCAPED;
                     break;
               }
               break;
            case TokenizerState.RAW_TEXT_DOUBLE_ESCAPED:
               // Consume the next input character.
               switch (char) {
                  case Characters.HYPHEN_MINUS:
                     // Switch to the script data double escaped dash state.
                     // Emit a U+002D HYPHEN-MINUS character token.
                     this.state = TokenizerState.RAW_TEXT_DOUBLE_ESCAPED_DASH;
                     break;
                  case Characters.LESS_THAN_SIGN:
                     // Switch to the script data double escaped less-than sign state.
                     // Emit a U+003C LESS-THAN SIGN character token.
                     this.state = TokenizerState.RAW_TEXT_DOUBLE_ESCAPED_LESS_THAN_SIGN;
                     break;
                  case Characters.NULL:
                     // Parse error. Emit a U+FFFD REPLACEMENT CHARACTER character token.
                     // emitReplacementCharacter
                     break;
                  default:
                     // Emit the current input character as a character token.
                     break;
               }
               break;
            case TokenizerState.RAW_TEXT_DOUBLE_ESCAPED_DASH:
               // Consume the next input character.
               switch (char) {
                  case Characters.HYPHEN_MINUS:
                     // Switch to the script data double escaped dash dash state.
                     // Emit a U+002D HYPHEN-MINUS character token.
                     this.state = TokenizerState.RAW_TEXT_DATA_DOUBLE_ESCAPED_DASH_DASH;
                     break;
                  case Characters.LESS_THAN_SIGN:
                     // Switch to the script data double escaped less-than sign state.
                     // Emit a U+003C LESS-THAN SIGN character token.
                     this.state = TokenizerState.RAW_TEXT_DOUBLE_ESCAPED_LESS_THAN_SIGN;
                     break;
                  case Characters.NULL:
                     // Parse error. Switch to the script data double escaped state.
                     // Emit a U+FFFD REPLACEMENT CHARACTER character token.
                     // emitReplacementCharacter
                     this.state = TokenizerState.RAW_TEXT_DOUBLE_ESCAPED;
                     break;
                  default:
                     // Switch to the script data double escaped state.
                     // Emit the current input character as a character token.
                     this.state = TokenizerState.RAW_TEXT_DOUBLE_ESCAPED;
                     break;
               }
               break;
            case TokenizerState.RAW_TEXT_DATA_DOUBLE_ESCAPED_DASH_DASH:
               // Consume the next input character.
               switch (char) {
                  case Characters.HYPHEN_MINUS:
                     // Emit a U+002D HYPHEN-MINUS character token.
                     break;
                  case Characters.LESS_THAN_SIGN:
                     // Switch to the script data double escaped less-than sign state.
                     // Emit a U+003C LESS-THAN SIGN character token.
                     this.state = TokenizerState.RAW_TEXT_DOUBLE_ESCAPED_LESS_THAN_SIGN;
                     break;
                  case Characters.GREATER_THAN_SIGN:
                     // Switch to the script data state. Emit a U+003E GREATER-THAN SIGN character token.
                     this.state = TokenizerState.RAW_TEXT;
                     break;
                  case Characters.NULL:
                     // Parse error. Switch to the script data double escaped state.
                     // Emit a U+FFFD REPLACEMENT CHARACTER character token.
                     // emitReplacementCharacter
                     this.state = TokenizerState.RAW_TEXT_DOUBLE_ESCAPED;
                     break;
                  default:
                     // Switch to the script data double escaped state.
                     // Emit the current input character as a character token.
                     this.state = TokenizerState.RAW_TEXT_DOUBLE_ESCAPED;
                     break;
               }
               break;
            case TokenizerState.RAW_TEXT_DOUBLE_ESCAPED_LESS_THAN_SIGN:
               // Consume the next input character.
               switch (char) {
                  case Characters.SOLIDUS:
                     // Set the temporary buffer to the empty string.
                     // Switch to the script data double escape end state.
                     // Emit a U+002F SOLIDUS character token.
                     this.index = 0;
                     this.state = TokenizerState.RAW_TEXT_DOUBLE_ESCAPE_END;
                     break;
                  default:
                     // Reconsume the current input character in the script data double escaped state.
                     this.source.reconsume();
                     this.state = TokenizerState.RAW_TEXT_DOUBLE_ESCAPED;
                     break;
               }
               break;
            case TokenizerState.RAW_TEXT_DOUBLE_ESCAPE_END:
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
                  case Characters.CHARACTER_TABULATION:
                  case Characters.LINE_FEED:
                  case Characters.FORM_FEED:
                  case Characters.SPACE:
                  case Characters.SOLIDUS:
                  case Characters.GREATER_THAN_SIGN:
                     // If the temporary buffer is the string "script", then switch to the script data escaped state.
                     // Otherwise, switch to the script data double escaped state.
                     // Emit the current input character as a character token.
                     if (this.index < this.endTagExpectation.length) {
                        char = char.toUpperCase();
                        if (char === this.endTagExpectation[this.index]) {
                           this.index++;
                        } else {
                           this.source.reconsume();
                           this.state = TokenizerState.RAW_TEXT_DOUBLE_ESCAPED;
                        }
                     } else {
                        this.state = TokenizerState.RAW_TEXT_ESCAPED;
                        this.index = Number.MAX_VALUE;
                     }
                     break;
                  default:
                     // Reconsume the current input character in the script data double escaped state.
                     this.source.reconsume();
                     this.state = TokenizerState.RAW_TEXT_DOUBLE_ESCAPED;
                     break;
               }
               break;
            case TokenizerState.ESCAPABLE_RAW_TEXT:
               // Consume the next input character.
               switch (char) {
                  case Characters.LESS_THAN_SIGN:
                     this.flushCharBuffer();
                     this.returnState = TokenizerState.ESCAPABLE_RAW_TEXT;
                     this.state = TokenizerState.ESCAPABLE_RAW_TEXT_LESS_THAN_SIGN;
                     break;
                  case Characters.NULL:
                     // Parse error. Emit a U+FFFD REPLACEMENT CHARACTER character token.
                     // emitReplacementCharacter
                     break;
                  default:
                     // Emit the current input character as a character token.
                     this.appendCharBuffer(char);
                     break;
               }
               break;
            case TokenizerState.ESCAPABLE_RAW_TEXT_LESS_THAN_SIGN:
               switch (char) {
                  case Characters.SOLIDUS:
                     // Set the temporary buffer to the empty string.
                     this.index = 0;
                     this.cleanCharBuffer();
                     this.state = TokenizerState.ESCAPABLE_RAW_TEXT_END_TAG_NAME;
                     break;
                  default:
                     // Emit a U+003C LESS-THAN SIGN character token
                     // and reconsume the current input character in the RCDATA state.
                     this.appendCharBuffer(Characters.LESS_THAN_SIGN);
                     this.state = this.returnState;
                     this.source.reconsume();
                     break;
               }
               break;
            case TokenizerState.ESCAPABLE_RAW_TEXT_END_TAG_NAME:
               // Consume the next input character.
               if (this.endTagExpectation === null) {
                  this.appendCharBuffer('</');
                  this.source.reconsume();
                  this.state = this.returnState;
                  break;
               } else if (this.index < this.endTagExpectation.length) {
                  char = char.toLowerCase();
                  if (char !== this.endTagExpectation[this.index]) {
                     this.appendCharBuffer('</');
                     this.flushCharBuffer();
                     this.source.reconsume();
                     break;
                  }
                  this.appendCharBuffer(char);
                  this.index++;
                  break;
               } else {
                  this.endTag = true;
                  this.tagName = this.endTagExpectation;
                  this.endTagExpectation = '';
                  switch (char) {
                     case Characters.LINE_FEED:
                     case Characters.SPACE:
                     case Characters.CHARACTER_TABULATION:
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
                        this.appendCharBuffer('</');
                        this.flushCharBuffer();
                        this.source.reconsume();
                        break;
                  }
               }
               break;
         }
      }
      this.finalize();
   }

   private getCurrentLocation(): SourceLocation {
      return new SourceLocation(this.startPosition as SourcePosition, this.currentPosition as SourcePosition);
   }

   private resetPosition(): void {
      this.startPosition = this.currentPosition;
   }

   private flushCharBuffer(): void {
      if (this.charBuffer.length > 0) {
         this.tokenHandler.onText(this.charBuffer, this.getCurrentLocation());
         this.cleanCharBuffer();
      }
   }

   private cleanCharBuffer(): void {
      this.charBuffer = '';
      this.resetPosition();
   }

   private appendCharBuffer(char: string): void {
      this.charBuffer += char;
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
         this.tokenHandler.onCloseTag(this.tagName as string, this.getCurrentLocation());
      } else {
         this.tokenHandler.onOpenTag(this.tagName as string, this.attributes || { }, this.selfClosing, this.getCurrentLocation());
      }
      this.tagName = '';
      this.attributes = undefined;
      this.selfClosing = false;
      this.resetPosition();
   }

   private emitComment(provisionalHyphens: number): void {
      const data = this.charBuffer.substr(0, this.charBuffer.length - provisionalHyphens);
      if (this.allowComments) {
         this.tokenHandler.onComment(data, this.getCurrentLocation());
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
         this.error(`Duplicate attribute "${this.attributeName}"`);
         this.attributeName = undefined;
      }
   }

   private addAttributeWithoutValue(): void {
      this.warn('noteAttributeWithoutValue');
      if (this.attributes && this.attributeName) {
         this.attributes[this.attributeName] = new Attribute(this.attributeName, null, this.getCurrentLocation());
      }
      this.attributeName = undefined;
      this.cleanCharBuffer();
   }

   private addAttributeWithValue(): void {
      if (this.attributes && this.attributeName) {
         this.attributes[this.attributeName] = new Attribute(this.attributeName, this.charBuffer, this.getCurrentLocation());
      }
      this.attributeName = undefined;
      this.cleanCharBuffer();
   }

   private isCDATAAllowed(): boolean {
      return this.allowCDATA;
   }

   private emitCDATA(): void {
      this.tokenHandler.onCDATA(this.charBuffer, this.getCurrentLocation());
      this.cleanCharBuffer();
   }

   private emitDoctype(): void {
      this.tokenHandler.onDoctype(this.charBuffer, this.getCurrentLocation());
      this.cleanCharBuffer();
   }

   private finalize(): void {
      let state = this.state;
      finalizeLoop: while (true) {
         switch (state) {
            case TokenizerState.RAW_TEXT_LESS_THAN_SIGN:
            case TokenizerState.RAW_TEXT_ESCAPED_LESS_THAN_SIGN:
               this.appendCharBuffer('<');
               break finalizeLoop;
            case TokenizerState.TAG_OPEN:
               this.error('End of file after less-than-sign');
               this.appendCharBuffer('<');
               break finalizeLoop;
            case TokenizerState.ESCAPABLE_RAW_TEXT_LESS_THAN_SIGN:
               this.appendCharBuffer('<');
               break finalizeLoop;
            case TokenizerState.ESCAPABLE_RAW_TEXT_END_TAG_NAME:
               this.appendCharBuffer('<>');
               this.flushCharBuffer();
               break finalizeLoop;
            case TokenizerState.END_TAG_OPEN:
               this.error('End of file after less-than-sign');
               this.appendCharBuffer('<>');
               break finalizeLoop;
            case TokenizerState.TAG_NAME:
               this.error('End of file seen when looking for tag name. Ignoring tag');
               break finalizeLoop;
            case TokenizerState.BEFORE_ATTRIBUTE_NAME:
            case TokenizerState.AFTER_ATTRIBUTE_VALUE_QUOTED:
            case TokenizerState.SELF_CLOSING_START_TAG:
               this.error('Saw end of file without the previous tag ending with greater-than-sign. Ignoring tag');
               break finalizeLoop;
            case TokenizerState.ATTRIBUTE_NAME:
               this.error('End of file occurred in an attribute name. Ignoring tag');
               break;
            case TokenizerState.AFTER_ATTRIBUTE_NAME:
            case TokenizerState.BEFORE_ATTRIBUTE_VALUE:
               this.error('End of file reached when before an attribute value. Ignoring tag');
               break finalizeLoop;
            case TokenizerState.ATTRIBUTE_VALUE_DOUBLE_QUOTED:
            case TokenizerState.ATTRIBUTE_VALUE_SINGLE_QUOTED:
            case TokenizerState.ATTRIBUTE_VALUE_UNQUOTED:
               this.error('End of file reached when inside an attribute value. Ignoring tag');
               break finalizeLoop;
            case TokenizerState.BOGUS_COMMENT:
               this.emitComment(0);
               break finalizeLoop;
            case TokenizerState.BOGUS_COMMENT_HYPHEN:
               this.emitComment(0);
               break finalizeLoop;
            case TokenizerState.MARKUP_DECLARATION_OPEN:
            case TokenizerState.MARKUP_DECLARATION_HYPHEN:
               this.error('Bogus comment');
               this.emitComment(0);
               break finalizeLoop;
            case TokenizerState.MARKUP_DECLARATION_OCTYPE:
               if (this.index < 6) {
                  this.error('Bogus comment');
                  this.emitComment(0);
               } else {
                  this.error('End of file inside doctype');
                  this.emitDoctype();
               }
               break finalizeLoop;
            case TokenizerState.COMMENT_START:
            case TokenizerState.COMMENT:
               this.error('End of file inside comment.');
               this.emitComment(0);
               break finalizeLoop;
            case TokenizerState.COMMENT_END:
               this.error('End of file inside comment.');
               this.emitComment(2);
               break finalizeLoop;
            case TokenizerState.COMMENT_END_DASH:
            case TokenizerState.COMMENT_START_DASH:
               this.error('End of file inside comment');
               this.emitComment(1);
               break finalizeLoop;
            case TokenizerState.COMMENT_END_BANG:
               this.error('End of file inside comment.');
               this.emitComment(3);
               break finalizeLoop;
            case TokenizerState.DOCTYPE:
               this.error('End of file inside doctype');
               this.emitDoctype();
               break finalizeLoop;
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

