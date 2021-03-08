new Vue(options)

this.init(options)
```js
Vue.prototype._init = function (options) {
    var vm = this;
    // a uid
    vm._uid = uid$2++;

    var startTag, endTag;
    /* istanbul ignore if */
    if ( config.performance && mark) {
        startTag = "vue-perf-start:" + (vm._uid);
        endTag = "vue-perf-end:" + (vm._uid);
        mark(startTag);
    }

    // a flag to avoid this being observed
    vm._isVue = true;
    // merge options
    if (options && options._isComponent) {
        // optimize internal component instantiation
        // since dynamic options merging is pretty slow, and none of the
        // internal component options needs special treatment.
        initInternalComponent(vm, options);
    } else {
        vm.$options = mergeOptions(
            resolveConstructorOptions(vm.constructor),
            options || {},
            vm
        );
    }
    /* istanbul ignore else */
    {
        initProxy(vm);
    }
    // expose real self
    console.log('_init');
    vm._self = vm;
    initLifecycle(vm);
    /*
    function initLifecycle (vm) {
        var options = vm.$options;
        // locate first non-abstract parent
        var parent = options.parent;
        if (parent && !options.abstract) {
            while (parent.$options.abstract && parent.$parent) {
                parent = parent.$parent;
            }
            parent.$children.push(vm);
        }
        vm.$parent = parent;
        // 确定根对象
        vm.$root = parent ? parent.$root : vm;
        // 初始各种变量
        vm.$children = [];
        vm.$refs = {};
        vm._watcher = null;
        vm._inactive = null;
        vm._directInactive = false;
        vm._isMounted = false;
        vm._isDestroyed = false;
        vm._isBeingDestroyed = false;
    }
    */
    initEvents(vm);
    /*
    function initEvents (vm) {
        vm._events = Object.create(null);
        vm._hasHookEvent = false;
        // init parent attached events
        var listeners = vm.$options._parentListeners;
        if (listeners) {
            updateComponentListeners(vm, listeners);
        }
    }
    */
    initRender(vm);
    callHook(vm, 'beforeCreate');
    /*
    function callHook (vm, hook) {
        // #7573 disable dep collection when invoking lifecycle hooks
        // 在执行生命周期钩子时，全局的Dep.target会设置为undefined
        pushTarget();
        var handlers = vm.$options[hook];
        var info = hook + " hook";
        // 循环执行一次生命周期函数
        if (handlers) {
            for (var i = 0, j = handlers.length; i < j; i++) {
                invokeWithErrorHandling(handlers[i], vm, null, vm, info);
            }
        }
        if (vm._hasHookEvent) {
            // 最后触发一下生命周期vm.$emit('hook:' + hook);
            vm.$emit('hook:' + hook);
        }
        // 最后重置Dep.target
        popTarget();
    }   
    */
    initInjections(vm); // resolve injections before data/props
    initState(vm);
    /*
    function initState (vm) {
        console.log('initState');
        vm._watchers = [];
        var opts = vm.$options;
        if (opts.props) { initProps(vm, opts.props); }
        if (opts.methods) { initMethods(vm, opts.methods); }
        if (opts.data) {
            initData(vm);
        } else {
            observe(vm._data = {}, true);
        }
        if (opts.computed) { initComputed(vm, opts.computed); }
        if (opts.watch && opts.watch !== nativeWatch) {
            initWatch(vm, opts.watch);
        }
    }
    */
    initProvide(vm); // resolve provide after data/props
    callHook(vm, 'created');

    /* istanbul ignore if */
    if ( config.performance && mark) {
        vm._name = formatComponentName(vm, false);
        mark(endTag);
            measure(("vue " + (vm._name) + " init"), startTag, endTag);
        }

        if (vm.$options.el) {
            vm.$mount(vm.$options.el);
        }
    };
}

// 初始化组件
function initInternalComponent (vm, options) {
    var opts = vm.$options = Object.create(vm.constructor.options);
    // doing this because it's faster than dynamic enumeration.
    var parentVnode = options._parentVnode;
    opts.parent = options.parent;
    opts._parentVnode = parentVnode;

    var vnodeComponentOptions = parentVnode.componentOptions;
    opts.propsData = vnodeComponentOptions.propsData;
    opts._parentListeners = vnodeComponentOptions.listeners;
    opts._renderChildren = vnodeComponentOptions.children;
    opts._componentTag = vnodeComponentOptions.tag;

    if (options.render) {
      opts.render = options.render;
      opts.staticRenderFns = options.staticRenderFns;
    }
}

// 继承属性
function resolveConstructorOptions (Ctor) {
    var options = Ctor.options;
    if (Ctor.super) {
        var superOptions = resolveConstructorOptions(Ctor.super);
        var cachedSuperOptions = Ctor.superOptions;
        if (superOptions !== cachedSuperOptions) {
            // super option changed,
            // need to resolve new options.
            Ctor.superOptions = superOptions;
            // check if there are any late-modified/attached options (#4976)
            var modifiedOptions = resolveModifiedOptions(Ctor);
            // update base extend options
            if (modifiedOptions) {
                extend(Ctor.extendOptions, modifiedOptions);
            }
            options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
            if (options.name) {
                options.components[options.name] = Ctor;
            }
        }
    }
    return options
}

function resolveModifiedOptions (Ctor) {
    var modified;
    var latest = Ctor.options;
    var sealed = Ctor.sealedOptions;
    for (var key in latest) {
        if (latest[key] !== sealed[key]) {
            if (!modified) { modified = {}; }
            modified[key] = latest[key];
        }
    }
    return modified
}
```


