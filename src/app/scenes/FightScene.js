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
        var backgroundLayer = this.backgroundLayer_;
        var bg = display.newColorLayer(display.COLOR_BLUE);
        backgroundLayer.addChild(bg);

        var bg = display.newSprite("#fight_bg.png", display.cx, display.cy, null)
        bg.setContentSizeScale(display.width, display.height);
        backgroundLayer.addChild(bg);

        var bg_down = display.newSprite("#fight_down_bg.png")
        bg_down.align(display.BOTTOM_LEFT, display.cx, 0);
        bg_down.setContentSizeScale(display.width, 159);
        backgroundLayer.addChild(bg_down);

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

        // 桌子上当前翻开的牌
        this.dealCardSprite = new CardSprite();
        this.dealCardSprite.initData(1);
        this.dealCardSprite.initView(true, FightConstants.full_card);
        this.batch_.addChild(this.dealCardSprite)
        this.dealCardSprite.setVisible(false)
        this.dealCardSprite.setPosition(display.left + 200, display.cy + 200);

        //开速开始按钮
        var param = {
            onTouchEndedHandle: function () {
                PomeloApi.createRoom('001', { count: 3 }, 'wosxieez' + new Date().getMilliseconds());
            }
        }
        var param2 = {
            onTouchEndedHandle: function () {
                PomeloApi.joinRoom('001', 'wosxieez' + new Date().getMilliseconds())
            }
        }
        var startSpt = display.newSprite("#hall_image_start.png", display.cx, 350)
        backgroundLayer.addChild(startSpt);
        TouchUtil.addTouchEventListener(startSpt, param)

        var startSpt2 = display.newSprite("#hall_image_start.png", display.cx, 250)
        backgroundLayer.addChild(startSpt2)
        TouchUtil.addTouchEventListener(startSpt2, param2)

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
        console.log('收到通知', event)
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
        roominfo.users.some(user => {
            if (user.username === PomeloApi.username) {
                this.my = user
                return true // 跳出循环
            }
        })
    },
    onNewRound: function (roominfo) {
        console.log('收到开局通知', roominfo)

        this.initRoomInfo(roominfo)

        // 新的一局开始
        // 显示空闲的桌上的空闲牌
        this.freeCardSprites = []
        for (var i = 0; i < roominfo.cards.length; i++) {
            var cardSprite = new CardSprite();
            cardSprite.initData({ cardId: i });
            cardSprite.initView(false, 'fight_big_card.png');
            this.batch_.addChild(cardSprite);
            cardSprite.setPosition(display.cx, display.top + 40);
            transition.moveTo(cardSprite, { delay: i * 0.01, time: 0.1, y: display.cy + 200 + i * .5 })
            this.freeCardSprites.push(cardSprite)
        }

        // 生存自己的牌 并排序
        this.myCardSprites = []
        for (var i = 0; i < this.my.handCards.length; i++) {
            var cardSprite = new CardSprite();
            cardSprite.initData(this.my.handCards[i])
            cardSprite.initView(true, FightConstants.big_card)
            this.batch_.addChild(cardSprite)
            cardSprite.setPosition(display.cx, display.top + 40)
            cardSprite.setTouch(this.onCardTouchEnd.bind(this))
            this.myCardSprites.push(cardSprite)
        }

        this.orderMyCard()
    },
    onPoker: function (data) {
        console.log('收到发牌信息', data)
        this.initRoomInfo(data)
        this.orderMyCard()
        this.dealCardSprite.initData(data.deal_card)
        this.dealCardSprite.initView(true, FightConstants.full_card);
        this.dealCardSprite.setVisible(true)
    },
    checkPeng: function (data) {
        console.log('收到检查碰操作', data)

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
        console.log('收到玩家碰操纵', data)
        this.initRoomInfo(data)
        this.orderMyCard()
    },
    checkEat: function (data) {
        console.log('收到检查吃操作', data)

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
        console.log('收到玩家吃操纵', data)
        this.initRoomInfo(data)
        this.orderMyCard()
    },
    onCardTouchEnd(cardSprite, data) {
        if (data.lastY > display.cy && this.canSt) {
            // 发送St命令 牌局开始
            var action = { name: Actions.St, data: cardSprite.cardId }
            PomeloApi.sendAction(action)
            this.canSt = false
            this.setVisibleWithFingerTips(false)
        }
        this.orderMyCard()
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
            this.countDownTimerSprite_.setVisible(true);
            this.countDownTimerSprite_.setPosition(display.cx, display.cy);
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
    // 排序自己的牌
    orderMyCard: function () {
        this.myCardSprites.forEach(cardSprite => {
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
                var cardSprite = this.myCardSprites[index];
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