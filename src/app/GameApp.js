//require("config.js")
//require("engin.init.js")
/**
 * GameGameApp.js
 * 游戏主类
 * Created by Administrator on 2014/6/30.
 */
var GameApp ={};


//该程序的包
GameApp.packageRoot = "app";



/**
 * 程序第一次启动运行
 */
GameApp.run =function(){
    //load resources
//    cc.LoaderScene.preload(g_resources, function () {
//        cc.director.runScene(new LoginScene());
//    }, this);

    //通过调用enterScene 方法进入场景

//    this.enterScene("FightScene")
    FightConstants.init();
    console.log(this)
    this.enterScene("HallScene")
}

/**
 *  进入某一个场景
 * @param sceneName  当前场景名称
 * @param backScaneName 当前场景的上一个返回场景
 * @param param 进入场景的一些参数
 */
GameApp.enterScene = function(sceneName, param){
    var arr = SceneConstants.getSceneName(sceneName);
    var backScaneName = arr.backScene;
    var loadResources = arr.loadResources;


    enterSceneFun = function(sceneName, args){
        var scenePackageName = this. packageRoot + ".scenes." + sceneName;
        var sceneClass = scenePackageName; //这里就是动态加载一个类


        cc.LoaderScene.preload(loadResources, function () {
            var scene = SceneConstants.getScene(sceneName)//sceneClass.new(args)
            if(scene.initData) { //含有initData方法
                scene.initData(args);
            }
            cc.director.runScene(scene);
        }, this);
        return scene
    }



    /**参数**/
    if(param == null)
        param = {};
    param.sceneName = sceneName;


    //进入场景  并记录  上一个场景名称  当前场景名称  以及当前场景实例
    var scene = enterSceneFun(sceneName,param);
    this.previousSceneName_ = this.currentSceneName_;
    this.currentSceneName_ = sceneName;
    this.currentScene_ = scene;//display.getRunningScene();
}





/**
 * 返回到上一个场景
 */
GameApp.backScene = function(){
    var sceneName,backScaneName = SceneConstants.getSceneName();
    if(backScaneName) {
        this.enterScene(sceneName,backScaneName)
    }else{
        cc.game.exit();
    }
}