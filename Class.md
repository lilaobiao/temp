# Class

ES6提供了更接近传统语言的写法，引入了Class（类）这个概念，作为对象的模板。通过class关键字，可以定义类。基本上，ES6的class可以看作 只是一个语法糖，它的绝大部分功能，ES5都可以做到，新的class写法只是让对象原型的写法更加清晰、更像面向对象编程的语法而已.
```js
function Point(x, y) {  
    this.x = x;  
    this.y = y; 
}

Point.prototype.toString = function () {  
    return '(' + this.x + ', ' + this.y + ')'; 
}


//定义类 
class Point {  
    constructor(x, y) {    
        this.x = x;    
        this.y = y;  
    }

    toString() {    
        return '(' + this.x + ', ' + this.y + ')';  
    } 
}

// 类实际上就是方法
typeof Point // function

// 构造函数的prototype属性，在ES6的“类”上面继续存在。事实上，类的所有方法都定义在类的prototype属性上面。
class B {} 
let b = new B();
b.constructor === B.prototype.constructor // true

// prototype对象的constructor属性，直接指向“类”的本身，这与ES5的行为是一致的。
b.prototype.constructor === B // true
```

另外，类的内部所有定义的方法，都是不可枚举的（non-enumerable）。

```js
class Point {  
    constructor(x, y) {    
         this.x = x;
         this.y = y; 
    }

    toString() {    
        // ...  
    } 
}

Object.keys(Point.prototype) // [] 
Object.getOwnPropertyNames(Point.prototype) // ["constructor","toString"]

// 与ES5一样，实例的属性除非显式定义在其本身（即定义在this对象上），否则都是定义在原型上（即定义在class上）。
var point = new Point(2, 3);
point.toString() // (2, 3)

point.hasOwnProperty('x') // true 
point.hasOwnProperty('y') // true 
point.hasOwnProperty('toString') // false 
point.__proto__.hasOwnProperty('toString') // true


// toString方法是Point类内部定义的方法，它是不可枚举的。这一点与ES5的行为不一致。
var Point = function (x, y) { };
Point.prototype.toString = function() { };
Object.keys(Point.prototype) // ["toString"] 
Object.getOwnPropertyNames(Point.prototype) // ["constructor","toString"]


point.hasOwnProperty('x') // true 
point.hasOwnProperty('y') // true 
point.hasOwnProperty('toString') // false 
```

###  constructor方法 

constructor方法是类的默认方法，通过new命令生成对象实例时，自动调用该方法。一个类必须有constructor方法，如果没有显式定义，一个空 的constructor方法会被默认添加。
constructor方法默认返回实例对象（即this），完全可以指定返回另外一个对象。

```js
class Foo {  constructor() {    return Object.create(null);  } }
new Foo() instanceof Foo // false
```
上面代码中，constructor函数返回一个全新的对象，结果导致实例对象不是Foo类的实例。

类的构造函数，不使用new是没法调用的，会报错。这是它跟普通构造函数的一个主要区别，后者不用new也可以执行。
```js
class Foo {  constructor() {    return Object.create(null);  } }
Foo() // TypeError: Class constructor Foo cannot be invoked without 'new'
```

### 静态方法

类相当于实例的原型，所有在类中定义的方法，都会被实例继承。如果在一个方法前，加上static关键字，就表示该方法不会被实例继承，而是直接 通过类来调用，这就称为“静态方法”。

```js
class Foo {  static classMethod() {    return 'hello';  } }
Foo.classMethod() // 'hello'
var foo = new Foo(); 
foo.classMethod() // TypeError: foo.classMethod is not a function

// 父类的静态方法，可以被子类继承。
class Bar extends Foo { }
Bar.classMethod(); // 'hello'

// 静态方法也是可以从super对象上调用的。
class Bar extends Foo {  
    static classMethod() {    
        return super.classMethod() + ', too';  
    } 
}
Bar.classMethod();

```


静态方法的实现其实跟下面类似
```js
class Foo {  
    static classMethod() {    
        return 'hello';  
    } 
}

// 等同于
function Foo(){}
Foo.classMethod = function(){
    return 'hello';
}
```

### 静态属性

静态属性指的是Class本身的属性，即Class.propname，而不是定义在实例对象（this）上的属性。
```js
class Foo { }
Foo.prop = 1; 
Foo.prop // 1

// 语法等同于
function Foo(){}
Foo.prop = 1
```

目前，只有这种写法可行，因为ES6明确规定，Class内部只有静态方法，没有静态属性。
```js
// 以下两种写法都无效 
class Foo {  
    // 写法一  
    prop: 2
    // 写法二  
    static prop: 2 
}
Foo.prop // undefined
```
### 继承

