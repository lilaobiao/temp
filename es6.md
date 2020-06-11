## 深冻结对象

```js
var constantize = (obj) => {  
    Object.freeze(obj);  
    Object.keys(obj).forEach( (key, value) => {
        if ( typeof obj[key] === 'object' ) {
            constantize( obj[key] );
        }
    });
}
```

## codePointAt() 与 fromCodePoint()

codePointAt 方法主要用于 js 中的四个字节的字符处理

```js
var s = "𠮷";
s.length // 2 
s.charAt(0) // '' 
s.charAt(1) // '' 
s.charCodeAt(0) // 55362 
s.charCodeAt(1) // 57271


var s = 'a';
s.codePointAt(0) // 134071 
s.codePointAt(1) // 57271
s.charCodeAt(2) // 97


s.codePointAt(0).toString(16) // "20bb7" 
// 注意，下面是 2 不是 1
s.charCodeAt(2).toString(16) // "61"

// codePointAt方法是测试一个字符由两个字节还是由四个字节组成的最简单方法。
function is32Bit(c) {  return c.codePointAt(0) > 0xFFFF; }

// 数字转为16进制
var a = 134071
a.toString(16) 
"20bb7"
```

fromCodePoint()
```js
String.fromCharCode(0x20BB7) // "ஷ"

String.fromCodePoint(0x20BB7) // "𠮷"
String.fromCodePoint(0x78, 0x1f680, 0x79) === 'x\uD83D\uDE80y' // true


var text = String.fromCodePoint(0x20BB7);
for (let i = 0; i < text.length; i++) {  console.log(text[i]); } 
// " " 
// " "
for (let i of text) {  console.log(i); } 
// "𠮷"
```

## 模板字符串

大括号内部可以放入任意的JavaScript表达式，可以进行运算，以及引用对象属性。
```js
var x = 1; var y = 2;
`${x} + ${y} = ${x + y}` 
// "1 + 2 = 3"
`${x} + ${y * 2} = ${x + y * 2}`
// "1 + 4 = 5"
var obj = {x: 1, y: 2}; 
`${obj.x + obj.y}` 
// 3

// 函数调用
function fn() {  return "Hello World"; }
`foo ${fn()} bar` 
// foo Hello World bar

// 嵌套
const tmpl = addrs => `  
    <table>  
        ${addrs.map(addr => `    
            <tr><td>${addr.first}</td></tr>    
            <tr><td>${addr.last}</td></tr>  
        `).join('')}  
    </table> `;
```

## 标签模板

模板字符串可以紧跟在一个函数名后面，该函数将被调用来处理这个模板字符串。这被称为“标签模板”功能（tagged template）。

```js
alert`123` 
// 等同于 alert(123)


// 如果模板字符里面有变量，就不是简单的调用了，而是会将模板字符串先处理成多个参数，再调用函数。
tag`Hello ${ a + b } world ${ a * b }`; 
// 等同于 tag(['Hello ', ' world ', ''], 15, 50);


// 如何将各个参数按照原来的位置拼合回去
var total = 30; 
var msg = passthru`The total is ${total} (${total*1.05} with tax)`;
function passthru(literals) {
    console.log(literals); // ["The total is ", " (", " with tax)"]
    console.log(arguments); // [["The total is ", " (", " with tax)"], 30 ,31.5]
    var result = '';  
    var i = 0;
    while (i < literals.length) {
        result += literals[i++];
        if (i < arguments.length) {
            result += arguments[i];
        }
    }
    return result;
}
console.log(msg) // "The total is 30 (31.5 with tax)"


// 方法2, 用 扩展符
function passthru(literals, ...values) {
    var output = "";
    for (var index = 0; index < values.length; index++) {
        output += literals[index] + values[index];
    }
    output += literals[index]
    return output;
}
```

## 正则

