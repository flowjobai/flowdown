import { program } from "commander";
import { getFolders, Folder } from "./folder";
import fs from "fs";
import { exportDoc } from "./docs";
import { exportSheet } from "./sheets";
import { exportFile } from "./file";

program.name("flowdown").description("Use Google Drive as your CMS");

let folderId = "";

program
    .argument("<id>", "id of the root folder")
    .action((id) => (folderId = id))
    .option("-f --folder <string>", "export a specific folder")
    .option("-d --dir <string>", "the local export directory", "flowdown")
    .parse();

const options = program.opts();

console.log("Exporting folder", folderId);
try {
    fs.mkdirSync(options.dir, { recursive: true });
    const folders = await getFolders(folderId, "");
    for (const folder of folders) {
        console.log("Processing", folder.id);
        let path: string;
        if (folder.root) {
            path = options.dir;
        } else {
            path = [options.dir, folder.path, folder.name].filter((dir) => dir !== "").join("/");
        }
        if (options.folder == undefined || path.startsWith(options.dir + "/" + options.folder)) {
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
        } else {
            console.log("Excluding", folder.id);
        }
    }
} catch (e) {
    console.error("Error processing root folder", folderId, e.message);
}
