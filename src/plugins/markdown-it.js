

import MarkdownItPrism from "markdown-it-prism";
import MarkdownItTOC from "markdown-it-toc";
import MarkdownItAttrs from "markdown-it-attrs";
import MarkdownItInclude from "markdown-it-include";
export default class PrismPlugin {
  init(md) {
    md.use(MarkdownItPrism, {
      plugins: ["line-numbers"],
    });
    md.use(MarkdownItAttrs);
    md.use(MarkdownItTOC, {});
    md.use(MarkdownItInclude);
  }
}
