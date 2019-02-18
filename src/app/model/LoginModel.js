/**
 * 登陆的 LoginModel.js
 * Created by xhl on 2014/7/19.
 */
var LoginModel = BaseModel.extend({
    userId:null,
    user:null,
    /**
     *  连接
      * @param ip
     * @param port 端口
     */
   connect:function(ip,port){

   },

    /**
     * 登陆
     * 需要返回 当前用户的角色等各种信息
     * @param userName
     * @param passWord
     * @return 当前用户的角色等各种信息
     */
   login:function(userName,passWord,callBack){
        var that = this;
        var complete = function(result){
            var data = result.data;
            that.user = data;
            that.userId = data.userId;

            if(callBack){
                callBack();
            }
        }

        var data = null;
        if(FightVo.deskType == 2){
            alert("网络连接失败！")
        }else if(FightVo.deskType == 1){
            alert("网络连接失败！")
        }else{//单机
            LoginAction.login("真实用户-龙哥","123456",complete)
        }
   },






    /**
     * 在大厅hall中  去加入大厅的某个房间
     * @param deskType //0表示单机 1表示私人场  2表示三人网络场
     */
    joinHallRoom:function(deskType,callBack){
        if(deskType == 0 ){ //单机
            FightVo.deskType = 0;

        }else if(deskType == 2) {//三人网络场
            FightVo.deskType = 2;

        }

        if(callBack){
            callBack();
        }
    }


})

