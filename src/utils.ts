import * as escape from 'escape-string-regexp';
import { isUndefined, isNumber } from 'chek';
import { IKawkahParserToTypes, IKawkahParserIsType } from './interfaces';
import { LIKE_BOOLEAN, LIKE_NUMBER, LIKE_HEX_NUMBER, FLAG_EXP, FLAG_SHORT, FLAG_COUNT, FLAG_DOT_NOTA, ARG_REQ, ARG_OPT, ARG_DOT_NOTA, NEGATE_CHAR, VARIADIC_CHAR, FLAG_EXP_ANY, ARG_OPT_ANY, ARG_REQ_ANY, DEFAULT_TYPE_VALUES } from './constants';
import { isNullOrUndefined } from 'util';

/**
 * Ensures a default value when current is undefined.
 *
 * @param val the current value.
 * @param def the default value.
 */
export function ensureDefault(val: any, def: any) {
  if ((isNullOrUndefined(val) || val === '') && !isUndefined(def))
    return def;
  return val;
}

/**
 * Checks if value is number like.
 *
 * @param val the value to inspect.
 */
export function isLikeNumber(val: any) {
  return LIKE_HEX_NUMBER.test(val) ||
    LIKE_NUMBER.test(val);
}

/**
 * Checks if a val is boolean like.
 *
 * @param val the value to inspect.
 */
export function isLikeBoolean(val: any) {
  return LIKE_BOOLEAN.test(val);
}

/**
 * Inspect variadic config value returning bool if truthy.
 *
 * @param val the value to check.
 */
export function isTruthyVariadic(val: any) {
  return isNumber(val) || val === true;
}

/**
 * Checks if object has own property key.
 *
 * @param obj the object the key belongs to.
 * @param key the key to inspect.
 */
export function hasOwn(obj: object, key: string | number) {
  return obj.hasOwnProperty(key);
}

export const toType: IKawkahParserToTypes = {

  /**
   * Converts type to string.
   *
   * @param val the value to convert.
   */
  string: (val: any) => {
    val = ensureDefault(val, DEFAULT_TYPE_VALUES.string);
    return String(val);
  },

  /**
   * Converts type to a boolean.
   *
   * @param val the value to convert.
   */
  boolean: (val: any) => {
    val = ensureDefault(val, DEFAULT_TYPE_VALUES.boolean);
    return Boolean(/^false$/i.test(val) ? false : val);
  },

  /**
   * Converts type to a number.
   *
   * @param val the value to convert.
   */
  number: (val: any) => {
    val = ensureDefault(val, DEFAULT_TYPE_VALUES.number);
    return Number(val);
  },

  /**
   * Converts type to an array.
   *
   * @param val the value to convert.
   */
  array: (val: any) => {
    val = ensureDefault(val, DEFAULT_TYPE_VALUES.array);
    if (!Array.isArray(val))
      val = [val];
    return val;
  }
};

export const isType: IKawkahParserIsType = {

  /**
   * Checks if is string
   *
   * @param val the value to inspect.
   */
  string: (val: any) => typeof val === 'string',

  /**
   * Checks if is a boolean.
   *
   * @param val the value to inspect.
   */
  boolean: (val: any) => typeof val === 'boolean',

  /**
   * Checks if is a number.
   *
   * @param val the value to inspect.
   */
  number: (val: any) => typeof val === 'number',

  /**
   * Checks if is an array.
   *
   * @param val the value to inspect.
   */
  array: (val: any) => Array.isArray(val)
};

/**
 * Checks if value is a flag option.
 *
 * @example --flag or -f
 *
 * @param val the value to inpsect.
 */
export function isFlag(val: any) {
  return FLAG_EXP.test(val);
}

/**
 * Checks globally if any in string is a flag expression.
 *
 * @param val the value to inspect.
 */
export function isFlagAny(val: any) {
  return FLAG_EXP_ANY.test(val);
}

/**
 * Checks if a flag option is of the short variety.
 *
 * @example -f
 *
 * @param val the value to inspect.
 */
export function isFlagShort(val: any) {
  return FLAG_SHORT.test(val);
}

/**
 * Checks if the previous argument is a flag option.
 *
 * @example ['--flag', '<arg>'] index = 1 >> true
 *
 * @param arr an array containing flag and/or argument options.
 * @param index the current index to inspect from.
 */
export function isFlagPrev(arr: string[], index: number) {
  arr = arr || [];
  return isFlag(arr[index - 1]);
}

/**
 * Checks if a flag option is of type count.
 *
 * @example -vvvvv >> true
 *
 * @param val the value to inspect.
 */
export function isFlagCount(val: any) {
  return FLAG_COUNT.test(val);
}

/**
 * Checks if argument array contains a flag option next.
 *
 * @example ['install', '--force'] index = 0 >> true
 *
 * @param arr an array containing flags or arguments.
 * @param index the current index to inspect from.
 */
export function isFlagNext(arr: string[], index: number) {
  arr = arr || [];
  return isFlag(arr[index + 1]);
}

/**
 * Check if a flag option contains dot notation.
 *
 * @example --config.cfg.c >> true
 *
 * @param val the value to inspect.
 */
export function isDotNotationFlag(val: any) {
  return FLAG_DOT_NOTA.test(val);
}

/**
 * Checks if an argument contains required tokens.
 *
 * @example <arg> >> true
 * @example [arg] >> false
 *
 * @param val the value to inspect.
 */
