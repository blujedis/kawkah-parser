import { IKawkahParserToTypes, IKawkahParserIsType } from './interfaces';
/**
 * Ensures a default value when current is undefined.
 *
 * @param val the current value.
 * @param def the default value.
 */
export declare function ensureDefault(val: any, def: any): any;
/**
 * Checks if value is number like.
 *
 * @param val the value to inspect.
 */
export declare function isLikeNumber(val: any): boolean;
/**
 * Checks if a val is boolean like.
 *
 * @param val the value to inspect.
 */
export declare function isLikeBoolean(val: any): boolean;
/**
 * Inspect variadic config value returning bool if truthy.
 *
 * @param val the value to check.
 */
export declare function isTruthyVariadic(val: any): boolean;
/**
 * Checks if object has own property key.
 *
 * @param obj the object the key belongs to.
 * @param key the key to inspect.
 */
export declare function hasOwn(obj: object, key: string | number): boolean;
export declare const toType: IKawkahParserToTypes;
export declare const isType: IKawkahParserIsType;
/**
 * Camelize string, ignore dot notation strings when strict.
 *
 * @param val the value to camelize
 * @param strict when true dot notation values ignored.
 */
export declare function toCamelcase(val: string, strict?: boolean): string;
/**
 * Checks if value is a flag option.
 *
 * @example --flag or -f
 *
 * @param val the value to inpsect.
 */
export declare function isFlag(val: any): boolean;
/**
 * Checks globally if any in string is a flag expression.
 *
 * @param val the value to inspect.
 */
export declare function isFlagAny(val: any): boolean;
/**
 * Checks if a flag option is of the short variety.
 *
 * @example -f
 *
 * @param val the value to inspect.
 */
export declare function isFlagShort(val: any): boolean;
/**
 * Checks if the previous argument is a flag option.
 *
 * @example ['--flag', '<arg>'] index = 1 >> true
 *
 * @param arr an array containing flag and/or argument options.
 * @param index the current index to inspect from.
 */
export declare function isFlagPrev(arr: string[], index: number): boolean;
/**
 * Checks if a flag option is of type count.
 *
 * @example -vvvvv >> true
 *
 * @param val the value to inspect.
 */
export declare function isFlagCount(val: any): boolean;
/**
 * Checks if argument array contains a flag option next.
 *
 * @example ['install', '--force'] index = 0 >> true
 *
 * @param arr an array containing flags or arguments.
 * @param index the current index to inspect from.
 */
export declare function isFlagNext(arr: string[], index: number): boolean;
/**
 * Check if a flag option contains dot notation.
 *
 * @example --config.cfg.c >> true
 *
 * @param val the value to inspect.
 */
export declare function isDotNotationFlag(val: any): boolean;
/**
 * Checks if an argument contains required tokens.
 *
 * @example <arg> >> true
 * @example [arg] >> false
 *
 * @param val the value to inspect.
 */
export declare function isArgRequired(val: any): boolean;
/**
 * Check if argument contains optional argument tokens.
 *
 * @example [arg] >> true
 * @example <arg> >> false
 *
 * @param val the value to be inspected.
 */
export declare function isArgOptional(val: any): boolean;
/**
 * Checks if a value contains arg tokens.
 *
 * @example <arg> >> true
 * @example [arg] >> true
 *
 * @param val the value to inspect.
 */
export declare function isArg(val: any): boolean;
/**
 * Checks globally if any in string is an optional arg.
 *
 * @example 'some string [arg]' >> true
 *
 * @param val the value to inspect.
 */
export declare function isArgOptionalAny(val: any): boolean;
/**
 * Checks globally if any in string is a required arg.
 *
 * @example 'some string <arg>' >> true
 *
 * @param val the value to inspect.
 */
export declare function isArgRequiredAny(val: any): boolean;
/**
 * Checks globally if any in string is an arg expression.
 *
 * @example 'some string <arg>' >> true
 * @example 'other <arg> with string [arg]' >> true
 *
 * @param val the value to inspect.
 */
export declare function isArgAny(val: any): boolean;
/**
 * Checks if argument contans dot notation.
 *
 * @example [arg.a] >> true
 *
 * @param val the value to inspect.
 */
export declare function isArgDotNotation(val: any): boolean;
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
export declare function expandArgs(val: string | string[], match?: string[], safe?: string[]): string[];
/**
 * Expands options arguments into multiple singular arguments.
 *
 * @example [-abc] becomes [-a, '-b', '-c']
 *
 * @param val the value to be expanded.
 * @param allowValues when true short flag groups can have values.
 */
export declare function expandOptions(val: string[], allowValues?: boolean): any[];
/**
 * Checks if flag is that of negation.
 *
 * @example --no-force >> true
 * @example --force >> false
 *
 * @param val the value to inspect.
 * @param negate the negation char to check if exists.
 */
export declare function isNegateFlag(val: any, negate: string): boolean;
/**
 * Checks if an argument contains variadic characters.
 *
 * @example [arg...] >> true
 *
 * @param val the value to be inspected.
 * @param variadic the variadic char to check if exists.
 */
export declare function isArgVariadic(val: any, variadic: string): any;
/**
 * Checks if an argument is variadic and also contains required tokens.
 *
 * @example <arg...> >> true
 *
 * @param val the value to inspect.
 * @param variadic the char representing variadic arguments.
 */
export declare function isArgVariadicRequired(val: any, variadic: string): any;
/**
 * Strips a flag of all tokens.
 *
 * @example --user.name >> user.name
 * @example --no-force >> force (removes negation also)
 *
 * @param val the value containing flag tokens to be stripped.
 * @param negate the negation char defined in options.
 */
export declare function stripFlag(val: any, negate: string): any;
/**
 * Strips negate chars from flag.
 *
 * @param val the value to be stripped.
 * @param negate the characters denoting negate.
 */
export declare function stripNegate(val: any, negate?: string): any;
/**
 * Strips variadic chars from flag.
 *
 * @param val the value to be stripped.
 * @param negate the characters denoting variadic.
 */
export declare function stripVariadic(val: any, variadic?: string): any;
/**
 * Strips all tokens from string.
 *
 * @example 'install <dir> [filename]' >> 'install dir filename'
 *
 * @param val the val containing tokens to be stripped.
 * @param negate the negation char used.
 * @param variadic the variadic char used.
 */
export declare function stripTokens(val: any, negate?: string, variadic?: string): string;
