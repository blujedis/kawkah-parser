import { IKawhakParserOptions } from './interfaces';
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
export declare function parse(argv?: string | any[], options?: IKawhakParserOptions): any;
