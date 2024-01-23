import fs from "fs";
import mammoth from "mammoth";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { JSDOM } from "jsdom";
import pm from "picomatch";

const nhm = new NodeHtmlMarkdown();
const DOC_URL = "https://docs.google.com/document/export?format=docx&id=";

async function exportDoc(id: string, path: string, matcher: pm.Matcher) {
    const url = DOC_URL + id;
    // Get the docx file into a memory buffer
    console.log("Fetching", url);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Unable to fetch ${url} - ${response.status}`);
    }
    // Get the filename from the content-disposition header if available (should always be)
    let filename = response.headers.has("content-disposition") ? response.headers.get("content-disposition")!.split('"')[1] : id;
    const buffer = await response.arrayBuffer();
    const converted = await convert(Buffer.from(buffer));
    // Write the markdown to a file
    const fullPath = path + "/" + filename.replace(".docx", ".md");
    if (matcher(fullPath)) {
        fs.mkdirSync(path, { recursive: true });
        fs.writeFileSync(fullPath, converted.fm + converted.md);
        console.log("Markdown written to", fullPath);
    }
    else {
        console.log("File skipped", fullPath);
    }
}

async function convert(buffer: Buffer) {
    // Convert to html
    // @ts-ignore
    const transform = mammoth.transforms.paragraph(transformCodeParagraph);
    const styleMap = ["p[style-name='Code'] => code:separator('\n')"];
    const { value } = await mammoth.convertToHtml({ buffer: buffer }, { transformDocument: transform, styleMap: styleMap });
    ///const { value } = await mammoth.convertToHtml({ buffer: buffer });
    // Remove the non printing characters that docs code block adds
    const html = value.replace("", "").replace("", "");
    //console.log("****\n" + html + "\n****");
    const fm = frontmatter(html);
    // Convert the html to markdown
    const md = nhm.translate(fm.body);
    return { fm, md };
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

// A mammoth transformer to change monospaced fonts to code block
const monospaceFonts = ["consolas", "courier", "courier new", "roboto mono", "monaco", "monospace"];
function transformCodeParagraph(paragraph: any) {
    // @ts-ignore
    const runs = mammoth.transforms.getDescendantsOfType(paragraph, "run");
    const isMatch =
        runs.length > 0 &&
        runs.every((run: any) => {
            return run.font && monospaceFonts.indexOf(run.font.toLowerCase()) !== -1;
        });
    if (isMatch) {
        return {
            ...paragraph,
            styleId: "code",
            styleName: "Code",
        };
    }
    return paragraph;
}

export { exportDoc, convert };
