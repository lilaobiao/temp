## 一个关于缓存验证的实验性项目

目录结构
```js
▼ 根目录
    ▼ static
    |   ▼ css
    |   |   main.css
    |   ▼ etag
    |   |   index.js
    |   ▼ expires
    |   |   index.js
    |   ▼ image
    |   |   test.png
    |   ▼ js
    |   |   index.js
    |   ▼ last-modified
    |   |   index.js
    |   ▼ max-age
    |   |   index.js
    ▼ util
    |   content.js
    |   dir.js
    |   file.js
    |   mimes.js
    |   walk.js
    favicon.ico
    index.html
    app.js
    index.js
    package.json
```

1、app.js
```js
const Koa = require('koa')
const app = new Koa()
const fs = require('fs')
const path = require('path')
// 计算文件hash值
const crypto = require('crypto')

// 定义资源类型常量列表
const mimes = {
  css: 'text/css',
  less: 'text/css',
  gif: 'image/gif',
  html: 'text/html',
  ico: 'image/x-icon',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'text/javascript',
  json: 'application/json',
  pdf: 'application/pdf',
  png: 'image/png',
  svg: 'image/svg+xml',
  swf: 'application/x-shockwave-flash',
  tiff: 'image/tiff',
  txt: 'text/plain',
  wav: 'audio/x-wav',
  wma: 'audio/x-ms-wma',
  wmv: 'video/x-ms-wmv',
  xml: 'text/xml',
}

// 解析资源类型
function parseMime(url) {
  // path.extname获取路径中文件的后缀名
  let extName = path.extname(url)
  extName = extName ? extName.slice(1) : 'unknown'
  return mimes[extName]
}

const parseStatic = (dir) => {
  return new Promise((resolve) => {
    resolve(fs.readFileSync(dir), 'binary')
  })
}

function getFileStat(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, function (err, stats) {
      if (stats) {
        resolve(stats)
      } else {
        reject(err)
      }
    })
  })
}

app.use(async (ctx) => {
  const url = ctx.request.url
  console.log(url, 'url')
  if (url === '/') {
    // 访问根路径返回index.html
    ctx.set('Content-Type', 'text/html')
    ctx.body = await parseStatic('./index.html')
  } else {
    const filePath = path.resolve(__dirname, `.${url}`)
    ctx.set('Content-Type', parseMime(url))
    console.log(url);
    /**
     * @title 强缓存
     * @descript Expires设置30秒后过期
     */
    if(url.indexOf('/expires/') > -1){
      ctx.set('Expires', new Date(Date.now() + 30000))
      ctx.body = await parseStatic(filePath)
    }
    /**
     * @title 强缓存
     * @descript Cache-Control max-age=300 设置30秒后过期
     */
    else if(url.indexOf('/max-age/') > -1){
      ctx.set('Cache-Control', 'max-age=30')
      ctx.body = await parseStatic(filePath)
    }
    /**
     * @title 协商缓存
     * @descript Last-Modified、if-modified-since
     */
    else if(url.indexOf('/last-modified/') > -1){
      ctx.set('Cache-Control', 'no-cache')
      const ifModifiedSince = ctx.request.header['if-modified-since']
      const fileStat = await getFileStat(filePath)
      if (ifModifiedSince === fileStat.mtime.toGMTString()) {
        ctx.status = 304
      } else {
        ctx.set('Last-Modified', fileStat.mtime.toGMTString())
        ctx.body = await parseStatic(filePath)
      }
    }
    /**
     * @title 协商缓存
     * @descript etag、if-none-match
     */
    else if(url.indexOf('/etag/') > -1){
      ctx.set('Cache-Control', 'no-cache')
      const fileBuffer = await parseStatic(filePath)
      const ifNoneMatch = ctx.request.headers['if-none-match']
      const hash = crypto.createHash('md5')
      hash.update(fileBuffer)
      const etag = `"${hash.digest('hex')}"`
      if (ifNoneMatch === etag) {
        ctx.status = 304
      } else {
        ctx.set('etag', etag)
        ctx.body = fileBuffer
      }
    }
    /**
     * 默认，不设置任何缓存
     */
    else{
      ctx.body = await parseStatic(filePath)
    }
  }
})

app.listen(3000, () => {
  console.log('starting at port 3000')
})
```


