import { IKawhakParserOptions } from './interfaces';

export const FLAG_EXP = /^--?/;
export const FLAG_SHORT = /^-(?!-).+$/;
export const FLAG_DOT_NOTA = /^--.+\./;
export const FLAG_COUNT = /^-(.).*\1$/;
export const ARG_OPT = /^\[.+\]$/;
export const ARG_REQ = /^\<.+\>$/;
export const ARG_DOT_NOTA = /(\[|<)\S+\.[^\.]\S+(\]|>)/g;
export const LIKE_BOOLEAN = /^(true|false)$/;
export const LIKE_NUMBER = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/;
export const LIKE_HEX_NUMBER = /^0x[0-9a-f]+$/i;

export const FLAG_EXP_ANY = /[^\S]--?\S/g;
export const ARG_OPT_ANY = /\[.+\]/g;
export const ARG_REQ_ANY = /\<.+\>/g;

export const NEGATE_CHAR = 'no-';
export const VARIADIC_CHAR = '...';
export const ABORT_CHAR = '--';
export const SUPPORTED_TYPES = ['string', 'boolean', 'number', 'array'];

export const PARSER_DEFAULTS: IKawhakParserOptions = {

  charVariadic: '...',                 // char denoting variadic argument.
  charAbort: '--',                     // when seen all args/opts after are ignored.
  charNegate: 'no-',                   // the char to use to negate boolean flags.

  allowParseBooleans: true,            // allows auto parsing booleans.
  allowParseNumbers: true,             // allows auto parsing numbers.
  allowCamelcase: true,                 // when true camelcase is used.
  allowShortExpand: true,              // converts -abc to -a, -b, -c.
  allowShortValues: true,              // when true "-f val" allowed otherwise is boolean.
  allowDuplicateOptions: true,         // allows -x 10 -x 20 to become x: [ 10, 20 ]
  allowDotNotation: true,              // allows user.name >> user: { name: value }
  allowBoolNegation: true,             // allows --no-force to set force flag as false.
  allowCountOptions: true,             // allows for -vvvvv to become { v: 5 }
  allowVariadics: true,                // allows arg1... arg2 arg3 >> [arg1, arg2, arg3]
  allowAnonymous: true,                // when true non configured args are allowed.

  allowAliases: true,                  // extend object with known aliases.
  allowExtendArgs: false,              // when true config'd index args added to result.
  allowPlaceholderArgs: false,         // when true indexed args set to null if undefined.
  allowPlaceholderOptions: false,      // when true options set to default if missing.

  options: {},                         // options for simple type checking.
  onParserError: null                   // custom error handler for error messages.

};

export const DEFAULT_TYPE_VALUES = {
  string: '',
  array: [],
  boolean: false,
  number: null
};