字符串对象共有4个方法，可以使用正则表达式：match()、replace()、search()和split()。
ES6将这4个方法，在语言内部全部调用RegExp的实例方法，从而做到所有与正则相关的方法，全都定义在RegExp对象上。
String.prototype.match 调用 RegExp.prototype[Symbol.match] 
String.prototype.replace 调用 RegExp.prototype[Symbol.replace] 
String.prototype.search 调用 RegExp.prototype[Symbol.search] 
String.prototype.split 调用 RegExp.prototype[Symbol.split] 

u 修饰符和 y 修饰符

ES6对正则表达式添加了u修饰符，含义为“Unicode模式”，用来正确处理大于\uFFFF的Unicode字符。也就是说，会正确处理四个字节的UTF-16编 码。
```js
/^\uD83D/u.test('\uD83D\uDC2A')
// false 
/^\uD83D/.test('\uD83D\uDC2A') 
// true
```

y修饰符的作用与g修饰符类似，也是全局匹配，后一次匹配都从上一次匹配成功的下一个位置开始。不同之处在于，g修饰符只要剩余位置中存在匹配 就可，而y修饰符确保匹配必须从剩余的第一个位置开始，这也就是“粘连”的涵义。
```js
var s = 'aaa_aa_a';
var r1 = /a+/g;
var r2 = /a+/y;
r1.exec(s) // ["aaa"] 
r2.exec(s) // ["aaa"]
r1.exec(s) // ["aa"] 
r2.exec(s) // null


// 没有找到匹配 
'x##'.split(/#/y) // [ 'x##' ]
// 找到两个匹配 
'##x'.split(/#/y) // [ '', '', 'x' ]
```


正则表达式的 exec 和 字符串的 match 方法对比

```js
var str = "带我去百度errorCode=123456789,whqwherrorCode=12345;带我去百度";
var r1 = /errorCode=\d*/;
// exec每次只找一个
r1.exec(str);
// 永远都是 ["errorCode=123456789", index: 5, input: "带我去百度errorCode=123456789,whqwherrorCode=12345;带我去百度", groups: undefined]

// 每次匹配成功后，正则的 lastIndex 属性都变为匹配后的下一个位置
var r2 = /errorCode=\d*/g;
// r2.lastIndex // 0
r2.exec(str);
// ["errorCode=123456789", index: 5, input: "带我去百度errorCode=123456789,whqwherrorCode=12345;带我去百度", groups: undefined]
// r2.lastIndex // 24
r2.exec(str);
// ["errorCode=12345", index: 30, input: "带我去百度errorCode=123456789,whqwherrorCode=12345;带我去百度", groups: undefined]
// r2.lastIndex // 45
r2.exec(str);
// null

// 也可以在匹配前指定r2的lastIndex(匹配的开始位置);
// r2.lastIndex = 5;


// 注意match多个和一个时返回数据的区别，有无 g 修饰符的区别

str.match(r1);
// ["errorCode=123456789", index: 5, input: "带我去百度errorCode=123456789,whqwherrorCode=12345;带我去百度", groups: undefined]
str.match(r2);
// ["errorCode=123456789", "errorCode=12345"]

var r3 = /^errorCode=\d*$/g;
str.match(r3);
// null
```

先行断言，先行否定断言，后行断言，后行否定断言

JavaScript语言的正则表达式，只支持先行断言（lookahead）和先行否定断言（negative lookahead），不支持后行断言（lookbehind）和后行否定 断言（negative lookbehind）。
目前，有一个提案，在ES7加入后行断言。V8引擎4.9版已经支持，Chrome浏览器49版打开”experimental JavaScript features“开关（地址栏键 入about:flags），就可以使用这项功能。
”先行断言“指的是，x只有在y前面才匹配，必须写成/x(?=y)/。比如，只匹配百分号之前的数字，要写成/\d+(?=%)/。”先行否定断言“指的是，x只有 不在y前面才匹配，必须写成/x(?!y)/。比如，只匹配不在百分号之前的数字，要写成/\d+(?!%)/。

```js
/\d+(?=%)/.exec('100% of US presidents have been male')  // ["100"] 
/\d+(?!%)/.exec('that’s all 44 of them')                 // ["44"]
```

