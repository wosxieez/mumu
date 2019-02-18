/**
 * RoomAction.js
 * 服务器 房间相关的处理
 * Created by Administrator on 2014/8/29.
 */
var RoomAction = {

    // 1. 查找 room list，查找空房间加入，如果没有空房间，新建房间。
    // 2. 当前玩家人数为 1 人。创建round，创建定时器，定时加入NPC。
    // 3. 当前玩家人数为 2 人。开局游戏。
    // 4. 玩家数据保存到 round。
    joinRoom: function(userId, roomId, callback){
      // 1. 查找 room list，查找空房间加入，如果没有空房间，新建房间。
      // 2. 当前玩家人数为 1 人。创建round，创建定时器，定时加入NPC。
      // 3. 当前玩家人数为 2 人。开局游戏。
      // 4. 玩家数据保存到 round。
      var user = UserList.getUserByUserId(userId)
      roomId = RoomList.joinRoom(user, roomId);


      // 发消息通知其他玩家加入房间
      var serverDirect = RoomList.getServerDirectByUserId(userId);
      var joinRoomEvent = {
        cmd:CardUtil.ServerNotify.onJoinRoom,
        data:{
            serverDirect:serverDirect,//风位
          user: user
        }
      };
      ServerNotifyManager.sendCmdResponse(joinRoomEvent);


        // CardUtil.ServerNotify.onJoinRoom:
        if ( _.isFunction(callback)) {
            callback({rect:STATUS_SUCCESS,data:null});
        }


      if (RoomList.isFull(roomId)){
        RoomList.clearTimeout(roomId);
        RoundAction.newRound(roomId);

      } else {
        RoomList.setTimeout(roomId, setTimeOut(function(){
          var userId = UserAction.createNpcUser().userId;
          RoomAction.joinRoom(userId, roomId, function(){});
        }, 5*1000));
      }

    },



    joinPrivateRoom: function(userId, roomId, password, callback) {
      var user = UserList.getUserByUserId(userId)
      if(RoomLisst.joinPrivateRoom(user, roomId, password))
      {
        // 发消息通知其他玩家加入房间
        var serverDirect = RoomList.getServerDirectByUserId(userId);
        var joinRoomEvent = {
          cmd:CardUtil.ServerNotify.onJoinRoom,
          data:{
              serverDirect:serverDirect,//风位
            user: user
          }
        };
        ServerNotifyManager.sendCmdResponse(joinRoomEvent);


        if(roomList.isFull(roomId)){
          RoundAction.newRound(roomId, callback);
        }
      }

      if (_.isFunction(callback)) {
        callback();
      }
    },


    createRoom: function(userId, password, callback){
        var user = UserList.getUserByUserId(userId)
    }
};