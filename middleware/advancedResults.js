const { formatMongoData } = require("../utils/dbHelper");
const ErrorResponse = require("../utils/errorResponse");

const advancedResults = (model, populate) => async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ["select", "sort", "page", "limit", "populate"];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in|nin|eq|ne|regex)\b/g,
      (match) => `$${match}`
    );

    // Parse the query string
    const parsedQuery = JSON.parse(queryStr);

    // Initial query
    let query = model.find(parsedQuery);

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1); // Ensure minimum page is 1
    const limit = Math.min(parseInt(req.query.limit, 10) || 25, 100); // Cap maximum limit
    const startIndex = (page - 1) * limit;
    
    // Get total count before pagination
    const total = await model.countDocuments(parsedQuery);

    // Apply pagination
    query = query.skip(startIndex).limit(limit);

    // Handle population
    if (populate) {
      if (typeof populate === 'string') {
        query = query.populate(populate);
      } else if (Array.isArray(populate)) {
        populate.forEach(pop => {
          query = query.populate(pop);
        });
      } else {
        query = query.populate(populate);
      }
    }

    // Execute query
    const results = await query;

    // Pagination metadata
    const pagination = {
      current: page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    if (page < Math.ceil(total / limit)) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (page > 1) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.advancedResults = {
      success: true,
      count: results.length,
      pagination,
      data: formatMongoData(results)
    };

    next();
  } catch (err) {
    next(new ErrorResponse('Error processing query', 500));
  }
};

module.exports = advancedResults;
