

import MarkdownItPrism from "markdown-it-prism";
import MarkdownItTOC from "markdown-it-toc";
import MarkdownItAttrs from "markdown-it-attrs";
export default class PrismPlugin {
  init(md) {
    md.use(MarkdownItPrism, {
      plugins: ["line-numbers"],
    });
    md.use(MarkdownItTOC, {});
    md.use(MarkdownItAttrs);
  }
}
