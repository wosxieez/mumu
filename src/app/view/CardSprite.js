var CardSprite = cc.Sprite.extend({
    initData: function (cardId) {
        this.cardId = cardId;//定义牌的标记 1-20  1-10 表示小写  11-20表示大写
        this.cardType = this.cardId > 10 ? "d" : "x";//定义大小 d 或者 x
        this.cardNum = checkint((this.cardId) % 10);//定义卡片的数字
        if (this.cardNum == 0) this.cardNum = 10;
    },
    initView: function (showFlag, imageName) {
        if (showFlag) {
            var imageName = "fight_" + imageName + "_" + this.cardType + this.cardNum + ".png";
            var spriteFrame = display.newSpriteFrame(imageName)
            //在需要时，修改 Sprite 的显示内容
            this.setSpriteFrame(spriteFrame)
        } else {
            var spriteFrame = display.newSpriteFrame(imageName)
            //cardSpt.initWithSpriteFrame(spriteFrame)
            this.setSpriteFrame(spriteFrame);
        }
    },
    setCardArrayIndex: function (bigIndex, smallIndex) {//记录当前卡牌所在的数组索引
        this.bigArrayIndex_ = bigIndex;
        this.smallArrayIndex_ = smallIndex;
    },
    setTouch: function (callback) {
        var that = this;
        var param = {
            onTouchBeganHandle: function (touch, event) {
                var x = touch.getLocationX();
                var y = touch.getLocationY();
                that.drag = {
                    startX: x,//that.getPositionX(),
                    startY: y,// that.getPositionY(),
                    lastX: 0,
                    lastY: 0,
                    offsetX: 0,
                    offsetY: 0,
                    moveOffsetX: 0,
                    moveOffsetY: 0,
                    time: 0
                }
            },
            onTouchMovedHandle: function (touch, event) {
                var x = touch.getLocationX();
                var y = touch.getLocationY();
                that.setPosition(x, y);
            },
            onTouchEndedHandle: function (touch, event) {
                var x = touch.getLocationX();
                var y = touch.getLocationY();
                that.drag.lastX = x;
                that.drag.lastY = y;
                callback(that, that.drag)
                that.drag = null
            }
        }
        TouchUtil.addTouchEventListener(this, param);
        this.setTouchEnabled(true);
    }
})