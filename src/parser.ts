import { get, set, has, camelcase, flatten, isValue, isUndefined } from 'chek';
import { format } from 'util';
import { PARSER_DEFAULTS, SUPPORTED_TYPES } from './constants';
import { expandArgs, isFlag, isNegateFlag, isFlagCount, expandOptions, isLikeBoolean, isLikeNumber, stripFlag, hasOwn, isDotNotationFlag, stripTokens, ensureDefault, isFlagShort, toType, isType, isTruthyVariadic, toCamelcase, stripVariadic } from './utils';
import { IKawkahParserOptions, IKawkahParserConfig, IKawkahParsedArg, IKawkahParserConfigs, IKawkahParserResult } from './types';

/**
 * Parses provided arguments or uses process.argv.
 *
 * @example .parse('install /some/path --force);
 * @example .parse('sip show log -vvvvv) >> { v: 5 }
 * @example .parse('--user.name=Jim') >> { user: { name: 'Jim' } }
 *
 * @param argv string or array to be parsed.
 * @param options parser options.
 */
export function parse(argv?: string | any[], options?: IKawkahParserOptions): IKawkahParserResult {

  options = Object.assign({}, PARSER_DEFAULTS, options);

  const _result: any = { _: [], __: [] };
  let raw = process.argv.slice(2);

  if (process.env.NODE_ENV === 'test')
    raw = raw.slice(raw.indexOf('--bail') + 1);

  function handleError(message: string, ...args: any[]) {
    const template = message;
    message = format(message, ...args);
    const err = new Error(message);
    if (!options.onParserError)
      throw err;
    options.onParserError(err, template, args);
  }

  function getConfig(key: string | number): IKawkahParserConfig {
    // if (isType.string(key) && options.allowCamelcase)
    //   key = camelcase(<string>key);
    return _configs[_aliases[key]] as IKawkahParserConfigs;
  }

  function castType(val, config) {

    let result = val;

    // This is a variadic value, iterate
    // each element and ensure type.
    if (Array.isArray(val)) {
      result = val.map(v => castType(v, config));
    }

    else {

      if (config.type === 'boolean') {
        result = toType.boolean(val);
      }

      else if (config.type === 'number') {
        result = toType.number(val);
      }

      else if (config.type === 'array') {
        result = toType.array(val);
      }

      else if (config.type === 'string') {
        result = toType.string(val);
      }

      else if (isLikeBoolean(val) && options.allowParseBooleans) {
        result = toType.boolean(val);
      }

      else if (isLikeNumber(val) && options.allowParseNumbers) {
        result = toType.number(val);
      }

      else {
        result = toType.string(val);
      }

    }

    return result;

  }

  function normalize() {

    const aliasMap: any = {};
    const variadicKeys = [];
    const indexKeys = [];

    const configs: IKawkahParserConfigs = options.options;

    for (const k in configs) {

      if (isType.string(configs[k])) {
        configs[k] = {
          type: configs[k]
        } as IKawkahParserConfig;
      }

      const config = configs[k] as IKawkahParserConfig;
      configs[k]['name'] = configs[k]['name'] || k;
      config.type = config.type || 'string';

      // Ensure supported type.
      if (hasOwn(config, 'type') && !~SUPPORTED_TYPES.indexOf(config.type)) {
        handleError(`Type %s is not in supported types of %s.`, config.type, SUPPORTED_TYPES.join(', '));
        return false;
      }

      config.alias = toType.array(config.alias);

      if (hasOwn(config, 'index')) {

        // Can't have dupe configs at
        // the same index.
        if (~indexKeys.indexOf(config.index)) {
          handleError(`Removing %s with duplicate index %s, the configuration already exists.`, k, config.index);
          return false;
        }

        aliasMap[k] = config.index;
        aliasMap[config.index] = k;
        indexKeys.push(config.index);

      }
      else {
        // Flags cannot be variadic.
        config.variadic = false;
      }

      if (config.variadic)
        variadicKeys.push(k);

      aliasMap[k] = k;

      (configs[k] as IKawkahParserConfig).alias = (config.alias as string[]).map(v => {
        v = stripFlag(v, options.charNegate);
        aliasMap[v] = k; // update all aliases.
        return v;
      });

    }

    return {
      aliasMap,
      indexKeys,
      configs
    };

  }

  function breakoutArg(arg: string | number) {
    if (isType.number(arg))
      return {
        key: arg,
        value: null
      };
    const hasFlag = isFlag(arg);
    if (hasFlag)
      arg = stripFlag(arg, options.charNegate);
    else
      arg = stripVariadic(arg, options.charVariadic);
    const split = (arg as string).split('=');
    if (hasFlag && options.allowCamelcase)
      split[0] = toCamelcase(split[0]);
    return {
      key: split[0],
      value: split[1] || null
    };
  }

  function parseArg(arg: string, arr: string[], i: number): IKawkahParsedArg {

    arg = arg + '';
    const hasFlag = isFlag(arg);
    const hasSplit = ~arg.indexOf('=');
    const hasFlagShort = isFlagShort(arg);
    let hasNegate = isNegateFlag(arg, options.charNegate);
    let hasCount = isFlagCount(arg);
    const hasDotNotation = isDotNotationFlag(arg);

    const next = (arr[i + 1]) + '';
    const nextHasFlag = isFlag(next);
    let nextHasCount = isFlagCount(next);
    let nextHasVariadic = next.endsWith(options.charVariadic);

    const isLast = i === (arr.length - 1);

    // CHECK ENABLED //

    if (!options.allowCountOptions) {
      hasCount = false;
      nextHasCount = false;
    }

    if (!options.allowBoolNegation) {
      hasNegate = false;
    }

    if (!options.allowVariadics) {
      nextHasVariadic = false;
    }

    // BREAKOUT KEY //

    const x = _aliases;
    const keyVal = breakoutArg(arg);
    let key: any = _aliases[keyVal.key] || keyVal.key;
    let value: any = keyVal.value;

    // LOOKUP CONFIG //

    const idx = !_result._.length ? 0 : _result._.length;
    const confKey = !hasFlag ? idx : key;
    const config = getConfig(confKey) || { anon: true };

    // CHECK BOOL //

    let flagIsBool = (hasFlag && !hasCount && !hasSplit) && (nextHasFlag || nextHasVariadic || config.type === 'boolean' || isLast);

    // If a flag and a type is specified it's not boolean.
    if (hasFlag && config.type && config.type !== 'boolean')
      flagIsBool = false;

    // CHECK IF FLAG VALUE //

    // Should check current config for bool in iteration.
    let hasFlagValue = hasFlag && (!nextHasFlag && !nextHasCount && !nextHasVariadic && !isLast && !hasCount && !keyVal.value && config.type !== 'boolean');

    // CHECK SHORT VALUES //

    if (hasFlagShort && !options.allowShortValues) {
      hasFlagValue = false;
      if (!hasCount)
        flagIsBool = true;
    }

    // CHECK VARIADIC //

    let hasVariadic;
    const configVariadic = isTruthyVariadic(config.variadic);

    // Check if variadic if enabled, allow config.variadic to override option.
    if (options.allowVariadics) {

      // Can't have variadics with flags.
      hasVariadic = !hasFlag &&
        (arg.endsWith(options.charVariadic) || configVariadic);

      // Update the config.
      if (hasVariadic)
        config.variadic = config.variadic || true;

    }
    else {
      // Ensure variadic is disabled in config.
      config.variadic = false;
    }

    // CHECK SHOULD INGEST //

    const shouldIngest = hasFlagValue || hasVariadic;
    const ingestable = !hasFlag && !hasVariadic && !hasOwn(config, 'index');

    // CHECK CAMELCASE //

    // Check key for camelcase.
    if (options.allowCamelcase && hasFlag && isType.string(key) && !hasDotNotation)
      key = camelcase(key);

    // NORMALIZE KEY & VALUE //

    if (hasFlag) {

      // This is a boolean flag --force or -f
      // or is boolean negate --no-force or --no-f.
      if (flagIsBool) {
        value = hasNegate ? false : true;
      }

      // Flag like -vvvvv such as indicating level verbosity.
      // results in { v: 5 }
      else if (hasCount) {
        value = (key as string).length;
        key = key[0];
      }

    }

    // This is a standard arg set key to it's index.
    else {
      value = key;
      key = idx;
    }

    return {

      index: i,
      key: key,
      value: value,

      isFlag: hasFlag,
      isFlagNegate: hasNegate,
      isFlagBool: flagIsBool,
      isFlagWithValue: hasFlagValue,
      isVariadic: hasVariadic,

      ingest: shouldIngest,
      ingestable: ingestable,

      config: config

    };

  }

  function reorderArgs(arr: string[]) {

    // If no indexed args reorder not needed.
    if (!_indexed.length)
      return arr;

    // Previous argument.
    let prev = parseArg(arr[0], arr, 0);

    // Reduce array and reorder for parsing.
    const reordered = arr.reduce((a, c, i) => {
      if (c === '') return a;
      const parsed = parseArg(c, arr, i);
      if (!parsed.isFlag && !prev.isFlagWithValue)
        a.indexed.push(c);
      else
        a.remainder.push(c);
      prev = parsed;
      return a;
    }, { indexed: [], remainder: [] });
    return reordered.indexed.concat(reordered.remainder);

  }

  function setArg(key: string | number, val: any, config: IKawkahParserConfig) {

    let cur;

    // Duplicate options are disabled.
    if (key && hasOwn(_result, key) && !options.allowDuplicateOptions)
      return;

    if (key) {
      const getKey = isType.number(key) ? `_[${key}]` : key;
      cur = get(_result, <string>getKey);
      // If exists ensure is array if
      // duplicate values are allowed.
      if (cur && !Array.isArray(cur) && options.allowDuplicateOptions)
        cur = [cur];
    }

    val = castType(val, config);

    if (Array.isArray(cur)) {
      cur.push(val);
      val = flatten(cur);
    }

    if (isType.number(key))
      _result._.push(val);
    else if (options.allowDotNotation)
      set(_result, <string>key, val);
    else
      _result[key] = val;

  }

  function ingest(arr: any[], i: number, parsed: IKawkahParsedArg) {

    // const result = parsed.value ? [parsed.value] : [];
    const result = [];

    // If not flag with value adjust index.
    if (!parsed.isFlagWithValue)
      result.push(parsed.value);

    // The primary configuration.
    const config = parsed.config;

    // Counter used when variadic has specified count.
    let ctr = result.length;

    // Holds current index.
    let n;

    // Variadic specifies a specific count.
    const count = isType.number(config.variadic) ? config.variadic : null;

    // Otherwise ingest args until max count or reaches
    // another flag, negate or variadic.
    for (n = i + 1; n < arr.length; n++) {

      const arg = arr[n] + '';
      const ingestable =
        !isFlag(arg) &&
        !arg.endsWith(options.charVariadic) &&
        (count === null || ctr < count);

      // If hit should eat arg don't break
      // unless it's past the first.
      if (!ingestable)
        break;

      result.push(stripTokens(arg, options.charNegate, options.charVariadic));
      ctr += 1;

    }

    n = parsed.isFlagWithValue ? n - 1 : i + (ctr - 1);

    return {
      i: Math.max(0, n),
      val: !parsed.isVariadic ? result[0] : result
    };

  }

  // Normalize any option configurations.
  const normalized: any = normalize();

  // Errored normalizing abort.
  if (!normalized)
    return;

  const _configs = normalized.configs;
  const _aliases = normalized.aliasMap;
  const _indexed = normalized.indexKeys;
  const _maxIndex = Math.max(..._indexed);

  if (isType.string(argv)) argv = (argv as string).trim();

  // Use provided argv or use process args.
  const hasArgv = !!argv;

  argv = argv || [...raw];

  // Expand args into an array.
  argv = expandArgs(argv);

  // Args manually passed. 
  if (hasArgv)
    raw = [...argv];

  // Check if has abort flag if true slice
  // array and store in abort array.
  const abortIdx = argv.indexOf('--');
  if (~abortIdx) {
    _result.__ = argv.slice(abortIdx + 1);
    argv = argv.slice(0, abortIdx);
  }

  // short options -f are allowed can exapand. -abc >> -a -b -c.
  if (options.allowShortExpand)
    argv = expandOptions(argv as string[], options.allowShortValues);

  // Reorder the arguments so that
  // install --force /some/path becomes
  // install /some/path --force.
  argv = reorderArgs(argv);

  // PARSE ARGUMENTS //

  for (let i = 0; i < argv.length; i++) {

    const k = argv[i];

    // Parse the argument returning helpers.
    const parsed = parseArg(k, argv, i);

    // Anonymous flags/args are not allowed.
    if (!options.allowAnonymous && parsed.config.anon) {
      const label = parsed.isFlag ? 'Flag' : 'Argument';
      handleError(`%s %s failed: invalidated by anonymous prohibited (value: %s).`, label, parsed.key, parsed.value);
      break;
    }

    if (parsed.ingest) {
      const tmp = ingest(argv, i, parsed);
      i = tmp.i;
      setArg(parsed.key, tmp.val, parsed.config);
    }

    else {
      // This happens when we've used the next arg
      // as this flag's value so we increment.
      setArg(parsed.key, parsed.value, parsed.config);
    }

  }

  // DEFAULTS, EXTEND ALIASES & ARGS //

  for (const k in _configs) {

    let config = _configs[k];

    config = <IKawkahParserConfig>config;
    const hasIndex = hasOwn(config, 'index');

    const exists = hasIndex ? !isUndefined(_result._[config.index]) : has(_result, k);

    // HANDLE DEFAULTS //

    const curVal = hasIndex ? _result._[config.index] : get(_result, k);
    const normalVal = ensureDefault(curVal, config.default);

    // If exists normalize and ensure
    // the default value.
    if (exists) {
      if (hasIndex)
        _result._[config.index] = normalVal;
      else
        set(_result, k, normalVal);
    }
    // Otherwise check if placeholders are enabled.
    else {
      if (hasIndex && options.allowPlaceholderArgs)
        _result._[config.index] = normalVal === !isValue(normalVal) || normalVal === '' ? null : normalVal;
      else if (options.allowPlaceholderOptions)
        set(_result, k, normalVal);
    }

    // HANDLE ALIASES //

    // When parsing from Kawkah we'll handle aliases there.
    if (hasOwn(config, 'alias') && options.allowAliases) {



      const aliases = !Array.isArray(config.alias) ? [config.alias] : config.alias;

      // Update object with aliases.
      aliases.forEach(a => {
        if (exists || options.allowPlaceholderOptions)
          _result[a] = get(_result, k);
      });

    }

    // HANDLE EXTEND ARGS //

    if (options.allowExtendArgs && hasIndex)
      _result[k] = _result._[config.index];

  }

  // When allow placeholders are enabled ensures that we
  // don't end up with undefined or empty array elements.
  if (options.allowPlaceholderArgs) {
    let ctr = 0;
    while (ctr < _maxIndex) {
      if (isUndefined(_result._[ctr]))
        _result._[ctr] = null;
      ctr++;
    }
  }

  _result._raw = raw;

  return _result;

}
