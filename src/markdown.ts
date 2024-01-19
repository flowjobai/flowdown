import { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } from 'node-html-markdown';

const nhm = new NodeHtmlMarkdown();

function convert(html: string) {
    const md = nhm.translate(html);
    return md;
}

export { convert }