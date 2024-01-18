import { program } from "commander";
import { getFolder, Folder } from "./folder";
import fs from "fs";

// https://github.com/SBoudrias/Inquirer.js

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
process(root);

function process(folder: Folder) {
    // Process this folder
    console.log("Creating", folder.path)
    fs.mkdirSync(folder.path, { recursive: true });

    // Process any children
    if (folder.folders) {
        folder.folders.forEach((f) => process(f));
    }
}

