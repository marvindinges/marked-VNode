# marked-VNode
This is the [marked](https://github.com/markedjs/marked) library (v15.0.0) rewritten to return a VNode array, allowing you to use custom Vue components with it.

> [!CAUTION]  
> This library is untested and I am very inexperienced with JavaScript & TypeScript. Use at your own risk.

## Usage
```vue
<template>  
    <textarea v-model="markdownText"/>
    <component 
     v-for="(node, index) in renderedNodes" 
     :key="index" 
    :is="node"
    />
</template>

<script setup>
import { ref, watch, onMounted, h } from 'vue';
import { marked } from '../marked';

const markdownText = ref("### Hello World!\nThis is a [link](http://example.com)");
const renderedNodes = ref([]);

// Watch for changes in markdownText and re-render
watch(markdownText, async (newMarkdown) => {
  try {
    renderedNodes.value = await Promise.resolve(marked(newMarkdown));
  } catch (error) {
    console.error('Markdown parsing error:', error);
  }
});

// Initial rendering on mount
onMounted(async () => {
  try {
    renderedNodes.value = await Promise.resolve(marked(markdownText.value));
  } catch (error) {
    console.error('Initial markdown parsing error:', error);
  }
});
</script>
```

Register custom component:
```vue
<script setup>
import { ref, watch, onMounted, h } from 'vue';
import { marked } from '../marked';
import CustomLink from './CustomLink.vue';

const markdownText = ref("### Hello World!\nThis is a [link](http://example.com)");
const renderedNodes = ref([]);

// Create custom renderer
const renderer = new marked.Renderer();

// Override link rendering to use CustomLink component
renderer.link = ({ href, tokens }) => {
  const content = renderer.parser.parseInline(tokens);
  return h(CustomLink, { link: href }, content);
};

// Watch for changes in markdownText and re-render
watch(markdownText, async (newMarkdown) => {
  try {
    renderedNodes.value = await Promise.resolve(marked(newMarkdown, { renderer }));
  } catch (error) {
    console.error('Markdown parsing error:', error);
  }
});

// Initial rendering on mount
onMounted(async () => {
  try {
    renderedNodes.value = await Promise.resolve(marked(markdownText.value, { renderer }));
  } catch (error) {
    console.error('Initial markdown parsing error:', error);
  }
});
</script>
```

for further documentation consult the [marked documentation](https://marked.js.org/) just always return a VNode and no HTML string

