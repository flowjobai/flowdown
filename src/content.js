import { join } from "path";
import { promises as fs } from "fs";
import { cwd } from "process";
import { google } from "googleapis";

const TOKEN_PATH = join(cwd(), "token.json");

const content = await fs.readFile(TOKEN_PATH);
const credentials = JSON.parse(content.toString());
const client = google.auth.fromJSON(credentials);

const drive = google.drive({ version: "v3", auth: client });
const res = await drive.files.list({
    pageSize: 10,
    fields: "nextPageToken, files(id, name)",
});
const files = res.data.files;
if (files.length === 0) {
    console.log("No files found.");
} else {
    console.log("Files:");
    files.map((file) => {
        console.log(`${file.name} (${file.id})`);
    });
}
