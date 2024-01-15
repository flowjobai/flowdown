import { join } from "path";
import { cwd } from "process";
import { authenticate } from "@google-cloud/local-auth";
import { promises as fs } from "fs";

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/drive.readonly", "https://www.googleapis.com/auth/documents.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = join(cwd(), "token.json");
const CREDENTIALS_PATH = join(cwd(), "credentials.json");

const client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
});
if (client.credentials) {
    const credentials = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(credentials.toString());
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: "authorized_user",
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
    console.log("Token saved to", TOKEN_PATH);
} else {
    console.error("No credentials");
}
