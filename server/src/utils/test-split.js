import fs from "fs";
import path from "path";
import { splitIntoClauses } from "./clauseSplitter.js";

const textPath = path.join(process.cwd(), "src/utils/test-output/extracted-text.txt");

console.log("🔍 Loading extracted text from:", textPath);

const text = fs.readFileSync(textPath, "utf8");

console.log("📄 Text length:", text.length);

const clauses = splitIntoClauses(text);

console.log("📝 Number of clauses:", clauses.length);

clauses.forEach((c, i) => {
  console.log(`\n----- CLAUSE ${i + 1} -----\n`);
  console.log(c.substring(0, 300)); // first 300 chars
});
