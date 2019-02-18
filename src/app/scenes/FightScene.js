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

        this.shuffleCard();

        PomeloApi.addEventListener('onNotification', this.onNotification.bind(this))

        //开速开始按钮
        var that = this;
        var param = {
            onTouchEndedHandle : function(){
                PomeloApi.createRoom('001', {count: 3}, 'wosxieez' + new Date().getMilliseconds());
            }
        }
        var param2 = {
            onTouchEndedHandle : function(){
                PomeloApi.joinRoom('001', 'wosxieez' + new Date().getMilliseconds())
            }
        }
        var param3 = {
            onTouchEndedHandle : function(){
                PomeloApi.joinRoom('001', 'wosxieez' + new Date().getMilliseconds())
            }
        }
        var startSpt = display.newSprite("#hall_image_start.png",display.cx,350)
        backgroundLayer.addChild(startSpt);
        TouchUtil.addTouchEventListener(startSpt,param)

        var startSpt2 = display.newSprite("#hall_image_start.png",display.cx,250)
        backgroundLayer.addChild(startSpt2);
        TouchUtil.addTouchEventListener(startSpt2,param2)

        var startSpt3 = display.newSprite("#hall_image_start.png",display.cx,150)
        backgroundLayer.addChild(startSpt3);
        TouchUtil.addTouchEventListener(startSpt3,param3)

        return true;
    },
    onNotification: function (event) {
        console.log('收到通知')
        console.log(event.data.name == CMD.Notifications.onNewRound)
        if (event.data.name == CMD.Notifications.onNewRound) {
            this.onNewRound()
        }
    },
    //有人加入桌子 ，初始化该人的信息
    joinRoom: function (clientDirect, user) {
        var keySptName = "avatarSprite" + clientDirect + "_";
        this[keySptName].initViw(user);
    },
    /**
     * 发牌
     */
    onNewRound: function (cards) {
        var onHand = cards[1].onHand;
        //庄家 以及 玩家分配过来并初始化
        //纯牌的夹子安排
        this.fight_card_storage_.setVisible(true);//存牌的夹子
        var fight_card_storage = display.newSprite("#fight_up_card_storage.png", display.cx - 2, display.top - 140 + 5)
        fight_card_storage.align(display.BOTTOM_CENTER);
        this.batch_.addChild(fight_card_storage);

        for (var i = 0; i < 80; i++) {
            var cardSprite = this.allCardSpt_[80 - i - 1];//索引为0的放上面
            cardSprite.initView(false, "fight_small_card.png");
            cardSprite.setPosition(display.cx, display.top - 75 - 40 + i * 0.2);
        }


        //开始发牌
        var onHandleCardSpriteArr = [];
        for (var i = 0; i < 20; i++) {
            var index = i * 3;
            var delay = i * 0.04;

            var cardSprite0 = this.allCardSpt_[index];
            cardSprite0.initView(false, "fight_big_card.png");
            cardSprite0.setRotation(90);
            transition.moveTo(cardSprite0, { delay: delay, time: 0.2, x: display.right + 100 })


            var cardSprite1 = this.allCardSpt_[index + 1];
            cardSprite1.initView(false, "fight_big_card.png");
            transition.moveTo(cardSprite1, { delay: delay, time: 0.2, y: display.bottom - 115 });
            onHandleCardSpriteArr.push(cardSprite1);

            var cardSprite2 = this.allCardSpt_[index + 2];
            cardSprite2.initView(false, "fight_big_card.png");
            cardSprite2.setRotation(90);
            transition.moveTo(cardSprite2, { delay: delay, time: 0.2, x: display.left - 100 })
        }

        var cardSprite3 = this.allCardSpt_[60];
        cardSprite3.initView(false, "fight_big_card.png");
        if (onHand.length > 20) {
            transition.moveTo(cardSprite3, { time: 0.2, y: display.bottom - 115 });
            onHandleCardSpriteArr.push(cardSprite3);
        } else {
            cardSprite3.setRotation(90);
            transition.moveTo(cardSprite3, { delay: delay, time: 0.2, x: display.left - 100 })
        }


        //排列自己的牌
        var self = this;
        var onComplete = function () {
            self.orderMyCard(onHandleCardSpriteArr, onHand);
        }
        this.backgroundLayer_.performWithDelay(onComplete, 1.5);
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
    /**
     * 生成80张牌  洗牌 动画
     */
    shuffleCard: function () {
        var batch = this.batch_
        this.allCardSpt_ = [];

        var fight_card_storage = display.newSprite("#fight_card_storage.png", display.cx, display.top - 140)
        fight_card_storage.align(display.BOTTOM_CENTER);
        batch.addChild(fight_card_storage);
        fight_card_storage.setVisible(false);
        this.fight_card_storage_ = fight_card_storage;

        //生成牌
        for (var i = 0; i < 80; i++) {
            var cardSprite = new CardSprite();
            cardSprite.initData({ cardId: i });
            cardSprite.initView(false, "fight_wash_card.png");
            batch.addChild(cardSprite);
            cardSprite.setPosition(display.cx, display.top + 40);
            this.allCardSpt_.push(cardSprite)
            transition.moveTo(cardSprite, { delay: i * 0.01, time: 0.1, y: display.cy + i * .5 })
        }
    },
    /**
     * 第一次排列牌
     */
    orderMyCard: function (onHandleCardSprite, onHand) {
        //排列我的牌
        //        var loginModel = Singleton.getInstance("LoginModel");
        //        var me = loginModel.user;
        var outputCard = CardUtil.riffle(onHand);
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
                var cardSprite = onHandleCardSprite[index];
                cardSprite.setCardArrayIndex(i, j);
                cardSprite.initData({ cardId: oneOutputCard });
                cardSprite.initView(true, FightConstants.big_card);
                cardSprite.setPosition(x, y);
                cardSprite.setLocalZOrder(oneOutputCardArr.length - j);
                cardSprite.setTouch();

                oneonHandleCardSpriteArr.push(cardSprite)
                index++;
            }
            onHandleCardSpriteArr.push(oneonHandleCardSpriteArr)
        }
        //存储起来
        FightVo.onHandleCardSpriteArr_ = onHandleCardSpriteArr;
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

        //依赖注入mvc中的视图
        var handle = Singleton.getInstance("FightHandle");
        handle.setView(layer);
        layer.setHandle(handle);
        handle.init();
    }
});



