import { NodeHtmlMarkdown } from 'node-html-markdown';
import { expect, test } from "bun:test";

const nhm = new NodeHtmlMarkdown();

test("Single line", async () => {
    const html = `
        <div>
            <h1>Heading</h1>
            <code>
                const v = 1;
                console.log(v);
            </code>
        </div>
    `
    const md = nhm.translate(html);
    expect(md).toBeDefined();
    console.log(md)
});

test("Multi line", async () => {
    const html = `
        <div>
            <h1>Heading</h1>
            <pre><code>
                const v = 1;
                console.log(v);
            </code></pre>
        </div>
    `
    const md = nhm.translate(html);
    expect(md).toBeDefined();
    console.log(md)
});