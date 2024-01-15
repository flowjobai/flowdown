import { list, getDocument } from "../src/api/drive";
import credentials from "./token.json";
import { Auth } from "googleapis";

const auth = Auth.auth.fromJSON(credentials) as Auth.OAuth2Client;

// const files = await list(auth, "1aK91jp8954KOTOo5fJC4NUdwArqQyBvE");
// console.log(files);

const doc = await getDocument(auth, "14u-UCYqiLMCdIvFAhlMqY0ExMFwFq1f6CvC0MGgQgQ8");
console.log(JSON.stringify(doc));
