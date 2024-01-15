import { docs_v1 } from "googleapis";

/**
 * Convert a Google Docs document to markdown.
 *
 * Notes:
 *
 * - Headings are stripped of any formatting inline with markdown conventions
 * - Only one nesting level of lists is supported
 * - Where paragraphs are encounted in tables a <br> is inserted between them.
 *
 * See https://developers.google.com/docs/api/concepts/structure
 */

type Document = Pick<docs_v1.Schema$Document, "body" | "lists">;

function parse(doc: Document) {
    const builder: Record<"title" | "subtitle" | "body", string[]> = { title: [], subtitle: [], body: [] };
    // Convert the lists to a map of list id to markdown list type
    const lists = Object.entries(doc.lists || []).reduce(
        (acc, [id, list]) => {
            acc[id] = list.listProperties?.nestingLevels?.[0].glyphType ? "1." : "-";
            return acc;
        },
        {} as Record<string, string>,
    );
    // Loop through the elements in the body
    for (const element of doc.body?.content || []) {
        if (element.paragraph) {
            // Parse a paragraph
            paragraph(element.paragraph, lists, builder);
        } else if (element.table) {
            // Parse a table, tables can further unclude paragraphs
            const rows = table(element.table);
            builder.body.push(...rows);
        }
    }
    return {
        title: builder.title.join(""),
        subtitle: builder.subtitle.join(""),
        body: builder.body.join(""),
    };
}

// Parse a google docs "paragraph" element
function paragraph(para: docs_v1.Schema$Paragraph, lists: Record<string, string>, builder: Record<"title" | "subtitle" | "body", string[]>) {
    const style = para.paragraphStyle?.namedStyleType?.split("_");
    if (style) {
        switch (style[0]) {
            case "TITLE":
                builder.title.push(text(para.elements));
                break;
            case "SUBTITLE":
                builder.subtitle.push(text(para.elements));
                break;
            case "HEADING":
                builder.body.push("#".repeat(parseInt(style[1])) + " " + text(para.elements) + "\n");
                break;
            case "NORMAL":
                let run = elements(para.elements);
                if (para.bullet) {
                    const bullet = lists[para.bullet.listId || ""];
                    run = bullet + " " + run;
                }
                builder.body.push(run);
                break;
        }
    }
}

// Extract the text from a paragraph element
function text(elements: docs_v1.Schema$ParagraphElement[] = []) {
    return elements
        .map((e) => e.textRun?.content || "")
        .join("")
        .replace("\n", "");
}

// Parse the text runs in a paragraph
function elements(elements: docs_v1.Schema$ParagraphElement[] = []) {
    const md: string[] = [];
    // Loop through the paragraph elements
    for (const element of elements) {
        if (element.textRun) {
            const textRun = element.textRun;
            const content = textRun.content || "";
            if (textRun.textStyle?.bold) {
                md.push(`**${content}**`);
            } else if (textRun.textStyle?.italic) {
                md.push(`*${content}*`);
            } else if (textRun.textStyle?.strikethrough) {
                md.push(`~~${content}~~`);
            } else if (textRun.textStyle?.underline) {
                md.push(`<u>${content}</u>`);
            } else if (textRun.textStyle?.link) {
                md.push(`[${content}](${textRun.textStyle.link.url})`);
            } else {
                md.push(content || "");
            }
        }
    }
    return md.join("");
}

function table(table: docs_v1.Schema$Table) {
    const rows: string[] = [];
    for (const row of table.tableRows || []) {
        const cells: string[] = [];
        for (const cell of row.tableCells || []) {
            const paragraphs = cell.content?.map((c) => elements(c.paragraph?.elements).trim()) || [];
            // Filter out any blank lines and join the paragraphs with a <br>
            cells.push(paragraphs.filter((c) => c).join("<br />"));
        }
        rows.push("|" + cells.join("|") + "|");
        // Add the markdown table header row
        if (rows.length === 1) {
            rows.push("|" + cells.map(() => "---").join("|") + "|");
        }
    }
    return rows.map((row) => row + "\n");
}

export { parse };
