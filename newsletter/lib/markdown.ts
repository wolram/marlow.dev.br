import { marked } from "marked";

marked.setOptions({ breaks: true, gfm: true });

export function renderMarkdownToHtml(markdown: string): string {
  return marked.parse(markdown) as string;
}
