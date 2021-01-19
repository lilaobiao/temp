```js
// node-admin/test/index.js
const path = require('path');
const join = path.join;
const resolve = (dir) => path.join(__dirname, '../', dir);
console.log(resolve('packages'));

// node-admin目录下执行 node test/index.js
// 输出：D:\00test\node-admin\packages
```


### 数据库

**delete from 'tableName:**

　　DELETE 语句每次删除一行，并在事务日志中为所删除的每行记录一项。（相当于把房子里家具全丢了，但为了纪念原先的家具，所以原先放家具的那块地以后不再放新家具了）

**drop TABLE 'tableName:**

　　删除表定义及其数据（相当于除了把家具丢了外，还把房子拆了，回到解放前）

**truncate TABLE 'tableName':**

　　TRUNCATE TABLE 在功能上与不带 WHERE 子句的 DELETE 语句相同：二者均删除表中的全部行。但 TRUNCATE TABLE 比 DELETE 速度快，且使用的系统和事务日志资源少。（相当于把家具丢了，也不纪念什么了，以后有新家具了，直接重新摆放） 主键id递增，你如果想让它重新从1开始递增，怎么办呢？ 就用 truncate table "tabeName"删除它吧。




## KOA 基础服务搭建

目录结构：

```js
|-index.js
|-mysql.js
|-routes
|----|-index.js
|-public
|----|-index.html
|----|-static
|----|----|-main.css
|-contact
|----|-index.js
|----|-controller.js
```


index.js
```js
const Koa = require('koa');
const koaJson = require('koa-json');
const bodyParser = require('koa-bodyparser');
const path = require('path');
const http = require('http');
const fs = require('fs');
const query = require('./mysql.js');

// 处理静态资源
const static = require('koa-static');
// const views = require('koa-views');

const app = new Koa();


// 应用ejs模板引擎
// app.use(views('views', { map: { html: 'ejs' } }));

// http://localhost:3000/css/basic.css 首先去static目录找,如果能找到返回对应的文件,找不到next()
// 配置静态web服务的中间件
// app.use(static('static'));
// app.use(static(__dirname + '/static'));
app.use(static(__dirname + '/public')); // koa静态资源中间件可以配置多个

app.use(bodyParser());
app.use(koaJson());

app.use(async (ctx, next) => {
  ctx.execSql = query;
  await next();
});

// routes
fs.readdirSync(path.join(__dirname, 'routes')).forEach(function (file) {
  if (~file.indexOf('.js')) app.use(require(path.join(__dirname, 'routes', file)).routes());
});

app.use(function (ctx, next) {
  ctx.redirect('/404.html');
});

app.on('error', (error, ctx) => {
  console.log('something error ' + JSON.stringify(ctx.onerror))
  ctx.redirect('/500.html');
});

http.createServer(app.callback())
  .listen(8090)
  .on('listening', function () {
    console.log('server listening on: ' + 8090)
  });
```

mysql.js
```js
const mysql = require('mysql');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    port: '3306',
    database: 'test',
})

let query = function (sql, values) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                return reject(err);
            } else {
                connection.query(sql, values, (err, rows) => {
                    connection.release();
                    if (err) {
                        return reject(err)
                    } else {
                        return resolve(rows);
                    }
                })
            }
        })
    })
}

module.exports = query;
```

routes/index.js
```js
const router =  require('koa-router')();
const contact = require('../contact/index.js');


router.get('/', async (ctx) => {
    await ctx.render('index');
});

router.use('/contact', contact.routes(), contact.allowedMethods());

module.exports = router;
```


contact/index.js
```js
const router = require('koa-router')();
const controller = require('./controller.js');

router.post('/login', controller.Login);

module.exports = router;
```


contact/controller.js
```js
exports.Login = async(ctx) => {
    let username = ctx.request.body.username || '';
    let psd = ctx.request.body.password || '';
    if (!username || !psd) {
        ctx.body = {
            success: false,
            message: '用户名或密码不能为空'
        };
        return false;
    }
    try {
        let result = await ctx.execSql(`select * from user where username = ? and password = ?`, [username, psd]);
        if (result.length > 0) {
            ctx.body = {
                success: true,
                userID: result[0].id,
                message: ''
            };
        } else {
            ctx.body = {
                success: false,
                userID: 0,
                message: '账号或密码错误'
            };
        }
    } catch (err) {
        ctx.body = {
            success: false,
            userID: 0,
            message: err
        };
    }
}
```


