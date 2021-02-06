// class Emitter {
//     constructor(max) {
//         this.max = max;
//         this.syncIdx = 0;
//     }
//     *[Symbol.iterator]() {
//         while(this.syncIdx < this.max) {
//             yield this.syncIdx++;
//         }
//     }
// }
// const emitter = new Emitter(5);
// function syncCount() {
//     const syncCounter = emitter[Symbol.iterator]();
//     for (const x of syncCounter) {
//         console.log(x);
//     }
// }
// syncCount(); //0，1，2，3，4


// 异步迭代器
// class Emitter {
//     constructor(max) {
//         this.max = max;
//         this.syncIdx = 0;
//         this.asyncIdx = 0;
//     }
//     async *[Symbol.asyncIterator]() {
//         // *[Symbol.asyncIterator]() {
//         while(this.asyncIdx < this.max) {
//             // yield new Promise((resolve) => resolve(this.asyncIdx++));
//             // yield this.asyncIdx++
//             yield new Promise((resolve) => {
//                 setTimeout(() => {
//                     resolve(this.asyncIdx++)
//                 }, 3000);
//             });
//         }
//     }
// }
// const emitter = new Emitter(5);
// async function asyncCount() {
//     const asyncCounter = emitter[Symbol.asyncIterator]();
//     // for-await-of 循环可以流畅地处理同步和异步可迭代对象
//     for await(const x of asyncCounter) {
//         console.log(x);
//     }

//     // 普通的for-of会报错
//     // for (const x of syncCounter) {
//     //     console.log(x);
//     // }
// }
// asyncCount();// 0，1，2，3，4, 每3s输出一个





// class Emitter {
//     constructor(max) {
//         this.max = max;
//         this.syncIdx = 0;
//         this.asyncIdx = 0;
//     }
//     async *[Symbol.asyncIterator]() {
//         while(this.asyncIdx < this.max) {
//             if (this.asyncIdx < 3) {
//                 yield this.asyncIdx++;
//             } else {
//                 // 被拒绝的期约会强制退出迭代器
//                 throw 'Exited loop';
//             }
//         }
//     }
// }
// const emitter = new Emitter(5);
// async function asyncCount() {
//     const asyncCounter = emitter[Symbol.asyncIterator]();
//     for await(const x of asyncCounter) {
//         console.log(x);
//     }
// }
// asyncCount();
// 因为异步迭代器使用期约来包装返回值，所以必须考虑某个期约被拒绝的情况。由于异步迭代会按
// 顺序完成，而在循环中跳过被拒绝的期间是不合理的。因此，被拒绝的期约会强制退出迭代器
// 0
// 1
// 2
// Uncaught (in promise) Exited loop


// 高级用法
// class Observable {
//     constructor() {
//         this.promiseQueue = [];
//         // 保存用于解决队列中下一个期约的程序
//         this.resolve = null;
//         // 把最初的期约推到队列
//         // 该期约会解决为第一个观察到的事件
//         this.enqueue();
//     }
//     // 创建新期约，保存其解决方法
//     // 再把它保存到队列中
//     enqueue() {
//         this.promiseQueue.push(new Promise((resolve) => this.resolve = resolve));
//     }
//     // 从队列前端移除期约
//     // 并返回它
//     dequeue() {
//         return this.promiseQueue.shift();
//     }
//     async *fromEvent (element, eventType) {
//         // 在有事件生成时，用事件对象来解决 队列头部的期约
//         // 同时把另一个期约加入队列
//         element.addEventListener(eventType, (event) => {
//             this.resolve(event);
//             this.enqueue();
//         });
//         // 每次解决队列前面的期约
//         // 都会向异步迭代器返回相应的事件对象
//         while (1) {
//             yield await this.dequeue();
//         }
//     }
// }
// (async function() {
//     const observable = new Observable();
//     const button = document.querySelector('button');
//     const mouseClickIterator = observable.fromEvent(button, 'click');
//     for await (const clickEvent of mouseClickIterator) {
//         console.log(clickEvent);
//     }
// })();


// promise.all 只有所有的等待都resolve了才走then方法，否则，谁先reject，就走catch，并且后续的不再处理
// const req1 = new Promise(resolve => {
//     setTimeout(()=>{resolve('resolve')}, 1000);
// });
// const req2 = new Promise((resolve, reject) => {
//     setTimeout(()=>{reject('reject')}, 1000);
// });
// // 只有所有请求都resolve了才会进入.then
// Promise.all([req1, req2]).then(res => {
//     console.log('all-then', res);
// })
// .catch(err => {
//     console.log('all-catch', err);
// });
// // 输出all-catch reject

