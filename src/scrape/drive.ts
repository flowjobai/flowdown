// https://drive.google.com/drive/folders/1aK91jp8954KOTOo5fJC4NUdwArqQyBvE
// https://docs.google.com/document/d/14u-UCYqiLMCdIvFAhlMqY0ExMFwFq1f6CvC0MGgQgQ8
// <title>Product Catalog – Google Drive</title>

// https://drive.google.com/uc?id=1I7KMarwMYnbBuWFAYkl4DoAogie5qYuq&export=download

const titleRegex = /<title>.* – Google Drive<\/title>/g;
const folderRegex = /https:\/\/drive\.google\.com\/drive\/folders\/[-_0-9a-zA-Z]{33}/g;
const docsRegex = /https:\/\/docs\.google\.com\/document\/d\/[-_0-9a-zA-Z]{44}/g;
const fileRegex = /https:\/\/drive\.google\.com\/file\/d\/[-_0-9a-zA-Z]{33}/g;

async function scrapeFolder(id: string) {
    const result = {
        id: id,
        title: "",
        folders: new Set<string>(),
        docs: new Set<string>(),
        files: new Set<string>(),
    };
    const url = "https://drive.google.com/drive/folders/" + id;
    console.log("Fetching", url);
    const res = await fetch(url);
    const body = await res.text();

    const title = [...body.matchAll(titleRegex)];
    result.title = title[0][0].replace("<title>", "").replace(" – Google Drive</title>", "").trim();
    const driveLinks = [...body.matchAll(folderRegex)];
    driveLinks.forEach((l) => result.folders.add(l[0]));
    const docLinks = [...body.matchAll(docsRegex)];
    docLinks.forEach((l) => result.docs.add(l[0]));
    const fileLinks = [...body.matchAll(fileRegex)];
    fileLinks.forEach((l) => result.files.add(l[0]));

    return result;
}

const res = await scrapeFolder("1aK91jp8954KOTOo5fJC4NUdwArqQyBvE");
console.log(res);

export {};
