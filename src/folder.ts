// https://drive.google.com/drive/folders/1aK91jp8954KOTOo5fJC4NUdwArqQyBvE
// https://docs.google.com/document/d/14u-UCYqiLMCdIvFAhlMqY0ExMFwFq1f6CvC0MGgQgQ8
// <title>Product Catalog – Google Drive</title>

// https://drive.google.com/uc?id=1I7KMarwMYnbBuWFAYkl4DoAogie5qYuq&export=download

const titleRegex = /<title>.* – Google Drive<\/title>/g;
const folderRegex = /https:\/\/drive\.google\.com\/drive\/folders\/[-_0-9a-zA-Z]{33}/g;
const docsRegex = /https:\/\/docs\.google\.com\/document\/d\/[-_0-9a-zA-Z]{44}/g;
const sheetsRegex = /https:\/\/docs\.google\.com\/spreadsheets\/d\/[-_0-9a-zA-Z]{44}/g;
const fileRegex = /https:\/\/drive\.google\.com\/file\/d\/[-_0-9a-zA-Z]{33}/g;

interface Folder {
    id: string;
    path: string;
    name: string | undefined;
    docs: string[];
    sheets: string[];
    files: string[];
};

const FOLDER_URL = "https://drive.google.com/drive/folders/";

/**
 * Get a folder and all of its children
 */
async function getFolders(id: string, path: string, folders: Folder[] = []) {
    const folder: Folder = {
        id: id,
        path,
        name: undefined,
        docs: [],
        sheets: [],
        files: [],
    };
    const url = FOLDER_URL + id;
    console.log("Fetching", id, path);
    const res = await fetch(url);
    if (res.status !== 200) {
        throw new Error(res.status + " " + res.statusText);
    }
    const body = await res.text();
    // Parse the body looking for the title and specific links
    const title = [...body.matchAll(titleRegex)];
    folder.name = title[0][0].replace("<title>", "").replace(" – Google Drive</title>", "").trim();
    // Get the links out of the body 
    folder.docs = getUrlIds(body, docsRegex);
    folder.sheets = getUrlIds(body, sheetsRegex);
    folder.files = getUrlIds(body, fileRegex);
    folders.push(folder);
    // Recursively fetch the children
    const folderIds = getUrlIds(body, folderRegex, id);
    for (const id of folderIds) {
        await getFolders(id, path + "/" + folder.name, folders);
    }
    return folders;
}

function getUrlIds(body: string, regex: RegExp, exclude?: string) {
    const ids = new Set<string>();
    const urlMatch = body.match(regex);
    if (urlMatch) {
        for (const url of urlMatch) {
            const id = url.split("/").pop();
            if (id && id !== exclude) {
                ids.add(id);
            }
        }
    }
    return [...ids.values()];
}

export { getFolders, type Folder };
