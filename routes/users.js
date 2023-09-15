var express = require('express');
var access = require('./function.js');
const db2 = require('./mssql.js');
var router = express.Router();

var db = new access(2, 3);
var conn = db.openConn();


/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource ');
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
/* GET home page. */
router.get('/info', function(req, res, next) {
    db2.selectAll('xy_admin', function(err, result) { //查询所有userInfo表的数据
        res.send(result.recordset)
        // res.render('userInfo', { results: result.recordset, moment: moment });
    });


    function getIP() {

    }
});

router.post('/delete', function(req, res, next) { //删除一条id对应的userInfo表的数据
    console.log(req.body, 77);
    const { UserId } = req.body
    const id = UserId
    db2.del("where id = @id", { id: id }, "userInfo", function(err, result) {
        console.log(result, 66);
        res.send('ok')
    });
});
router.post('/update/:id', function(req, res, next) { //更新一条对应id的userInfo表的数据
    var id = req.params.id;
    var content = req.body.content;
    db2.update({ content: content }, { id: id }, "userInfo", function(err, result) {
        res.redirect('back');
    });

});


module.exports = router;