import StreamZip from 'node-stream-zip';
import { https } from 'follow-redirects';
import fs from 'fs';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;
import mammoth from 'mammoth';

const DOC_URL = "https://docs.google.com/document/export?format=docx&id=";

async function exportDoc(id: string, path: string) {
    const url = DOC_URL + id;
    const file = fs.createWriteStream(`${path}/${new Date().getTime()}.docx`);
    // Get the docx file
    console.log("Fetching", url);
    await new Promise((resolve, reject) => {
        https.get(url, (response: any) => { 
            response.pipe(file);
            file.on('finish', () => {
                resolve(null);
            });
            file.on('error', (err) => {
                reject(err);
            });
        });
    });
    file.close();  

    const html = await mammoth.convertToHtml({path: file.path.toString()});
    console.log(html)

    fs.rmSync(file.path.toString());

    // // Extract the html file from the zip
    // const zip = new StreamZip.async({ file: zipPath });
    // const entries = await zip.entries()
    // const html = Object.keys(entries).filter((entry) => { return entry.endsWith(".html") })[0];
    // await zip.extract(html, temp);
    // zip.close();
    // console.log('Extracted', temp + "/" + html);
    // // Convert to markdown
    // const content = fs.readFileSync(temp + "/" + html, 'utf8');
    // Cleanup
    //fs.rmdirSync(temp, { recursive: true });

}

function doc2md(doc: string) {
    const { document } = (new JSDOM(doc)).window;
    const impact = getImpact(document.querySelector("style")?.sheet?.cssRules);
    console.log(impact)

    const paragraphs = document.querySelector("body")?.children;
    for (const para of paragraphs!) {
        switch (para.tagName) {
            case "P":
                break;
            case "UL":
                break;
            case "OL":
                break;
            case "TABLE":
                break;
            default:    
                if (para.tagName.startsWith("H")) {

                }
        }
    }
}

function toText(el: Element) {
    const text = el.textContent;
    if (text) {
        return text;
    }
    return "";

}

function getImpact(styles: CSSRuleList | undefined) {
    const impacts = {};
    if (styles) {
        for (const style of styles) {
            const text = style.cssText;
            const impact = {
                bold: text.includes("700"),
                italic: text.includes("italic"),
                underline: text.includes("underline"),
                strike: text.includes("line-through")
            };
            if (text.startsWith(".c") && (impact.bold || impact.italic || impact.underline || impact.strike)) {
                impacts[text.split("{")[0].substring(1).trim()] = impact;
            }
        }
    }
    return impacts;
}

export { exportDoc, doc2md }