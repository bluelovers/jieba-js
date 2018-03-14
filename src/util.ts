/**
 * Created by user on 2018/3/15/015.
 */

export function max_of_array(array): number
{
	return Math.max.apply(Math, array)
}

export function min_of_array(array): number
{
	return Math.min.apply(Math, array)
}

import * as self from './util';
export default self;

