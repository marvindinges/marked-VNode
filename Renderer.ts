import { _defaults } from './defaults.ts';
import {
  cleanUrl,
  escape,
} from './helpers.ts';
import { other } from './rules.ts';
import type { MarkedOptions } from './MarkedOptions.ts';
import type { Tokens } from './Tokens.ts';
import type { _Parser } from './Parser.ts';
import { h, Fragment, type VNode } from "vue"
/**
 * Renderer
 */
export class _Renderer {
  options: MarkedOptions;
  parser!: _Parser; // set by the parser
  constructor(options?: MarkedOptions) {
    this.options = options || _defaults;
  }

  // space(token: Tokens.Space): string {
  //   return '';
  // }

  code({ text, lang, escaped }: Tokens.Code): VNode {
    const langString = (lang || '').match(other.notSpaceStart)?.[0];

    const code = text.replace(other.endingNewline, '') + '\n';

    if (!langString) {
      return h("pre", {}, h("code", {innerHTML: escaped ? code : escape(code, true)}));
    }

    return h("pre", {class: "code--" + escape(langString, true)}, h("code", {
      class: "code--" + escape(langString, true),
      innerHTML: escaped ? code : escape(code, true)
  }))
  }

  blockquote({ tokens }: Tokens.Blockquote): VNode {
    const body = this.parser.parse(tokens);
    return h("blockquote", {}, body);
  }

  html({ text }: Tokens.HTML | Tokens.Tag) : VNode {
    return h("span", {innerHTML: text });
  }

  heading({ tokens, depth }: Tokens.Heading): VNode {
    return h("h" + depth, {}, this.parser.parseInline(tokens));
  }

  hr(token: Tokens.Hr): VNode {
    return h("hr");
  }

  list(token: Tokens.List): VNode {
    const ordered = token.ordered;
    const start = token.start;

    const body = [];
    for (let j = 0; j < token.items.length; j++) {
      const item = token.items[j];
      body.push(this.listitem(item));
    }

    const type = ordered ? 'ol' : 'ul';
    const startAttr = (ordered && start !== 1) ? {start: start} : {};
    return h(type, startAttr, body)  
  }

  listitem(item: Tokens.ListItem): VNode {
    return h("li", {}, this.parser.parse(item.tokens, !!item.loose))
  }

  checkbox({ checked }: Tokens.Checkbox): VNode {
    interface Props {
      type: string
      disabled: boolean
      checked?: ""
  }

  const props: Props = {
      type: "checkbox",
      disabled: true,
  }
  if (checked) {
      props["checked"] = ""
  }

  return h("input", props)
  }

  paragraph({ tokens }: Tokens.Paragraph): VNode {
    return h("p", {}, this.parser.parseInline(tokens))
  }

  table(token: Tokens.Table): VNode {
    // Generate header cells
    const headerCells = token.header.map(cellToken => this.tablecell(cellToken, true));
    // Create header row
    const headerRow = this.tablerow(headerCells);
    // Create thead
    const thead = h('thead', {}, [headerRow]);
  
    // Generate body rows
    const bodyRows = token.rows.map(rowTokens => {
      const cells = rowTokens.map(cellToken => this.tablecell(cellToken, false));
      return this.tablerow(cells);
    });
    // Create tbody
    const tbody = h('tbody', {}, bodyRows);
  
    // Create table
    return h('table', {}, [thead, tbody]);
  }

  tablerow(cells: VNode[]): VNode {
    return h('tr', {}, cells);
  }

  tablecell(cellToken: Tokens.TableCell, isHeader: boolean): VNode {
    const content = this.parser.parseInline(cellToken.tokens);
    const tag = isHeader ? 'th' : 'td';
    const align = cellToken.align ? { align: cellToken.align } : {};
    return h(tag, align, content);
  }

  /**
   * span level renderer
   */
  strong({ tokens }: Tokens.Strong): VNode {
    return h("strong", { 
      class: `font-bold`
    }, this.parser.parseInline(tokens));
  }

  em({ tokens }: Tokens.Em): VNode {
    return h("em", {}, this.parser.parseInline(tokens));
  }

  codespan({ text }: Tokens.Codespan): VNode {
    return h('code', {}, text);
  }

  br(token: Tokens.Br): VNode {
    return h("br")
  }

  del({ tokens }: Tokens.Del): VNode {
    return h("del", {}, this.parser.parseInline(tokens));
  }

  link({ href, title, tokens }: Tokens.Link): VNode {
    const content = this.parser.parseInline(tokens);
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      // If href is invalid, render content without link
      return h('span', {}, content);
    }
    const props: any = { href: cleanHref };
    if (title) {
      props.title = title;
    }
    return h('a', props, content);
  }

  image({ href, title, text }: Tokens.Image): VNode {
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      return h("img", {src: href, title: title, alt: text})
    }
    href = cleanHref;
    return h("img", {src: href, title: title, alt: text})
  }

  text(token: Tokens.Text | Tokens.Escape): VNode {
    if ('tokens' in token && token.tokens) {
      // Token has nested tokens
      return h(Fragment, {}, this.parser.parseInline(token.tokens));
    } else {
      // Plain text
      return h('span', {}, token.text);
    }
  }
}