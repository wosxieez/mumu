/**
 * 战斗场景
 * Created by Administrator on 2014/7/7.
 */
var FightLayer = BaseScene.extend({
    ctor: function () {
        this._super();

        //背景层
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

        PomeloApi.addEventListener('onNotification', this.onNotification.bind(this))

        //开速开始按钮
        var that = this;
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
        backgroundLayer.addChild(startSpt2);
        TouchUtil.addTouchEventListener(startSpt2, param2)

        return true;
    },
    onNotification: function (event) {
        console.log('收到通知', event)
        console.log(event.data.name == CMD.Notifications.onNewRound)
        if (event.data.name == CMD.Notifications.onNewRound) {
            this.onNewRound(event.data.data)
        }
    },
    onNewRound: function (roominfo) {
        console.log('收到开局通知', roominfo)

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
        for (var i = 0; i < roominfo.users[0].cards.length; i++) {
            var cardSprite = new CardSprite();
            cardSprite.initData(roominfo.users[0].cards[i])
            cardSprite.initView(true, FightConstants.big_card)
            this.batch_.addChild(cardSprite)
            cardSprite.setPosition(display.cx, display.top + 40)
            cardSprite.setTouch(this.onCardTouchEnd.bind(this))
            this.myCardSprites.push(cardSprite)
        }

        this.orderMyCard()
    },
    onCardTouchEnd(cardSprite, data) {
        this.orderMyCard()
        console.log(data)
        if (data.lastY >= display.cy) {
            // 发送St命令 牌局开始
            var cmd = {name: CMD.Actions.St, data: cardSprite.cardId}
            PomeloApi.sendCMD(cmd)
        }
    },
    //倒计时提示
    setVisibleWithCountDownTimerTips: function (visible, position, onComplete) {
        if (this.countDownTimerSprite_ == null) {
            var tipLayer = this.tipLayer_;
            var countDownTimerSprite = new CountDownTimerSprite();
            tipLayer.addChild(countDownTimerSprite);
            this.countDownTimerSprite_ = countDownTimerSprite;
        }
        if (visible) {
            this.countDownTimerSprite_.setVisible(true);
            this.countDownTimerSprite_.setPosition(position.x, position.y);
            this.countDownTimerSprite_.start(15, onComplete)
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
    //提示用户 吃、碰、胡等
    cardOprateTipsShow: function (enableSpriteArray) {
        if (!this.cardOprateTipsSprite_) {
            var cardOprateTipsSprite = new CardOprateTipsSprite();
            cardOprateTipsSprite.setPosition(display.cx, display.cy);
            this.tipLayer_.addChild(cardOprateTipsSprite);
            this.cardOprateTipsSprite_ = cardOprateTipsSprite;
        }
        this.cardOprateTipsSprite_.initView(enableSpriteArray);
    },
    // 排序自己的牌
    orderMyCard: function () {
        var myCards = []
        this.myCardSprites.forEach(cardSprite => {
            myCards.push(cardSprite.cardId)
        })
        //排列我的牌
        var outputCard = CardUtil.riffle(myCards);
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
});

var FightScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        display.addSpriteFrames("res/Sheet_Fight.plist", "res/Sheet_Fight.png")

        var layer = new FightLayer();
        this.addChild(layer);
    }
});



