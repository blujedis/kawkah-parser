<p align="left">
  <a href="http://github.com/blujedis/kawkah-parser"><img src="https://cdn.rawgit.com/blujedis/kawkah-parser/master/assets/logo.png"></a>
</p>


The argument parser for Kawkah. If you're looking for a full blow CLI parser you probably want [Kawkah](https://github.com/blujedis/kawkah). You can think of kawkah-parser as sort of a normalizer before
you would validate the parsed result against a schema then trigger perhaps an action. If you
simply want to parse whatcha got and then handle constraints/coercion yourself kawkah-parser works great.

## Install

```sh
$ npm install kawkah-parser
```

## Usage

```ts
import { parse } from 'kawkah-parser';
const args = 'install /some/path names... tim sally joe --user.name bob --force --tags red --tags blue -abc -vvvvv --no-rename';
const result = parse();
```

Your result would be:

```ts
result = {
  _: ['install', '/some/path'],
  force: true,
  tags: ['red', 'blue'],
  names: ['jim', 'sally', 'joe'],
  user: { name: 'bob' },
  a: true,
  b: true,
  c: true,
  v: 5,
  rename: false,
  __: []
};
```

## Options

For addtional option detail and API info see [Docs](#Docs) below.

### charVariadic

Character denoting variadic arguments.

```ts
const args = 'create blog java... c python javascript'
const result = parse(args);
```

Result would be:

```ts
result = {
  _: ['create', 'blog', ['java', 'c', 'python', 'javascript']],
};
```

<table>
  <tr><td>Type</td><td>string</td></tr>
  <tr><td>Default</td><td>...</td></tr>
</table>

### charAbort

Character used to abort parsing of args.

```ts
const args = 'create blog -- ignore1 ignore2'
const result = parse(args);
```

Result would be:

```ts
result = {
  _: ['create', 'blog'],
  __: ['ignore1', 'ignore2']
};
```

<table>
  <tr><td>Type</td><td>string</td></tr>
  <tr><td>Default</td><td>--</td></tr>
</table>

### charNegate

Character used to negate boolean flags.

```ts
const args = '--no-force'
const result = parse(args);
```

Result would be:

```ts
result = {
  force: false
};
```

<table>
  <tr><td>Type</td><td>string</td></tr>
  <tr><td>Default</td><td>no-</td></tr>
</table>

### allowParseBooleans

Allows parsing flags as boolean.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowParseNumbers

Allows parsing number like values.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowCamelcase

Allow converting some-flag to someFlag.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowShortExpand

Allows expanding -abc to -a -b -c.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowShortValues

Allows short flags to have values.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowDuplicateOptions

Allows --tag red --tag green --tag blue which will be stored in an array.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowDotNotation

Allows --user.name bob to result in { name: 'bob'}.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowBoolNegation

Allows --no-force to set --force flag to false.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowCountOptions

Allows -vvvvv to result in { v: 5 }.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowVariadics

Allows arguments to be grouped in an array.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowAnonymous

Allows anonymous arguments when false flags/args must have configuration.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>true</td></tr>
</table>

### allowExtendArgs

When true args in _ are extend to result object by name.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>false</td></tr>
</table>

### allowPlaceholderArgs

When true result._ args set as null when no value.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>false</td></tr>
</table>

### allowPlaceholderOptions

When true if a configured option is not present a placeholder is set.

<table>
  <tr><td>Type</td><td>boolean</td></tr>
  <tr><td>Default</td><td>false</td></tr>
</table>

### onParserError

When null errors are thrown otherwise handled by specified handler.

<table>
 <tr><td>Type</td><td>function</td></tr>
  <tr><td>Default</td><td>undefined</td></tr>
</table>

## Docs

See [https://blujedis.github.io/kawkah-parser/](https://blujedis.github.io/kawkah-parser/)

## Change

See [CHANGE.md](CHANGE.md)

## License

See [LICENSE.md](LICENSE)