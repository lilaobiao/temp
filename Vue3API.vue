<template>
  <div>
    detail <span>{{$route.params.id}}</span>
    <div ref="testel">
      <button @click="valueplus">
        testValue++
      </button>
      <span>{{testValue}} __ {{plusOne}}</span>
    </div>
    <div>
      <button @click="objValueplus">
        valueObj.age++
      </button>
      <span>{{valueObj.age}}</span>
    </div>
    <div>
      <button @click="changeRefObj">
        changeRefObj
      </button>
      <span>因为没有通过reactive包装newObj，所以ui界面上并不能获取到相关的值，改变也不会触发视图更新{{newObj.name}} </span>
      <span>toRef时，newObj.name 为undefined</span>
      <span>toRefs时，newObj.name 为一个对象，可以访问newObj.name.value，但是不具备响应式</span>
    </div>
    <div>
      <button @click="createErr">
        报个错试试
      </button>
    </div>
  </div>
</template>

<script>
  import {
    ref,
    toRef,
    toRefs,
    reactive,
    watch,
    watchEffect,
    computed,
    onBeforeMount,
    onMounted,
    onBeforeUpdate,
    onUpdated,
    onBeforeUnmount,
    onUnmounted,
    onErrorCaptured,
    // 调试用的钩子函数
    onRenderTracked,
    onRenderTriggered,
    // 定义组件
    defineComponent,
    // 获取实例
    getCurrentInstance
  
  } from 'vue';
  // import { useStore } from "vuex";

  export default {
    // setup 这个函数是在beforeCreate和created之前运行的,所以你可以用它来代替这两个钩子函数。
    setup(props, ctx){
      // const store = useStore();
      // const num = computed(() => store.state.num);

      // 元素
      const testel = ref(null);
      // ref的原理，实际上是创建了一个对象，内部有value属性，指向真实的值，所以在进行js操作时，必须操作value
      const testValue = ref(0);// reactive({value: 0});
      // 
      const valueObj = reactive({
        name: 'lgx',
        age: 0
      });

      function valueplus(){
        testValue.value++;
      }

      function objValueplus(){
        valueObj.age++;
      }

      // 创建一个 computed 计算属性
      const plusOne = computed({
        // 取值函数
        get: () => testValue.value + 1,
        // 赋值函数
        set: val => {
          testValue.value = val - 1
        }
      });


      let obj = {name : 'alice', age : 12};
      // 用toref把对象的某个值变成响应式
      // let newObj = toRef(obj, 'name');
      // function changeRefObj(){
      //    newObj.value = 'Tom';
      //    console.log(obj,newObj);
      // }

      let newObj = toRefs(obj);
      function changeRefObj(){
        newObj.name.value = 'Tom';
        newObj.age.value = 18;
        console.log(obj,newObj)
      }

      // vue3.0 中使用 getCurrentInstance 方法获取当前组件实例; 你可以console它。
      const vm = getCurrentInstance();
      const el = vm.ctx.$el;

      function createErr(){
        throw new Error();
        // 不会触发onErrorCaptured
        console.log(a.b);
      }

  
      // 在setup函数中没有这两个钩子
      // onBeforeCreate(() => {
      //   console.log('onBeforeCreate',testel);
      // });
      // onCreated(() => {
      //   console.log('onCreated',testel);
      // });
      onBeforeMount(() => {
        console.log('onBeforeMount',testel);
      });
      onMounted(() => {
        console.log('onMounted',testel);
        console.log(vm, props, ctx);
        // ctx中有attrs,slots
      });
      onBeforeUpdate(() => {
        console.log('onBeforeUpdate');
      });
      onUpdated(() => {
        console.log('onUpdated');
      });
      // activated     -> onActivated
      // deactivated   -> onDeactivated
      onBeforeUnmount(() => {
        console.log('onBeforeUnmount');
      });
      onUnmounted(() => {
        console.log('onUnmounted');
      });
      onErrorCaptured(() => {
        console.log('onErrorCaptured');
      });
      // 调试用的钩子函数
      onRenderTracked(() => {
        // 会在onBeforeMount和onMounted之间，onBeforeUpdate和onUpdated之间打印多次
        console.log('onRenderTracked');
      });
      onRenderTriggered(() => {
        console.log('onRenderTriggered');
      });

      // watch监听ref和reactive的区别
      watch(testValue, (newValue, oldValue) => {
        console.log(`testValue原值为${oldValue}`)
        console.log(`testValue新值为${newValue}`)
      });

      watch(() => valueObj.age, (newValue, oldValue) => {
        console.log(`valueObj.age原值为${oldValue}`)
        console.log(`valueObj.age新值为${newValue}`)
      }, {
        immediate: true,
        // deep: true
      });

      // watch([() => count.value, () => name.value],
      //     //接收两个参数，第一个是新值在数组中，第二个是旧值也是在数组中
      //     ([count, name], [oldCount, oldName]) => {
      //         console.log(count, name);
      //         console.log(oldCount, oldName);
      //         if (count != oldCount) {
      //             console.log("count发声变化");
      //         }
      //         if (name != oldName) {
      //             console.log("name发声变化");
      //         }
      //     }
      // );

      // watch如果设置了immediate: true，它和watchEffect都在onBeforeMount之前执行
      // watch 和 watchEffect 的执行顺序跟在setup函数中定义的顺序一致


      // watchEffect 它与 watch 的区别主要有以下几点：
      // 不需要手动传入依赖
      // 每次初始化时会执行一次回调函数来自动获取依赖
      // 无法获取到原值，只能得到变化后的值

      // watchEffect(() => { // 只在一开始触发一次，因为没有任何依赖
      //   console.log('watchEffect');
      // });
      watchEffect(() => {// 初始化时自动收集依赖，任何依赖的值有更新就会执行回调函数
        console.log(testValue.value);
        console.log(valueObj.age);
      });

      

      // onMounted(() => {
      //   window.addEventListener("hashchange", onHashChange);
      //   onHashChange();
      // });

      // onUnmounted(() => {
      //   window.removeEventListener("hashchange", onHashChange);
      // });

      return {
        testel, testValue, valueObj, valueplus, objValueplus, plusOne,
        // 測試toRefs,toRefs只是toRef的复数形式，用于批量操作
        newObj, changeRefObj,
        createErr,
      }
    }
  }
</script>

<style scoped>

</style>
