var express = require('express');
var router = express.Router();
const svgCaptcha = require('svg-captcha');

var session = require('express-session');

router.use(
    session({
    secret:'keyboard cat',//服务端生成申明可随意写
    resave:true,//强制保存session即使他没有什么变化
    saveUninitialized:true,//强制将来初始化的session存储
    cookie:{//session是基于cookie的，所以可以在配置session的时候配置cookie|
        maxAge:1000*60,//设置过期时间
        secure:false//true的话表示只有https协议才能访问cookie
    }
}))



/* GET home page. */
router.get('/', function(req, res, next) {
 
    var captcha = svgCaptcha.create({
        // 翻转颜色 
        inverse: false,
        // 字体大小 
        fontSize: 36,
        // 噪声线条数 
        noise: 2,
        // 宽度 
        width: 80,
        // 高度 
        height: 30,
    });
    // 保存到session,忽略大小写 
    // req.session = captcha.text.toLowerCase();
     // req.session.yzm = captcha.text.toLowerCase();
     req.session.yzm=captcha.text.toLowerCase();



    // console.log(req.session); //0xtg 生成的验证码
    //保存到cookie 方便前端调用验证
    // res.cookie('captcha', req.session);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.write(String(captcha.data));
    res.end();
});
router.get('/aa', function(req, res, next) { 
    req.session.yzm="123"
    res.end(req.session.yzm);
});
router.get('/bb', function(req, res, next) { 
    res.end("showa="+req.session.yzm);
});
 
module.exports = router;