组件挂载与更新
```js
Vue.prototype.$mount = function (el,hydrating) {
    el = el && inBrowser ? query(el) : undefined;
    return mountComponent(this, el, hydrating)
};

function mountComponent (vm,el,hydrating) {
    vm.$el = el;
    if (!vm.$options.render) {
        vm.$options.render = createEmptyVNode;
    }
    // 执行钩子函数beforeMount
    callHook(vm, 'beforeMount');

    var updateComponent;
    updateComponent = function () {
        vm._update(vm._render(), hydrating);
    };

    new Watcher(vm, updateComponent, noop, {
        before: function before () {
            if (vm._isMounted && !vm._isDestroyed) {
            callHook(vm, 'beforeUpdate');
            }
        }
    }, true);
    hydrating = false;

    if (vm.$vnode == null) {
        vm._isMounted = true;
        callHook(vm, 'mounted');
    }
    return vm
}

// 在调用vm._update前，会先通过vm._render()函数生成vnode
vm._update(vm._render(), hydrating);


Vue.prototype._render = function () {
    var vm = this;
    var ref = vm.$options;
    var render = ref.render;
    var _parentVnode = ref._parentVnode;

    if (_parentVnode) {
        vm.$scopedSlots = normalizeScopedSlots(
            _parentVnode.data.scopedSlots,
            vm.$slots,
            vm.$scopedSlots
        );
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode;
    // render self
    var vnode;
    try {
        // There's no need to maintain a stack because all render fns are called
        // separately from one another. Nested component's render fns are called
        // when parent component is patched.
        currentRenderingInstance = vm;
        // 传入context 和 render函数
        vnode = render.call(vm._renderProxy, vm.$createElement);
    } catch (e) {
       // ...
    } finally {
        currentRenderingInstance = null;
    }
    // if the returned array contains only a single node, allow it
    if (Array.isArray(vnode) && vnode.length === 1) {
        vnode = vnode[0];
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
        if ( Array.isArray(vnode)) {
            warn(
            'Multiple root nodes returned from render function. Render function ' +
            'should return a single root node.',
            vm
            );
        }
        vnode = createEmptyVNode();
    }
    // set parent
    vnode.parent = _parentVnode;
    console.log('关键点：_render函数得到的vnode是', vnode);
    return vnode
}

// _update内部调用patch方法
Vue.prototype._update = function (vnode, hydrating) {
    var vm = this;
    var prevEl = vm.$el;
    var prevVnode = vm._vnode;
    var restoreActiveInstance = setActiveInstance(vm);
    vm._vnode = vnode;
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    console.log('关键点：组件挂载与更新', vnode, prevVnode);
    // 第一次挂载，没有老节点
    if (!prevVnode) {
        // initial render
        vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
    } else {
        // updates
        vm.$el = vm.__patch__(prevVnode, vnode);
    }
    // ...
}

// 新老节点比对时，有的就比较，没有的就新建

// 该方法相当于render函数里的H函数
// vnode = render.call(vm._renderProxy, vm.$createElement);
// vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };
function _createElement (
    context,
    tag,
    data,
    children,
    normalizationType
  ) {
    if (isDef(data) && isDef((data).__ob__)) {
       warn(
        "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
        'Always create fresh vnode data objects in each render!',
        context
      );
      return createEmptyVNode()
    }
    // object syntax in v-bind
    if (isDef(data) && isDef(data.is)) {
      tag = data.is;
    }
    if (!tag) {
      // in case of component :is set to falsy value
      return createEmptyVNode()
    }
    // warn against non-primitive key
    if (
      isDef(data) && isDef(data.key) && !isPrimitive(data.key)
    ) {
      {
        warn(
          'Avoid using non-primitive value as key, ' +
          'use string/number value instead.',
          context
        );
      }
    }
    // support single function children as default scoped slot
    if (Array.isArray(children) &&
      typeof children[0] === 'function'
    ) {
      data = data || {};
      data.scopedSlots = { default: children[0] };
      children.length = 0;
    }
    if (normalizationType === ALWAYS_NORMALIZE) {
      children = normalizeChildren(children);
    } else if (normalizationType === SIMPLE_NORMALIZE) {
      children = simpleNormalizeChildren(children);
    }
    var vnode, ns;
    if (typeof tag === 'string') {
      var Ctor;
      ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
      if (config.isReservedTag(tag)) {
        // platform built-in elements
        if ( isDef(data) && isDef(data.nativeOn)) {
          warn(
            ("The .native modifier for v-on is only valid on components but it was used on <" + tag + ">."),
            context
          );
        }
        vnode = new VNode(
          config.parsePlatformTagName(tag), data, children,
          undefined, undefined, context
        );
      } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
        // component
        vnode = createComponent(Ctor, data, context, children, tag);
      } else {
        // unknown or unlisted namespaced elements
        // check at runtime because it may get assigned a namespace when its
        // parent normalizes children
        vnode = new VNode(
          tag, data, children,
          undefined, undefined, context
        );
      }
    } else {
      // direct component options / constructor
      vnode = createComponent(tag, data, context, children);
    }
    if (Array.isArray(vnode)) {
      return vnode
    } else if (isDef(vnode)) {
      if (isDef(ns)) { applyNS(vnode, ns); }
      if (isDef(data)) { registerDeepBindings(data); }
      return vnode
    } else {
      return createEmptyVNode()
    }
  }
```


