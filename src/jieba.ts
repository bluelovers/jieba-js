/**
 * Created by user on 2018/3/14/014.
 */

import { loadStream, load as loadDict, loadSync as loadDictSync, IDict } from './loader/jieba';
import buildFromDict, { IFreq, ITrie } from './trie/index';
import { max_of_array, min_of_array } from './util';
import crlf, { LF, lineSplit } from 'crlf-normalize';
import { autobind } from 'core-decorators';
import * as path from 'path';

const DEFAULT_DICT_PATH = path.join(__dirname, '../dict');

@autobind
export class Jieba
{
	protected initialized;
	protected _waiting: Promise<any> | any;
	options;

	protected _cache_ = {
		trie: {},
		min_freq: 0.0,
		dict_file: [],
	} as {
		trie?: ITrie,
		FREQ?: IFreq,
		total?: number,
		min_freq?: number,
		dict_file: string[],
	};

	dictionary: IDict = [];

	constructor(options = {})
	{
		this.options = options;
		//this._setup();

		this.useDict(path.join(DEFAULT_DICT_PATH, 'dict.txt.big'));
	}

	static get DEFAULT_DICT_PATH()
	{
		return DEFAULT_DICT_PATH;
	}

	useDict(dict: string): this
	useDict(dict: IDict): this
	useDict(dict: (dict: IDict, jieba: Jieba) => IDict | string | null | void): this
	useDict(dict): this
	{
		const self = this;

		if (typeof dict == 'string')
		{
			this._cache_.dict_file.push(dict);
		}
		else if (Array.isArray(dict))
		{
			this.dictionary = this.dictionary
				.concat(dict)
			;
		}
		else if (typeof dict == 'function')
		{
			let ret = dict.call(this, this.dictionary, this);

			if (ret instanceof Promise)
			{
				ret.then(function (ret)
				{
					if (ret)
					{
						self.useDict(ret);
					}
				})
			}
			else if (ret)
			{
				self.useDict(ret);
			}
		}
		else
		{
			throw new Error(dict);
		}

		return this;
	}

	async cut(sentence: string, cb?: (ret: string[]) => void)
	{
		await this.init();

		let ret = this._cut(sentence);
		if (cb)
		{
			cb(ret);
		}
		return ret;
	}

	cutSync(sentence: string, cb?: (ret: string[]) => void)
	{
		this.initSync();

		let ret = this._cut(sentence);
		if (cb)
		{
			cb(ret);
		}
		return ret;
	}

	get trieTree()
	{
		return this._cache_.trie;
	}

	async init()
	{
		if (!this._waiting)
		{
			this._waiting = this._setup();
		}

		await this._waiting;

		return this;
	}

	initSync()
	{
		this._setupSync();

		return this;
	}