export function isArgRequired(val: any) {
  return ARG_REQ.test(val);
}

/**
 * Check if argument contains optional argument tokens.
 *
 * @example [arg] >> true
 * @example <arg> >> false
 *
 * @param val the value to be inspected.
 */
export function isArgOptional(val: any) {
  return ARG_OPT.test(val);
}

/**
 * Checks if a value contains arg tokens.
 *
 * @example <arg> >> true
 * @example [arg] >> true
 *
 * @param val the value to inspect.
 */
export function isArg(val: any) {
  return isArgOptional(val) || isArgRequired(val);
}

/**
 * Checks globally if any in string is an optional arg.
 *
 * @example 'some string [arg]' >> true
 *
 * @param val the value to inspect.
 */
export function isArgOptionalAny(val: any) {
  return ARG_OPT_ANY.test(val);
}

/**
 * Checks globally if any in string is a required arg.
 *
 * @example 'some string <arg>' >> true
 *
 * @param val the value to inspect.
 */
export function isArgRequiredAny(val: any) {
  return ARG_REQ_ANY.test(val);
}

/**
 * Checks globally if any in string is an arg expression.
 *
 * @example 'some string <arg>' >> true
 * @example 'other <arg> with string [arg]' >> true
 *
 * @param val the value to inspect.
 */
export function isArgAny(val: any) {
  return isArgOptionalAny(val) || isArgRequiredAny(val);
}

/**
 * Checks if argument contans dot notation.
 *
 * @example [arg.a] >> true
 *
 * @param val the value to inspect.
 */
export function isArgDotNotation(val: any) {
  return ARG_DOT_NOTA.test(val);
}

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
export function expandArgs(val: string | string[], match?: string[], safe?: string[]): string[] {

  if (Array.isArray(val))
    return (val as string[]).slice(0); // always slice to clone.

  match = match || ['"', "'"];
  safe = safe || ['[', ']', '<', '>'];

  function replacer(p, c) {
    p.a[p.a.length - 1] += c.replace(/\\(.)/, '$1');
  }

  const all = safe.concat(match);

  const result = (val as string).match(/\\?.|^$/g).reduce((p: any, c) => {

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

/**
 * Expands options arguments into multiple singular arguments.
 *
 * @example [-abc] becomes [-a, '-b', '-c']
 *
 * @param val the value to be expanded.
 * @param allowValues when true short flag groups can have values.
 */
export function expandOptions(val: string[], allowValues?: boolean) {
  val = val || [];
  let trail = [];
  return val.reduce(function (a, c) {
    if (!FLAG_SHORT.test(c) || FLAG_COUNT.test(c))
      return a.concat(c);
    const split = c.slice(1).split('').map(n => `-${n}`);
    if (allowValues)
      return a.concat(split);
    trail = trail.concat(split); // shift to end can't have values.
    return a;
  }, []).concat(trail);
}

/**
 * Checks if flag is that of negation.
 *
 * @example --no-force >> true
 * @example --force >> false
 *
 * @param val the value to inspect.
 * @param negate the negation char to check if exists.
 */
export function isNegateFlag(val: any, negate: string) {
  negate = escape(negate || NEGATE_CHAR);
  return (new RegExp('^--' + negate)).test(val);
}

/**
 * Checks if an argument contains variadic characters.
 *
 * @example [arg...] >> true
 *
 * @param val the value to be inspected.
 * @param variadic the variadic char to check if exists.
 */
export function isArgVariadic(val: any, variadic: string) {
  variadic = variadic || VARIADIC_CHAR;
  return isArg(val)
    && (val.endsWith(variadic + ']')
      || val.endsWith(variadic + '>'));
}

/**
 * Checks if an argument is variadic and also contains required tokens.
 *
 * @example <arg...> >> true
 *
 * @param val the value to inspect.
 * @param variadic the char representing variadic arguments.
 */
export function isArgVariadicRequired(val: any, variadic: string) {
  variadic = variadic || VARIADIC_CHAR;
  return isArgRequired(val) && val.endsWith(variadic + '>');
}

/**
 * Strips a flag of all tokens.
 *
 * @example --user.name >> user.name
 * @example --no-force >> force (removes negation also)
 *
 * @param val the value containing flag tokens to be stripped.
 * @param negate the negation char defined in options.
 */
export function stripFlag(val: any, negate: string) {
  negate = escape(negate || NEGATE_CHAR);
  return (val || '').replace(new RegExp('^--?(' + negate + ')?'), '');
}

/**
 * Strips all tokens from string.
 *
 * @example 'install <dir> [filename]' >> 'install dir filename'
 *
 * @param val the val containing tokens to be stripped.
 * @param negate the negation char used.
 * @param variadic the variadic char used.
 */
export function stripTokens(val: any, negate?: string, variadic?: string) {

  variadic = escape(variadic || VARIADIC_CHAR);
  negate = escape(negate || NEGATE_CHAR);

  const argExp =
    new RegExp(['<', '>', '\\[', '\\]'].join('|'), 'g');

  const noExp = new RegExp('^' + negate);
  const variExp = new RegExp(variadic + '$');

  return expandArgs(val)
    .map(v => {
      v = v
        .replace(FLAG_EXP, '')
        .replace(noExp, '')
        .replace(argExp, '')
        .replace(variExp, '');
      return v;
    }).join(' ');

}