```js
Vue.prototype.$mount = function (el,hydrating) {
    el = el && inBrowser ? query(el) : undefined;
    return mountComponent(this, el, hydrating)
};

function mountComponent (vm,el,hydrating) {
    vm.$el = el;
    if (!vm.$options.render) {
        vm.$options.render = createEmptyVNode;
    }
    // 执行钩子函数beforeMount
    callHook(vm, 'beforeMount');

    var updateComponent;
    updateComponent = function () {
        vm._update(vm._render(), hydrating);
    };

    // we set this to vm._watcher inside the watcher's constructor
    // since the watcher's initial patch may call $forceUpdate (e.g. inside child
    // component's mounted hook), which relies on vm._watcher being already defined
    new Watcher(vm, updateComponent, noop, {
        before: function before () {
            if (vm._isMounted && !vm._isDestroyed) {
            callHook(vm, 'beforeUpdate');
            }
        }
    }, true);
    hydrating = false;

    // manually mounted instance, call mounted on self
    // mounted is called for render-created child components in its inserted hook
    if (vm.$vnode == null) {
        vm._isMounted = true;
        callHook(vm, 'mounted');
    }
    return vm
}

// 缓存方法
var mount = Vue.prototype.$mount;
Vue.prototype.$mount = function (el,hydrating) {
    el = el && query(el);
    var options = this.$options;
    // resolve template/el and convert to render function
    if (!options.render) {
        var template = options.template;
        if (template) {
            if (typeof template === 'string') {
                if (template.charAt(0) === '#') {
                    template = idToTemplate(template);
                }
            } else if (template.nodeType) {
                template = template.innerHTML;
            } else {
                {
                warn('invalid template option:' + template, this);
                }
                return this
            }
        } else if (el) {
            template = getOuterHTML(el);
        }
        if (template) {
            // 解析模板，得到render函数
            
            var ref = compileToFunctions(template, {
                outputSourceRange: "development" !== 'production',
                shouldDecodeNewlines: shouldDecodeNewlines,
                shouldDecodeNewlinesForHref: shouldDecodeNewlinesForHref,
                delimiters: options.delimiters,
                comments: options.comments
            }, this);
            // 关键知识点：compileToFunctions内部有一个res对象，会存储已经解析过的模板对象
            // res 的key就是整个template字符串，值就是返回的ref

            // compileToFunctions内部会调用var compiled = compile(template, options);
            // 其作用是解析模板，拿到ast和render函数字符串，compiled 格式大概如下
            // {ast: {...}，errors: []，render: "with(this){return _c(...)}", staticRenderFns: []，tips: []}
            // 然后是
            // res.render = createFunction(compiled.render, fnGenErrors); // return new Function(code)
            // res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
            //     return createFunction(code, fnGenErrors)
            // });
            // return (cache[key] = res)


            // compire内部又是调用的baseCompile方法

            // ref = {   
            //     render:function(){}
            //     staticRenderFns: []
            // }
            var render = ref.render;
            var staticRenderFns = ref.staticRenderFns;
            options.render = render;
            options.staticRenderFns = staticRenderFns;
        }
    }
    return mount.call(this, el, hydrating)
};


function baseCompile (template, options) {
    // 先得到AST语法树
    var ast = parse(template.trim(), options);
    // parse内部调用parseHTML
    if (options.optimize !== false) {
        // 对语法树进行优化
        optimize(ast, options);
    }
    // 生成render函数字符串
    var code = generate(ast, options);
    return {
        ast: ast,
        render: code.render,
        staticRenderFns: code.staticRenderFns
    }
}



function generate (
    ast,
    options
    ) {
    var state = new CodegenState(options);
    var code = ast ? genElement(ast, state) : '_c("div")';
    return {
        render: ("with(this){return " + code + "}"),
        staticRenderFns: state.staticRenderFns
    }
}

function genElement (el, state) {
    if (el.parent) {
        el.pre = el.pre || el.parent.pre;
    }

    if (el.staticRoot && !el.staticProcessed) {
        return genStatic(el, state)
    } else if (el.once && !el.onceProcessed) {
        return genOnce(el, state)
    } else if (el.for && !el.forProcessed) {
        return genFor(el, state)
    } else if (el.if && !el.ifProcessed) {
        return genIf(el, state)
    } else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
        return genChildren(el, state) || 'void 0'
    } else if (el.tag === 'slot') {
        return genSlot(el, state)
    } else {
        // component or element
        var code;
        if (el.component) {
            code = genComponent(el.component, el, state);
        } else {
            var data;
            if (!el.plain || (el.pre && state.maybeComponent(el))) {
                data = genData$2(el, state);
            }

            var children = el.inlineTemplate ? null : genChildren(el, state, true);
            code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
        }
        // module transforms
        for (var i = 0; i < state.transforms.length; i++) {
            code = state.transforms[i](el, code);
        }
        return code
    }
}
```