2、index.js
```js
const Koa = require('koa')
const path = require('path')
const content = require('./util/content')
const mimes = require('./util/mimes')

const app = new Koa()

// 静态资源目录对于相对入口文件index.js的路径
const staticPath = './static'

// 解析资源类型
function parseMime(url) {
  let extName = path.extname(url)
  extName = extName ? extName.slice(1) : 'unknown'
  return mimes[extName]
}

app.use(async (ctx) => {
  // 静态资源目录在本地的绝对路径
  let fullStaticPath = path.join(__dirname, staticPath)

  // 获取静态资源内容，有可能是文件内容，目录，或404
  let _content = await content(ctx, fullStaticPath)

  // 解析请求内容的类型
  let _mime = parseMime(ctx.url)

  // 如果有对应的文件类型，就配置上下文的类型
  if (_mime) {
    ctx.type = _mime
  }

  // 输出静态资源内容
  if (_mime && _mime.indexOf('image/') >= 0) {
    // 如果是图片，则用node原生res，输出二进制数据
    ctx.res.writeHead(200)
    ctx.res.write(_content, 'binary')
    ctx.res.end()
  } else {
    // 其他则输出文本
    ctx.body = _content
  }
})

app.listen(3000)
console.log('[demo] static-server is starting at port 3000')
```

3、index.html 和各静态文件
```html
<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>test cache</title>
            <link rel="stylesheet" href="/static/css/main.css" />
        </head>
      <body>
            <h1>缓存的各个字段的原理探索</h1>
            <img src="/static/image/test.png"/>
            <script src="/static/js/index.js"></script>
            <script src="/static/etag/index.js"></script>
            <script src="/static/expires/index.js"></script>
            <script src="/static/max-age/index.js"></script>
            <script src="/static/last-modified/index.js"></script>
      </body>
</html>


'static/css/main.css': `*{margin: 0;padding: 0;}`,
'static/image/test.png': 一张图片,
'static/js/index.js': `console.log('我是来自未设置缓存信息文件的输出');`,
'static/etag/index.js': `console.log('我是来自etag缓存文件的输出');`,
'static/expires/index.js': `console.log('我是来自expires缓存文件的输出');`,
'static/last-modifieded/index.js': `console.log('我是来自last-modifieded缓存文件的输出');`,
'static/max-age/index.js': `console.log('我是来自max-age缓存文件的输出');`
```

3、util下的js文件
```js
// count.js
const path = require('path')
const fs = require('fs')

// 封装读取目录内容方法
const dir = require('./dir')

// 封装读取文件内容方法
const file = require('./file')

/**
 * 获取静态资源内容
 * @param  {object} ctx koa上下文
 * @param  {string} 静态资源目录在本地的绝对路径
 * @return  {string} 请求获取到的本地内容
 */
async function content(ctx, fullStaticPath) {
  // 封装请求资源的完绝对径
  let reqPath = path.join(fullStaticPath, ctx.url)

  // 判断请求路径是否为存在目录或者文件
  let exist = fs.existsSync(reqPath)

  // 返回请求内容， 默认为空
  let content = ''

  if (!exist) {
    //如果请求路径不存在，返回404
    content = '404 Not Found! o(╯□╰)o！'
  } else {
    //判断访问地址是文件夹还是文件
    let stat = fs.statSync(reqPath)

    if (stat.isDirectory()) {
      //如果为目录，则渲读取目录内容
      content = dir(ctx.url, reqPath)
    } else {
      // 如果请求为文件，则读取文件内容
      content = file(reqPath)
    }
  }

  return content
}
module.exports = content

// dir.js
const url = require('url')
const fs = require('fs')
const path = require('path')

// 遍历读取目录内容方法
const walk = require('./walk')

/**
 * 封装目录内容
 * @param  {string} url 当前请求的上下文中的url，即ctx.url
 * @param  {string} reqPath 请求静态资源的完整本地路径
 * @return {string} 返回目录内容，封装成HTML
 */
function dir(url, reqPath) {
  // 遍历读取当前目录下的文件、子目录
  let contentList = walk(reqPath)

  let html = `<ul>`
  for (let [index, item] of contentList.entries()) {
    html = `${html}<li><a href="${
      url === '/' ? '' : url
    }/${item}">${item}</a></li>`
  }
  html = `${html}</ul>`

  return html
}
module.exports = dir

// file.js
const fs = require('fs')

/**
 * 读取文件方法
 * @param  {string} 文件本地的绝对路径
 * @return {string|binary}
 */
