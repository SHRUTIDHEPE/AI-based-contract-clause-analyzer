// --------------------------------------------------------------
// Risk Rules — Matches Python Training Script & predictor.py
// --------------------------------------------------------------

export const HIGH_RISK_TYPES = new Set([
  "Uncapped Liability",
  "Indemnification",
  "Non_Compete",
  "Termination",
  "Termination For Convenience",
  "Ip Ownership Assignment",
  "Unlimited/All-You-Can-Eat-License",
  "Change Of Control",
  "Liquidated Damages"
]);

export const MEDIUM_RISK_TYPES = new Set([
  "Cap On Liability",
  "Confidentiality",
  "Payment Terms",
  "payment_terms",
  "Governing Law",
  "Warranty Duration",
  "Exclusivity",
  "License Grant",
  "Irrevocable Or Perpetual License",
  "Severability",
  "Representations"
]);

export const LOW_RISK_TYPES = new Set([
  "Headings",
  "WHEREAS",
  "NOW",
  "Document Name",
  "Parties",
  "Definitions",
  "Entire",
  "Miscellaneous",
  "Counterparts"
]);

export const RISKY_KEYWORDS = [
  "unlimited",
  "uncapped",
  "perpetual",
  "irrevocable",
  "sole discretion",
  "waive",
  "waiver",
  "indemnify",
  "indemnification",
  "no liability",
  "hold harmless"
];
