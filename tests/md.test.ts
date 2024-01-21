import { convert } from "../src/docs";
import * as fs from "fs";
import { expect, test } from "bun:test";



test("Simple convert", async () => {
    const buffer = fs.readFileSync("tests/README.docx");
    const html = await convert(buffer)
    expect(html.md).toBeDefined();
    console.log(html.md)
});