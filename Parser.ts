import { _Renderer } from './Renderer.ts';
import { _TextRenderer } from './TextRenderer.ts';
import { _defaults } from './defaults.ts';
import type { MarkedToken, Token, Tokens } from './Tokens.ts';
import type { MarkedOptions } from './MarkedOptions.ts';
import { type VNode, h } from "vue"

/**
 * Parsing & Compiling
 */
export class _Parser {
  options: MarkedOptions;
  renderer: _Renderer;
  textRenderer: _TextRenderer;
  constructor(options?: MarkedOptions) {
    this.options = options || _defaults;
    this.options.renderer = this.options.renderer || new _Renderer();
    this.renderer = this.options.renderer;
    this.renderer.options = this.options;
    this.renderer.parser = this;
    this.textRenderer = new _TextRenderer();
  }

  /**
   * Static Parse Method
   */
  static parse(tokens: Token[], options?: MarkedOptions): VNode[] {
    const parser = new _Parser(options);
    return parser.parse(tokens);
  }

  /**
   * Static Parse Inline Method
   */
  static parseInline(tokens: Token[], options?: MarkedOptions): VNode[] {
    const parser = new _Parser(options);
    return parser.parseInline(tokens);
  }

  /**
   * Parse Loop
   */
  parse(tokens: Token[], top = true): VNode [] {
    const out: VNode[] = []

    for (let i = 0; i < tokens.length; i++) {
      const anyToken = tokens[i];

      // Run any renderer extensions
      if (
        this.options.extensions &&
        this.options.extensions.renderers &&
        this.options.extensions.renderers[anyToken.type]
      ) {
        const extensionRenderer = this.options.extensions.renderers[anyToken.type];
        const ret = extensionRenderer.call({ parser: this }, anyToken);
        if (ret !== false) {
          if (ret) {
            out.push(h('span', {}, ret));
          }
          continue;
        }
        // If ret === false, fall through to default renderer if it exists
      }

      const token = anyToken as MarkedToken;

      switch (token.type) {
        case 'space': {
          //out.push(this.renderer.space(token));
          continue;
        }
        case 'hr': {
          out.push(this.renderer.hr(token));
          continue;
        }
        case 'heading': {
          out.push(this.renderer.heading(token));
          continue;
        }
        case 'code': {
          out.push(this.renderer.code(token));
          continue;
        }
        case 'table': {
          out.push(this.renderer.table(token));
          continue;
        }
        case 'blockquote': {
          out.push(this.renderer.blockquote(token));
          continue;
        }
        case 'list': {
          out.push(this.renderer.list(token));
          continue;
        }
        case 'html': {
          out.push(this.renderer.html(token));
          continue;
        }
        case 'paragraph': {
          out.push(this.renderer.paragraph(token));
          continue;
        }
        case 'text': {
          // let textToken = token;
          // let body = this.renderer.text(textToken);
          // while (i + 1 < tokens.length && tokens[i + 1].type === 'text') {
          //   textToken = tokens[++i] as Tokens.Text;
          //   body += '\n' + this.renderer.text(textToken);
          // }
          // if (top) {
          //   out += this.renderer.paragraph({
          //     type: 'paragraph',
          //     raw: body,
          //     text: body,
          //     tokens: [{ type: 'text', raw: body, text: body, escaped: true }],
          //   });
          // } else {
          //   out += body;
          // }
          out.push(this.renderer.text(token));
          continue;
        }

        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            out.push(h('div', { class: 'error' }, errMsg));
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }

  /**
   * Parse Inline Tokens
   */
  parseInline(tokens: Token[], renderer?: _Renderer | _TextRenderer): VNode[] {
    renderer = renderer || this.renderer;
    const out: VNode[] = []

    for (let i = 0; i < tokens.length; i++) {
      const anyToken = tokens[i];

      // Run any renderer extensions
      if (
        this.options.extensions &&
        this.options.extensions.renderers &&
        this.options.extensions.renderers[anyToken.type]
      ) {
        const extensionRenderer = this.options.extensions.renderers[anyToken.type];
        const ret = extensionRenderer.call({ parser: this }, anyToken);
        if (ret !== false) {
          if (ret) {
            if (typeof ret === 'string') {
              out.push(h('span', {}, ret));
            } else {
              out.push(ret);
            }
          }
          continue;
        }
        // If ret === false, fall through to default renderer if it exists
      }

      const token = anyToken as MarkedToken;

      switch (token.type) {
        case 'escape': {
          out.push(renderer.text(token));
          break;
        }
        case 'html': {
          out.push(renderer.html(token));
          break;
        }
        case 'link': {
          out.push(renderer.link(token));
          break;
        }
        case 'image': {
          out.push(renderer.image(token));
          break;
        }
        case 'strong': {
          out.push(renderer.strong(token));
          break;
        }
        case 'em': {
          out.push(renderer.em(token));
          break;
        }
        case 'codespan': {
          out.push(renderer.codespan(token));
          break;
        }
        case 'br': {
          out.push(renderer.br(token));
          break;
        }
        case 'del': {
          out.push(renderer.del(token));
          break;
        }
        case 'text': {
          out.push(renderer.text(token));
          break;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            out.push(h('span', { class: 'error' }, errMsg));
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
}