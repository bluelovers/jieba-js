import { loadStream } from '../loader/jieba/index';
import * as fs from 'fs';

/**
 * Created by user on 2018/3/14/014.
 */

export interface ITrie
{
	[key: string]: ITrieRow,
}

export type IFreq = {
	[key: string]: number,
}

export type ITrieRow = {
	[key: string]: ITrieRow | number,
	"" ?: number,
};

export function buildFromDict(dictionary: [string, number, string][], sourceTrie: ITrie = {}): [ITrie, IFreq, number]
{
	let lfreq: IFreq = {},
		trie: ITrie = sourceTrie || {},
		ltotal: number = 0.0;

	for (let i = 0; i < dictionary.length; i++)
	{
		let entry = dictionary[i],
			word = entry[0],
			freq = entry[1];

		lfreq[word] = freq;
		ltotal += freq;

		let p = trie as ITrieRow;

		for (let ci = 0; ci < word.length; ci++)
		{
			let c = word[ci];
			if (!(c in p))
			{
				p[c] = p[c] || {};
			}
			// @ts-ignore
			p = p[c];
		}
		//p[''] = ''; // ending flag
		p[''] = freq;
	}

	return [trie, lfreq, ltotal];
}

export default buildFromDict;

/*
loadStream('../../dict/dict.txt.big', function (err, dict, stream)
{
	if (err)
	{
		console.log(err);
		//console.log(stream);
	}

	else
	{
		let [trie, lfreq, ltotal] = buildFromDict(dict);

		console.log([trie, lfreq, ltotal]);

		//console.dir(trie['1']);

		fs.writeFileSync('../../test/temp/trie.json', JSON.stringify(trie, null, "\t"))
	}
});
*/
