// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
require("./framework");
//利用window.onerror 函数 写bug 或者将bug 发送到服务器
(funtion(){
	if(!CC_EDITOR){ 
	    const type='ERROR_LOG', key = 'SystemError';
	    window.onerror = function(msg, url, line) {
	        var errorMsg = {
	            message : msg,
	            url : url,
	            line : line,
	            datetime : new Date().Format("yyyy-MM-dd hh:mm:ss")
	        }, value = GLocalStorage.getItem(type, key) || [];
	        if(value.length > 10) { //just have 10 records are stored
	            value.shift();
	        }
	        value.push(errorMsg);
	        GLocalStorage.setItem(type, key, value);
	        //send error message to server 
	        // socket.send("CLIENT_ERROR_MESSAGE",errorMsg);
	        return false;
	    };
	}
})();

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
    },

    start () {},

    // update (dt) {},

    // 获取URL数据
    initURLData(){
    	if (!cc.sys.isNative) {
            var url = window.location.search;  
            var theRequest = null;   
            if (url.indexOf("?") != -1) {   
                theRequest = new Object();
                var str = url.substr(1);   
                let strs = str.split("&");   
                for(var i = 0; i < strs.length; i ++) {   
                    theRequest[strs[i].split("=")[0]]=decodeURI(strs[i].split("=")[1]); 
                }  
                // var crypto = require("Crypto");
                // console.log(crypto.aes_dec_cbc(XMQ.Config.DEFAULT_AESKEY,XMQ.Config.DEFAULT_AESC,theRequest.data))
                // JSON.parse(crypto.aes_dec_cbc(XMQ.Config.DEFAULT_AESKEY,XMQ.Config.DEFAULT_AESC,theRequest.data));
            }  
        }
    },

    //后台暂停
    _pausedCallback(){
        this._isRestore = false;
        this._remarkTime = cc.js.getLocalTime();
    },
    //前台恢复
    _restoreCallback(){
        if(!this._isRestore){ //防止二次调用
            this._isRestore = true;
            // 后台时间超过10秒就再重新登录
            if(cc.js.getLocalTime() - this._remarkTime >= 10000){
                GNetMgr.closeAllSocket();
                this.startGame();
            }
        }
    },
    // 启动游戏的第一个场景
    startGame: function () {
        GSenceMgr.openScene("WelcomScene");
    },
    /**
     * 注册全局消息的处理函数
     * @private
     */
    _registerEventHandler: function () {
        addNodeEventListener('INVALID_TOKEN', this._invalidToken.bind(this));
        addNodeEventListener('CLOSE_GAME', this._closeGame.bind(this));
        cc.game.on(cc.game.EVENT_HIDE, this._pausedCallback.bind(this));
        cc.game.on(cc.game.EVENT_SHOW, this._restoreCallback.bind(this));
    },

    _invalidToken(){
    	//服务器的session失效，需要删除本地缓存的session数据重现向服务器申请token
        // let CommandCleanLocalAccount = require("CommandCleanLocalAccount");
        // new CommandCleanLocalAccount(() => {
        //     this.startGame();
        // });
        //断掉所有连接
        GNetMgr.closeAllSocket();
        this.scheduleOnce(this.startGame().bind(this),1/30);
    },
	_closeGame(){
		//关闭游戏
        if (cc.sys.isNative) {
            cc.game.end();
        } else {
            if (navigator.userAgent.indexOf("Firefox") != -1 || navigator.userAgent.indexOf("Chrome") !=-1) {
                window.location.href="about:blank";
                window.close();
            } else {
                window.opener = null;
                window.open("", "_self");
                window.close();
            }
        }
	},

});