let date = Date.now();
console.log(date)
const req1 = new Promise((resolve, reject) => {
    setTimeout(()=>{reject('reject1')}, 1000);
});
const req2 = new Promise((resolve, reject) => {
    setTimeout(()=>{reject('reject2')}, 3000);
});
// 只有所有请求都resolve了才会进入.then
Promise.all([req1, req2]).then(res => {
    console.log('all-then', res);
})
.catch(err => {
    console.log(Date.now() - date);
    console.log('all-catch', err);
});
// 输出all-catch reject1


// Promise.race(iterable):返回一个promise，一旦迭代器中的某个promise解决或则拒绝，返回的promise就会解决或者拒绝。


JSON.stringify();//  值为undefined的属性会被忽略
JSON.stringify(1)
// "1"
JSON.stringify('1')
// ""1""
JSON.stringify(false)
// "false"
JSON.stringify(new Date())
// ""2021-02-06T08:39:56.901Z""

// 第2个参数：用于过滤、格式化，

// 没有或者是null，则所有属性被序列化
JSON.stringify({name: 'text', age: 18});
JSON.stringify({name: 'text', age: 18}, null);
// "{"name":"text","age":18}"

// 是数组，则属性名在该数组内的属性被序列化
JSON.stringify({name: 'text', age: 18}, ['age']);
// "{"age":18}"

// 数组中先给出的字段会先序列化，并且是对每一层对象都如此
JSON.stringify({name: 'text', age: 18, obj: {name: 'text1', age: 20}}, ['age','obj','name']);
// "{"age":18,"obj":{"age":20,"name":"text1"},"name":"text"}"

// 数组中没给出的字段都会被忽略，并且是对每一层对象都如此
JSON.stringify({name: 'text', age: 18, obj: {name: 'text1', age: 20}}, ['age','obj']);
// "{"age":18,"obj":{"age":20}}"
JSON.stringify({name: 'text', age: 18, obj: {name: 'text1', age: 20}}, ['age','obj.name']);
// "{"age":18}"


// 是函数，则该函数会遍历属性，return undefined的属性会被忽略
JSON.stringify({name: 'text', age: 18, obj: {name: 'text1', age: 20}}, (key, value) => {
	if (key === 'age') return undefined
	return value
});
// "{"name":"text","obj":{"name":"text1"}}"

// 根对象的key为空字符串''
JSON.stringify({name: 'text', age: 18}, (key, value) => {
	if (key === '') return undefined
	return value
});
// undefined
JSON.stringify({name: 'text', age: 18}, (key, value) => {
	if (key === '') return {a:1,b:2};
	return value
});
// "{"a":1,"b":2}"

// 第3个参数：用于缩进、美化
// 没有或者是null，则正常打印
JSON.stringify({name: 'text', age: 18}, null);
JSON.stringify({name: 'text', age: 18}, null, null);
// "{"name":"text","age":18}"

// 是数字，则代表缩进多少个空格，最大为10，小于1则没有空格
JSON.stringify({name: 'text', age: 18}, null, -1);
// "{"name":"text","age":18}"
JSON.stringify({name: 'text', age: 18}, null, 4);
/*
"{
    "name": "text",
    "age": 18
}"
*/
JSON.stringify({name: 'text', age: 18}, null, "----");
/*
"{
---"name": "text",
---"age": 18
}"
*/
// 字符串超过10个，则只取前10个
JSON.stringify({name: 'text', age: 18, obj: {name: 'text1', age: 20}}, null, "012345678910");
/*
"{
0123456789"name": "text",
0123456789"age": 18,
0123456789"obj": {
01234567890123456789"name": "text1",
01234567890123456789"age": 20
0123456789}
}"
*/

/*
有时候，对象需要在JSON.stringify()之上自定义JSON 序列化。此时，可以在要序列化的对象
中添加toJSON()方法，序列化时会基于这个方法返回适当的JSON 表示。事实上，原生Date 对象就
有一个toJSON()方法，能够自动将JavaScript 的Date 对象转换为ISO 8601 日期字符串（本质上与在
Date 对象上调用toISOString()方法一样）。


toJSON()方法可以与过滤函数一起使用，因此理解不同序列化流程的顺序非常重要。在把对象传
给JSON.stringify()时会执行如下步骤。
(1) 如果可以获取实际的值，则调用toJSON()方法获取实际的值，否则使用默认的序列化。
(2) 如果提供了第二个参数，则应用过滤。传入过滤函数的值就是第(1)步返回的值。
(3) 第(2)步返回的每个值都会相应地进行序列化。
*/


