import type { Tokens } from './Tokens.ts';
import { h, type VNode } from 'vue';

/**
 * TextRenderer
 * returns only the textual part of the token
 */
export class _TextRenderer {
  strong({ text }: Tokens.Strong): VNode {
    return h('span', {}, text);
  }

  em({ text }: Tokens.Em): VNode {
    return h('span', {}, text);
  }

  codespan({ text }: Tokens.Codespan): VNode {
    return h('span', {}, text);
  }

  del({ text }: Tokens.Del): VNode {
    return h('span', {}, text);
  }

  html({ text }: Tokens.HTML | Tokens.Tag): VNode {
    return h('span', {}, text);
  }

  text({ text }: Tokens.Text | Tokens.Escape | Tokens.Tag): VNode {
    return h('span', {}, text);
  }

  link({ text }: Tokens.Link): VNode {
    return h('span', {}, text);
  }

  image({ text }: Tokens.Image): VNode {
    return h('span', {}, text);
  }

  br(): VNode {
    return h('span', {}, '');
  }
}