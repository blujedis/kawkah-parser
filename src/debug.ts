import * as parser from './parser';
import { IKawkahParserOptions } from './types';

const options: IKawkahParserOptions = {
  allowCamelcase: false
};

const args = ['--deep-dish'];

const result = parser.parse(args, options);

console.log(result);