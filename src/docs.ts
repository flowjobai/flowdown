import fs from "fs";
import mammoth from "mammoth";
import { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } from 'node-html-markdown';
import { JSDOM } from "jsdom";

const nhm = new NodeHtmlMarkdown();
const DOC_URL = "https://docs.google.com/document/export?format=docx&id=";

async function exportDoc(id: string, path: string) {
    const url = DOC_URL + id;
    // Get the docx file into a memory buffer
    console.log("Fetching", url);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Unable to fetch ${url} - ${response.status}`);
    }
    // Get the filename from the content-disposition header if available (should always be)
    let filename = response.headers.has("content-disposition") ? response.headers.get("content-disposition")!.split('"')[1] : id;
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // Convert to html
    const conversion = await mammoth.convertToHtml({ buffer: buffer });
    // Remove the non printing characters that docs code block adds
    const html = conversion.value.replace("", "").replace("", "");
    //console.log(html);
    const fm = frontmatter(html);
    // Convert the html to markdown
    const markdown = nhm.translate(fm.body);
    // Write the markdown to a file
    const fullPath = path + "/" + filename.replace(".docx", ".md");
    fs.writeFileSync(fullPath, fm.frontmatter + markdown);
    console.log("Markdown written to", fullPath);
}

// Detect and handle front-matter before converting to markdown
function frontmatter(html: string) {
    const finder = /<p>---\s*<\/p>(.*)<p>---\s*<\/p>/gs;
    const match = finder.exec(html);
    if (match) {
        const frontmatter = match[1];
        const dom = new JSDOM(frontmatter);
        const p = dom.window.document.body.querySelectorAll("p");
        const text = ["---"];
        for (const element of p) {
            text.push(element.textContent || "");
        }
        text.push("---");
        return {
            body: html.replace(finder, ""),
            frontmatter: text.join("\n") + "\n",
        };
    }
    return {
        body: html,
        frontmatter: "",
    };
}

export { exportDoc };
