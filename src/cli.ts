import { program } from "commander";
import { getFolder, Folder } from "./folder";
import fs from "fs";
import { exportDoc } from "./docs";

program
    .name('flowdown')
    .description('Use Google Drive as your CMS')

let folderId = "";    

program
    .argument('<id>', 'id of the root folder')
    .action((id) => folderId = id)
    .option("-f --folder <string>", "limit the export to a specific folder")
    .option("-d --dir <string>", "specify the name of the local export directory", "flowdown")
    .parse();

const options = program.opts();

console.log("Processing root folder", folderId);
const root = await getFolder(folderId, options.dir);
await process(root);

async function process(folder: Folder) {
    // Process this folder
    fs.mkdirSync(folder.path, { recursive: true });
    // Export any docs
    for (const id of folder.docs) {
        await exportDoc(id, folder.path);
    }
    // Process any children
    if (folder.folders) {
        folder.folders.forEach((f) => process(f));
    }
}