```js
/*
html代码片段如下
<div id="app">
    <div>
        <h1>{{msg}}</h1>
        <p>count1 is {{count1}}</p>
        <p>count2 is {{count2}}</p>
        <p>count + count2  is {{computedCount}}</p>
        <p>computed countOne + countTwo is {{computedCount2}}</p>
        <p>methods countOne + countTwo is {{getComputedCount2()}}</p>

        <p>
            <button @click="add1">count1++</button>
            <button @click="add2">count1++, count2--</button>
            <button @click="add3">countOne++, countTwo--</button>
        </p>
        <p>
            computedValue is {{computedValue}}
            <button @click="changeValue">更新Value</button>
            <button @click="getComputedValue">打印computedValue</button>
            <button @click="update">强制刷新</button>
        </p>
        <!-- <test-component msg="测试模板组件"></test-component> -->
    </div>
</div>
*/ 
with(this){
    return _c('div',
        {attrs:{"id":"app"}},
        [   
            _c('div',[
                _c('h1',[_v(_s(msg))]),
                _v(" "),
                _c('p',[_v("count1 is "+_s(count1))]),
                _v(" "),
                _c('p',[_v("count2 is "+_s(count2))]),
                _v(" "),
                _c('p',[_v("count + count2  is "+_s(computedCount))]),
                _v(" "),
                _c('p',[_v("computed countOne + countTwo is "+_s(computedCount2))]),
                _v(" "),
                _c('p',[_v("methods countOne + countTwo is "+_s(getComputedCount2()))]),
                _v(" "),
                _c('p',[
                    _c('button',{on:{"click":add1}},[_v("count1++")]),
                    _v(" "),
                    _c('button',{on:{"click":add2}},[_v("count1++, count2--")]),
                    _v(" "),
                    _c('button',{on:{"click":add3}},[_v("countOne++, countTwo--")])
                ]),
                _v(" "),
                _c('p',[
                    _v("\n                computedValue is "+_s(computedValue)+"\n                "),
                    _c('button',{on:{"click":changeValue}},[_v("更新Value")]),
                    _v(" "),
                    _c('button',{on:{"click":getComputedValue}},[_v("打印computedValue")]),
                    _v(" "),
                    _c('button',{on:{"click":update}},[_v("强制刷新")])
                ])
            ])
        ]
    )
}
```




