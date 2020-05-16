## 参考链接

[使用ShellJS提升你的开发效率](https://blog.csdn.net/weixin_33980459/article/details/91422235)

[child_process - 子进程 ](https://segmentfault.com/a/1190000016125823)

[Nodejs的path模块介绍](https://www.cnblogs.com/wulinzi/p/8034047.html)

[浅谈Nodejs开发桌面应用 针对 Electron ](https://www.jianshu.com/p/72e7d7e513ca)

[vue-cli脚手架中webpack配置基础文件详解 ](https://www.cnblogs.com/zhangruiqi/p/9062005.html)

[插件之mini-css-extract-plugin](https://www.jianshu.com/p/91e60af11cc9)


```js
function getSearchFromLocation(){
  let search = location.search;
  // ? 在 hash 之后
  if(!search){
    let index = location.href.indexOf('?');
    if(index < 0 || index === location.href.length - 1){
      search = '';
    }else{
      search = '?' + location.href.split('?')[1];
    }
  }
  // search 后面如果有 hash, search 不会包含hash
  search = search.substring(1);
  if(search === '') return {};
  // 到这里的时候search 一定不为空，保存 search 字符串
  const searchObj = {
    originSearchStr: search
  }
  const arr = search.split('&');
  arr.forEach( item => {
    let subSearch = item.split('=');
    if(subSearch.length === 2){
      searchObj[subSearch[0]] = subSearch[1];
    }else{
      searchObj[subSearch[0]] = '';
    }
  })
  return searchObj;
}
```
