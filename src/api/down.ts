import { list, getDocument, downloadFile } from "./drive";
import { parse } from "./doc2md";
import fs from "fs";
import path from "path";
import { Auth } from "googleapis";

async function download(folderId: string, dir: string) {
    const filePath = path.join(process.cwd(), "token.json");
    console.log("Reading token", filePath);
    const token = await fs.promises.readFile(filePath, "utf8");
    const auth = Auth.auth.fromJSON(JSON.parse(token) as any) as Auth.OAuth2Client;

    console.log("Enumerating folder", folderId);
    const files = await list(auth, folderId);
    for (const file of files) {
        // Convert a google doc to markdown
        if (file.type === "document") {
            const doc = await getDocument(auth, file.id);
            if (doc) {
                const markdown = parse(doc).body;
                const docPath = path.join(dir, file.path, file.name + ".md");
                console.log("Writing", docPath);
                await fs.promises.mkdir(path.dirname(docPath), { recursive: true });
                await fs.promises.writeFile(docPath, markdown);
            }
        }
        // Download a binary file (image, pdf) as is
        else if (file.type === "binary") {
            const filePath = path.join(dir, file.path, file.name);
            console.log("Writing", filePath);
            await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
            const writeStream = fs.createWriteStream(filePath);
            await downloadFile(auth, file.id, writeStream);
        }
    }
}

export { download };
