"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripTokens = exports.stripVariadic = exports.stripNegate = exports.stripFlag = exports.isArgVariadicRequired = exports.isArgVariadic = exports.isNegateFlag = exports.expandOptions = exports.expandArgs = exports.isArgDotNotation = exports.isArgAny = exports.isArgRequiredAny = exports.isArgOptionalAny = exports.isArg = exports.isArgOptional = exports.isArgRequired = exports.isDotNotationFlag = exports.isFlagNext = exports.isFlagCount = exports.isFlagPrev = exports.isFlagShort = exports.isFlagAny = exports.isFlag = exports.toCamelcase = exports.isType = exports.toType = exports.hasOwn = exports.isTruthyVariadic = exports.isLikeBoolean = exports.isLikeNumber = exports.ensureDefault = void 0;
const escape = require("escape-string-regexp");
const chek_1 = require("chek");
const constants_1 = require("./constants");
const util_1 = require("util");
/**
 * Ensures a default value when current is undefined.
 *
 * @param val the current value.
 * @param def the default value.
 */
function ensureDefault(val, def) {
    if ((util_1.isNullOrUndefined(val) || val === '') && !chek_1.isUndefined(def))
        return def;
    return val;
}
exports.ensureDefault = ensureDefault;
/**
 * Checks if value is number like.
 *
 * @param val the value to inspect.
 */
function isLikeNumber(val) {
    return constants_1.LIKE_HEX_NUMBER.test(val) ||
        constants_1.LIKE_NUMBER.test(val);
}
exports.isLikeNumber = isLikeNumber;
/**
 * Checks if a val is boolean like.
 *
 * @param val the value to inspect.
 */
function isLikeBoolean(val) {
    return constants_1.LIKE_BOOLEAN.test(val);
}
exports.isLikeBoolean = isLikeBoolean;
/**
 * Inspect variadic config value returning bool if truthy.
 *
 * @param val the value to check.
 */
function isTruthyVariadic(val) {
    return chek_1.isNumber(val) || val === true;
}
exports.isTruthyVariadic = isTruthyVariadic;
/**
 * Checks if object has own property key.
 *
 * @param obj the object the key belongs to.
 * @param key the key to inspect.
 */
function hasOwn(obj, key) {
    return obj.hasOwnProperty(key);
}
exports.hasOwn = hasOwn;
exports.toType = {
    /**
     * Converts type to string.
     *
     * @param val the value to convert.
     */
    string: (val) => {
        val = ensureDefault(val, constants_1.DEFAULT_TYPE_VALUES.string);
        return String(val);
    },
    /**
     * Converts type to a boolean.
     *
     * @param val the value to convert.
     */
    boolean: (val) => {
        val = ensureDefault(val, constants_1.DEFAULT_TYPE_VALUES.boolean);
        return Boolean(/^false$/i.test(val) ? false : val);
    },
    /**
     * Converts type to a number.
     *
     * @param val the value to convert.
     */
    number: (val) => {
        val = ensureDefault(val, constants_1.DEFAULT_TYPE_VALUES.number);
        return Number(val);
    },
    /**
     * Converts type to an array.
     *
     * @param val the value to convert.
     */
    array: (val) => {
        val = ensureDefault(val, constants_1.DEFAULT_TYPE_VALUES.array);
        if (!Array.isArray(val))
            val = [val];
        return val;
    }
};
exports.isType = {
    /**
     * Checks if is string
     *
     * @param val the value to inspect.
     */
    string: (val) => typeof val === 'string',
    /**
     * Checks if is a boolean.
     *
     * @param val the value to inspect.
     */
    boolean: (val) => typeof val === 'boolean',
    /**
     * Checks if is a number.
     *
     * @param val the value to inspect.
     */
    number: (val) => typeof val === 'number',
    /**
     * Checks if is an array.
     *
     * @param val the value to inspect.
     */
    array: (val) => Array.isArray(val)
};
/**
 * Camelize string, ignore dot notation strings when strict.
 *
 * @param val the value to camelize
 * @param strict when true dot notation values ignored.
 */
function toCamelcase(val, strict = true) {
    if (!strict || !/\S+\.[^\.]\S+/.test(val))
        return chek_1.camelcase(val);
    return val;
}
exports.toCamelcase = toCamelcase;
/**
 * Checks if value is a flag option.
 *
 * @example --flag or -f
 *
 * @param val the value to inpsect.
 */
function isFlag(val) {
    return constants_1.FLAG_EXP.test(val);
}
exports.isFlag = isFlag;
/**
 * Checks globally if any in string is a flag expression.
 *
 * @param val the value to inspect.
 */
