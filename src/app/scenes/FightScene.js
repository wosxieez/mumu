/**
 * 战斗场景
 * Created by Administrator on 2014/7/7.
 */
var FightLayer = BaseScene.extend({
    ctor: function () {
        this._super();

        //---------------------------------------------------------------------------------------------
        // 背景
        //---------------------------------------------------------------------------------------------
        var backgroundLayer = this.backgroundLayer_
        var bg = display.newColorLayer(display.COLOR_BLUE);
        backgroundLayer.addChild(bg)

        var bg = display.newSprite("#fight_bg.png", display.cx, display.cy, null)
        bg.setContentSizeScale(display.width, display.height)
        backgroundLayer.addChild(bg)

        var bg_down = display.newSprite("#fight_down_bg.png")
        bg_down.align(display.BOTTOM_LEFT, display.cx, 0)
        bg_down.setContentSizeScale(display.width, 159)
        backgroundLayer.addChild(bg_down)

        //---------------------------------------------------------------------------------------------
        // 图像显示
        //---------------------------------------------------------------------------------------------
        //加载三个头像显示
        var flysLayer = this.flysLayer_
        var avatarSprite0 = new AvatarSprite(); //上家
        avatarSprite0.setPosition(display.left + 120, display.top - 40);
        flysLayer.addChild(avatarSprite0);
        this.avatarSprite0_ = avatarSprite0

        var avatarSprite1 = new AvatarSprite(); //我
        avatarSprite1.setPosition(display.cx, display.bottom + 40);
        flysLayer.addChild(avatarSprite1);
        this.avatarSprite1_ = avatarSprite1

        var avatarSprite2 = new AvatarSprite(); //下家
        avatarSprite2.setPosition(display.right - 120, display.top - 40);
        flysLayer.addChild(avatarSprite2);
        this.avatarSprite2_ = avatarSprite2

        //---------------------------------------------------------------------------------------------
        // 生成80张牌
        //---------------------------------------------------------------------------------------------
        this.freeCardSprites = []
        this.myHandCardSprites = []
        this.myGroupCardSprites = []
        this.myPassCardSprites = []
        this.preGroupCardSprites = []
        this.prePassCardSprites = []
        this.nextGroupCardSprites = []
        this.nextPassCardSprites = []

        // 桌子上当前翻开的牌
        this.dealCardSprite = new CardSprite();
        this.dealCardSprite.initData(1);
        this.dealCardSprite.initView(true, FightConstants.full_card);
        this.batch_.addChild(this.dealCardSprite)
        this.dealCardSprite.setVisible(false)
        this.dealCardSprite.setPosition(display.left + 200, display.cy + 200);

        //---------------------------------------------------------------------------------------------
        // 操纵按钮层
        //---------------------------------------------------------------------------------------------
        // 碰按钮
        this.pengSprite = display.newSprite('#oprate_peng0.png', display.right - 100, display.cy)
        this.pengSprite.setVisible(false)
        TouchUtil.addTouchEventListener(this.pengSprite, {
            onTouchEndedHandle: () => {
                const action = { name: Actions.Peng, data: this.canPengCards }
                PomeloApi.sendAction(action)

                this.pengSprite.setVisible(false)
                this.pengSprite.setTouchEnabled(false)
            }
        })
        this.pengSprite.setTouchEnabled(false)
        this.tipLayer_.addChild(this.pengSprite)

        // 吃按钮
        this.chiSprite = display.newSprite('#oprate_chi0.png', display.right - 100, display.cy + 100)
        this.chiSprite.setVisible(false)
        TouchUtil.addTouchEventListener(this.chiSprite, {
            onTouchEndedHandle: () => {
                const action = { name: Actions.Chi, data: this.canEatCards }
                PomeloApi.sendAction(action)

                this.chiSprite.setVisible(false)
                this.chiSprite.setTouchEnabled(false)
            }
        })
        this.chiSprite.setTouchEnabled(false)
        this.tipLayer_.addChild(this.chiSprite)

        // 胡按钮
        this.huSprite = display.newSprite('#oprate_hu0.png', display.right - 100, display.cy - 100)
        this.huSprite.setVisible(false)
        this.tipLayer_.addChild(this.huSprite)

        // 过按钮
        this.closeSprite = display.newSprite('#oprate_close0.png', display.right - 100, display.cy - 200)
        this.closeSprite.setVisible(false)
        this.tipLayer_.addChild(this.closeSprite)

        //---------------------------------------------------------------------------------------------
        // 初始化
        //---------------------------------------------------------------------------------------------
        this.canSt = false // 默认不允许出牌
        PomeloApi.addEventListener('onNotification', this.onNotification.bind(this))

        return true;
    },
    onNotification: function (event) {
        const notification = event.data
        switch (notification.name) {
            case Notifications.onNewRound:
                this.onNewRound(notification.data)
                break;
            case Notifications.checkSt: // 请求出牌
                this.canSt = true
                this.setVisibleWithFingerTips(true, { x: display.cx, y: display.cy })
                break
            case Notifications.onPoker:
                this.onPoker(notification.data)
                break
            case Notifications.checkPeng:
                this.checkPeng(notification.data)
                break
            case Notifications.onPeng:
                this.onPeng(notification.data)
                break
            case Notifications.checkEat:
                this.checkEat(notification.data)
                break
            case Notifications.onEat:
                this.onEat(notification.data)
                break
            default:
                break;
        }
    },
    initRoomInfo(roominfo) {
        this.roominfo = roominfo
        for (var i = 0; i < roominfo.users.length; i++) {
            if (roominfo.users[i].username == PomeloApi.username) {
                var endUsers = roominfo.users.slice(i)
                var startUsers = roominfo.users.slice(0, i)
                var orderUsers = endUsers.concat(startUsers)
                this.my = orderUsers[0]
                this.next = orderUsers[1]
                this.pre = orderUsers.pop()
                break
            }
        }
        console.log('当前玩家', this.my.username)
        console.log('下个玩家', this.next.username)
        console.log('上个玩家', this.pre.username)
    },
    onNewRound: function (roominfo) {
        console.log('收到开局通知', roominfo)
        this.initRoomInfo(roominfo)
        this.updateFreeCardSprites()
        this.updateMyHandCardSprites()
        this.updateMyHandCardSpritesOrder()
    },
    onPoker: function (data) {
        // console.log('收到发牌信息', data)
        this.initRoomInfo(data)
        this.updateMyHandCardSpritesOrder()
        this.dealCardSprite.initData(data.deal_card)
        this.dealCardSprite.initView(true, FightConstants.full_card);
        this.dealCardSprite.setVisible(true)
    },
    checkPeng: function (data) {
        console.log('收到检查碰操作', data.username, data.card)

        this.pengSprite.setVisible(false)
        this.pengSprite.setTouchEnabled(false)

        this.chiSprite.setVisible(false)
        this.chiSprite.setTouchEnabled(false)
        this.closeSprite.setVisible(false)

        this.setVisibleWithCountDownTimerTips(false)

        if (data.username === PomeloApi.username) {
            this.canPengCards = CardUtil.canPeng(this.my.handCards, data.card)
            if (!!this.canPengCards) {
                console.log('可以碰的牌', this.canPengCards)
                this.pengSprite.setVisible(true)
                this.pengSprite.setTouchEnabled(true)
                this.closeSprite.setVisible(true)
            } else {
                // 发送无操纵指令
                const action = { name: Actions.Cancel, data: data.card }
                PomeloApi.sendAction(action)
            }
        } else {
            this.setVisibleWithCountDownTimerTips(true)
        }
    },
    onPeng: function (data) {
        // console.log('收到玩家碰操纵', data)
        this.initRoomInfo(data)
        this.updateMyGroupCardSprites()
        this.updatePreGroupCardSprites()
        this.updateNextGroupCardSprites()
        this.updateMyHandCardSpritesOrder()
    },
    checkEat: function (data) {
        console.log('收到检查吃操作', data.username, data.card)

        this.pengSprite.setVisible(false)
        this.pengSprite.setTouchEnabled(false)

        this.chiSprite.setVisible(false)
        this.chiSprite.setTouchEnabled(false)
        this.closeSprite.setVisible(false)

        this.setVisibleWithCountDownTimerTips(false)

        if (data.username === PomeloApi.username) {
            this.canEatCards = CardUtil.canChi(this.my.handCards, data.card)
            if (!!this.canEatCards) {
                console.log('可以吃的牌', this.canEatCards)
                this.chiSprite.setVisible(true)
                this.chiSprite.setTouchEnabled(true)
                this.closeSprite.setVisible(true)
            } else {
                // 发送无操纵指令
                const action = { name: Actions.Cancel, data: data.card }
                PomeloApi.sendAction(action)
            }
        } else {
            this.setVisibleWithCountDownTimerTips(true)
        }
    },
    onEat: function (data) {
        // console.log('收到玩家吃操纵', data)
        this.initRoomInfo(data)
        this.updateMyGroupCardSprites()
        this.updatePreGroupCardSprites()
        this.updateNextGroupCardSprites()
        this.updateMyHandCardSpritesOrder()
    },
    onCardTouchEnd(cardSprite, data) {
        if (data.lastY > display.cy && this.canSt) {
            // 发送St命令 牌局开始
            var action = { name: Actions.St, data: cardSprite.cardId }
            PomeloApi.sendAction(action)
            this.canSt = false
            this.setVisibleWithFingerTips(false)
        }
        this.updateMyHandCardSpritesOrder()
    },
    //倒计时提示
    setVisibleWithCountDownTimerTips: function (visible, onComplete) {
        if (this.countDownTimerSprite_ == null) {
            var tipLayer = this.tipLayer_;
            var countDownTimerSprite = new CountDownTimerSprite();
            tipLayer.addChild(countDownTimerSprite);
            this.countDownTimerSprite_ = countDownTimerSprite;
        }
        if (visible) {
            this.countDownTimerSprite_.setVisible(true)
            this.countDownTimerSprite_.setPosition(display.cx, display.cy)
            this.countDownTimerSprite_.start(5, onComplete)
        } else {
            this.countDownTimerSprite_.stop();
            this.countDownTimerSprite_.setVisible(false);
        }
    },
    //滑动出牌提示
    setVisibleWithFingerTips: function (visible, position) {
        if (this.fingerTips_ == null) {
            var tipLayer = this.tipLayer_;
            var fingerTips = display.newNode();
            var fight_finger_tips = display.newSprite("#fight_finger_tips.png");
            TransitionEffect.backAndForth(fight_finger_tips);
            fingerTips.addChild(fight_finger_tips);
            fingerTips.addChild(display.newSprite("#fight_txt_finger_tips.png"));
            tipLayer.addChild(fingerTips);
            this.fingerTips_ = fingerTips;
        }

        if (visible) {
            this.fingerTips_.setVisible(true);
            this.fingerTips_.setPosition(position.x, position.y);
        } else {
            this.fingerTips_.setVisible(false);
        }
    },
    updateFreeCardSprites: function () {
        var cardSprite 
        const oldFreeCardSprites = this.freeCardSprites
        this.freeCardSprites = []
        for (var i = 0; i < this.roominfo.cards.length; i++) {
            cardSprite = oldFreeCardSprites.pop()
            if (!cardSprite) {
                cardSprite = new CardSprite()
                this.batch_.addChild(cardSprite);
            }
            cardSprite.initData({ cardId: i });
            cardSprite.initView(false, 'fight_big_card.png');
            cardSprite.setPosition(display.cx, display.cy + 200 + i * .5);
            this.freeCardSprites.push(cardSprite)
        }
    },
    updateMyHandCardSprites: function () {
        var cardSprite 
        const oldMyHandCardSprites = this.myHandCardSprites
        this.myHandCardSprites = []
        for (var i = 0; i < this.my.handCards.length; i++) {
            cardSprite = oldMyHandCardSprites.pop()
            if (!cardSprite) {
                cardSprite = new CardSprite()
                this.batch_.addChild(cardSprite);
            }
            cardSprite.initData(this.my.handCards[i])
            cardSprite.initView(true, FightConstants.big_card)
            cardSprite.setPosition(display.cx, display.top + 40)
            cardSprite.setTouch(this.onCardTouchEnd.bind(this))
            this.myHandCardSprites.push(cardSprite)
        }
    },
    updateMyGroupCardSprites: function () {
        this.myGroupCardSprites.forEach(cs => {
            cs.setVisible(false)
        })
        var cardSprite 
        var group
        const oldMyGroupCardSprites = this.myGroupCardSprites
        this.myGroupCardSprites = []
        for (var i = 0; i < this.my.groupCards.length; i++) {
            group = this.my.groupCards[i]
            for (var j = 0; j < group.length; j++) {
                cardSprite = oldMyGroupCardSprites.pop()
                if (!cardSprite) {
                    cardSprite = new CardSprite()
                    this.batch_.addChild(cardSprite)
                }
                cardSprite.initData(group[j])
                cardSprite.setVisible(true)
                cardSprite.initView(true, FightConstants.small_card)
                cardSprite.setPosition(display.left + 50 + i * 30, display.bottom + 50 + j * 30)
                this.myGroupCardSprites.push(cardSprite)
            }
        }
    },
    // 更新上家的组合牌
    updatePreGroupCardSprites: function () {
        this.preGroupCardSprites.forEach(cs => {
            cs.setVisible(false)
        })
        var cardSprite 
        var group
        const oldPreGroupCardSprites = this.preGroupCardSprites
        this.preGroupCardSprites = []
        for (var i = 0; i < this.pre.groupCards.length; i++) {
            group = this.pre.groupCards[i]
            for (var j = 0; j < group.length; j++) {
                cardSprite = oldPreGroupCardSprites.pop()
                if (!cardSprite) {
                    cardSprite = new CardSprite()
                    this.batch_.addChild(cardSprite)
                }
                cardSprite.initData(group[j])
                cardSprite.setVisible(true)
                cardSprite.initView(true, FightConstants.small_card)
                cardSprite.setPosition(display.left + 50 + i * 30, display.cy + 50 + j * 30)
                this.preGroupCardSprites.push(cardSprite)
            }
        }
    },
    // 更新下家的组合牌
    updateNextGroupCardSprites: function () {
        this.nextGroupCardSprites.forEach(cs => {
            cs.setVisible(false)
        })
        var cardSprite 
        var group
        const oldNextGroupCardSprites = this.nextGroupCardSprites
        this.nextGroupCardSprites = []
        for (var i = 0; i < this.next.groupCards.length; i++) {
            group = this.next.groupCards[i]
            for (var j = 0; j < group.length; j++) {
                cardSprite = oldNextGroupCardSprites.pop()
                if (!cardSprite) {
                    cardSprite = new CardSprite()
                    this.batch_.addChild(cardSprite)
                }
                cardSprite.initData(group[j])
                cardSprite.setVisible(true)
                cardSprite.initView(true, FightConstants.small_card)
                cardSprite.setPosition(display.cx + 50 + i * 30, display.cy + 50 + j * 30)
                this.nextGroupCardSprites.push(cardSprite)
            }
        }
    },
    updateMyHandCardSpritesOrder: function () {
        this.myHandCardSprites.forEach(cardSprite => {
            cardSprite.setVisible(false)
        })
        //排列我的牌
        var outputCard = CardUtil.riffle(this.my.handCards);
        var behaveNum = checkint(outputCard.length / 2)

        var onHandleCardSpriteArr = [];
        var index = 0;
        for (var i = 0; i < outputCard.length; i++) {
            var oneOutputCardArr = outputCard[i]
            var x = display.cx;
            if (i < behaveNum) {
                x = x - (behaveNum - i) * 75;
            } else {
                x = x + (i - behaveNum) * 75;
            }

            var oneonHandleCardSpriteArr = [];
            for (var j = 0; j < oneOutputCardArr.length; j++) {
                var y = display.bottom + 115 + j * 115 / 2;
                var oneOutputCard = oneOutputCardArr[j];
                var cardSprite = this.myHandCardSprites[index];
                cardSprite.setCardArrayIndex(i, j);
                cardSprite.initData(oneOutputCard);
                cardSprite.initView(true, FightConstants.big_card);
                cardSprite.setPosition(x, y);
                cardSprite.setVisible(true)
                cardSprite.setLocalZOrder(oneOutputCardArr.length - j);

                oneonHandleCardSpriteArr.push(cardSprite)
                index++;
            }
            onHandleCardSpriteArr.push(oneonHandleCardSpriteArr)
        }
    },

    /**
     * 帧刷新事件
     * @param dt
     */
    tick: function (dt) {
        this._super(dt);
    }
})

var FightScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        display.addSpriteFrames("res/Sheet_Fight.plist", "res/Sheet_Fight.png")

        var layer = new FightLayer();
        this.addChild(layer);
    }
})