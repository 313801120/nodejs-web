var $ = require('underscore');
var md5 = require('md5-node');
var mysql = require('mysql');

//时间格式化20211017 如 timeFormat(new Date(),"yyyy-MM-dd hh:mm:ss")
function timeFormat(myDate, fmt) {
    var o = {
        "M+": myDate.getMonth() + 1, //月份 
        "d+": myDate.getDate(), //日 
        "h+": myDate.getHours(), //小时 
        "m+": myDate.getMinutes(), //分 
        "s+": myDate.getSeconds(), //秒 
        "q+": Math.floor((myDate.getMonth() + 3) / 3), //季度 
        "S": myDate.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (myDate.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


// 定义类
class Access {
    //构造函数
    constructor(x, y) {
        this.x = x; //类中变量
        this.y = y;
        this.webTitle = "this is title"
    }

    openConn() {
        var conn = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'phpwebdata',
            charset: 'UTF8_GENERAL_CI'
        });
        conn.connect();
        return conn;
    }

    //时间格式化20211017 如 timeFormat(new Date(),"yyyy-MM-dd hh:mm:ss")
    timeFormat(myDate, fmt) {
        return timeFormat(myDate, fmt);
    }
    install(ip) {
        var conn = this.openConn(); //打开数组库
        conn.query(
            'CREATE TABLE website' +
            '(id INT(11) AUTO_INCREMENT, ' +
            'webtitle VARCHAR(255), ' + //网站标题
            'webkeywords VARCHAR(255), ' + //网站关键词
            'webdescription VARCHAR(255), ' + //网站描述
            'webbottom VARCHAR(255), ' + //底部
            'weburl VARCHAR(255), ' + //网址
            'email VARCHAR(255), ' + //邮箱
            'copyright VARCHAR(255), ' + //版权
            'logo VARCHAR(255), ' + //logo
            'qrcode VARCHAR(255), ' + //二维码
            'addtime DATETIME, ' + //添加时间
            'edittime DATETIME, ' + //修改时间
            'content TEXT, ' + //备注
            'PRIMARY KEY (id)) charset=utf8;', //加个解决中文乱码
            function(err, result) {
                if (err) {
                    console.log("表1 website 存在");
                } else {
                    console.log("表 website 创建成功");
                    // conn.end();
                    var addSql = 'INSERT INTO website(webTitle,webKeywords,webDescription,webBottom,weburl) VALUES(?,?,?,?,?)';
                    var params = ['xiyuetaCMS内容管理系统V1.0', 'xiyueta,xiyuetaCMS,xytcms', 'xiyuetaCMS内容管理系统V1.0，是一套网站内容管理系统，是基于nodejs的express框架开发', 'Copyright © 2021 xiyueta.com MIT Licensed<br>免责声明 SiteMap 皖ICP备2021012434号', 'http://www.xiyueta.com/'];
                    //增
                    conn.query(addSql, params, function(err, result) {
                        if (err) {
                            console.log('[INSERT ERROR] - ', err.message);
                        }
                    });


                }
            });

        conn.query(
            'CREATE TABLE admin' +
            '(id INT(11) AUTO_INCREMENT, ' +
            'username VARCHAR(255), ' + //账号
            'pwd VARCHAR(255), ' + //密码
            'nickname VARCHAR(255), ' + //昵称
            'level INT(11) Default 1, ' + //等级
            'pic VARCHAR(255), ' + //头像
            'sex VARCHAR(2) Default "男",' + //性别
            'email VARCHAR(255), ' + //邮箱
            'mobile VARCHAR(255), ' + //手机
            'isthrough INT(2) Default 1, ' + //是否通过
            'regip VARCHAR(255), ' + //注册IP
            'upip VARCHAR(255), ' + //更新IP
            'addtime DATETIME, ' + //添加时间
            'edittime DATETIME, ' + //修改时间
            'content TEXT, ' + //备注
            'PRIMARY KEY (id)) charset=utf8;', //加个解决中文乱码
            function(err, result) {
                if (err) {
                    console.log("表2 admin 存在");
                } else {
                    console.log("表 admin 创建成功");
                    // conn.end();
                    var addSql = 'INSERT INTO admin(username,pwd,nickname,regip,pic,mobile,email,content,addtime) VALUES(?,?,?,?,?,?,?,?,?)';
                    var params = ['admin', md5('admin'), '小云', ip, '/images/spring.jpg', '18129330988', '313801120@qq.com', "这是超级管理员", timeFormat(new Date(), "yyyy-MM-dd hh:mm:ss")];
                    //增
                    conn.query(addSql, params, function(err, result) {
                        if (err) {
                            console.log('[INSERT ERROR] - ', err.message);
                        }
                    });
                    //第二个管理员
                    var addSql = 'INSERT INTO admin(level,username,pwd,nickname,regip,pic,mobile,email,content,addtime) VALUES(?,?,?,?,?,?,?,?,?,?)';
                    var params = [2, 'test', md5('test'), '张三', ip, '/images/spring.jpg', '18666666666', 'test@qq.com', "这是一个其它管理员", timeFormat(new Date(), "yyyy-MM-dd hh:mm:ss")];
                    //增
                    conn.query(addSql, params, function(err, result) {
                        if (err) {
                            console.log('[INSERT ERROR] - ', err.message);
                        }
                    });


                }
            });

        conn.query(
            'CREATE TABLE webcolumn' +
            '(id INT(11) AUTO_INCREMENT, ' +
            'name VARCHAR(255), ' + //账号
            'enname VARCHAR(255), ' + //密码
            'type VARCHAR(255), ' + //昵称
            'parentid INT(11) Default -1, ' + //上一级ID
            'sort INT(11) Default 0, ' + //排序
            'views INT(11) Default 0, ' + //显示总数
            'pic VARCHAR(255), ' + //头像 
            'isthrough INT(2) Default 1, ' + //是否通过 
            'pagesize INT(12) Default 10, ' + //页数 
            'ip VARCHAR(255), ' + //IP
            'webtitle VARCHAR(255), ' + //网站标题
            'webkeywords VARCHAR(255), ' + //网站关键词
            'webdescription VARCHAR(255), ' + //网站描述

            'addtime DATETIME, ' + //添加时间
            'edittime DATETIME, ' + //修改时间
            'summary VARCHAR(255), ' + //总结
            'content TEXT, ' + //备注
            'PRIMARY KEY (id)) charset=utf8;', //加个解决中文乱码
            function(err, result) {
                if (err) {
                    console.log("表2 webcolumn 存在");
                } else {
                    console.log("表 webcolumn 创建成功");
                    // conn.end();
                    var addSql = 'INSERT INTO webcolumn(name,sort,pagesize,addtime) VALUES(?,?,?,?)';
                    var params = ['网站首页', 0, 20, timeFormat(new Date(), "yyyy-MM-dd hh:mm:ss")];
                    //增
                    conn.query(addSql, params, function(err, result) {
                        if (err) {
                            console.log('[INSERT ERROR] - ', err.message);
                        }
                    });
                    //第二条
                    var addSql = 'INSERT INTO webcolumn(name,sort,pagesize,addtime) VALUES(?,?,?,?)';
                    var params = ['关于我们', 1, 20, timeFormat(new Date(), "yyyy-MM-dd hh:mm:ss")];
                    //增
                    conn.query(addSql, params, function(err, result) {
                        if (err) {
                            console.log('[INSERT ERROR] - ', err.message);
                        }
                    });

                }
            });

        conn.query(
            'CREATE TABLE article' +
            '(id INT(11) AUTO_INCREMENT, ' +
            'parentid INT(11) Default -1, ' + //上一级ID
            'title VARCHAR(255), ' + //标题
            'sort INT(11) Default 0, ' + //排序
            'views INT(11) Default 0, ' + //显示总数
            'smallpic VARCHAR(255), ' + //小图
            'pic VARCHAR(255), ' + //图片
            'author VARCHAR(255), ' + //作者 
            'isthrough INT(2) Default 1, ' + //是否通过  
            'ip VARCHAR(255), ' + //IP
            'flags VARCHAR(255), ' + //旗 
            'webkeywords VARCHAR(255), ' + //网站关键词
            'webdescription VARCHAR(255), ' + //网站描述

            'addtime DATETIME, ' + //添加时间
            'edittime DATETIME, ' + //修改时间
            'summary VARCHAR(255), ' + //总结
            'content TEXT, ' + //备注
            'PRIMARY KEY (id)) charset=utf8;', //加个解决中文乱码
            function(err, result) {
                if (err) {
                    console.log("表2 article 存在");
                } else {
                    console.log("表 article 创建成功");
                    // conn.end();
                    var addSql = 'INSERT INTO article(title,sort,addtime) VALUES(?,?,?)';
                    var params = ['这是第一篇文章', 0, timeFormat(new Date(), "yyyy-MM-dd hh:mm:ss")];
                    //增
                    conn.query(addSql, params, function(err, result) {
                        if (err) {
                            console.log('[INSERT ERROR] - ', err.message);
                        }
                    });
                    //第二条
                    var addSql = 'INSERT INTO article(title,sort,addtime) VALUES(?,?,?)';
                    var params = ['这是第2篇文章', 0, timeFormat(new Date(), "yyyy-MM-dd hh:mm:ss")];
                    //增
                    conn.query(addSql, params, function(err, result) {
                        if (err) {
                            console.log('[INSERT ERROR] - ', err.message);
                        }
                    });
                }
            });
    }
    //获得网站标题关键词描述等信息
    getWebSite(callback) {
        var conn = this.openConn(); //打开数组库
        //查
        var sql = 'SELECT * FROM website ';
        conn.query(sql, function(err, rows) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                callback({})
            }
            var tempAccount = $.map(rows, function(c) {
                return {
                    webTitle: c.webTitle,
                    webKeywords: c.webKeywords,
                    webDescription: c.webDescription,
                    webBottom: c.webBottom
                }
            });

            callback(tempAccount[0]);
        });
    }
    //检测是否登录
    adminAnQuan(adminid, callback) {
        if (typeof(adminid) != "number") {
            callback({ nickname: undefined });
            return;
        }
        var conn = this.openConn(); //打开数组库
        //查
        var sql = 'SELECT * FROM admin WHERE id=' + adminid;
        conn.query(sql, function(err, rows) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                callback({ nickname: undefined });
                return "";
            }
            var tempAccount = $.map(rows, function(c) {
                return {
                    nickname: c.nickname
                }
            });
            if (rows.length == 0) {
                callback({ nickname: undefined });
            } else {
                callback({ nickname: rows[0].nickname });
            }
        });
    }

    //类中函数
    aabb() {
        return '(' + this.x + ', ' + this.y + ')';
    }


    //静态函数
    static sayHello(name) {
        //修改静态变量
        this.para = name;
        return 'Hello, ' + name;
    }
}
//静态变量
module.exports = Access;