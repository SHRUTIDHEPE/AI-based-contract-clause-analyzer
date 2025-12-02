// server/src/utils/pagination.js
//pagination helper
function buildPagination(items, { page = 1, limit = 10 }) {
  page = Math.max(parseInt(page, 10) || 1, 1);
  limit = Math.max(parseInt(limit, 10) || 10, 1);

  const total = items.length;
  const start = (page - 1) * limit;
  const end = start + limit;

  const docs = items.slice(start, end);
  const totalPages = Math.ceil(total / limit);

  return {
    docs,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
}

module.exports = { buildPagination };
