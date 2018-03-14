/**
 * Created by user on 2018/3/15/015.
 */

import Jieba from './src/jieba';

let _jieba = new Jieba();

const jieba = _jieba as Jieba & {
	Jieba: typeof Jieba,
	default: Jieba,
	jieba: Jieba,
};

jieba.Jieba = Jieba;

jieba.default = jieba;
jieba.jieba = jieba;

export = jieba;
