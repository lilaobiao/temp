
### KOA + MYSQL 实现fetch登录和大文件分片上传

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


concat/upload.js
```js
const fs = require('fs');
const path = require('path');
// 文件上传
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

contact/controller.js
```js
exports.Login = async(ctx) => {
    console.log('登录请求来源地址：'+ctx.request.header.origin);
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

contact/index.js
```js
const router = require('koa-router')();
const controller = require('./controller.js');
const upload = require('./upload.js');

router.post('/login', controller.Login);
// 文件上传
router.post('/uploadBigFile', upload.uploadBig);
// 文件合并
router.post('/uploadBigFileFinish', upload.uploadMerge);
module.exports = router;
```

routes/index.js
```js
const router =  require('koa-router')();
const contact = require('../contact/index.js');


router.get('/', async (ctx) => {
    await ctx.render('index');
});

// router.get('/audio', async (ctx) => {
//     await ctx.render('audio.html');
// });

router.use('/contact', contact.routes(), contact.allowedMethods());

module.exports = router;
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

index.js
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

// 处理静态数据
const templateData = require('./data/template')


// 应用ejs模板引擎
// app.use(views('views', { map: { html: 'ejs' } }));

// http://localhost:3000/css/basic.css 首先去static目录找,如果能找到返回对应的文件,找不到next()
// 配置静态web服务的中间件
// app.use(static('static'));
// app.use(static(__dirname + '/static'));
app.use(static(__dirname + '/public')); // koa静态资源中间件可以配置多个

// 跨域参考链接：https://www.jb51.net/article/135924.htm
// 配置跨域白名单
app.use(
  cors({
      origin: function(ctx) { //设置允许来自指定域名请求
          const whiteList = [
            'https://www.liguixing.com',
            'https://www.baidu.com:8080'
          ];
          // 注意，如果是直接通过浏览器的url进行访问，header里面没有origin选项
          // 有一个host 选项，但是没有http 前缀，且带有端口号
          // 这里不考虑 https 的情况
          var origin = ctx.request.header.origin || ('http://' + ctx.request.header.host);
          // console.log(ctx)
          // 局域网和本地访问
          if(whiteList.includes(origin) || origin.startsWith('http://192.168')
           || origin.startsWith('http://127.0.0.1') || origin.startsWith('http://localhost')){
            console.log('origin匹配成功：'+ origin);
            console.log(ctx.request);
            return origin //注意，这里域名末尾不能带/，否则不成功
          }
          return 'http://localhost:3000' //默认允许本地请求3000端口可跨域
      },
      maxAge: 30, //指定预检请求的有效期，单位为秒。
      credentials: true, //是否允许发送Cookie
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
      // 类似这样的错误Request header field Authorization is not allowed by Access-Control-Allow-Headers，在这里设置
      allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-hw-csrftoken', 'x-cse-context'], //设置服务器支持的所有头信息字段
      // 请求头中通过Access-Control-Expose-Headers 指定的头部字段
      exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
  })
);

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
  // 添加查询数据的操作
  ctx.execSql = query;
  await next();
});

// routes
fs.readdirSync(path.join(__dirname, 'routes')).forEach(function (file) {
  if (~file.indexOf('.js')) app.use(require(path.join(__dirname, 'routes', file)).routes());
});

app.use(function (ctx, next) {
  console.log(ctx.request.header);
  // if(ctx.request.header.referer === 'http://127.0.0.1:8090/ompdistedge/workflow-mgnt-service/v1/workflow-rules/get-template'){
    ctx.body = templateData;
  // }
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