// JSON.parse(text,receiver) 可选，一个转换结果的函数， 将为对象的每个成员调用此函数。
var jsonText = '{"age":18,"obj":{"age":20,"initDate":"2020-01-02"},"initDate":0}';  //json格式字符串
var obj = JSON.parse(text, function (key, value) {   //每个对象的属性调用此循环
	if (key == "initDate") {
	    return new Date(value);//将日期对象返回
	} else {
	    return value;
    }
});
/*
{
age: 18
initDate: Thu Jan 01 1970 08:00:00 GMT+0800 (中国标准时间)
obj: {
    age: 20
    initDate: Thu Jan 02 2020 08:00:00 GMT+0800 (中国标准时间) 
}
*/

// 关于循环引用，下面代码会报错
var obj = {name: 'text', age: 18};
obj.child = obj;
JSON.stringify(obj);

var aa = {age: 1};
var bb = {age: 2};
aa.obj = bb;
bb.obj = aa;
JSON.stringify(aa);
/*
VM531:1 Uncaught TypeError: Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    |     property 'obj' -> object with constructor 'Object'
    --- property 'obj' closes the circle
    at JSON.stringify (<anonymous>)
    at <anonymous>:1:6
*/


/**
// json-stringify-safe.js
// 安全的stringify方法，对循环引用做了兼容处理
function stringify(obj, replacer, spaces, cycleReplacer) {
  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
}

function serializer(replacer, cycleReplacer) {
  var stack = [], keys = []

  if (cycleReplacer == null) cycleReplacer = function(key, value) {
    if (stack[0] === value) return "[Circular ~]"
    return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
  }

  return function(key, value) {
    if (stack.length > 0) {
      var thisPos = stack.indexOf(this)
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
    }
    else stack.push(value)

    return replacer == null ? value : replacer.call(this, key, value)
  }
}
*/


/**
// JSON.stringify模拟实现json-stable-stringify-without-jsonify
// https://www.npmjs.com/package/json-stable-stringify-without-jsonify
module.exports = function (obj, opts) {
    if (!opts) opts = {};
    if (typeof opts === 'function') opts = { cmp: opts };
    var space = opts.space || '';
    if (typeof space === 'number') space = Array(space+1).join(' ');
    var cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : false;
    var replacer = opts.replacer || function(key, value) { return value; };

    var cmp = opts.cmp && (function (f) {
        return function (node) {
            return function (a, b) {
                var aobj = { key: a, value: node[a] };
                var bobj = { key: b, value: node[b] };
                return f(aobj, bobj);
            };
        };
    })(opts.cmp);

    var seen = [];
    return (function stringify (parent, key, node, level) {
        var indent = space ? ('\n' + new Array(level + 1).join(space)) : '';
        var colonSeparator = space ? ': ' : ':';

        if (node && node.toJSON && typeof node.toJSON === 'function') {
            node = node.toJSON();
        }

        node = replacer.call(parent, key, node);

        if (node === undefined) {
            return;
        }
        if (typeof node !== 'object' || node === null) {
            return JSON.stringify(node);
        }
        if (Array.isArray(node)) {
            var out = [];
            for (var i = 0; i < node.length; i++) {
                var item = stringify(node, i, node[i], level+1) || JSON.stringify(null);
                out.push(indent + space + item);
            }
            return '[' + out.join(',') + indent + ']';
        }
        else {
            if (seen.indexOf(node) !== -1) {
                if (cycles) return JSON.stringify('__cycle__');
                throw new TypeError('Converting circular structure to JSON');
            }
            else seen.push(node);

            var keys = Object.keys(node).sort(cmp && cmp(node));
            var out = [];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var value = stringify(node, key, node[key], level+1);

                if(!value) continue;

                var keyValue = JSON.stringify(key)
                    + colonSeparator
                    + value;
                ;
                out.push(indent + space + keyValue);
            }
            seen.splice(seen.indexOf(node), 1);
            return '{' + out.join(',') + indent + '}';
        }
    })({ '': obj }, '', obj, 0);
};
 */