完整代码
```js
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <style>
      .d-upload{
        background-color: #fff;
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        width: 360px;
        height: 180px;
        text-align: center;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }
      .d-upload:hover{
        border: 1px dashed #6af;
      }
    </style>
  </head>
  <body>
    <div id="app">
        <div>
            <h1>{{msg}}</h1>
            <p>count1 is {{count1}}</p>
            <p>count2 is {{count2}}</p>
            <p>count + count2  is {{computedCount}}</p>
            <p>computed countOne + countTwo is {{computedCount2}}</p>
            <p>methods countOne + countTwo is {{getComputedCount2()}}</p>

            <p>
                <button @click="add1">count1++</button>
                <button @click="add2">count1++, count2--</button>
                <button @click="add3">countOne++, countTwo--</button>
            </p>
            <p>
                computedValue is {{computedValue}}
                <button @click="changeValue">更新Value</button>
                <button @click="getComputedValue">打印computedValue</button>
                <button @click="update">强制刷新</button>
            </p>
            <!-- <test-component msg="测试模板组件"></test-component> -->
        </div>
    </div>
  </body>
  <script src="./vue.js"></script>
  <script type="text/x-template" id="testTemplate">
    <div>
        <h1>{{msg}}</h1>
        <ul>
            <li v-for="item in items" :key="item.id">
                {{item.name}}
                <button @click="handlerClick(item)">{{item.name}}</button>
            </li>
        </ul>
    </div>
  </script>
  <script>
    // const testComponent = Vue.component('testComponent', {
    //     name: 'testComponent',
    //     template: '#testTemplate',// document.getElementById('testTemplate').innerHTML,
    //     props: {
    //         msg: {
    //             type: String,
    //             default: ''
    //         }
    //     },
    //     data(){
    //         return {
    //             items: [{
    //                 id: 1,
    //                 name: 'items1'
    //             },{
    //                 id: 2,
    //                 name: 'items2'
    //             }]
    //         }
    //     },
    //     methods: {
    //         handlerClick(item){
    //             console.log(item.name)
    //         }
    //     },
    //     /*生命周期的钩子，不仅可以是一个函数，还可以是由函数组成的数组*/
    //     created: [
    //         function(){
    //             console.log(this);
    //         },
    //         function(){
    //             console.log(this.items);
    //         }
    //     ]
    // });
    var vm = new Vue({
        el: '#app',
        data: {
            msg: '我是一只小小鸟',
            count1: 1,
            count2: 100,
            countOne: 1,
            countTwo: 100,
            value: 1
        },
        computed: {
            // this.getter.call(vm, vm)
            computedValue(){
                return this.value + '--' + Math.random()
            },
            computedCount(){
                return this.count1 + this.count2
            },
            computedCount2(){
                return this.countOne + this.countTwo + Math.random();
            }
        },
        watch: {
            computedCount2(newValue,oldValue){
                console.log('computedCount2 change', newValue, oldValue);
            }
        },
        updated() {
            console.log('updated');
        },
        methods: {
            add1(){
                this.count1 ++
            },
            add2(){
                this.count1 ++
                this.count2 --
            },
            add3(){
                this.countOne ++
                this.countTwo --
            },
            getComputedCount2(){
                return this.countOne + this.countTwo + Math.random();
            },
            update(){
                this.$forceUpdate();
            },
            changeValue(){
                this.value++;
            },
            getComputedValue(){
                console.log(this.computedValue);
            }
        }
    })
  </script>
</html>
```
