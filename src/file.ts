import fs from 'fs';

const DOWNLOAD_URL = "https://drive.google.com/uc?export=download&id=";

async function exportFile(id: string, path: string) {
    const url = DOWNLOAD_URL + id;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Unable to fetch ${url} - ${response.status}`);
    }    
    // Get the filename from the content-disposition header if available (should always be)
    let filename = response.headers.has('content-disposition') ? response.headers.get('content-disposition')!.split('"')[1] : id;;
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fullPath = path + "/" + filename;
    fs.writeFileSync(fullPath, buffer);
    console.log("File written to", fullPath);
}

export { exportFile };