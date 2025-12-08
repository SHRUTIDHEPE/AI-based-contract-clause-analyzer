import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { splitIntoClauses } from "../utils/clauseSplitter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const textPath = path.join(__dirname, "test-output/extracted-text.txt");

console.log(" Loading extracted text from:", textPath);

const text = fs.readFileSync(textPath, "utf8");

console.log(" Text length:", text.length);

const clauses = splitIntoClauses(text);

console.log(" Number of clauses:", clauses.length);

clauses.forEach((c, i) => {
  console.log(`\n----- CLAUSE ${i + 1} -----\n`);
  console.log(c.substring(0, 300)); // first 300 chars
});
