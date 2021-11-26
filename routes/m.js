var express = require('express');
var underscore = require('underscore');
var access = require('./function.js');
const svgCaptcha = require('svg-captcha');
const path = require("path");
var fs = require("fs");
var router = express.Router();
const urlib = require("url");
const querystring = require('querystring');
var url = require('url');
var md5 = require('md5-node');

var session = require('express-session');

router.use(
    session({
        secret: 'keyboard cat', //服务端生成申明可随意写
        resave: true, //强制保存session即使他没有什么变化
        saveUninitialized: true, //强制将来初始化的session存储
        cookie: { //session是基于cookie的，所以可以在配置session的时候配置cookie|
            maxAge: 10000 * 60, //设置过期时间
            secure: false //true的话表示只有https协议才能访问cookie
        }
    }))

var db = new access(2, 3);
var conn = db.openConn();

var bodyParser = require('body-parser');
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var nickname = "";

//案例验证
router.use(function(req, res, next) {
    if (typeof(req.session.adminid) != "number") {
        req.session.adminid = 1; //手动
        console.log("登录失效，默认自动登录，测试用")
    }
    var url = req.url.substr(0, 6).toLowerCase();
    if (url != "/login" && url.substr(0, 4) != "/yzm") {
        db.adminAnQuan(req.session.adminid, function(rs) {
            if (rs.nickname == undefined) {
                // res.redirect("login")
                console.log("登录过期");
                res.send("登录过期，<a href='/m/login'>点击重先登录！</a>" + req.session.yzm + " , " + req.session.adminid + " , " + typeof(req.session.adminid));
            } else {
                nickname = rs.nickname;
                next();
            }
        })
    } else {
        next();
    }

})

router.get('/', function(req, res, next) {
    res.render('m', { nickname: nickname });
});
router.get('/message', function(req, res, next) {
    res.render('m/message/list', {});
});

router.get('/set/user/info', function(req, res, next) {
    var sql = "SELECT * FROM admin WHERE id=" + req.session.adminid;
    conn.query(sql, function(err, rows) {
        if (err) {
            res.render('m/tip', { msg: "显示基本信息失败，数据库查的出错了", icon: 2, url: "" });
        } else {
            var data = { username: "", nickname: "", pic: "", mobile: "", email: "", content: "" };
            if (rows.length > 0) {
                data.level = rows[0].level;
                data.username = rows[0].username;
                data.nickname = rows[0].nickname;
                data.pic = rows[0].pic;
                data.mobile = rows[0].mobile;
                data.email = rows[0].email;
                data.content = rows[0].content;
                data.sex = rows[0].sex;
            }
            res.render('m/set/user/info', data);
        }
    });
});
router.post('/set/user/infosave', function(req, res, next) {
    var arg1 = url.parse(req.url, true).query;

    var nickname = req.body.nickname;
    var sex = req.body.sex;
    var pic = req.body.pic;
    var mobile = req.body.mobile;
    var email = req.body.email;
    var content = req.body.content;
    var sql = "update admin set nickname='" + nickname + "',sex='" + sex + "',pic='" + pic + "',mobile='" + mobile + "',email='" + email + "',content='" + content + "' WHERE id=" + req.session.adminid;
    conn.query(sql, function(err, rows) {
        if (err) {
            res.render('m/tip', { msg: "修改基本资料失败，数组库现错了！", icon: 2, url: "info" });
        } else {
            if (rows.length == 0) {
                res.render('m/tip', { msg: "修改基本资料失败！没有此ID", icon: 1, url: "info" });
            } else {
                res.render('m/tip', { msg: "修改基本资料成功！", icon: 1, url: "info" });
            }
        }
    });

})
router.get('/set/user/password', function(req, res, next) {
    res.render('m/set/user/password', { msg: "", ico: 1 });
});
router.post('/set/user/passwordsave', function(req, res, next) {
    var arg1 = url.parse(req.url, true).query;

    var oldPassword = req.body.oldPassword;
    oldPassword = md5(oldPassword); //md5加密
    var password = req.body.password;
    password = md5(password); //md5加密
    var sql = "select * from admin WHERE id=" + req.session.adminid;
    conn.query(sql, function(err, rows) {
        if (err) {
            res.render('m/tip', { msg: "修改密码失败，查找数组库现错了！", icon: 2, url: "password" });
        } else {
            if (oldPassword != rows[0].pwd) {
                res.render('m/tip', { msg: "修改密码失败，当前密码不正确！", icon: 2, url: "password" });
            } else {
                var sql = "update admin set pwd='" + password + "' WHERE id=" + req.session.adminid;
                conn.query(sql, function(err, rows) {
                    if (err) {
                        res.render('m/tip', { msg: "修改密码失败，更新数组库现错了！", icon: 2, url: "password" });
                    } else {
                        res.render('m/tip', { msg: "修改密码成功！", icon: 1, url: "password" });
                    }
                })

            }
        }
    });

});
//显示分类列表
router.get('/app/content/tags', function(req, res, next) {
    res.render('m/app/content/tags');
});
//删除分类
router.post('/app/content/tagsadel', function(req, res, next) {
    var id = req.body.id;
    var sql = "DELETE FROM webcolumn WHERE id=" + id;
    conn.query(sql, function(err, rows) {
        if (err) {
            res.render('m/tip', { msg: "显示网站设置失败，数据库查的出错了", icon: 2, url: "" });
        } else {
            res.send(JSON.stringify({ status: "y" }));
        }
    });
});
//分类json
router.get('/app/content/tags/json', function(req, res, next) {
    var sql = "SELECT * FROM webcolumn order by sort asc";
    conn.query(sql, function(err, rows) {
        if (err) {
            res.render('m/tip', { msg: "显示网站设置失败，数据库查的出错了", icon: 2, url: "" });
        } else {
            var data = { data: [], count: rows.length, code: 0, msg: "" }
            for (var i = 0; i < rows.length; i++) {
                data.data.push({
                    "id": rows[i].id,
                    "name": rows[i].name,
                    "sort": rows[i].sort
                });
            }
            res.send(JSON.stringify(data));
        }
    });
});
//显示文章列表
router.get('/app/content/list', function(req, res, next) {
    res.render('m/app/content/list');
});
//分类json
router.get('/app/content/list/json', function(req, res, next) {
    var sql = "SELECT * FROM article order by sort asc";
    conn.query(sql, function(err, rows) {
        if (err) {
            res.render('m/tip', { msg: "显示网站设置失败，数据库查的出错了", icon: 2, url: "" });
        } else {
            var data = { data: [], count: rows.length, code: 0, msg: "" }
            for (var i = 0; i < rows.length; i++) {
                data.data.push({
                    "id": rows[i].id,
                    "parentid": rows[i].parentid,
                    "title": rows[i].title,
                    "addtime": rows[i].addtime
                });
            }
            res.send(JSON.stringify(data));
        }
    });
});


