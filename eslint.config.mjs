import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  // {
  //   "env": {
  //     "node": true,
  //     "es2021": true
  //   },
  //   "parserOptions": {
  //     "ecmaVersion": 2021
  //   },
  //   "rules": {
  //     "no-undef": "error"
  //   }
  // }
];