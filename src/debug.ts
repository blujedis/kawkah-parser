import * as parser from './parser';
import { IKawkahParserOptions } from './interfaces';

const options: IKawkahParserOptions = {
  allowCamelcase: false
};

let args = ['--deep-dish'];

const result = parser.parse(args, options);

console.log(result);