Class之间可以通过extends关键字实现继承，这比ES5的通过修改原型链实现继承，要清晰和方便很多。

子类必须在constructor方法中调用super方法，否则新建实例时会报错。这是因为子类没有自己的this对象，而是继承父类的this对象，然后对其进行加工。如果不调用super方法，子类就得不到this对象。
```js
class ColorPoint extends Point {  
    constructor(x, y, color) {    
        super(x, y); // 调用父类的constructor(x, y)
        this.color = color;  
    }

    toString() {    
        return this.color + ' ' + super.toString(); // 调用父类的toString()  
    }
}


class Point { /* ... */ }
class ColorPoint extends Point {  constructor() {  } }
let cp = new ColorPoint(); // ReferenceError
```

如果子类没有定义constructor方法，这个方法会被默认添加，代码如下。也就是说，不管有没有显式定义，任何一个子类都有constructor方法。
```js
constructor(...args) {  super(...args); }
```

另一个需要注意的地方是，在子类的构造函数中，只有调用super之后，才可以使用this关键字，否则会报错。这是因为子类实例的构建，是基于对父 类实例加工，只有super方法才能返回父类实例。
```js
class Point {  
    constructor(x, y) {    
        this.x = x;    
        this.y = y;  
    } 

}
class ColorPoint extends Point { 
    constructor(x, y, color) {
        this.color = color; // ReferenceError    
        super(x, y);    
        this.color = color; // 正确  
    } 
}
```

### Class 与 function 的区别

Class不存在变量提升（hoist），这一点与ES5完全不同。
```js
new Foo(); // ReferenceError 
class Foo {}
```

ES5的继承，实质是先创造子类的实例对象this，然后再将父类的方法添加到this上面（Parent.apply(this)）。ES6的继承机制完全不同，实质是 先创造父类的实例对象this（所以必须先调用super方法），然后再用子类的构造函数修改this。


### 常见疑问

私有方法是常见需求，但ES6不提供，只能通过变通方法模拟实现。

类和模块的内部，默认就是严格模式，所以不需要使用use strict指定运行模式。只要你的代码写在类或模块之中，就只有严格模式可用。
考虑到未来所有的代码，其实都是运行在模块之中，所以ES6实际上把整个语言升级到了严格模式。

Object.getPrototypeOf方法可以用来从子类上获取父类。因此，可以使用这个方法判断，一个类是否继承了另一个类。
```js
Object.getPrototypeOf(ColorPoint) === Point // true
```


new.target属性 

new是从构造函数生成实例的命令。ES6为new命令引入了一个new.target属性，（在构造函数中）返回new命令作用于的那个构造函数。如果构造函数 不是通过new命令调用的，new.target会返回undefined，因此这个属性可以用来确定构造函数是怎么调用的。

```js
function Person(name) {  
    if (new.target !== undefined) {    
        this.name = name;  
    } else {    
        throw new Error('必须使用new生成实例');  
    } 
}
// 另一种写法 
function Person(name) {  
    if (new.target === Person) {    
        this.name = name;  
    } else {    
        throw new Error('必须使用new生成实例');  
    } 
}
var person = new Person('张三'); // 正确 
var notAPerson = Person.call(person, '张三');  // 报错
```

需要注意的是，子类继承父类时，new.target会返回子类。
```js
class Rectangle {  
    constructor(length, width) {    
        console.log(new.target === Rectangle);
        // ...  
    }
}
class Square extends Rectangle {  constructor(length) {    super(length, length);  } }
var obj = new Square(3); // 输出 false
```

利用这个特点，可以写出不能独立使用、必须继承后才能使用的类。
```js
class Shape {  
    constructor() {    
        if (new.target === Shape) {      
            throw new Error('本类不能实例化');    
        }  
    } 
}
class Rectangle extends Shape {  
    constructor(length, width) {    
        super();    // ...  
    } 
}
var x = new Shape();  // 报错 var y = new Rectangle(3, 4);  // 正确
```


多继承的实现

```js
function mix(...mixins) {  
    class Mix {}
    for (let mixin of mixins) {    
        copyProperties(Mix, mixin);    
        copyProperties(Mix.prototype, mixin.prototype);  
    }
    return Mix; 
}
function copyProperties(target, source) {  
    for (let key of Reflect.ownKeys(source)) {    
        if ( key !== "constructor"      
        && key !== "prototype"      
        && key !== "name") {      
            let desc = Object.getOwnPropertyDescriptor(source, key);      
            Object.defineProperty(target, key, desc);    
        }  
    } 
}
```
