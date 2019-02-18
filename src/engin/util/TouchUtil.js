/**
 * TouchUtil
 * 使用方法

 //创建一个sprite
 display.addSpriteFrames("res/explosion.plist","res/explosion.png")
 var sprite1 =display.newSprite("#explosion_08.png");
 this.addChild(sprite1);
 sprite1.setPosition(display.cx,display.cy)

 var param = {
    onTouchEndedHandle : function(){
        cc.log("onTouchEndedHandle 点击到了");
    }
 }
TouchUtil.addTouchEventListener(sprite1,param)



 //禁用触摸事件



 *
 * 给按钮添加触摸
 * Created by xhl on 2014/7/5.
 */
var TouchUtil = {};


/**
 * 只监听点击弹起后的事件
 * @param target
 * @param param
 */
TouchUtil.addTouchEndEventListener = function(target,callBack){
    var param = {
        onTouchEndedHandle : function(){
            if(callBack){
                callBack();
            }
        }
    }
    TouchUtil.addTouchEventListener(target,param)
}



/**
 * 监听事件
 * @param target 要添加触摸的显示对象
 * @param 相关的事件回调  比如触摸结束 触摸开始  触摸移动等
 */
TouchUtil.addTouchEventListener = function(target,param){
    var onTouchEndedHandle = param.onTouchEndedHandle;
    var onTouchMovedHandle = param.onTouchMovedHandle;
    var onTouchBeganHandle = param.onTouchBeganHandle;

    var onTouchEndedHandleFun = function(touch,event){
        if(onTouchEndedHandle){
            cc.log("sprite onTouchesEnded.. ");
            onTouchEndedHandle(touch,event);
        }
    }
    var onTouchMovedHandleFun = function(touch,event){
        if(onTouchMovedHandle){
            cc.log("sprite onTouchMoved.. ");
            onTouchMovedHandle(touch,event);
        }
    }
    var onTouchBeganHandleFun = function(touch,event){
        cc.log("sprite onTouchBegan.. ");
        if(onTouchBeganHandle){
            onTouchBeganHandle(touch,event);
        }
    }

    //监听函数
    var listener = cc.EventListener.create({
        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        swallowTouches:true,
        onTouchBegan: function(touch, event){
            var target = event.getCurrentTarget();

            var locationInNode = target.convertToNodeSpace(touch.getLocation());
            var s = target.getContentSize();
            var rect = cc.rect(0, 0, s.width, s.height);

//            var currentRect = target.getBoundingBox();
//            var rect = cc.rect(currentRect.getMinX(), currentRect.getMinY(), currentRect.getMaxX(), currentRect.getMaxY());

            if (cc.rectContainsPoint(rect, locationInNode)) {
                //cc.log("sprite onTouchBegan.. ");
                //target.setOpacity(180);
                onTouchBeganHandleFun(touch,event);
                return true;
            }
            return false;
        },
        onTouchMoved: function(touch, event){
            //cc.log("sprite onTouchMoved.. ");
            onTouchMovedHandleFun(touch,event)
            return true
        },
        onTouchEnded: function(touch, event){
            //cc.log("sprite onTouchesEnded.. ");
            //event.getCurrentTarget().setOpacity(255);
            onTouchEndedHandleFun(touch,event);
        }
    });
    cc.eventManager.addListener(listener, target);

    /***自己加的一个控制触摸事件的方法**/
    target.setTouchEnabled = function(enable){
        listener.setEnabled(enable);
    }

    return listener
}