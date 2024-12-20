module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['**/src/**/*'],
  moduleNameMapper: {
    '^axios$': 'axios/dist/node/axios.cjs'
  }
};
