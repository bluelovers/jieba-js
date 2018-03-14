import jieba, { cut } from '..';

console.log(jieba);

/*
jieba.cut("我爸新学会了一项解决日常烦闷的活动，就是把以前的照片抱回办公室扫描保存，弄成电子版的。更无法接受的是，还居然放到网上来，时不时给我两张。\n这些积尘的化石居然突然重现，简直是招架不住。这个怀旧的阀门一旦打开，那就直到意识模糊都没停下来。")
	.then(function (ret)
	{
		console.log(ret);
	})
;

cut('我的中文東西。', function (ret)
{
	console.log(ret);
});
*/

cut('我的中文東西。 2222222222').then(function (ret)
{
	console.log(ret);
});
