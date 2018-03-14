# jieba-js

> jieba-js A JavaScript Chinese word segmentation tool in pure javascript, based on Python Jieba

## install

`npm install jieba-js`

## demo

```ts
import jieba, { cut } from 'jieba-js';
const jieba = require("jieba-js");
const jieba = require("jieba-js").jieba;

//------------

const Jieba = require("jieba").Jieba;
const jieba = new Jieba();
```

```ts
console.log(jieba);

jieba.cut("我爸新学会了一项解决日常烦闷的活动，就是把以前的照片抱回办公室扫描保存，弄成电子版的。更无法接受的是，还居然放到网上来，时不时给我两张。\n这些积尘的化石居然突然重现，简直是招架不住。这个怀旧的阀门一旦打开，那就直到意识模糊都没停下来。")
	.then(function (ret)
	{
		//console.log(ret);
	})
;

cut('我的中文東西。', function (ret)
{
	//console.log(ret);
});

cut('我的中文東西。 2222222222').then(function (ret)
{
	console.log(ret);
});
```

### Dict

> this method only work before first time call `jieba.cut` or `jieba.init`

```ts
jieba.useDict('path of dict file')

let dict = [
    ['xxx', 0, 'x'],
];

jieba.useDict(dict)
```

## link

- [hermanschaaf/jieba-js](https://github.com/hermanschaaf/jieba-js)
- [pulipulichen/jieba-js](https://github.com/pulipulichen/jieba-js)
