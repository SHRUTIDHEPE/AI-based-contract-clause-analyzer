import { computeClauseRisk, mapIndexToLabel } from "../services/analysis/riskEngine.js";

// Test the risk computation
console.log("Testing risk computation...");

// Test with a known label index
const testIndex = 12; // Should map to "Limitation of Liability"
const clauseType = mapIndexToLabel(testIndex);
console.log(`Index ${testIndex} maps to: "${clauseType}"`);

const testText = "This clause limits liability to $100,000.";
const confidence = 0.85;

const result = computeClauseRisk(clauseType, testText, confidence);
console.log("Risk result:", result);

console.log("Test completed.");