//显示分类表单
router.get('/app/content/tagsform', function(req, res, next) {
    var arg1 = url.parse(req.url, true).query;
    var id = arg1.id;

    var data = { id: "", type: "", name: "", enname: "", sort: "", content: "", isthrough: 0, parentid: [] };
    if (id == undefined) {
        columnSubInput(-1, data.id, "", function(arr) {
            data.parentid = arr;
            res.render('m/app/content/tagsform', data);
        })
    } else {
        var sql = "SELECT * FROM webcolumn WHERE id=" + id;
        conn.query(sql, function(err, rows) {
            if (err) {
                res.render('m/tip', { msg: "显示分类表单，数据库查的出错了" + id, icon: 2, url: "" });
            } else {
                if (rows.length > 0) {
                    data.id = rows[0].id;
                    data.type = rows[0].type;
                    data.name = rows[0].name;
                    data.enname = rows[0].enname;
                    data.sort = rows[0].sort;
                    data.content = rows[0].content;
                    data.isthrough = rows[0].isthrough;
                    columnSubInput(-1, data.id, rows[0].parentid, function(arr) {
                        data.parentid = arr;
                        res.render('m/app/content/tagsform', data);
                    })
                } else {
                    res.render('m/tip', { msg: "显示分类表单，id不存在" + err, icon: 2, url: "tagsform" });
                }
            }
        });
    }
});
//分类表单保存
router.post('/app/content/tagsformsave', function(req, res, next) {
    var arg1 = url.parse(req.url, true).query;
    var id = arg1.id;

    var parentid = req.body.parentid; //上一级id
    var name = req.body.name;
    var enname = req.body.enname;
    var type = req.body.type;
    var sort = req.body.sort;
    var content = req.body.content;
    var isthrough = req.body.isthrough;
    isthrough = (isthrough == "1" ? 1 : 0);
    if (id == "") {
        if (name != "") {
            var sql = "select * from webcolumn WHERE name='" + name + "'";
            conn.query(sql, function(err, rows) {
                if (err) {
                    res.render('m/tip', { msg: "添加栏目分类，数据库错误" + err, icon: 2, url: "tagsform" });
                } else {
                    if (rows.length > 0) {
                        res.render('m/tip', { msg: "添加栏目分类，栏目名称存在", icon: 2, url: "back" });

                    } else {
                        var addSql = 'INSERT INTO webcolumn(parentid,type,name,enname,sort,content,isthrough,addtime) VALUES(?,?,?,?,?,?,?,?)';
                        var params = [parentid, type, name, enname, sort, content, isthrough, db.timeFormat(new Date(), "yyyy-MM-dd hh:mm:ss")];
                        //增
                        conn.query(addSql, params, function(err, result) {
                            if (err) {
                                res.render('m/tip', { msg: "添加分类表单，插入数组库出现错误！" + err, icon: 2, url: "tagsform" });
                            } else {
                                res.send('<script>parent.location.reload();</script>"');
                                // res.render('m/tip', { msg: "添加分类表单成功！" + id, icon: 1, url: "tagsform" });
                            }
                        });
                    }
                }
            });
        } else {
            res.render('m/tip', { msg: "添加分类表单，栏目名称不能为空！" + err, icon: 2, url: "back" });
        }
    } else {
        var sql = "select * from webcolumn WHERE id=" + id;
        conn.query(sql, function(err, rows) {
            if (err) {
                res.render('m/tip', { msg: "B分类表单保存，查找数组库现错了！" + id, icon: 2, url: "tagsform" });
            } else {
                var sql = "update webcolumn set type=?,name=?,enname=?,sort=?,content=?,isthrough=? WHERE id=" + id;
                var params = [type, name, enname, sort, content, isthrough];
                conn.query(sql, params, function(err, rows) {
                    if (err) {
                        res.render('m/tip', { msg: "分类表单保存，更新数组库现错了！" + id, icon: 2, url: "tagsform" });
                    } else {
                        res.send('<script>parent.location.reload();</script>"');
                        // res.render('m/tip', { msg: "修改分类表单成功！" + id, icon: 1, url: "tagsform" });
                    }
                })
            }
        });
    }
});

