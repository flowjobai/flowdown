import { list, getDocument } from "../src/drive";
import credentials from "./token.json";
import { Auth } from "googleapis";

const auth = Auth.auth.fromJSON(credentials) as Auth.OAuth2Client;

const files = await list(auth, "1aK91jp8954KOTOo5fJC4NUdwArqQyBvE");
console.log(files);

// const doc = await getDocument(auth, "1Za2oGOh2uW9Zk0u0oLlDxVawda5Dk_WeUyQOwWED-qE");
// console.log(JSON.stringify(doc));
