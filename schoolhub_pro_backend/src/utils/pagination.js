// Pagination utility for MongoDB queries

const paginate = async (Model, query = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    populate = [],
    select = ''
  } = options;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  let queryBuilder = Model.find(query);

  if (select) {
    queryBuilder = queryBuilder.select(select);
  }

  if (populate.length > 0) {
    populate.forEach(p => {
      queryBuilder = queryBuilder.populate(p);
    });
  }

  const [data, total] = await Promise.all([
    queryBuilder
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Model.countDocuments(query)
  ]);

  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
      hasMore: skip + data.length < total
    }
  };
};

module.exports = paginate;
