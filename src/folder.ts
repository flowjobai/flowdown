// https://drive.google.com/drive/folders/1aK91jp8954KOTOo5fJC4NUdwArqQyBvE
// https://docs.google.com/document/d/14u-UCYqiLMCdIvFAhlMqY0ExMFwFq1f6CvC0MGgQgQ8
// <title>Product Catalog – Google Drive</title>

// https://drive.google.com/uc?id=1I7KMarwMYnbBuWFAYkl4DoAogie5qYuq&export=download

const titleRegex = /<title>.* – Google Drive<\/title>/g;
const folderRegex = /https:\/\/drive\.google\.com\/drive\/folders\/[-_0-9a-zA-Z]{33}/g;
const docsRegex = /https:\/\/docs\.google\.com\/document\/d\/[-_0-9a-zA-Z]{44}/g;
const fileRegex = /https:\/\/drive\.google\.com\/file\/d\/[-_0-9a-zA-Z]{33}/g;

interface Folder {
    id: string;
    path: string;
    name: string | undefined;
    docs: Set<string>;
    files: Set<string>;
    folders: Folder[];
};

const FOLDER_URL = "https://drive.google.com/drive/folders/";

async function getFolder(id: string, path: string, depth = 0) {
    const result: Folder = {
        id: id,
        name: undefined,
        docs: new Set<string>(),
        files: new Set<string>(),
        folders: [] as Folder[],
        path
    };
    const url = FOLDER_URL + id;
    console.log("Fetching", url);
    const res = await fetch(url);
    const body = await res.text();
    // Parse the body looking for the title and specific links
    const title = [...body.matchAll(titleRegex)];
    result.name = title[0][0].replace("<title>", "").replace(" – Google Drive</title>", "").trim();
    const folderLinks = new Set([...body.matchAll(folderRegex)].filter((l) => l[0] !== url).map((l) => l[0]));
    const docLinks = [...body.matchAll(docsRegex)];
    docLinks.forEach((l) => result.docs.add(l[0]));
    const fileLinks = [...body.matchAll(fileRegex)];
    fileLinks.forEach((l) => result.files.add(l[0]));

    // Recursively fetch the children
    for (const folder of folderLinks) {
        const childPath = depth ? path + "/" + result.name : result.path;
        const child = await getFolder(folder.replace(FOLDER_URL, ""), childPath, depth + 1);
        result.folders.push(child);
    }

    return result;
}

export { getFolder, type Folder };