function isFlagAny(val) {
    return constants_1.FLAG_EXP_ANY.test(val);
}
exports.isFlagAny = isFlagAny;
/**
 * Checks if a flag option is of the short variety.
 *
 * @example -f
 *
 * @param val the value to inspect.
 */
function isFlagShort(val) {
    return constants_1.FLAG_SHORT.test(val);
}
exports.isFlagShort = isFlagShort;
/**
 * Checks if the previous argument is a flag option.
 *
 * @example ['--flag', '<arg>'] index = 1 >> true
 *
 * @param arr an array containing flag and/or argument options.
 * @param index the current index to inspect from.
 */
function isFlagPrev(arr, index) {
    arr = arr || [];
    return isFlag(arr[index - 1]);
}
exports.isFlagPrev = isFlagPrev;
/**
 * Checks if a flag option is of type count.
 *
 * @example -vvvvv >> true
 *
 * @param val the value to inspect.
 */
function isFlagCount(val) {
    return constants_1.FLAG_COUNT.test(val);
}
exports.isFlagCount = isFlagCount;
/**
 * Checks if argument array contains a flag option next.
 *
 * @example ['install', '--force'] index = 0 >> true
 *
 * @param arr an array containing flags or arguments.
 * @param index the current index to inspect from.
 */
function isFlagNext(arr, index) {
    arr = arr || [];
    return isFlag(arr[index + 1]);
}
exports.isFlagNext = isFlagNext;
/**
 * Check if a flag option contains dot notation.
 *
 * @example --config.cfg.c >> true
 *
 * @param val the value to inspect.
 */
function isDotNotationFlag(val) {
    return constants_1.FLAG_DOT_NOTA.test(val);
}
exports.isDotNotationFlag = isDotNotationFlag;
/**
 * Checks if an argument contains required tokens.
 *
 * @example <arg> >> true
 * @example [arg] >> false
 *
 * @param val the value to inspect.
 */
function isArgRequired(val) {
    return constants_1.ARG_REQ.test(val);
}
exports.isArgRequired = isArgRequired;
/**
 * Check if argument contains optional argument tokens.
 *
 * @example [arg] >> true
 * @example <arg> >> false
 *
 * @param val the value to be inspected.
 */
function isArgOptional(val) {
    return constants_1.ARG_OPT.test(val);
}
exports.isArgOptional = isArgOptional;
/**
 * Checks if a value contains arg tokens.
 *
 * @example <arg> >> true
 * @example [arg] >> true
 *
 * @param val the value to inspect.
 */
function isArg(val) {
    return isArgOptional(val) || isArgRequired(val);
}
exports.isArg = isArg;
/**
 * Checks globally if any in string is an optional arg.
 *
 * @example 'some string [arg]' >> true
 *
 * @param val the value to inspect.
 */
function isArgOptionalAny(val) {
    return constants_1.ARG_OPT_ANY.test(val);
}
exports.isArgOptionalAny = isArgOptionalAny;
/**
 * Checks globally if any in string is a required arg.
 *
 * @example 'some string <arg>' >> true
 *
 * @param val the value to inspect.
 */
function isArgRequiredAny(val) {
    return constants_1.ARG_REQ_ANY.test(val);
}
exports.isArgRequiredAny = isArgRequiredAny;
/**
 * Checks globally if any in string is an arg expression.
 *
 * @example 'some string <arg>' >> true
 * @example 'other <arg> with string [arg]' >> true
 *
 * @param val the value to inspect.
 */
function isArgAny(val) {
    return isArgOptionalAny(val) || isArgRequiredAny(val);
}
exports.isArgAny = isArgAny;
/**
 * Checks if argument contans dot notation.
 *
 * @example [arg.a] >> true
 *
 * @param val the value to inspect.
 */
function isArgDotNotation(val) {
    return constants_1.ARG_DOT_NOTA.test(val);
}
exports.isArgDotNotation = isArgDotNotation;
/**
 * Expand argument string into an array respecting space between special characters.
 *
 * NOTE: use \\ to escape inner quotes.
 *
 * @example 'install --dir "/some/path" -f' >> ['install', '--dir', '/some/path', '-f']
 *
 * @param val the arg string to split to array.
 * @param match chars when matched ignore spaces withing these chars.
 * @param safe same as match except these chars will be included in result.
 */
