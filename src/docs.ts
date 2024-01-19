import { https } from 'follow-redirects';
import fs from 'fs';
import mammoth from 'mammoth';
import Turndown from 'turndown';
import plugin from 'turndown-plugin-gfm'
import { PassThrough } from 'stream';
import toArray from 'stream-to-array';
import {JSDOM} from 'jsdom';

const DOC_URL = "https://docs.google.com/document/export?format=docx&id=";

async function exportDoc(id: string, path: string) {
    const url = DOC_URL + id;
    const pass = new PassThrough();
    // Get the docx file
    console.log("Fetching", url);
    let filename: string | undefined = await new Promise((resolve, reject) => {
        https.get(url, (response: any) => { 
            response.pipe(pass);
            pass.on('finish', () => {
                // Resolve the promise with the content-disposition header for the filename
                resolve(response.headers["content-disposition"]);
            });
            pass.on('error', (err) => {
                reject(err);
            });
        });
    });
    // Get the filename from the content-disposition header if available (should always be)
    filename = filename ? filename.split('"')[1] : id;
    // Convert the stream to a buffer
    const parts = await toArray(pass);
    const buffer = Buffer.concat(parts.map(part => Buffer.isBuffer(part) ? part : Buffer.from(part)));
    // Convert to html
    const conversion = await mammoth.convertToHtml({buffer: buffer});
    // Remove the non printing characters that docs code block adds
    let html = conversion.value.replace("", "").replace("", "");
    // Adjust tables
    html = table(html);
    //console.log(html);
    const fm = frontmatter(html);
    // Convert the html to markdown
    const turndown = new Turndown({headingStyle: "atx"}).use(plugin.gfm).addRule("break", {
        filter: ["br"],
        replacement: () => "<br />"
    });
    const markdown = fm.frontmatter + "\n" + turndown.turndown(fm.body);
    // Write the markdown to a file 
    const fullPath = path + "/" + filename.replace(".docx", ".md");
    fs.writeFileSync(fullPath, markdown);
    console.log("Markdown written to", fullPath);
}

// Make adjustments to a converted table html before converting to markdown
function table(html: string) {
    const dom = new JSDOM(html);
    const tables = dom.window.document.body.querySelectorAll("table");
    for (const table of tables) {
        const rewritten: string[] = [];
        const rows = table.querySelectorAll("tr");
        for (let i=0; i < rows.length; i++) {
            const row = rows[i];
            rewritten.push("<tr>");
            for (const cell of row.children) {
                // Remove paragraphs from the cell content
                rewritten.push(i ? "<td>" : "<th>");
                const content: string[] = []
                for (const p of cell.children) {
                    content.push(p.innerHTML);
                }
                // Break paragraphs with a <br>
                rewritten.push(content.join("<br>"));
                rewritten.push(i ? "</td>" : "</th>");
            }
            rewritten.push("</tr>");
        }
        table.innerHTML = rewritten.join("");        
    }
    return dom.window.document.body.innerHTML;
}

// Detect and handle front-matter before converting to markdown
function frontmatter(html: string) {
    const marker = /<p>---\s*<\/p>(.*)<p>---\s*<\/p>/gs;
    const match = marker.exec(html);
    if (match) {
        console.log("Front matter detected");
        const frontmatter = match[1]; 
        const dom = new JSDOM(frontmatter);
        const p = dom.window.document.body.querySelectorAll("p");
        const text = ["---"];
        for (const element of p) {
            text.push(element.textContent || "");
        }
        text.push("---");
        return {
            body: html.replace(marker, ""),
            frontmatter: text.join("\n")
        }
    }
    return {
        body: html,
        frontmatter: ""
    }
}

export { exportDoc }