
//端口  63342
//http://localhost:63342/paohuzi/client/index.html
//这里交给 GameApp　处理
cc.game.onStart = function(){

    // Setup the resolution policy and design resolution size
   // cc.view.setDesignResolutionSize(960, 640, cc.ResolutionPolicy.SHOW_ALL);
    // Instead of set design resolution, you can also set the real pixel resolution size
    // Uncomment the following line and delete the previous line.
    // cc.view.setRealPixelResolution(960, 640, cc.ResolutionPolicy.SHOW_ALL);
    // The game will be resized when browser size change
	
    EnginInit.init();//引擎初始化
    GameApp.run();
    // PomeloApi.createRoom('001', {count: 3}, 'wosxieez' + new Date().getMilliseconds());
    // PomeloApi.joinRoom('001', 'wosxieez' + new Date().getMilliseconds())
};
cc.game.run();

///**
// * 老的启动游戏
// */
//cc.game.onStart = function(){
//    cc.view.setDesignResolutionSize(800, 450, cc.ResolutionPolicy.SHOW_ALL);
//    cc.view.resizeWithBrowserSize(true);
//
//
//    //load resources
//    cc.LoaderScene.preload(g_resources, function () {
//        cc.director.runScene(new HelloWorldScene());
//    }, this);
//};
//cc.game.run();