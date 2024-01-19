import fs from 'fs';
import mammoth from 'mammoth';
import Turndown from 'turndown';
import plugin from 'turndown-plugin-gfm'
import { JSDOM } from 'jsdom';

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
    let filename = response.headers.has('content-disposition') ? response.headers.get('content-disposition')!.split('"')[1] : id;;
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
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

// Make adjustments to a table's html, making it frendly for turndown
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
                // Make the first row a header - turndown requires this
                rewritten.push(i ? "<td>" : "<th>");
                // Remove paragraphs from the cell content
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
            frontmatter: text.join("\n")
        }
    }
    return {
        body: html,
        frontmatter: ""
    }
}

export { exportDoc }