上面两个字符串，如果互换正则表达式，就会匹配失败。另外，还可以看到，”先行断言“括号之中的部分（(?=%)），是不计入返回结果的。
"后行断言"正好与"先行断言"相反，x只有在y后面才匹配，必须写成/(?<=y)x/。比如，只匹配美元符号之后的数字，要写成/(?<=\$)\d+/。
”后行否定 断言“则与”先行否定断言“相反，x只有不在y后面才匹配，必须写成/(?<!y)x/。比如，只匹配不在美元符号后面的数字，要写成/(?<!\$)\d+/。

```js
/(?<=\$)\d+/.exec('Benjamin Franklin is on the $100 bill')  // ["100"] 
/(?<!\$)\d+/.exec('it’s is worth about €90')                // ["90"]
```

上面的例子中，"后行断言"的括号之中的部分（(?<=\$)），也是不计入返回结果。
"后行断言"的实现，需要先匹配/(?<=y)x/的x，然后再回到左边，匹配y的部分。这种"先右后左"的执行顺序，与所有其他正则操作相反，导致了一些 不符合预期的行为。
首先，”后行断言“的组匹配，与正常情况下结果是不一样的。

```js
/(?<=(\d+)(\d+))$/.exec('1053') // ["", "1", "053"] 
/^(\d+)(\d+)$/.exec('1053') // ["1053", "105", "3"]
```

上面代码中，需要捕捉两个组匹配。没有"后行断言"时，第一个括号是贪婪模式，第二个括号只能捕获一个字符，所以结果是105和3。而"后行断 言"时，由于执行顺序是从右到左，第二个括号是贪婪模式，第一个括号只能捕获一个字符，所以结果是1和053。
其次，"后行断言"的反斜杠引用，也与通常的顺序相反，必须放在对应的那个括号之前。

```js
/(?<=(o)d\1)r/.exec('hodor')  // null 
/(?<=\1d(o))r/.exec('hodor')  // ["r", "o"]
```

上面代码中，如果后行断言的反斜杠引用（\1）放在括号的后面，就不会得到匹配结果，必须放在前面才可以。 


字符串的转义，让其成为正则模式。
```js
function escapeRegExp(str) {  
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'); 
}
let str = '/path/to/resource.html?search=query';
escapeRegExp(str) 
// "\/path\/to\/resource\.html\?search=query"
```

## 数值

1. 添加 2 进制和 8 进制

ES6提供了二进制和八进制数值的新的写法，分别用前缀0b（或0B）和0o（或0O）表示。

2. 添加 Number.isFinite(), Number.isNaN()，Number.isInteger()

```js
// es5 实现方式
(function (global) {  
    var global_isFinite = global.isFinite;
    Object.defineProperty(Number, 'isFinite', {    
        value: function isFinite(value) {      
            return typeof value === 'number' && global_isFinite(value);    
        },    
        configurable: true,    
        enumerable: false,    
        writable: true  
    }); 
})(this);


(function (global) {  
    var global_isNaN = global.isNaN;
    Object.defineProperty(Number, 'isNaN', {    
        value: function isNaN(value) {
            return typeof value === 'number' && global_isNaN(value);    
        },    
        configurable: true,    
        enumerable: false,    
        writable: true  
    }); 
})(this);


(function (global) {  var floor = Math.floor,    isFinite = global.isFinite;
  Object.defineProperty(Number, 'isInteger', {    value: function isInteger(value) {      return typeof value === 'number' && isFinite(value) &&        value > -9007199254740992 && value < 9007199254740992 &&        floor(value) === value;    },    configurable: true,    enumerable: false,    writable: true
  }); })(this);
```

3. Number.parseInt(), Number.parseFloat()

ES6将全局方法parseInt()和parseFloat()，移植到Number对象上面，行为完全保持不变。

4. Number.EPSILON，Number.MAX_SAFE_INTEGER 和 Number.MIN_SAFE_INTEGER

