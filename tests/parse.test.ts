import doc from "./doc-table.json";
import { parse } from "../src/doc2md";

const parsed = parse(doc);
console.log(parsed);
console.log(parsed.body);