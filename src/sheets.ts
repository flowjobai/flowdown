import { downloadFile } from './file';

const SHEETS_URL = "https://docs.google.com/spreadsheets/d/${id}/export?format=csv&id=${id}&gid=0";

async function exportSheet(id: string, path: string) {
    const url = SHEETS_URL.replace(/\${id}/g, id);
    return downloadFile(url, path);
}

export { exportSheet };
