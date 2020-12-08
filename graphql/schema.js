const { buildSchema } = require("graphql");

/**
 * In GraphQL, type defines the query and schema defines the return type
 */
module.exports = buildSchema(`
    type TestData {
        text: String!
        views: Int!
    }

    type RootQuery {
        hello: TestData!
    }

    schema {
        query: RootQuery
    }
`);
