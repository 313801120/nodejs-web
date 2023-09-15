//config.js
let app = {
    user: 'sa', //这里写你的数据库的用户名
    password: 'sa',//这里写数据库的密码
    server: 'localhost', 
    database: 'webdata', // 数据库名字
    port: 1433, //端口号,默认1433
    options: {
        encrypt: false,  //加密,设置为true时会连接失败 Failed to connect to localhost:1433 - self signed certificate
        enableArithAbort: false
    },
    pool: {
        min: 0,
        max: 10,
        idleTimeoutMillis: 3000
    }
}
 
module.exports = app