```js
function withinErrorMargin (left, right) {  return Math.abs(left - right) < Number.EPSILON; } 
withinErrorMargin(0.1 + 0.2, 0.3) // true 


Number.MAX_SAFE_INTEGER === Math.pow(2, 53) - 1 // true 
Number.MAX_SAFE_INTEGER === 9007199254740991 // true
Number.MIN_SAFE_INTEGER === -Number.MAX_SAFE_INTEGER // true 
Number.MIN_SAFE_INTEGER === -9007199254740991 // true
```

5. 安全整数和 安全整数和Number.isSafeInteger()

```js
Number.isSafeInteger = function (n) {  
    return (typeof n === 'number' &&    
        Math.round(n) === n &&    
        Number.MIN_SAFE_INTEGER <= n &&    
        n <= Number.MAX_SAFE_INTEGER); 
}
```

## Math对象的扩展

## Array

扩展运算符背后调用的是遍历器接口（Symbol.iterator），如果一个对象没有部署这个接口，就无法转换。Array.from方法则是还支持类似数组的对 象。所谓类似数组的对象，本质特征只有一点，即必须有length属性。因此，任何有length属性的对象，都可以通过Array.from方法转为数组，而此 时扩展运算符就无法转换。
```js
// Array.from
Array.from({length:5}).fill('1')
// ["1", "1", "1", "1", "1"]

// 简单的 Array.from 替代方法
const toArray = (() =>  Array.from ? Array.from : obj => [].slice.call(obj) )();

// Array.from 的第二个参数等同于 map 方法
Array.from({length:5},(x, index) => index);
// [0, 1, 2, 3, 4]

// Array.from()的另一个应用是，将字符串转为数组，然后返回字符串的长度。因为它能正确处理各种Unicode字符，
// 可以避免JavaScript将大 于\uFFFF的Unicode字符，算作两个字符的bug。
function countSymbols(string) {  return Array.from(string).length; }

// Array.of
function ArrayOf(){  return [].slice.call(arguments); }

// indexOf 返回索引，includes 返回 boolean，后者能正确判断 NaN
[NaN].indexOf(NaN) // -1
[NaN].includes(NaN) // true

// arr.some
arr.some(el => el === value);
[1,2,3].some(el => el === 3);
true
[1,3,3].some(el => el === 3);
true

// arr.every
[1,3,3].every(el => el === 3);
false
[3,3,3].every(el => el === 3);
true

// 数组的空位，下面代码说明，第一个数组的0号位置是有值的，第二个数组的0号位置没有值。
0 in [undefined, undefined, undefined] // true 
0 in [, , ,] // false
```

## 函数默认参数

```js
// 与解构赋值默认值结合使用 
function foo({x, y = 5}) {  console.log(x, y); }
foo({}) // undefined, 5 
foo({x: 1}) // 1, 5 
foo({x: 1, y: 2}) // 1, 2 
foo() // TypeError: Cannot read property 'x' of undefined


function fetch(url, { body = '', method = 'GET', headers = {} }) {  
    console.log(method); 
}
fetch('http://example.com', {}) // "GET"
fetch('http://example.com') // 报错

function fetch(url, { method = 'GET' } = {}) {  
    console.log(method);
}
fetch('http://example.com') // "GET"


// 通常情况下，定义了默认值的参数，应该是函数的尾参数。因为这样比较容易看出来，到底省略了哪些参数。如果非尾部的参数设置默认值，实际上 这个参数是没法省略的。

// 例一 
function f(x = 1, y) {  return [x, y]; }
f() // [1, undefined] 
f(2) // [2, undefined]) 
f(, 1) // 报错 
f(undefined, 1) // [1, 1]

// 例二 
function f(x, y = 5, z) {  return [x, y, z]; }
f() // [undefined, 5, undefined] 
f(1) // [1, 5, undefined] 
f(1, ,2) // 报错 
f(1, undefined, 2) // [1, 5, 2]


// 如果传入undefined，将触发该参数等于默认值，null则没有这个效果。
function foo(x = 5, y = 6) {  console.log(x, y); }
foo(undefined, null) // 5 null


// 指定了默认值以后，函数的length属性，将返回没有指定默认值的参数个数。也就是说，指定了默认值后，length属性将失真。
// 这是因为length属性的含义是，该函数预期传入的参数个数。某个参数指定默认值以后，预期传入的参数个数就不包括这个参数了。
(function (a = 5) {}).length // 0 
(function (a, b, c = 5) {}).length // 2

// 同理，rest参数也 不会计入length属性。
(function(...args) {}).length // 0

// 如果设置了默认值的参数不是尾参数，那么length属性也不再计入后面的参数了。
(function (a = 0, b, c) {}).length // 0 
(function (a, b = 1, c) {}).length // 1
```