	protected _cut(sentence: string): string[]
	{
		sentence = crlf(sentence);

		let cut_all = false,
			HMM = false,
			yieldValues = [];

		let re_han = /([\u4E00-\u9FA5a-zA-Z0-9+#&\._]+)/,
			re_skip = /(\r\n|\s)/;

		let blocks = sentence.split(re_han);
		let cut_block = this._get_cut_block(HMM);

		//console.log(blocks);

		for (let b in blocks)
		{
			let blk = blocks[b];
			//console.log(b, blk);
			if (blk.length == 0)
			{
				continue;
			}

			if (blk.match(re_han))
			{
				let cutted = cut_block(blk);
				//console.log("matches", cutted);
				for (let w in cutted)
				{
					let word = cutted[w];
					yieldValues.push(word);
				}
			}
			else
			{
				let tmp = blk.split(re_skip);
				for (let i = 0; i < tmp.length; i++)
				{
					let x = tmp[i];
					if (x.match(re_skip))
					{
						yieldValues.push(x);
					}
					else if (!cut_all)
					{
						// @ts-ignore
						for (let xi in x)
						{
							yieldValues.push(x[xi]);
						}
					}
					else
					{
						yieldValues.push(x);
					}
				}
			}
		}

		return yieldValues;
	}

	protected _get_cut_block(HMM: boolean)
	{
		// @ts-ignore
		return (HMM ? this.__cut_DAG : this.__cut_DAG_NO_HMM)
			//.bind(this)
			;
	}

	protected async _setup()
	{
		if (this.initialized)
		{
			return this;
		}
		this.initialized = true;

		for (let file of this._cache_.dict_file)
		{
			let dict = await loadDict(file);

			this.dictionary = (this.dictionary || []).concat(dict);
		}

		this._build_trie();

		return this;
	}

	protected _setupSync()
	{
		if (this.initialized)
		{
			return this;
		}
		this.initialized = true;

		for (let file of this._cache_.dict_file)
		{
			let dict = loadDictSync(file);

			this.dictionary = (this.dictionary || []).concat(dict);
		}

		this._build_trie();

		return this;
	}

	protected _build_trie()
	{
		const self = this;

		let [trie, FREQ, total] = buildFromDict(self.dictionary);

		this._cache_.min_freq = Infinity;
		// normalize:
		for (let k in FREQ)
		{
			let v = FREQ[k] as number;
			FREQ[k] = Math.log(v / (total as number));
			if (FREQ[k] < this._cache_.min_freq)
			{
				this._cache_.min_freq = FREQ[k];
			}
		}

		Object.assign(this._cache_, {
			trie,
			FREQ,
			total,
		});
	}

	protected _get_DAG(sentence)
	{
		const trie = this._cache_.trie;

		let N = sentence.length,
			i = 0,
			j = 0,
			p = trie,
			DAG = {};

		while (i < N)
		{
			let c = sentence[j];
			if (c in p)
			{
				// @ts-ignore
				p = p[c];
				if ('' in p)
				{
					if (!(i in DAG))
					{
						DAG[i] = [];
					}
					DAG[i].push(j);
				}
				j += 1;
				if (j >= N)
				{
					i += 1;
					j = i;
					p = trie;
				}
			}
			else
			{
				p = trie;
				i += 1;
				j = i;
			}
		}
		for (i = 0; i < sentence.length; i++)
		{
			if (!(i in DAG))
			{
				DAG[i] = [i];
			}
		}
		return DAG;
	}

	protected _calc(sentence, DAG, idx, route)
	{
		//console.log(this._cache_.FREQ);
		//console.log(this);

		let N = sentence.length;
		route[N] = [0.0, ''];
		for (idx = N - 1; idx > -1; idx--)
		{
			let candidates = [];
			let candidates_x = [];
			for (let xi in DAG[idx])
			{
				let x = DAG[idx][xi];

				//console.log(x, sentence.substring(idx, x + 1));

				let f = ((sentence.substring(idx, x + 1) in this._cache_.FREQ)
					? this._cache_.FREQ[sentence.substring(idx, x + 1)]
					: this._cache_.min_freq);
				candidates.push(f + route[x + 1][0]);
				candidates_x.push(x);
			}
			let m = max_of_array(candidates);
			//console.log('max is', m);
			route[idx] = [m, candidates_x[candidates.indexOf(m)]];
		}
	}

	protected __cut_DAG_NO_HMM(sentence)
	{
		let re_eng = /[a-zA-Z0-9]/,
			route = {},
			yieldValues = [];

		let DAG = this._get_DAG(sentence);
		//console.log("DAG", DAG);
		this._calc(sentence, DAG, 0, route);

		//console.log('route', route);

		let x = 0,
			buf = '',
			N = sentence.length;

		while (x < N)
		{
			let y = route[x][1] + 1;
			let l_word = sentence.substring(x, y);
			//console.log(l_word, l_word.match(re_eng))
			if (l_word.match(re_eng) && l_word.length == 1)
			{
				buf += l_word;
				x = y;
			}
			else
			{
				if (buf.length > 0)
				{
					yieldValues.push(buf);
					buf = '';
				}
				yieldValues.push(l_word);
				x = y;
			}
		}
		if (buf.length > 0)
		{
			yieldValues.push(buf);
			buf = '';
		}
		return yieldValues;
	}
}

export default Jieba;
