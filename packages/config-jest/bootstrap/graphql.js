// Register custom serializer when using GraphQL
try {
  require('graphql');

  expect.addSnapshotSerializer(require('../serializers/graphql'));
} catch (error) {
  // Ignore
}