router.get('/set/system/website', function(req, res, next) {
    var sql = "SELECT * FROM website";
    conn.query(sql, function(err, rows) {
        if (err) {
            res.render('m/tip', { msg: "显示网站设置失败，数据库查的出错了", icon: 2, url: "" });
        } else {
            var data = { id: "", webtitle: "", weburl: "", webkeywords: "", webdescription: "", webbottom: "", logo: "", qrcode: "" };
            if (rows.length > 0) {
                data.id = rows[0].id;
                data.webtitle = rows[0].webtitle;
                data.weburl = rows[0].weburl;
                data.webkeywords = rows[0].webkeywords;
                data.webdescription = rows[0].webdescription;
                data.webbottom = rows[0].webbottom;
                data.logo = rows[0].logo;
                data.qrcode = rows[0].qrcode;
            }
            res.render('m/set/system/website', data);
        }
    });
});
router.post('/set/system/websitesave', function(req, res, next) {
    var arg1 = url.parse(req.url, true).query;
    var id = arg1.id;

    var webtitle = req.body.webtitle;
    var webkeywords = req.body.webkeywords;
    var webdescription = req.body.webdescription;
    var webbottom = req.body.webbottom;
    var weburl = req.body.weburl;
    var logo = req.body.logo;
    var qrcode = req.body.qrcode;
    var sql = "select * from website WHERE id=" + id;
    conn.query(sql, function(err, rows) {
        if (err) {
            res.render('m/tip', { msg: "修改网站设置失败，查找数组库现错了！", icon: 2, url: "website" });
        } else {
            var sql = "update website set webtitle=?,webkeywords=?,webdescription=?,webbottom=?,weburl=?,logo=?,qrcode=? WHERE id=" + id;
            var params = [webtitle, webkeywords, webdescription, webbottom, weburl, logo, qrcode];
            conn.query(sql, params, function(err, rows) {
                if (err) {
                    res.render('m/tip', { msg: "修改网站设置失败，更新数组库现错了！" + err, icon: 2, url: "website" });
                } else {
                    res.render('m/tip', { msg: "修改网站设置成功！", icon: 1, url: "website" });
                }
            })
        }
    });

});


//显示登录界面
router.get('/login', function(req, res, next) {
    var myObj = urlib.parse(req.url, true);
    if (myObj.query.act == "outLogin") { //退出登录
        req.session.adminid = "";
        res.render('m/tip', { msg: "成功退出后台登录！", icon: 1, url: "login" });
    } else {
        res.render('m/login', { title: "登录" });
    }
});
//主界面
router.get('/home/console', function(req, res, next) {
    res.render('m/console', {});
});

//验证码
router.get('/yzm', function(req, res, next) {
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
    req.session.yzm = captcha.text.toLowerCase();
    res.setHeader('Content-Type', 'image/svg+xml');
    res.write(String(captcha.data));
    res.end();

});
//json
router.get('/json', function(req, res, next) {
    var data = {
        "data": [{
                "id": "20",
                "parentid": "常见问题",
                "title": "xiyuetaCMS官网网址？",
                "adddatetime": "2021/7/14 15:50:50"
            },
            {
                "id": "38",
                "parentid": "通知公告",
                "title": "xiyuetaCMS通知公告测试新闻第3条",
                "adddatetime": "2021/7/14 15:50:51"
            }
        ],
        "count": "42",
        "code": "0",
        "msg": ""
    }
    res.send(JSON.stringify(data));
});

