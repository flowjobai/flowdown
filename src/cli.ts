import { program } from "commander";
import { getFolders, exportFolders } from "./folder";
import pm from "picomatch";

/**
 * The main entry point for the CLI
 */

program.name("flowdown").description("Use Google Drive as your CMS");

let folderId = "";
let glob = "";

program
    .argument("<id>", "id of the root folder")
    .argument("[pattern]", "an optional glob pattern to match files to export", "**/*")
    .action((id, pattern) => {
        folderId = id;
        glob = pattern;
    })
    .option("-d --dir <string>", "the local export directory", "flowdown")
    .parse();

const { dir } = program.opts();
const matcher = pm(glob);

console.log("Exporting folder", folderId);
try {
    const folders = await getFolders(folderId);
    exportFolders(dir, folders, matcher);
} catch (e: any) {
    console.error("Error processing root folder", folderId, e.message);
}
