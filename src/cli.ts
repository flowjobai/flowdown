import { program } from "commander";

program
    .name('drivedown')
    .description('Use Google Drive as your CMS')
    .version('0.1.0');

program
    .option("-a --auth", "Authenticate with Google Drive")
    .option("-c --cred <credentials.json>", "Location of the credentials.json file");

program.parse();
