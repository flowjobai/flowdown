import { getFolders, exportFolders } from "../src/folder";
import { expect, test, mock } from "bun:test";
import pm from "picomatch";


const id = "1oWwQkdeDuzJthpUwjKNRu0tIn05CqI77";


// test("Flowdown folder", async () => {
//     const folders = await getFolders(id);
//     expect(folders).toBeDefined();
//     expect(folders.length).toBe(3);
//     expect(folders[0].id).toBe(id);
//     expect(folders[0].name).toBe("Flowdown");
//     expect(folders[0].docs.length).toBe(1);
//     expect(folders[0].sheets.length).toBe(0);
//     expect(folders[0].files.length).toBe(1);
//     expect(folders[1].name).toBe("content");
//     console.log(folders)
// });

test("Export folder", async () => {
    mock.module("fs", () => {
        return {
            mkdirSync: (path: string) => { 
                console.log("mkdirSync", path)
                return undefined 
            },
            writeFileSync: (path: string) => { 
                console.log("writeFileSync", path)
                return undefined 
            },
        };
    });
    

    const matcher = pm("**/*");
    const folders = await getFolders(id);
    exportFolders("flowdown-test", folders, matcher);
});