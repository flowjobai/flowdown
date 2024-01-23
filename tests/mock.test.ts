import { expect, test, mock } from "bun:test";
import fs from "fs";

mock.module("fs", () => {
    console.log("Mocking")
    return {
        mkdirSync: (path: string) => { 
            console.log("mkdirSync", path);
            return "mocked";
        }
    };
});
console.log("Mocked fs")

test("Mkdir", async () => {
    const dir = fs.mkdirSync("mock-dir", { recursive: true });
    expect(dir).toBe("mocked");
});