function expandArgs(val, match, safe) {
    if (Array.isArray(val))
        return val.slice(0); // always slice to clone.
    match = match || ['"', "'"];
    safe = safe || ['[', ']', '<', '>'];
    function replacer(p, c) {
        p.a[p.a.length - 1] += c.replace(/\\(.)/, '$1');
    }
    const all = safe.concat(match);
    const result = val.match(/\\?.|^$/g).reduce((p, c) => {
        if (~all.indexOf(c)) {
            p.quote ^= 1;
            if (~safe.indexOf(c))
                replacer(p, c);
        }
        else if (!p.quote && c === ' ')
            p.a.push('');
        else
            replacer(p, c);
        return p;
    }, { a: [''], e: false }).a;
    return result;
}
exports.expandArgs = expandArgs;
/**
 * Expands options arguments into multiple singular arguments.
 *
 * @example [-abc] becomes [-a, '-b', '-c']
 *
 * @param val the value to be expanded.
 * @param allowValues when true short flag groups can have values.
 */
function expandOptions(val, allowValues) {
    val = val || [];
    let trail = [];
    return val.reduce(function (a, c) {
        if (!constants_1.FLAG_SHORT.test(c) || constants_1.FLAG_COUNT.test(c))
            return a.concat(c);
        const split = c.slice(1).split('').map(n => `-${n}`);
        if (allowValues)
            return a.concat(split);
        trail = trail.concat(split); // shift to end can't have values.
        return a;
    }, []).concat(trail);
}
exports.expandOptions = expandOptions;
/**
 * Checks if flag is that of negation.
 *
 * @example --no-force >> true
 * @example --force >> false
 *
 * @param val the value to inspect.
 * @param negate the negation char to check if exists.
 */
function isNegateFlag(val, negate) {
    negate = escape(negate || constants_1.NEGATE_CHAR);
    return (new RegExp('^--' + negate)).test(val);
}
exports.isNegateFlag = isNegateFlag;
/**
 * Checks if an argument contains variadic characters.
 *
 * @example [arg...] >> true
 *
 * @param val the value to be inspected.
 * @param variadic the variadic char to check if exists.
 */
function isArgVariadic(val, variadic) {
    variadic = variadic || constants_1.VARIADIC_CHAR;
    return isArg(val)
        && (val.endsWith(variadic + ']')
            || val.endsWith(variadic + '>'));
}
exports.isArgVariadic = isArgVariadic;
/**
 * Checks if an argument is variadic and also contains required tokens.
 *
 * @example <arg...> >> true
 *
 * @param val the value to inspect.
 * @param variadic the char representing variadic arguments.
 */
function isArgVariadicRequired(val, variadic) {
    variadic = variadic || constants_1.VARIADIC_CHAR;
    return isArgRequired(val) && val.endsWith(variadic + '>');
}
exports.isArgVariadicRequired = isArgVariadicRequired;
/**
 * Strips a flag of all tokens.
 *
 * @example --user.name >> user.name
 * @example --no-force >> force (removes negation also)
 *
 * @param val the value containing flag tokens to be stripped.
 * @param negate the negation char defined in options.
 */
function stripFlag(val, negate) {
    negate = escape(negate || constants_1.NEGATE_CHAR);
    return (val || '').replace(new RegExp('^--?(' + negate + ')?'), '');
}
exports.stripFlag = stripFlag;
/**
 * Strips negate chars from flag.
 *
 * @param val the value to be stripped.
 * @param negate the characters denoting negate.
 */
function stripNegate(val, negate) {
    negate = escape(negate || constants_1.NEGATE_CHAR);
    const exp = new RegExp('^' + negate);
    return val.replace(exp, '');
}
exports.stripNegate = stripNegate;
/**
 * Strips variadic chars from flag.
 *
 * @param val the value to be stripped.
 * @param negate the characters denoting variadic.
 */
function stripVariadic(val, variadic) {
    variadic = escape(variadic || constants_1.VARIADIC_CHAR);
    const exp = new RegExp(variadic + '$');
    return val.replace(exp, '');
}
exports.stripVariadic = stripVariadic;
/**
 * Strips all tokens from string.
 *
 * @example 'install <dir> [filename]' >> 'install dir filename'
 *
 * @param val the val containing tokens to be stripped.
 * @param negate the negation char used.
 * @param variadic the variadic char used.
 */
function stripTokens(val, negate, variadic) {
    variadic = escape(variadic || constants_1.VARIADIC_CHAR);
    negate = escape(negate || constants_1.NEGATE_CHAR);
    const argExp = new RegExp(['<', '>', '\\[', '\\]'].join('|'), 'g');
    const noExp = new RegExp('^' + negate);
    const variExp = new RegExp(variadic + '$');
    return expandArgs(val)
        .map(v => {
        v = v
            .replace(constants_1.FLAG_EXP, '')
            .replace(noExp, '')
            .replace(argExp, '')
            .replace(variExp, '');
        return v;
    }).join(' ');
}
exports.stripTokens = stripTokens;
//# sourceMappingURL=utils.js.map