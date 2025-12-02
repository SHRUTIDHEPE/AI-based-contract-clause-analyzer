// server/src/aggregation/analysis/getClauseResults.pipeline.js
const { Types } = require("mongoose");

function getClauseResultsPipeline(analysisId, page = 1, limit = 10) {
  page = Math.max(parseInt(page, 10) || 1, 1);
  limit = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (page - 1) * limit;

  return [
    { $match: { _id: new Types.ObjectId(analysisId) } },
    { $unwind: "$results" },
    { $sort: { "results.clauseIndex": 1 } },
    {
      $facet: {
        docs: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
    {
      $project: {
        docs: 1,
        total: { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] },
      },
    },
  ];
}

module.exports = { getClauseResultsPipeline };
