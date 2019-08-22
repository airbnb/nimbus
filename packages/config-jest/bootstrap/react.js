// This file is ran AFTER all setup files have ran,
// but BEFORE tests are run. This hook is required
// when accessing the `expect` or `jest` globals.

const mockDataSerializer = require('../serializers/mockData');
const withStylesSerializer = require('../serializers/withStyles');

expect.addSnapshotSerializer(mockDataSerializer);
expect.addSnapshotSerializer(withStylesSerializer);
