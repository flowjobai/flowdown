import credentials from "./token.json";
import { google } from "googleapis";

const authClient = google.auth.fromJSON(credentials);
const drive = google.drive({ version: 'v3', auth: authClient as any });
const docs = google.docs({ version: 'v1', auth: authClient as any });

// const filesResult = await drive.files.list({
//     q: "'1aK91jp8954KOTOo5fJC4NUdwArqQyBvE' in parents and trashed = false",
// });
// const files = filesResult.data.files;
// console.log(filesResult.data);

// const getResult = await driveClient.files.export({fileId: "1PwJhTLrHkvAK7iOnzX2NFYG49v5B5Izvjeksm6HYMtM", mimeType: "application/vnd.google-apps.document"});
//console.log(getResult);


const docsResult = await docs.documents.get({documentId: "1PwJhTLrHkvAK7iOnzX2NFYG49v5B5Izvjeksm6HYMtM"});
docsResult.data
console.log(JSON.stringify(docsResult.data.inlineObjects));


