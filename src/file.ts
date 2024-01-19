import fs from "fs";

const DOWNLOAD_URL = "https://drive.google.com/uc?export=download&id=";

async function exportFile(id: string, path: string) {
    return downloadFile(DOWNLOAD_URL + id, path);
}

async function downloadFile(url: string, path: string) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Unable to fetch ${url} - ${response.status}`);
    }
    // Get the filename from the content-disposition header
    if (response.headers.has("content-disposition")) {
        const filename = response.headers.get("content-disposition")!.split('"')[1];
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fullPath = path + "/" + filename;
        fs.writeFileSync(fullPath, buffer);
        console.log("File written to", fullPath);
    } else {
        console.log("File has no name", url);
    }
}

export { exportFile, downloadFile };
