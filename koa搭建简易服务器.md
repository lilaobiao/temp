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




## 文件上传

public/upload.html
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
        <input type="file" name="file" id="file">
        <button type="submit">登录</button>
    </form>
    <button id="btn">测试 fetch api</button>
    <script src="./static/axios.js"></script>
    <script>
        let payload = JSON.stringify({
            username: 'user1',
            password: '123456',
        });
        let jsonHeaders = new Headers({
            'Content-Type': 'application/json'
        });

        const ApiUploadBigFile = async function(file){
            let bytesPerPiece = 1*1024*1024;//切片大小
            let start = 0;
            let end;
            let index = 0;
            let file_size = file.size;
            let file_name = file.name;
            let totalPieces = Math.ceil(file_size / bytesPerPiece);
            let timestamp = new Date().getTime();
            while(start < file_size){
                end = start + bytesPerPiece;
                if(end > file_size){
                    end = file_size;
                }
                let chunk = file.slice(start, end);//执行切片操作
                let sliceName = file_name + "." + index;
                let formData = new FormData();
                formData.append('timestamp', timestamp);
                formData.append('name', sliceName);
                formData.append('size', file_size);
                formData.append('total', totalPieces);
                formData.append('index', index);
                formData.append('file', chunk);//将表单id、文件、文件名输入form表单中，如果第三个参数不设置，则默认使用blob作为文件名
                let res1 = await axios.post(`/contact/uploadBigFile`, formData);
                if(res1.data.code == 1){
                    console.log(`已传输${index+1}个切片，共${totalPieces}个切片`)
                    this.uploadPercentage = Math.ceil((index+1)/totalPieces*100);
                    start = end;
                    index++;
                }else{
                    Promise.reject("文件传输过程中服务器发生错误");
                    return;
                }
            }
            let formDataFinish = new FormData();
            formDataFinish.append('timestamp', timestamp);
            formDataFinish.append('name', file_name);
            formDataFinish.append('size', file_size);
            formDataFinish.append('total', totalPieces);
            axios.post(`/contact/uploadBigFileFinish`, formDataFinish).then((res)=>{
                if(res.data.code == 1){
                    Promise.resolve("合并成功");
                    console.log("文件上传成功");
                    this.uploadPercentage = 0;
                }else{
                    Promise.reject("文件合并过程中服务器发生错误");
                }
            });
        }

        // 单文件上传用例
        function uploadFile(file) {
            var param = new FormData();
            param.append('file', file, file.name);
            gData.isUpload = true;
            doms.pr.addClass('rotate-img');
            doms.fileTip.html('上传中');
            console.log(apis.upload)
            $.ajax({
                type: "post",
                url: apis.upload,
                data: param,
                contentType: false,
                processData: false,
                success: function(data) {
                    console.log(data)
                    if (data.code === 0) {
                        gData.imgUrl = data.data.url;
                        doms.fileTip.html('上传成功')
                    } else {
                        doms.fileTip.html('上传失败')
                    }
                },
                error: function(err) {
                    doms.fileTip.html('上传失败')
                },
                complete: function() {
                    gData.isUpload = false;
                    doms.pr.removeClass('rotate-img');
                }
            })
        }

        window.onload = function(){
            document.getElementById('file').addEventListener('change', function(event){
                const files = event.target.files;
                console.log(files);
                if(files && files[0]){
                    ApiUploadBigFile(files[0]);
                }
            });
        }
    </script>
</body>
</html>
```


文件上传upload.js
```js
const fs = require('fs');
const path = require('path');
// 文件上传
// 注意路径问题，upload.js 里的文件路径需要和项目结构保持关联性，我们的文件是要上传到 根目录/public/upload 目录下
let uploadPath = path.resolve(__dirname, '../public/upload'); //'F:\\aitools_node\\upload'


