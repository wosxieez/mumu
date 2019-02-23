/**
 * 大厅
 *  可以选择 ： 三人场  私人场  比赛场  单机场
 * Created by Administrator on 2014/7/7.
 */
var HallLayer =  BaseScene.extend({
    ctor: function () {
        this._super();

        //背景层
        var backgroundLayer = this.backgroundLayer_;

        var bg = display.newColorLayer(display.COLOR_BLUE);
        backgroundLayer.addChild(bg);

        var hall_image_up = display.newSprite("#hall_image_up.png",display.cx,display.top-50,null)
        hall_image_up.setContentSizeScale(display.width,100);
        backgroundLayer.addChild(hall_image_up)

        var hall_image_down = display.newSprite("#hall_image_down.png",display.cx,50,null)
        hall_image_down.setContentSizeScale(display.width,100);
        backgroundLayer.addChild(hall_image_down)

        //开速开始按钮
        var param = {
            onTouchEndedHandle : function(){
                PomeloApi.createRoom('001', { count: 3 }, 'wosxieez' + new Date().getMilliseconds())
                GameApp.enterScene("FightScene")
            }
        }
        var param2 = {
            onTouchEndedHandle : function(){
                PomeloApi.joinRoom('001', 'wosxieez' + new Date().getMilliseconds())
                GameApp.enterScene("FightScene")
            }
        }
        var startSpt = display.newSprite("#hall_image_start.png",display.cx,350)
        backgroundLayer.addChild(startSpt);
        TouchUtil.addTouchEventListener(startSpt,param)

        var startSpt2 = display.newSprite("#hall_image_start.png",display.cx,250)
        backgroundLayer.addChild(startSpt2);
        TouchUtil.addTouchEventListener(startSpt2,param2)

        return true;
    },
    /**
     * 帧刷新事件
     * @param dt
     */
    tick:function(dt){
        this._super(dt);
    }
});

var HallScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        display.addSpriteFrames("res/Sheet_Hall.plist","res/Sheet_Hall.png")

        var layer = new HallLayer();
        this.addChild(layer);
    }
})



