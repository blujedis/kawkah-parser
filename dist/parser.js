"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const chek_1 = require("chek");
const util_1 = require("util");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
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
function parse(argv, options) {
    options = Object.assign({}, constants_1.PARSER_DEFAULTS, options);
    const _result = { _: [], __: [] };
    let raw = process.argv.slice(2);
    if (process.env.NODE_ENV === 'test')
        raw = raw.slice(raw.indexOf('--bail') + 1);
    function handleError(message, ...args) {
        const template = message;
        message = util_1.format(message, ...args);
        const err = new Error(message);
        if (!options.onParserError)
            throw err;
        options.onParserError(err, template, args);
    }
    function getConfig(key) {
        // if (isType.string(key) && options.allowCamelcase)
        //   key = camelcase(<string>key);
        return _configs[_aliases[key]];
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
                result = utils_1.toType.boolean(val);
            }
            else if (config.type === 'number') {
                result = utils_1.toType.number(val);
            }
            else if (config.type === 'array') {
                result = utils_1.toType.array(val);
            }
            else if (config.type === 'string') {
                result = utils_1.toType.string(val);
            }
            else if (utils_1.isLikeBoolean(val) && options.allowParseBooleans) {
                result = utils_1.toType.boolean(val);
            }
            else if (utils_1.isLikeNumber(val) && options.allowParseNumbers) {
                result = utils_1.toType.number(val);
            }
            else {
                result = utils_1.toType.string(val);
            }
        }
        return result;
    }
    function normalize() {
        const aliasMap = {};
        const variadicKeys = [];
        const indexKeys = [];
        const configs = options.options;
        for (const k in configs) {
            if (utils_1.isType.string(configs[k])) {
                configs[k] = {
                    type: configs[k]
                };
            }
            const config = configs[k];
            configs[k]['name'] = configs[k]['name'] || k;
            config.type = config.type || 'string';
            // Ensure supported type.
            if (utils_1.hasOwn(config, 'type') && !~constants_1.SUPPORTED_TYPES.indexOf(config.type)) {
                handleError(`Type %s is not in supported types of %s.`, config.type, constants_1.SUPPORTED_TYPES.join(', '));
                return false;
            }
            config.alias = utils_1.toType.array(config.alias);
            if (utils_1.hasOwn(config, 'index')) {
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
            configs[k].alias = config.alias.map(v => {
                v = utils_1.stripFlag(v, options.charNegate);
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
    function breakoutArg(arg) {
        if (utils_1.isType.number(arg))
            return {
                key: arg,
                value: null
            };
        const hasFlag = utils_1.isFlag(arg);
        if (hasFlag)
            arg = utils_1.stripFlag(arg, options.charNegate);
        else
            arg = utils_1.stripVariadic(arg, options.charVariadic);
        const split = arg.split('=');
        if (hasFlag && options.allowCamelcase)
            split[0] = utils_1.toCamelcase(split[0]);
        return {
            key: split[0],
            value: split[1] || null
        };
    }
    function parseArg(arg, arr, i) {
        arg = arg + '';
        const hasFlag = utils_1.isFlag(arg);
        const hasSplit = ~arg.indexOf('=');
        const hasFlagShort = utils_1.isFlagShort(arg);
        let hasNegate = utils_1.isNegateFlag(arg, options.charNegate);
        let hasCount = utils_1.isFlagCount(arg);
        const hasDotNotation = utils_1.isDotNotationFlag(arg);
        const next = (arr[i + 1]) + '';
        const nextHasFlag = utils_1.isFlag(next);
        let nextHasCount = utils_1.isFlagCount(next);
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
        let key = _aliases[keyVal.key] || keyVal.key;
        let value = keyVal.value;
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
        const configVariadic = utils_1.isTruthyVariadic(config.variadic);
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
        const ingestable = !hasFlag && !hasVariadic && !utils_1.hasOwn(config, 'index');
        // CHECK CAMELCASE //
        // Check key for camelcase.
        if (options.allowCamelcase && hasFlag && utils_1.isType.string(key) && !hasDotNotation)
            key = chek_1.camelcase(key);
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
                value = key.length;
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
    function reorderArgs(arr) {
        // If no indexed args reorder not needed.
        if (!_indexed.length)
            return arr;
        // Previous argument.
        let prev = parseArg(arr[0], arr, 0);
        // Reduce array and reorder for parsing.
        const reordered = arr.reduce((a, c, i) => {
            if (c === '')
                return a;
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
    function setArg(key, val, config) {
        let cur;
        // Duplicate options are disabled.
        if (key && utils_1.hasOwn(_result, key) && !options.allowDuplicateOptions)
            return;
        if (key) {
            const getKey = utils_1.isType.number(key) ? `_[${key}]` : key;
            cur = chek_1.get(_result, getKey);
            // If exists ensure is array if
            // duplicate values are allowed.
            if (cur && !Array.isArray(cur) && options.allowDuplicateOptions)
                cur = [cur];
        }
        val = castType(val, config);
        if (Array.isArray(cur)) {
            cur.push(val);
            val = chek_1.flatten(cur);
        }
        if (utils_1.isType.number(key))
            _result._.push(val);
        else if (options.allowDotNotation)
            chek_1.set(_result, key, val);
        else
            _result[key] = val;
    }
    function ingest(arr, i, parsed) {
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
        const count = utils_1.isType.number(config.variadic) ? config.variadic : null;
        // Otherwise ingest args until max count or reaches
        // another flag, negate or variadic.
        for (n = i + 1; n < arr.length; n++) {
            const arg = arr[n] + '';
            const ingestable = !utils_1.isFlag(arg) &&
                !arg.endsWith(options.charVariadic) &&
                (count === null || ctr < count);
            // If hit should eat arg don't break
            // unless it's past the first.
            if (!ingestable)
                break;
            result.push(utils_1.stripTokens(arg, options.charNegate, options.charVariadic));
            ctr += 1;
        }
        n = parsed.isFlagWithValue ? n - 1 : i + (ctr - 1);
        return {
            i: Math.max(0, n),
            val: !parsed.isVariadic ? result[0] : result
        };
    }
    // Normalize any option configurations.
    const normalized = normalize();
    // Errored normalizing abort.
    if (!normalized)
        return;
    const _configs = normalized.configs;
    const _aliases = normalized.aliasMap;
    const _indexed = normalized.indexKeys;
    const _maxIndex = Math.max(..._indexed);
    if (utils_1.isType.string(argv))
        argv = argv.trim();
    // Use provided argv or use process args.
    const hasArgv = !!argv;
    argv = argv || [...raw];
    // Expand args into an array.
    argv = utils_1.expandArgs(argv);
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
        argv = utils_1.expandOptions(argv, options.allowShortValues);
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
        config = config;
        const hasIndex = utils_1.hasOwn(config, 'index');
        const exists = hasIndex ? !chek_1.isUndefined(_result._[config.index]) : chek_1.has(_result, k);
        // HANDLE DEFAULTS //
        const curVal = hasIndex ? _result._[config.index] : chek_1.get(_result, k);
        const normalVal = utils_1.ensureDefault(curVal, config.default);
        // If exists normalize and ensure
        // the default value.
        if (exists) {
            if (hasIndex)
                _result._[config.index] = normalVal;
            else
                chek_1.set(_result, k, normalVal);
        }
        // Otherwise check if placeholders are enabled.
        else {
            if (hasIndex && options.allowPlaceholderArgs)
                _result._[config.index] = normalVal === !chek_1.isValue(normalVal) || normalVal === '' ? null : normalVal;
            else if (options.allowPlaceholderOptions)
                chek_1.set(_result, k, normalVal);
        }
        // HANDLE ALIASES //
        // When parsing from Kawkah we'll handle aliases there.
        if (utils_1.hasOwn(config, 'alias') && options.allowAliases) {
            const aliases = !Array.isArray(config.alias) ? [config.alias] : config.alias;
            // Update object with aliases.
            aliases.forEach(a => {
                if (exists || options.allowPlaceholderOptions)
                    _result[a] = chek_1.get(_result, k);
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
            if (chek_1.isUndefined(_result._[ctr]))
                _result._[ctr] = null;
            ctr++;
        }
    }
    _result._raw = raw;
    return _result;
}
exports.parse = parse;
//# sourceMappingURL=parser.js.map