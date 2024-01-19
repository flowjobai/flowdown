import { program } from "commander";
import { getFolders, Folder } from "./folder";
import fs from "fs";
import { exportDoc } from "./docs";
import { exportSheet } from "./sheets";
import { exportFile } from "./file";

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
try {
    const folders = await getFolders(folderId, options.dir);
    for (const folder of folders) {
        const path = folder.path + "/" + folder.name;
        console.log("Processing", folder.id, path);
        // Process this folder
        fs.mkdirSync(path, { recursive: true });
        // Export any docs
        for (const id of folder.docs) {
            await exportDoc(id, path);
        }
        for (const id of folder.sheets) {
            await exportSheet(id, path);
        }
        for (const id of folder.files) {
            await exportFile(id, path);
        }
    }   
}
catch (e) {
    console.error("Error processing root folder", folderId, e.message);
}

