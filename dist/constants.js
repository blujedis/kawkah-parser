"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TYPE_VALUES = exports.PARSER_DEFAULTS = exports.SUPPORTED_TYPES = exports.ABORT_CHAR = exports.VARIADIC_CHAR = exports.NEGATE_CHAR = exports.ARG_REQ_ANY = exports.ARG_OPT_ANY = exports.FLAG_EXP_ANY = exports.LIKE_HEX_NUMBER = exports.LIKE_NUMBER = exports.LIKE_BOOLEAN = exports.ARG_DOT_NOTA = exports.ARG_REQ = exports.ARG_OPT = exports.FLAG_COUNT = exports.FLAG_DOT_NOTA = exports.FLAG_SHORT = exports.FLAG_EXP = void 0;
exports.FLAG_EXP = /^--?/;
exports.FLAG_SHORT = /^-(?!-).+$/;
exports.FLAG_DOT_NOTA = /^--.+\./;
exports.FLAG_COUNT = /^-(.).*\1$/;
exports.ARG_OPT = /^\[.+\]$/;
exports.ARG_REQ = /^\<.+\>$/;
exports.ARG_DOT_NOTA = /(\[|<)\S+\.[^\.]\S+(\]|>)/g;
exports.LIKE_BOOLEAN = /^(true|false)$/;
exports.LIKE_NUMBER = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/;
exports.LIKE_HEX_NUMBER = /^0x[0-9a-f]+$/i;
exports.FLAG_EXP_ANY = /[^\S]--?\S/g;
exports.ARG_OPT_ANY = /\[.+\]/g;
exports.ARG_REQ_ANY = /\<.+\>/g;
exports.NEGATE_CHAR = 'no-';
exports.VARIADIC_CHAR = '...';
exports.ABORT_CHAR = '--';
exports.SUPPORTED_TYPES = ['string', 'boolean', 'number', 'array'];
exports.PARSER_DEFAULTS = {
    charVariadic: '...',
    charAbort: '--',
    charNegate: 'no-',
    allowParseBooleans: true,
    allowParseNumbers: true,
    allowCamelcase: true,
    allowShortExpand: true,
    allowShortValues: true,
    allowDuplicateOptions: true,
    allowDotNotation: true,
    allowBoolNegation: true,
    allowCountOptions: true,
    allowVariadics: true,
    allowAnonymous: true,
    allowAliases: true,
    allowExtendArgs: false,
    allowPlaceholderArgs: false,
    allowPlaceholderOptions: false,
    options: {},
    onParserError: null // custom error handler for error messages.
};
exports.DEFAULT_TYPE_VALUES = {
    string: '',
    array: [],
    boolean: false,
    number: null
};
//# sourceMappingURL=constants.js.map