## 箭头函数

箭头函数有几个使用注意点。
（1）函数体内的this对象，就是定义时所在的对象，而不是使用时所在的对象。

    所以当然也就不能用call()、apply()、bind()这些方法去改变this的指向。

（2）不可以当作构造函数，也就是说，不可以使用new命令，否则会抛出一个错误。

    没有 new.target

（3）不可以使用arguments对象，该对象在函数体内不存在。如果要用，可以用Rest参数代替。

    以下三个变量在箭头函数之中也是不存在的，指向外层函数的对应变量：arguments、super、new.target。

（4）不可以使用yield命令，因此箭头函数不能用作Generator函数。

```js
function foo() {  
    setTimeout(() => {    
        console.log('id:', this.id);  
    }, 100); 
}
function bar() {  
    setTimeout(function(){    
        console.log('id:', this.id);  
    }, 100); 
}
var id = 21;
foo.call({ id: 42 }); // id: 42
bar.call({ id: 42 }); // id: 21
```

上面代码中，setTimeout的参数是一个箭头函数，这个箭头函数的定义生效是在foo函数生成时，而它的真正执行要等到100毫秒后。如果是普通函 数，执行时this应该指向全局对象window，这时应该输出21。但是，箭头函数导致this总是指向函数定义生效时所在的对象（本例是{id: 42}），所 以输出的是42。

```js
function Timer() {
    this.s1 = 0;
    this.s2 = 0; 
    // 箭头函数  
    setInterval(() => this.s1++, 1000);  
    // 普通函数  
    setInterval(function () {    
        this.s2++;
    }, 1000);
}
var timer = new Timer();
setTimeout(() = >console.log('s1: ', timer.s1), 3100);
setTimeout(() = >console.log('s2: ', timer.s2), 3100); 
// s1: 3 
// s2: 0
```

上面代码中，Timer函数内部设置了两个定时器，分别使用了箭头函数和普通函数。前者的this绑定定义时所在的作用域（即Timer函数），后者 的this指向运行时所在的作用域（即全局对象）。所以，3100毫秒之后，timer.s1被更新了3次，而timer.s2一次都没更新。

**this指向的固定化，并不是因为箭头函数内部有绑定this的机制，实际原因是箭头函数根本没有自己的this，导致内部的this就是外层代码块 的this。正是因为它没有this，所以也就不能用作构造函数。**

```js
function foo() {
    setTimeout(() = >{
        console.log('args:', arguments);
    },
    100);
}
foo(2, 4, 6, 8)
// args: [2, 4, 6, 8]
// 上面代码中，箭头函数内部的变量arguments，其实是函数foo的arguments变量。

(function() {
    return [(() = >this.x).bind({
        x: 'inner'
    })()];
}).call({x: 'outer'});
// ['outer']
// 上面代码中，箭头函数没有自己的this，所以bind方法无效，内部的this指向外部的this。
```

## 尾递归优化

函数调用自身，称为递归。如果尾调用自身，就称为尾递归。
递归非常耗费内存，因为需要同时保存成千上百个调用帧，很容易发生“栈溢出”错误（stack overflow）。但对于尾递归来说，由于只存在一个调用 帧，所以永远不会发生“栈溢出”错误。