// mkdirsSync函数
const mkdirsSync = (dirname) => {
    if(fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

// file要上传的文件，filePath 上传的路径
const copyFile = (file, filePath, fileName) => {
    // 读取文件流
    const fileReader = fs.createReadStream(file.path);
    // 判断 /static/upload 文件夹是否存在，如果不在的话就创建一个
    var flag
    if (!fs.existsSync(filePath)) {
        console.log('filePath',filePath)
        try{
            // 创建成功返回 undefined
            flag = fs.mkdirSync(filePath);
            console.log(flag)
        } catch(err){
            flag = true
        }
    }
    if(flag){
        return false;
    }else{
        const writeStream = fs.createWriteStream(filePath + fileName);
        fileReader.pipe(writeStream);
        return true;
    }
}

// 文件上传
exports.uploadBig = async (ctx, next) => {
    console.log('分片上传接口接收到请求');
    // 根据文件hash创建文件夹，把默认上传的文件移动当前hash文件夹下。方便后续文件合并。
    console.log(ctx.request.body);
    console.log(ctx.request.files);

	const { timestamp, name, size, total, index} = ctx.request.body;
    const chunksPath = path.join(uploadPath, `/file_temp${timestamp}/`);

    console.log(chunksPath);
    console.log(ctx.request.files.file.path);
    // 移动文件，不支持跨分区
    // fs.renameSync(ctx.request.files.file.path, chunksPath + timestamp + name); //改名字

    // 移动文件到目录，并重命名为
    const copyFlag = copyFile(ctx.request.files.file, chunksPath, timestamp + name);
    if(copyFlag){
        ctx.body={
            code: 1,
            msg: '上传成功，可继续传输'
        };
    }else{
        ctx.body={
            code: 0,
            msg: '上传失败，传输中断'
        };
    }
}


// 文件合并
exports.uploadMerge = async (ctx, next) => {
    console.log('分片合并接口接收到请求');
	const { timestamp, name, size, total } = ctx.request.body;
	// 创建存储文件
	// 合并
    const chunksPath = path.join(uploadPath, `/file_temp${timestamp}/`); //F:\aitools_node\upload\
    // 需要合并后的文件
	const filePath = path.join(uploadPath, timestamp + name); //生成的文件名
	// 读取所有的chunks 文件名存放在数组中
	const chunks = fs.readdirSync(chunksPath);//读取目录下的所有文件
	// 创建存储文件
	if(chunks.length != total || chunks.length == 0) {
		ctx.body={
			code: 1,
			msg: '切片文件数量不符合'
		};
		chunks.forEach((item)=>{
			fs.unlinkSync(chunksPath + item);
		});
		fs.rmdirSync(chunksPath);
		return;
	}else{
		fs.writeFileSync(filePath, ''); 
		for (let i = 0; i < total; i++) {
            // 追加写入到文件中
            fs.appendFileSync(filePath, fs.readFileSync(chunksPath + timestamp + name + '.' + i));
            // 删除本次使用的chunk
            fs.unlinkSync(chunksPath + timestamp + name + '.' + i);
		}
		fs.rmdirSync(chunksPath);
		// 文件合并成功，可以把文件信息进行入库。
		ctx.body={
			code: 1,
			msg: '切片文件合并成功',
			data: {
				url: timestamp + name
			}
		};
	}
}


// 单文件上传
exports.upload = async (ctx, next) => {
    const file = ctx.request.files.file;
    // 读取文件流
    const fileReader = fs.createReadStream(file.path);
    // 以当前日期创建文件夹
    const date = dateFormat()
    // 文件上传路径
    const filePath = path.join(__dirname, `../public/upload/${date}`);
    // 返回的文件访问路径
    const uploadUrl = `upload/${date}`;
    console.log(uploadUrl)
    // 判断 /static/upload 文件夹是否存在，如果不在的话就创建一个
    var flag
    if (!fs.existsSync(filePath)) {
        console.log('filePath',filePath)
        try{
            // 创建成功返回 undefined
            flag = fs.mkdirSync(filePath);
            console.log(flag)
        } catch(err){
            // throw new Error(err)
            flag = true
        }
    }
    if(flag){
        // ctx.body = new ErrorModel({},'文件上传失败')
        ctx.body={
			code: 0,
			msg: '文件上传失败',
		};
    }else{
        // 组装成绝对路径
        const fileResource = filePath + `/${file.name}`;
        // 使用 createWriteStream 写入数据，然后使用管道流pipe拼接
        const writeStream = fs.createWriteStream(fileResource);
        fileReader.pipe(writeStream);
        ctx.body={
			code: 1,
            msg: '文件上传失败',
            url: uploadUrl + `/${file.name}`,
            name: file.name
		};
        // ctx.body = new SuccessModel({
        //     url: uploadUrl + `/${file.name}`,
        //     name: file.name
        // })
    }
}
```


文件上传涉及的点：

1. 路径问题，upload.js 里的文件路径需要和项目结构保持关联性，我们的文件是要上传到 根目录/public/upload 目录下

2. koa-body 要用 4+ 版本，同时要在app.use时传递好参数
```js
const Koa = require('koa');
const koaJson = require('koa-json');
const bodyparser = require('koa-body');
const cors = require('koa2-cors')
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

// 配置跨域白名单
// app.use(
//   cors({
//       origin: function(ctx) { //设置允许来自指定域名请求
//           const whiteList = [
//             'http://116.62.243.51:8080',
//             'http://gzsgsfwq.com:8080',
//             'http://www.gzsgsfwq.com:8080'
//           ];
//           // 注意，如果是直接通过浏览器的url进行访问，header里面没有origin选项
//           // 有一个host 选项，但是没有http 前缀，且带有端口号
//           // 这里不考虑 https 的情况
//           var origin = ctx.request.header.origin || ('http://' + ctx.request.header.host);
//           console.log(ctx)
//           // 局域网和本地访问
//           if(whiteList.includes(origin) || origin.startsWith('http://192.168')
//            || origin.startsWith('http://127.0.0.1') || origin.startsWith('http://localhost')){
//             return origin //注意，这里域名末尾不能带/，否则不成功
//           }
//           return 'http://localhost:3000' //默认允许本地请求3000端口可跨域
//       },
//       maxAge: 5, //指定本次预检请求的有效期，单位为秒。
//       credentials: true, //是否允许发送Cookie
//       allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
//       allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
//       exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
//   })
// );

// middlewares
app.use(bodyparser({
  // enableTypes:['json', 'form', 'text'],
  multipart: true, // 支持文件上传
  formidable: {
    maxFieldsSize: 50 * 1024 * 1024, // 最大文件为50兆
    multipart: true // 是否支持 multipart-formdate 的表单
  }
}))

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
