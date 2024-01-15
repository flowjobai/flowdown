import doc from "./doc.json";
import { parse } from "../src/api/doc2md";

const parsed = parse(doc);
// console.log(parsed);
console.log(parsed.body);