```js
function factorial(n) {  
    if (n === 1) return 1;  
    return n * factorial(n - 1); 
}
factorial(5) // 120

// 上面代码是一个阶乘函数，计算n的阶乘，最多需要保存n个调用记录，复杂度 O(n) 。


// 如果改写成尾递归，只保留一个调用记录，复杂度 O(1) 。
function factorial(n, total) {
    if (n === 1) return total;
    return factorial(n - 1, n * total);
}
factorial(5, 1) // 120



// 还有一个比较著名的例子，就是计算fibonacci 数列，也能充分说明尾递归优化的重要性
// 如果是非尾递归的fibonacci 递归方法
function Fibonacci (n) {  
    if ( n <= 1 ) {return 1};
    return Fibonacci(n - 1) + Fibonacci(n - 2); 
}
Fibonacci(10); // 89 
// Fibonacci(100) 
// Fibonacci(500) // 堆栈溢出了


// 如果我们使用尾递归优化过的fibonacci 递归算法
function Fibonacci2(n, ac1 = 1, ac2 = 1) {
    if (n <= 1) {
        return ac2
    };
    return Fibonacci2(n - 1, ac2, ac1 + ac2);
    // Fibonacci2(1, 1, 2);
    // Fibonacci2(2, 1, 3);
}
Fibonacci2(100) // 573147844013817200000 
Fibonacci2(1000) // 7.0330367711422765e+208 
Fibonacci2(10000) // Infinity

```

**重点：递归优化手段**
1、中间变量改为函数参数
2、柯里化（currying）
3、改为循环，蹦床函数（trampoline）可以将递归执行转为循环执行

```js
function sum(x, y) {
    if (y > 0) {
        return sum(x + 1, y - 1);
    } else {
        return x;
    }
}
sum(1, 100000) // Uncaught RangeError: Maximum call stack size exceeded(…)

// 优化1
// 蹦床函数（trampoline）可以将递归执行转为循环执行。
function trampoline(f) {
    while (f && f instanceof Function) {
        f = f();
    }
    return f;
}

function sum(x, y) {
    if (y > 0) {
        // 每次都返回一个函数
        return sum.bind(null, x + 1, y - 1);
    } else {
        return x;
    }
}

trampoline(sum(1, 100000)) // 100001


// 优化2，从调用栈的角度出发自己实现
function tco(f) {
    var value;
    var active = false;
    var accumulated = [];
    return function accumulator() {
        accumulated.push(arguments);
        if (!active) {
            active = true;
            while (accumulated.length) {
                value = f.apply(this, accumulated.shift());
            }
            active = false;
            return value;
        }
    };
}
var sum = tco(function(x, y) {
    if (y > 0) {
        return sum(x + 1, y - 1)
    } else {
        return x
    }
});
sum(1, 100000) // 100001
```

## set 和 map

### set

```js
var s = new Set();
[2, 3, 5, 4, 5, 2, 2].map(x => s.add(x));
for (let i of s) {  console.log(i); } // 2 3 5 4
console.log(s.size); // 4


var items = new Set([1, 2, 3, 4, 5]); 
var array = Array.from(items);

// 去除数组的重复成员 
[...new Set(array)]

function dedupe(array) {  return Array.from(new Set(array)); }
```
Set实例的方法分为两大类：操作方法（用于操作数据）和遍历方法（用于遍历成员）。下面先介绍四个操作方法。

add(value)：添加某个值，返回Set结构本身。 

delete(value)：删除某个值，返回一个布尔值，表示删除是否成功。 

has(value)：返回一个布尔值，表示该值是否为Set的成员。 

clear()：清除所有成员，没有返回值。


Set结构的实例有四个遍历方法，可以用于遍历成员。

keys()：返回键名的遍历器 

values()：返回键值的遍历器 

entries()：返回键值对的遍历器 

forEach()：使用回调函数遍历每个成员

由于Set结构没有键名，只有键值（或者说键名和键值是同 一个值），所以key方法和value方法的行为完全一致。

**需要特别指出的是，Set的遍历顺序就是插入顺序。这个特性有时非常有用，比如使用Set保存一个回调函数列表，调用时就能保证按照添加顺序调用。**

