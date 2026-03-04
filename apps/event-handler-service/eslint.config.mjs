const baseConfig = require("@repo/eslint-config/base");

module.exports = {
  ...baseConfig,
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
};
