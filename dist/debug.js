"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser = require("./parser");
const options = {
    allowCamelcase: false
};
const args = ['--deep-dish'];
const result = parser.parse(args, options);
console.log(result);
//# sourceMappingURL=debug.js.map