//上传图片
router.post('/upload', function(req, res, next) { // 输出 JSON 格式
    req.setEncoding('binary');
    var body = ''; // 文件数据
    var fileName = ''; // 文件名
    // 边界字符串
    var boundary = req.headers['content-type'].split('; ')[1].replace('boundary=', '');
    req.on('data', function(chunk) {
        body += chunk;
    });

    req.on('end', function() {
        var file = querystring.parse(body, '\r\n', ':')

        // 只处理图片文件
        if (file['Content-Type'].indexOf("image") !== -1) {
            //获取文件名
            var fileInfo = file['Content-Disposition'].split('; ');
            for (value in fileInfo) {
                if (fileInfo[value].indexOf("filename=") != -1) {
                    fileName = fileInfo[value].substring(10, fileInfo[value].length - 1);

                    if (fileName.indexOf('\\') != -1) {
                        fileName = fileName.substring(fileName.lastIndexOf('\\') + 1);
                    }
                    console.log("文件名: " + fileName);
                }
            }

            // 获取图片类型(如：image/gif 或 image/png))
            var entireData = body.toString();
            var contentTypeRegex = /Content-Type: image\/.*/;

            contentType = file['Content-Type'].substring(1);

            //获取文件二进制数据开始位置，即contentType的结尾
            var upperBoundary = entireData.indexOf(contentType) + contentType.length;
            var shorterData = entireData.substring(upperBoundary);

            // 替换开始位置的空格
            var binaryDataAlmost = shorterData.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

            // 去除数据末尾的额外数据，即: "--"+ boundary + "--"
            var binaryData = binaryDataAlmost.substring(0, binaryDataAlmost.indexOf('--' + boundary + '--'));

            var myDate = new Date();
            var timeName = myDate.getFullYear() + "" + (myDate.getMonth() + 1) + "" + myDate.getDate() + "" + myDate.getHours() + "" + myDate.getMinutes() + "" + myDate.getSeconds();
            fileName = timeName + ".jpg";
            var filePath = "/uploadfiles/img/" + fileName;

            // 保存文件
            fs.writeFile("public/" + filePath, binaryData, 'binary', function(err) {
                res.end(JSON.stringify({
                    data: {
                        "src": filePath,
                        "title": fileName
                    }
                }));
                // res.end('图片上传完成');
            });
        } else {
            res.end(JSON.stringify({
                data: {
                    "src": "",
                    "title": ""
                }
            }));
            // res.end('只能上传图片文件');
        }
    });


    // let data = ''

    // req.on('data', chunk => {
    //     data += chunk;
    // })

    // req.on('end', () => {
    //     fs.writeFileSync('img.jpg', data)
    // })
})
//登录后台
router.post('/login', function(req, res, next) { // 输出 JSON 格式
    if (req.session.yzm != req.body.captcha) {
        res.send(JSON.stringify({ start: 0, info: "验证码不正确！" }));
        res.end();
    }
    var username = req.body.username.replace(/'/g, "");
    var password = req.body.password.replace(/'/g, "");
    password = md5(password);
    //查
    var sql = "SELECT * FROM admin WHERE username='" + username + "' and pwd='" + password + "'"
    conn.query(sql, function(err, rows) {
        if (err) {
            res.end(JSON.stringify({ status: "no", info: "数据库查的出错了" }));
        } else {
            if (rows.length <= 0) {
                res.end(JSON.stringify({ status: "no", info: "账号密码不正确！" }));
            } else {
                req.session.adminid = rows[0].id; //记录后台ID到session
                res.send(JSON.stringify({ status: "yes", info: "登录成功！" }));
            }
        }
    });
});



// columnSubInput(-1,"","")
function columnSubInput(parentid, focusId, focusParentId, callback) {
    var arr = [];
    var s, sel
    var addsql = ""
    if (focusId != "") addsql = " and id<>" + focusId
    var sql = "SELECT * FROM webcolumn WHERE parentid=" + parentid + addsql + " order by sort asc"
    conn.query(sql, function(err, rows) {
        if (err) {
            console.log("columnSubInput", "显示分类表单，数据库查的出错了" + sql);
        } else {
            for (var i = 0; i < rows.length; i++) {
                sel = ""
                if (focusParentId != "") {
                    if (focusParentId == rows[i].id) {
                        sel = " selected";
                    }
                }
                arr.push({ value: rows[i].id, sel: sel, show: rows[i].name });
                // c = c + '<option value="' + rows[i].id + '"' + sel + '>' + rows[i].name + '</option>';
            }
            callback(arr);
        }
    });
}

module.exports = router;