function file(filePath) {
  let content = fs.readFileSync(filePath, 'binary')
  return content
}
module.exports = file

// mimes.js
let mimes = {
  css: 'text/css',
  less: 'text/css',
  gif: 'image/gif',
  html: 'text/html',
  ico: 'image/x-icon',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'text/javascript',
  json: 'application/json',
  pdf: 'application/pdf',
  png: 'image/png',
  svg: 'image/svg+xml',
  swf: 'application/x-shockwave-flash',
  tiff: 'image/tiff',
  txt: 'text/plain',
  wav: 'audio/x-wav',
  wma: 'audio/x-ms-wma',
  wmv: 'video/x-ms-wmv',
  xml: 'text/xml',
}
module.exports = mimes

// walk.js
const fs = require('fs')
const mimes = require('./mimes')

/**
 * 遍历读取目录内容（子目录，文件名）
 * @param  {string} reqPath 请求资源的绝对路径
 * @return {array} 目录内容列表
 */
function walk(reqPath) {
  let files = fs.readdirSync(reqPath)

  let dirList = [],
    fileList = []
  for (let i = 0, len = files.length; i < len; i++) {
    let item = files[i]
    let itemArr = item.split('.')
    let itemMime =
      itemArr.length > 1 ? itemArr[itemArr.length - 1] : 'undefined'

    if (typeof mimes[itemMime] === 'undefined') {
      dirList.push(files[i])
    } else {
      fileList.push(files[i])
    }
  }

  let result = dirList.concat(fileList)

  return result
}
module.exports = walk
```

4、package.json
```json
{
  "name": "cache",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "dependencies": {
    "koa": "^2.13.1",
    "koa-router": "^10.0.0",
    "koa-static": "^5.0.0"
  }
}
```


### Last-Modified

第一次请求响应头
Date: Fri, 26 Mar 2021 02:54:06 GMT
Last-Modified: Fri, 26 Mar 2021 02:49:44 GMT

30s内重新请求
请求头字段：If-Modified-Since: Fri, 26 Mar 2021 02:49:44 GMT
响应：304 Not Modified

30s后重新请求
请求头字段：If-Modified-Since: Fri, 26 Mar 2021 02:49:44 GMT
响应：304 Not Modified

修改文件再请求
请求头字段：If-Modified-Since: Fri, 26 Mar 2021 02:49:44 GMT
响应状态：200
向应头：
Date: Fri, 26 Mar 2021 03:16:06 GMT
Last-Modified: Fri, 26 Mar 2021 03:15:57 GMT

删除文件内容保存，再把删除的内容加回去保存
请求头字段：If-Modified-Since: 上次返回的Last-Modified
响应状态：200
向应头：
Date: 新的时间
Last-Modified: 新的时间


### etag

第一次请求响应头
Date: Fri, 26 Mar 2021 02:54:06 GMT
etag: "96c773068c947074a6e69af2a1e09e3a"

30s内重新请求
请求头字段：If-None-Match: "96c773068c947074a6e69af2a1e09e3a"
响应：304 Not Modified

30s后重新请求
请求头字段：If-None-Match: "96c773068c947074a6e69af2a1e09e3a"
响应：304 Not Modified

修改文件再请求
请求头字段：If-None-Match: "96c773068c947074a6e69af2a1e09e3a"
响应状态：200
向应头：
Date: Fri, 26 Mar 2021 03:12:49 GMT
etag: "0e616de44cf3356010144026ddfdf943"

删除文件内容保存，再把删除的内容加回去保存
请求头字段：If-None-Match: 上次返回的etag值
响应状态：304 Not Modified


### Expires（绝对时间，精确到秒）

第一次请求响应头
Date: Fri, 26 Mar 2021 02:54:06 GMT
Expires: Fri Mar 26 2021 10:54:36 GMT+0800 (GMT+08:00)

30s内重新请求
请求头不含任何缓存字段
响应：200 memory-cache

30s后重新请求
请求头不含缓存字段
响应：200 来自网络


### Cache-Control: max-age（相对时间，以秒为单位）

第一次请求响应头
Cache-Control: max-age=30
Date: Fri, 26 Mar 2021 02:54:06 GMT

30s内重新请求
请求头不含任何缓存字段
响应：200 memory-cache

30s后重新请求
请求头不含缓存字段
响应：200 来自网络