```js
let set = new Set([1, 2, 3]); 
set = new Set([...set].map(x => x * 2)); // 返回Set结构：{2, 4, 6}

let set = new Set([1, 2, 3, 4, 5]); 
set = new Set([...set].filter(x => (x % 2) == 0)); // 返回Set结构：{2, 4}


let a = new Set([1, 2, 3]); 
let b = new Set([4, 3, 2]);

// 并集 
let union = new Set([...a, ...b]); // Set {1, 2, 3, 4}

// 交集 
let intersect = new Set([...a].filter(x => b.has(x))); // set {2, 3}

// 差集 
let difference = new Set([...a].filter(x => !b.has(x))); // Set {1}

// 重新赋值
// 方法一 
let set = new Set([1, 2, 3]); 
set = new Set([...set].map(val => val * 2)); // set的值是2, 4, 6

// 方法二 
let set = new Set([1, 2, 3]); 
set = new Set(Array.from(set, val => val * 2)); // set的值是2, 4, 6

```

### WeakSet

WeakSet结构与Set类似，也是不重复的值的集合。但是，它与Set有两个区别。

首先，WeakSet的成员只能是对象，而不能是其他类型的值。

其次，WeakSet中的对象都是弱引用，即垃圾回收机制不考虑WeakSet对该对象的引用，也就是说，如果其他对象都不再引用该对象，那么垃圾回收 机制会自动回收该对象所占用的内存，不考虑该对象还存在于WeakSet之中。这个特点意味着，无法引用WeakSet的成员，因此WeakSet是不可遍历的。

WeakSet没有size属性，没有办法遍历它的成员


```js
var ws = new WeakSet(); 
ws.add(1) // TypeError: Invalid value used in weak set 
ws.add(Symbol()) // TypeError: invalid value used in weak set

var b = [3, 4]; 
var ws = new WeakSet(b); // Uncaught TypeError: Invalid value used in weak set(…)

var a = [[1,2], [3,4]]; 
var ws = new WeakSet(a); // 可以
```

WeakSet结构有以下三个方法。

WeakSet.prototype.add(value)：向WeakSet实例添加一个新成员。 

WeakSet.prototype.delete(value)：清除WeakSet实例的指定成员。 

WeakSet.prototype.has(value)：返回一个布尔值，表示某个值是否在WeakSet实例之中。

WeakSet不能遍历，是因为成员都是弱引用，随时可能消失，遍历机制无法保证成员的存在，很可能刚刚遍历结束，成员就取不到了。WeakSet的一 个用处，是储存DOM节点，而不用担心这些节点从文档移除时，会引发内存泄漏。

```js
// 下面代码保证了Foo的实例方法，只能在Foo的实例上调用。这里使用WeakSet的好处是，foos对实例的引用，
// 不会被计入内存回收机制，所以删除实 例的时候，不用考虑foos，也不会出现内存泄漏。 
const foos = new WeakSet() 

class Foo {
    constructor() {    
        foos.add(this)
    }
    
    method() {
        if (!foos.has(this)) {
            throw new TypeError('Foo.prototype.method 只能在Foo的实例上调用！');
        }
    }
}
```

### Map

Object结构提供了“字符串—值”的对应，Map结构提供了“值—值”的对应.

```js
var m = new Map(); 
var o = {p: 'Hello World'};
m.set(o, 'content') 
m.get(o) // "content"
m.has(o) // true 
m.delete(o) // true 
m.has(o) // false


var map = new Map([
    ['name', '张三'],
    ['title', 'Author']
]);
map.size // 2 
map.has('name') // true 
map.get('name') // "张三" 
map.has('title') // true 
map.get('title') // "Author"

// 字符串true和布尔值true是两个不同的键。
var m = new Map([
    [true, 'foo'],  
    ['true', 'bar']
]);
m.get(true) // 'foo' 
m.get('true') // 'bar'

```

**注意，只有对同一个对象的引用，Map结构才将其视为同一个键。这一点要非常小心。**
```js
var map = new Map();
map.set(['a'], 555); 
map.get(['a']) // undefined


var map = new Map();
var k1 = ['a']; 
var k2 = ['a'];
map.set(k1, 111).set(k2, 222);
map.get(k1) // 111 
map.get(k2) // 222
```

