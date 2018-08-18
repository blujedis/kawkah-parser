"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser = require("./parser");
var options = {
    allowCamelcase: false
};
var args = ['--deep-dish'];
var result = parser.parse(args, options);
console.log(result);
//# sourceMappingURL=debug.js.map