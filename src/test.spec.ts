import * as chai from 'chai';
import * as mocha from 'mocha';

import * as parser from './';

const expect = chai.expect;
const should = chai.should;
const assert = chai.assert;

describe('Kawkah Parser', () => {

  before((done) => {
    done();
  });

  it('should parse args with boolean.', () => {
    const expected = { _: [], __: [], force: true, _raw: ['--force'] };
    assert.deepEqual(parser.parse(['--force']), expected);
  });

  it('should parse args with number.', () => {
    const expected = { _: [50], __: [], _raw: ['50'] };
    assert.deepEqual(parser.parse(['50']), expected);
  });

  it('should parse args with verbose count option.', () => {
    const expected = { _: [], __: [], v: 5, _raw: ['-vvvvv'] };
    assert.deepEqual(parser.parse(['-vvvvv']), expected);
  });

  it('should parse args with negate option.', () => {
    const expected = { _: [], __: [], force: false, _raw: ['--no-force'] };
    assert.deepEqual(parser.parse(['--no-force']), expected);
  });

  it('should parse args where key is followed by value.', () => {
    const expected = { _: [], __: [], key: 'value', _raw: ['--key', 'value'] };
    assert.deepEqual(parser.parse(['--key', 'value']), expected);
  });

  it('should parse args where key is followed by = then value.', () => {
    const expected = { _: [], __: [], key: 'value', _raw: ['--key=value'] };
    const expected2 = { _: [], __: [], user: { tags: ['java', 'go'] }, _raw: ['--user.tags=java', '--user.tags=go'] };
    const expected3 = { _: [], __: [], user: { tags: ['java'] } };
    assert.deepEqual(parser.parse(['--key=value']), expected);
    assert.deepEqual(parser.parse(['--user.tags=java', '--user.tags=go']), expected2);
  });

  it('should parse args with dot notation.', () => {
    const expected = { _: [], __: [], user: { name: 'Milton Waddams' }, _raw: ['--user.name', 'Milton Waddams'] };
    const actual = parser.parse(['--user.name', 'Milton Waddams']);
    assert.deepEqual(actual, expected);
  });

  it('should parse args and convert to camelcase.', () => {
    const expected = { _: [], __: [], camelCase: true, _raw: ['--camel-case'] };
    assert.deepEqual(parser.parse(['--camel-case']), expected);
  });

  it('should parse args and spread to separate options.', () => {
    const expected = { _: [], __: [], a: true, b: true, c: true, _raw: ['-abc'] };
    assert.deepEqual(parser.parse(['-abc']), expected);
  });

  it('should populate duplciate args into an array.', () => {
    const expected = { _: [], __: [], x: [10, 20, 30], _raw: ['-x', 10, '-x', 20, '-x', 30] };
    assert.deepEqual(parser.parse(['-x', 10, '-x', 20, '-x', 30], { allowShortValues: true }), expected);
  });

  it('should parse args then abort after --', () => {
    const expected = { _: ['arg1', 'arg2'], __: ['arg3'], _raw: ['arg1', 'arg2', '--', 'arg3'] };
    assert.deepEqual(parser.parse(['arg1', 'arg2', '--', 'arg3']), expected);
  });

  it('should parse variadic args', () => {
    const expected = { _: ['arg1', ['arg2', 'arg3', 'arg4']], __: [], force: true, _raw: ['arg1', 'arg2...', 'arg3', 'arg4', '--force'] };
    const result = parser.parse(['arg1', 'arg2...', 'arg3', 'arg4', '--force']);
    assert.deepEqual(result, expected);
  });

  it('should parse using string rather than argv like array.', () => {
    const expected = { _: ['arg1', 'arg2'], __: [], force: true, _raw: ['arg1', 'arg2', '--force'] };
    assert.deepEqual(parser.parse('arg1 arg2 --force'), expected);
  });

  it('should parse with custom options forcing flag to boolean.', () => {
    const expected = { _: ['arg1', 'arg2'], __: [], force: true, _raw: ['arg1', '--force', 'arg2'] };
    assert.deepEqual(parser.parse('arg1 --force arg2', { options: { force: 'boolean' } }), expected);
  });

  it('should parse with custom options forcing value to an array.', () => {
    const expected = { _: ['arg1'], __: [], tags: ['tag1'], _raw: ['arg1', '--tags', 'tag1'] };
    const result = parser.parse('arg1 --tags tag1', { options: { tags: 'array' } });
    assert.deepEqual(parser.parse('arg1 --tags tag1', { options: { tags: 'array' } }), expected);
  });

  // UTILS //

  it('should check if is argument token', () => {
    assert.isTrue(parser.isArg('[arg]'));
    assert.isTrue(parser.isArg('<arg>'));
  });

  it('should check if is required argument token', () => {
    assert.isTrue(parser.isArgRequired('<arg>'));
  });

  it('should check if is optional argument token', () => {
    assert.isTrue(parser.isArgOptional('[arg]'));
  });

  it('should check if is dot notation argument token', () => {
    assert.isTrue(parser.isArgDotNotation('[arg.arg]'));
    assert.isFalse(parser.isArgDotNotation('--install.in.i'));
  });

  it('should check if is required variadic token', () => {
    assert.isTrue(parser.isArgVariadicRequired('<arg...>', '...'));
  });

  it('should check if previous arg is option flag.', () => {
    assert.isTrue(parser.isFlagPrev(['--flag', 'arg'], 1));
  });

  it('should check if next arg is flag option.', () => {
    assert.isTrue(parser.isFlagNext(['--flag', '--arg'], 0));
  });

  it('should strip tokens from string.', () => {
    const stripped = parser.stripTokens('<required> [optional...]', 'no-', '...');
    assert.equal(stripped, 'required optional');
  });

  it('should strip prefix from flag option.', () => {
    assert.equal(parser.stripFlag('--flag', 'no-'), 'flag');
    assert.equal(parser.stripFlag('--no-flag', 'no-'), 'flag');
  });

  it('should check if any in tokens are flags.', () => {
    assert.equal(parser.isFlagAny('some string --flag'), true);
  });

  it('should check if any in tokens are args.', () => {
    assert.equal(parser.isArgAny('string with [args] <arg2>'), true);
    assert.equal(parser.isArgRequiredAny('string with <args> and text.'), true);
  });



});