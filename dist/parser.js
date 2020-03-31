"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chek_1 = require("chek");
var util_1 = require("util");
var constants_1 = require("./constants");
var utils_1 = require("./utils");
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
    var _result = { _: [], __: [] };
    var _configs, _aliases, _indexed, _maxIndex;
    function handleError(message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var template = message;
        message = util_1.format.apply(void 0, __spreadArrays([message], args));
        var err = new Error(message);
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
        var result = val;
        // This is a variadic value, iterate
        // each element and ensure type.
        if (Array.isArray(val)) {
            result = val.map(function (v) { return castType(v, config); });
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
        var aliasMap = {};
        var variadicKeys = [];
        var indexKeys = [];
        var configs = options.options;
        var _loop_2 = function (k) {
            if (utils_1.isType.string(configs[k])) {
                configs[k] = {
                    type: configs[k]
                };
            }
            var config = configs[k];
            configs[k]['name'] = configs[k]['name'] || k;
            config.type = config.type || 'string';
            // Ensure supported type.
            if (utils_1.hasOwn(config, 'type') && !~constants_1.SUPPORTED_TYPES.indexOf(config.type)) {
                handleError("Type %s is not in supported types of %s.", config.type, constants_1.SUPPORTED_TYPES.join(', '));
                return { value: false };
            }
            config.alias = utils_1.toType.array(config.alias);
            if (utils_1.hasOwn(config, 'index')) {
                // Can't have dupe configs at
                // the same index.
                if (~indexKeys.indexOf(config.index)) {
                    handleError("Removing %s with duplicate index %s, the configuration already exists.", k, config.index);
                    return { value: false };
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
            configs[k].alias = config.alias.map(function (v) {
                v = utils_1.stripFlag(v, options.charNegate);
                aliasMap[v] = k; // update all aliases.
                return v;
            });
        };
        for (var k in configs) {
            var state_1 = _loop_2(k);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return {
            aliasMap: aliasMap,
            indexKeys: indexKeys,
            configs: configs
        };
    }
    function breakoutArg(arg) {
        if (utils_1.isType.number(arg))
            return {
                key: arg,
                value: null
            };
        var hasFlag = utils_1.isFlag(arg);
        if (hasFlag)
            arg = utils_1.stripFlag(arg, options.charNegate);
        else
            arg = utils_1.stripVariadic(arg, options.charVariadic);
        var split = arg.split('=');
        if (hasFlag && options.allowCamelcase)
            split[0] = utils_1.toCamelcase(split[0]);
        return {
            key: split[0],
            value: split[1] || null
        };
    }
    function parseArg(arg, arr, i) {
        arg = arg + '';
        var hasFlag = utils_1.isFlag(arg);
        var hasSplit = ~arg.indexOf('=');
        var hasFlagShort = utils_1.isFlagShort(arg);
        var hasNegate = utils_1.isNegateFlag(arg, options.charNegate);
        var hasCount = utils_1.isFlagCount(arg);
        var hasDotNotation = utils_1.isDotNotationFlag(arg);
        var next = (arr[i + 1]) + '';
        var nextHasFlag = utils_1.isFlag(next);
        var nextHasCount = utils_1.isFlagCount(next);
        var nextHasVariadic = next.endsWith(options.charVariadic);
        var isLast = i === (arr.length - 1);
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
        var x = _aliases;
        var keyVal = breakoutArg(arg);
        var key = _aliases[keyVal.key] || keyVal.key;
        var value = keyVal.value;
        // LOOKUP CONFIG //
        var idx = !_result._.length ? 0 : _result._.length;
        var confKey = !hasFlag ? idx : key;
        var config = getConfig(confKey) || { anon: true };
        // CHECK BOOL //
        var flagIsBool = (hasFlag && !hasCount && !hasSplit) && (nextHasFlag || nextHasVariadic || config.type === 'boolean' || isLast);
        // If a flag and a type is specified it's not boolean.
        if (hasFlag && config.type && config.type !== 'boolean')
            flagIsBool = false;
        // CHECK IF FLAG VALUE //
        // Should check current config for bool in iteration.
        var hasFlagValue = hasFlag && (!nextHasFlag && !nextHasCount && !nextHasVariadic && !isLast && !hasCount && !keyVal.value && config.type !== 'boolean');
        // CHECK SHORT VALUES //
        if (hasFlagShort && !options.allowShortValues) {
            hasFlagValue = false;
            if (!hasCount)
                flagIsBool = true;
        }
        // CHECK VARIADIC //
        var hasVariadic;
        var configVariadic = utils_1.isTruthyVariadic(config.variadic);
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
        var shouldIngest = hasFlagValue || hasVariadic;
        var ingestable = !hasFlag && !hasVariadic && !utils_1.hasOwn(config, 'index');
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
        var prev = parseArg(arr[0], arr, 0);
        // Reduce array and reorder for parsing.
        var reordered = arr.reduce(function (a, c, i) {
            if (c === '')
                return a;
            var parsed = parseArg(c, arr, i);
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
        var cur;
        // Duplicate options are disabled.
        if (key && utils_1.hasOwn(_result, key) && !options.allowDuplicateOptions)
            return;
        if (key) {
            var getKey = utils_1.isType.number(key) ? "_[" + key + "]" : key;
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
        var result = [];
        // If not flag with value adjust index.
        if (!parsed.isFlagWithValue)
            result.push(parsed.value);
        // The primary configuration.
        var config = parsed.config;
        // Counter used when variadic has specified count.
        var ctr = result.length;
        // Holds current index.
        var n;
        // Variadic specifies a specific count.
        var count = utils_1.isType.number(config.variadic) ? config.variadic : null;
        // Otherwise ingest args until max count or reaches
        // another flag, negate or variadic.
        for (n = i + 1; n < arr.length; n++) {
            var arg = arr[n] + '';
            var ingestable = !utils_1.isFlag(arg) &&
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
    var normalized = normalize();
    // Errored normalizing abort.
    if (!normalized)
        return;
    _configs = normalized.configs;
    _aliases = normalized.aliasMap;
    _indexed = normalized.indexKeys;
    _maxIndex = Math.max.apply(Math, _indexed);
    if (utils_1.isType.string(argv))
        argv = argv.trim();
    // Use provided argv or use process args.
    argv = argv || process.argv.slice(2);
    // Expand args into an array.
    argv = utils_1.expandArgs(argv);
    // Check if has abort flag if true slice
    // array and store in abort array.
    var abortIdx = argv.indexOf('--');
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
    for (var i = 0; i < argv.length; i++) {
        var k = argv[i];
        // Parse the argument returning helpers.
        var parsed = parseArg(k, argv, i);
        // Anonymous flags/args are not allowed.
        if (!options.allowAnonymous && parsed.config.anon) {
            var label = parsed.isFlag ? 'Flag' : 'Argument';
            handleError("%s %s failed: invalidated by anonymous prohibited (value: %s).", label, parsed.key, parsed.value);
            break;
        }
        if (parsed.ingest) {
            var tmp = ingest(argv, i, parsed);
            i = tmp.i;
            setArg(parsed.key, tmp.val, parsed.config);
        }
        else {
            // This happens when we've used the next arg
            // as this flag's value so we increment.
            setArg(parsed.key, parsed.value, parsed.config);
        }
    }
    var _loop_1 = function (k) {
        var config = _configs[k];
        config = config;
        var hasIndex = utils_1.hasOwn(config, 'index');
        var exists = hasIndex ? !chek_1.isUndefined(_result._[config.index]) : chek_1.has(_result, k);
        // HANDLE DEFAULTS //
        var curVal = hasIndex ? _result._[config.index] : chek_1.get(_result, k);
        var normalVal = utils_1.ensureDefault(curVal, config.default);
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
            var aliases = !Array.isArray(config.alias) ? [config.alias] : config.alias;
            // Update object with aliases.
            aliases.forEach(function (a) {
                if (exists || options.allowPlaceholderOptions)
                    _result[a] = chek_1.get(_result, k);
            });
        }
        // HANDLE EXTEND ARGS //
        if (options.allowExtendArgs && hasIndex)
            _result[k] = _result._[config.index];
    };
    // DEFAULTS, EXTEND ALIASES & ARGS //
    for (var k in _configs) {
        _loop_1(k);
    }
    // When allow placeholders are enabled ensures that we
    // don't end up with undefined or empty array elements.
    if (options.allowPlaceholderArgs) {
        var ctr = 0;
        while (ctr < _maxIndex) {
            if (chek_1.isUndefined(_result._[ctr]))
                _result._[ctr] = null;
            ctr++;
        }
    }
    return _result;
}
exports.parse = parse;
//# sourceMappingURL=parser.js.map