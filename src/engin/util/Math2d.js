/**
 * 数学相关的计算
 * Created by xhl on 2014/7/15.
 */
var Math2d = {};


/**
 *  判断是否是偶数
 * @param number
 * @returns {*}
 */
Math2d.isEvenOrOddNumber = function(number){
    var isEven
    (number%2 ==0)?isEven=true:isEven=false;
    return isEven;
}