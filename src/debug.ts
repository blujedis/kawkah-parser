import * as parser from './parser';
import { IKawhakParserOptions } from './interfaces';

const options: IKawhakParserOptions = {
  allowCamelcase: false
};

let args = ['--deep-dish'];

const result = parser.parse(args, options);

console.log(result);