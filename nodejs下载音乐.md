
```js
const fs = require('fs');// 文件处理模块
const path = require('path');
const request = require('request');
const requestObj = {
    dir: './files/',
    url: 'http://xinsheng.music.com/cn/index.php?app=home&mod=Attach&act=showdataattach&savepath='
}

function downloadFile(obj){
    const req = request(requestObj.url + obj.url, {timeout: 10000, pool: false});
    req.setMaxListeners(50);
    // Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36
    req.setHeader('user-agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36');

    req.on('error', function(err) {
        throw err;
    });
    req.on('response', function(res) {
        res.setEncoding("binary");
        let fileData = "";

        res.on('data', function (chunk) {
            fileData += chunk; 
        });
        res.on('end',function(){
            const dir = path.join(__dirname, requestObj.dir);
            const fileName = `${dir}${obj.name}`;
            fs.writeFile(fileName, fileData, "binary", function(err){
                if(err){
                    console.log(`文件${obj.name}下载失败.`);
                }else{
                    console.log(`文件${obj.name}下载成功.`);
                }
            });  
        });
    })
}

//-------------------------------
// 入口函数
//-------------------------------
function main(list){
    for(let i = 0; i < list.length; i++) {
        downloadFile(list[i]);
    }
}

// 开始
const list = [
    {
        "name": "周杰伦-彩虹.mp3",
        "url": "2011/1112/13/&savename=4ebe09bd3b27c.mp3"
    },
]
main(list);

```


## url

```js
{"name": "任贤齐_-_爱，怎么会是这样.mp3", "url": "2011/1225/12/&savename=4ef6a9eb7ceb4.mp3"
        },{"name": "任贤齐_-_爱的路上只有我和你.mp3", "url": "2011/1225/12/&savename=4ef6a9f42e9f8.mp3"
        },{"name": "任贤齐_-_不再让你孤单.mp3", "url": "2011/1225/12/&savename=4ef6a9f8da644.mp3"
        },{"name": "任贤齐_-_春天花会开.mp3", "url": "2011/1225/12/&savename=4ef6a9fe36c14.mp3"
        },{"name": "任贤齐_-_对面的女孩看过来.mp3", "url": "2011/1225/12/&savename=4ef6aa020f17b.mp3"
        },{"name": "任贤齐_-_飞鸟.mp3", "url": "2011/1225/12/&savename=4ef6aa0d9fcd6.mp3"
        },{"name": "任贤齐_-_风暴.mp3", "url": "2011/1225/12/&savename=4ef6aa11b334d.mp3"
        },{"name": "任贤齐_-_很受伤.mp3", "url": "2011/1225/12/&savename=4ef6aa158a2e6.mp3"
        },{"name": "任贤齐_-_花太香.mp3", "url": "2011/1225/12/&savename=4ef6aa19b7242.mp3"
        },{"name": "任贤齐_-_活着.mp3", "url": "2011/1225/12/&savename=4ef6aa1df2666.mp3"
        },{"name": "任贤齐_-_橘子香水.mp3", "url": "2011/1225/12/&savename=4ef6aa279aeb0.mp3"
        },{"name": "任贤齐_-_绝望的生鱼片.mp3", "url": "2011/1225/12/&savename=4ef6aa2b94d8f.mp3"
        },{"name": "任贤齐_-_哭个痛快.mp3", "url": "2011/1225/12/&savename=4ef6aa320ae79.mp3"
        },{"name": "任贤齐_-_浪花一朵朵.mp3", "url": "2011/1225/12/&savename=4ef6aa3643b06.mp3"
        },{"name": "任贤齐_-_流着泪的你的脸.mp3", "url": "2011/1225/12/&savename=4ef6aa3ad4ddf.mp3"
        },{"name": "任贤齐_-_呢喃.mp3", "url": "2011/1225/12/&savename=4ef6aa44ea54f.mp3"
        },{"name": "任贤齐_-_任逍遥.mp3", "url": "2011/1225/12/&savename=4ef6aa4992b8e.mp3"
        },{"name": "任贤齐_-_伤心太平洋.mp3", "url": "2011/1225/12/&savename=4ef6aa4de5e09.mp3"
        },{"name": "任贤齐_-_少年游.mp3", "url": "2011/1225/12/&savename=4ef6aa5224aa3.mp3"
        },{"name": "任贤齐_-_天使也一样.mp3", "url": "2011/1225/12/&savename=4ef6aa56805d9.mp3"
        },{"name": "任贤齐_-_我是一只鱼.mp3", "url": "2011/1225/12/&savename=4ef6aa62daa21.mp3"
        },{"name": "任贤齐_-_希望你明年冬天会回來.mp3", "url": "2011/1225/12/&savename=4ef6aa674e679.mp3"
        },{"name": "任贤齐_-_小雪.mp3", "url": "2011/1225/12/&savename=4ef6aa6b8730e.mp3"
        },{"name": "任贤齐_-_兄弟.mp3", "url": "2011/1225/12/&savename=4ef6aa6f6bfaf.mp3"
        },{"name": "任贤齐_-_一个男人的眼泪.mp3", "url": "2011/1225/12/&savename=4ef6aa7423a21.mp3"
        },{"name": "任贤齐_-_一个人.mp3", "url": "2011/1225/12/&savename=4ef6aa804cd7e.mp3"
        },{"name": "任贤齐_-_依靠.mp3", "url": "2011/1225/12/&savename=4ef6aa84acfd7.mp3"
        },{"name": "任贤齐_-_再出发.mp3", "url": "2011/1225/12/&savename=4ef6aa8832819.mp3"
        },{"name": "任贤齐_-_珍惜.mp3", "url": "2011/1225/12/&savename=4ef6aa8f61a32.mp3"
        },{"name": "任贤齐_-_只爱你一个人.mp3", "url": "2011/1225/12/&savename=4ef6aa94cb93b.mp3"
        }

       
```