public/index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="./static/main.css">
</head>
<body>
    <div> KOA 静态资源 </div>
    <form action="/contact/login" method="post">
        <input type="text" name="username" value="user1">
        <input type="password" name="password" value="123456">
        <button type="submit">登录</button>
    </form>
    <button id="btn">测试 fetch api</button>
    <script>
        let payload = JSON.stringify({
            username: 'user1',
            password: '123456',
        });
        let jsonHeaders = new Headers({
            'Content-Type': 'application/json'
        });
        
        window.onload = function(){
            document.getElementById('btn').addEventListener('click', function(){
                // const obj = {
                //     method: 'post',
                //     data: {
                //         username: 'user1',
                //         password: '123456',
                //     }
                // };
                // fetch('/contact/login', obj).then(res => {
                //     console.log(res);
                // });
                console.log('click');
                // fetch('/contact/login', {
                //     method: 'POST',
                //     body: payload,
                //     headers: jsonHeaders
                // })
                // .then(res => {
                //     console.log(res);
                // });

                fetch('/contact/login', {
                    method: 'POST',
                    body: payload,
                    headers: jsonHeaders
                })
                .then((response) => response.json())
                .then(data => {
                    console.log(data);
                })
            });
        }
    </script>
</body>
</html>
```


启动项目、访问项目

```shell
node index.js
localhost:8090
```


数据库测试db.js
```js
const mysql = require('mysql')

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    port: '3306',
    database: 'test',
})

const execute = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err)
            } else {
                if (values) {
                    connection.query(sql, values, (err, rows) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(rows)
                        }
                        connection.release()
                    })
                } else {
                    connection.query(sql, (err, rows) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(rows)
                        }
                        connection.release()
                    })
                }
            }
        })
    })
}

module.exports = { execute }

// 测试使用
const { execute } = require('./db');

// 查询-------------------------
// execute('SELECT * FROM user WHERE id = ? limit 1', {id:'1'}).then(results => {
//     console.log('results', results)
// });

// 新增-------------------------
// 第一种 insert into tablename values(‘value1’,’value2’,’value3’….)
// 第二种 insert into EmpTable(Name,Age,Duty,Salary) values('杨兰1653',20,'外贸员',3000)
// execute(`INSERT INTO user(id, name, sex, age) values(${Date.now() - 1597396200000}, "杨兰1653", 2, 100)`).then(results => {
//     console.log('results', results)
//     // results: 
//     // OkPacket {
//     //     fieldCount: 0,
//     //     affectedRows: 1,
//     //     insertId: 180627,
//     //     serverStatus: 2,
//     //     warningCount: 0,
//     //     message: '',
//     //     protocol41: true,
//     //     changedRows: 0
//     // }
// });
// execute('INSERT INTO user(name, sex, age) values("杨兰1653", 2, 100)').then(results => {
//     console.log('results', results)
// });
// // 这种形式必须指定全部字段
// execute(`INSERT INTO user values(${Date.now() - 1597396200001},"杨兰1653", 2, 99)`).then(results => {
//     console.log('results', results)
// });


// 修改-------------------------
// execute(`UPDATE user SET sex=1 WHERE sex=2`).then(results => {
//     console.log('results', results)
//     // results: 
//     // OkPacket {
//     //     fieldCount: 0,
//     //     affectedRows: 5,
//     //     insertId: 0,
//     //     serverStatus: 34,
//     //     warningCount: 0,
//     //     message: '(Rows matched: 5  Changed: 5  Warnings: 0',
//     //     protocol41: true,
//     //     changedRows: 5
//     // }
// });


// 删除-------------------------
// execute(`DELETE FROM user WHERE sex = ? OR age > ?`, {sex: 3, age: 99}) // 报错

execute(`DELETE FROM user WHERE sex = 3 OR age = 99`).then(results => {
    console.log('results', results)
    // results: 
    // OkPacket {
    //     fieldCount: 0,
    //     affectedRows: 1,
    //     insertId: 0,
    //     serverStatus: 34,
    //     warningCount: 0,
    //     message: '',
    //     protocol41: true,
    //     changedRows: 0
    // }
});
```
