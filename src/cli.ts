import { program } from "commander";

// https://github.com/SBoudrias/Inquirer.js

program
    .name('drivedown')
    .description('Use Google Drive as your CMS')
    .version('0.1.0');

program
    .option("-a --auth", "authenticate with Google Drive")
    .option("-c --cred <credentials.json>", "location of the credentials.json file");

program.parse();