由上可知，Map的键实际上是跟内存地址绑定的，只要内存地址不一样，就视为两个键。这就解决了同名属性碰撞（clash）的问题.


如果Map的键是一个简单类型的值（数字、字符串、布尔值），则只要两个值严格相等，Map将其视为一个键，包括0和-0。另外，虽然NaN不严格相 等于自身，但Map将其视为同一个键。

```js
let map = new Map();
map.set(NaN, 123);
map.get(NaN) // 123
map.set(-0, 123);
map.get(+0) // 123
```

Map原生提供三个遍历器生成函数和一个遍历方法。

keys()：返回键名的遍历器。 

values()：返回键值的遍历器。 

entries()：返回所有成员的遍历器。 

forEach()：遍历Map的所有成员。

需要特别注意的是，Map的遍历顺序就是插入顺序

Map 转数组和对象
```js
let map = new Map([  [1, 'one'],  [2, 'two'],  [3, 'three'], ]);
[...map.keys()] // [1, 2, 3]
[...map.values()] // ['one', 'two', 'three']
[...map.entries()] // [[1,'one'], [2, 'two'], [3, 'three']]
[...map] // [[1,'one'], [2, 'two'], [3, 'three']


function strMapToObj(strMap) {  
    let obj = Object.create(null);  
    for (let [k,v] of strMap) {    
        obj[k] = v;  
    }  
    return obj; 
}
```

### WeakMap

WeakMap结构与Map结构基本类似，唯一的区别是它只接受对象作为键名（null除外），不接受其他类型的值作为键名，而且键名所指向的对象，不计 入垃圾回收机制。十分类似于 weakset 和 set 的区别。

WeakMap与Map在API上的区别主要是两个，一是没有遍历操作（即没有key()、values()和entries()方法），也没有size属性；二是无法清空，即 不支持clear方法。这与WeakMap的键不被计入引用、被垃圾回收机制忽略有关。因此，WeakMap只有四个方法可 用：get()、set()、has()、delete()。


### Iterator（遍历器）和 和for...of循环

**Iterator（遍历器）的概念**

JavaScript原有的表示“集合”的数据结构，主要是数组（Array）和对象（Object），ES6又添加了Map和Set。这样就有了四种数据集合，用户还可以 组合使用它们，定义自己的数据结构，比如数组的成员是Map，Map的成员是对象。这样就需要一种统一的接口机制，来处理所有不同的数据结构。
遍历器（Iterator）就是这样一种机制。它是一种接口，为各种不同的数据结构提供统一的访问机制。任何数据结构只要部署Iterator接口，就可以完成 遍历操作（即依次处理该数据结构的所有成员）。

Iterator的作用有三个：一是为各种数据结构，提供一个统一的、简便的访问接口；二是使得数据结构的成员能够按某种次序排列；三是ES6创造了一 种新的遍历命令for...of循环，Iterator接口主要供for...of消费。

Iterator的遍历过程是这样的。
（1）创建一个指针对象，指向当前数据结构的起始位置。也就是说，遍历器对象本质上，就是一个指针对象。
（2）第一次调用指针对象的next方法，可以将指针指向数据结构的第一个成员。
（3）第二次调用指针对象的next方法，指针就指向数据结构的第二个成员。
（4）不断调用指针对象的next方法，直到它指向数据结构的结束位置。
每一次调用next方法，都会返回数据结构的当前成员的信息。具体来说，就是返回一个包含value和done两个属性的对象。其中，value属性是当前成 员的值，done属性是一个布尔值，表示遍历是否结束。


任何部署了Iterator接口的对象，都可以用for...of循环遍历。Map结构原生支持Iterator接口，配合变量的解构赋值，获取键名和键值就非常方便。

```js
var map = new Map(); map.set('first', 'hello'); map.set('second', 'world');
for (let [key, value] of map) {  console.log(key + " is " + value); } // first is hello // second is world
如果只想获取键名，或者只想获取键值，可以写成下面这样。
// 获取键名 for (let [key] of map) {  // ... }
// 获取键值 for (let [,value] of map) {  // ... }
```
