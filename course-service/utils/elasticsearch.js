const { Client } = require("@elastic/elasticsearch");

const elasticClient = new Client({
  node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
});

const initElasticsearch = async () => {
  try {
    const indexExists = await elasticClient.indices.exists({
      index: "courses",
    });

    if (!indexExists) {
      await elasticClient.indices.create({
        index: "courses",
        body: {
          mappings: {
            properties: {
              course_id: { type: "keyword" },
              title: {
                type: "text",
                analyzer: "standard",
              },
              description: {
                type: "text",
                analyzer: "standard",
              },
              category: {
                type: "text",
                analyzer: "standard",
              },
              instructor: {
                type: "text",
                analyzer: "standard",
              },
              duration: { type: "integer" },
              price: { type: "float" },
              rating: { type: "float" },
              students_enrolled: { type: "integer" },
            },
          },
        },
      });
      console.log("Elasticsearch index created");
    }
  } catch (error) {
    console.error("Elasticsearch initialization error:", error);
  }
};

const indexCourse = async (course) => {
  try {
    await elasticClient.index({
      index: "courses",
      id: course.course_id,
      body: course,
    });
  } catch (error) {
    console.error("Error indexing course:", error);
  }
};

const searchCourses = async (query, filters = {}) => {
  try {
    const { category, instructor, minRating, maxDuration } = filters;

    let mustQueries = [];

    if (query) {
      mustQueries.push({
        multi_match: {
          query: query,
          fields: ["title", "description", "category", "instructor"],
          fuzziness: "AUTO",
        },
      });
    }

    let filterQueries = [];

    if (category) {
      filterQueries.push({ term: { "category.keyword": category } });
    }

    if (instructor) {
      filterQueries.push({
        wildcard: {
          "instructor.keyword": `*${instructor}*`,
        },
      });
    }

    if (minRating) {
      filterQueries.push({
        range: { rating: { gte: parseFloat(minRating) } },
      });
    }

    if (maxDuration) {
      filterQueries.push({
        range: { duration: { lte: parseInt(maxDuration) } },
      });
    }

    const searchBody = {
      query: {
        bool: {},
      },
    };

    if (mustQueries.length > 0) {
      searchBody.query.bool.must = mustQueries;
    }

    if (filterQueries.length > 0) {
      searchBody.query.bool.filter = filterQueries;
    }

    if (mustQueries.length === 0 && filterQueries.length === 0) {
      searchBody.query = { match_all: {} };
    }

    const result = await elasticClient.search({
      index: "courses",
      body: searchBody,
      size: 50,
    });

    return result.body.hits.hits.map((hit) => ({
      ...hit._source,
      _score: hit._score,
    }));
  } catch (error) {
    console.error("Elasticsearch search error:", error);
    throw error;
  }
};

module.exports = {
  elasticClient,
  initElasticsearch,
  indexCourse,
  searchCourses,
};
