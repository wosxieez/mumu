/**
 * Singleton.js
 * 单例
 * Created by Administrator on 2014/7/21.
 */


////单例第一种方法
var Singleton = {};
Singleton.dict = {};

/**
* 获取实例
* @param ref 类名
* @returns {*}
*/
Singleton.getInstance = function(ref){
    if (this.dict[ref] == null){
        //var ref = Array.prototype.shift.apply(arguments)
        // 创建实例锁
        this.dict[ref] = false;
        this.dict[ref] = eval("new "+ref +"()"); //new ref(); //这种情况  我怎么把参数塞进构造函数里面去
    }
    return this.dict[ref];
}


Singleton.destory = function(ref){
    if (this.dict[ref] != null){
        this.dict[ref] = null;
    }
}






//var Singleton = cc.Class.extend({
//    instance:null,
//    ctor:function(){
//        if(instance==null){
//            instance = this
//        }else{
//            cc.log("error： instance error");
//        }
//    },
//    getInstance:function(cla){
//        if(instance == null){
//            instance = eval("new "+cla +"()");
//        }
//        return instance;
//    }
//});
