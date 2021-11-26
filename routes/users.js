var express = require('express');
var access = require('./function.js');
var router = express.Router();

var db = new access(2, 3);
var conn = db.openConn();


/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource ' + me.a);
});

router.get('/install', function(req, res, next) {
    var ip = req.ip;
    var nLen = ip.lastIndexOf(":");
    if (nLen >= 0) {
        ip = ip.substr(nLen + 1);
    }
    db.install(ip); //安装
    db.getWebSite(function(rs) {
        // rs['list']=[1,2,3,4]
        console.log(ip)
        res.writeHead(200, {
            'content-type': 'text/html;charset=utf8'
        });
        res.end("安装完成!<a href='/m/login'>点击登录后台</a>");
    });

    // db.closeConn();
});

router.get('/abc', function(req, res, next) {
    // conn.end();
    res.render('users', { title: 'Express', body: db.aabb() });
});

function getIP() {

}




module.exports = router;