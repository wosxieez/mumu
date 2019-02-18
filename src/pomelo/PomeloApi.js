var PomeloApi = {}


/**
 * 创建房间
 *
 * @param {*} roomname
 * @param {*} username
 * @param {*} callback
 */
PomeloApi.createRoom = function (roomname, roominfo, username, callback) {
  this.roomname = roomname
  this.username = username

  queryEntry(username, function (host, port) {
    window.pomelo.init({ host, port }, function () {
      window.pomelo.request('connector.entryHandler.createRoom', { roomname, roominfo, username }, function (data) {
        if (data.code === 0) {
          window.pomelo.on('onNotification', PomeloApi.onNotification)
          PomeloApi.sendCMD({ name: CMD.Actions.St, value: true }) // 发送准备就绪指令
        }
      })
    })
  })
}

/**
 * 加入房间
 *
 * @param {*} roomname
 * @param {*} username
 * @param {*} callback
 */
PomeloApi.joinRoom = function (roomname, username, callback) {
  this.roomname = roomname
  this.username = username

  queryEntry(username, function (host, port) {
    window.pomelo.init({ host, port }, function () {
      window.pomelo.request('connector.entryHandler.joinRoom', { roomname, username }, function (data) {
      })
    })
  })
}

/**
 * 发送消息
 *
 * @param {*} msg
 */
PomeloApi.send = function (msg) {
  console.log(this)
  window.pomelo.request('chat.roomHandler.send', { roomname: this.roomname, from: this.username, content: msg, to: '*' }, function (data) {
    console.log(data)
  })
}

PomeloApi.sendCMD = function (cmd) {
  window.pomelo.request('chat.roomHandler.sendCMD', cmd, function (data) {
    console.log('send cmd result data', data)
  })
}

PomeloApi.onNotification = function (notification) {
  PomeloApi.dispatchEvent({name: 'onNotification', data: notification})
}

// 查询入口服务
function queryEntry(username, callback) {
  var route = 'gate.gateHandler.queryEntry';
  window.pomelo.init({
    host: '127.0.0.1',
    port: 3014,
    log: true
  }, function () {
    window.pomelo.request(route, {
      username
    }, function (data) {
      window.pomelo.disconnect();
      if (data.code === 500) {
        return;
      }
      callback(data.host, data.port);
    });
  });
}

EventProtocol.extend(PomeloApi);

var CMD = {}

CMD.Actions = {
  St: 'st',         // 状态
  Ti: "ti",         // 提
  Pao: "pao",       // 跑
  Wei: "wei",       // 偎
  Peng: "peng",     // 碰
  Hu: "hu",         // 胡牌
  Chi: "chi",       // 吃牌
  Cancel: "cancel", // 取消 
  Idle: "idle"      // 无操作
}

CMD.Notifications = {
  onJoinRoom: 1,    // 新玩家加入通知
  onNewRound: 2,    // 开局通知
  onDisCard: 3,    //等待玩家出牌
  onCard: 4,    // 玩家出的牌
  onEat: 5,    // 玩家吃牌
  onPeng: 11,    // 玩家碰牌
  onWei: 6,    // 玩家偎牌
  onWin: 7,    // 玩家胡牌
  onTi: 8,    // 玩家提牌
  onPao: 9,    // 玩家跑牌
  onNewCard: 10   // 新底牌
}