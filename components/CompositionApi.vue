<template>
  <div>
    <h2 ref="h2Ref">composition-api 知识点</h2>
    <div class="wrapper">
      <div>count: {{count}}</div>
      <button @click="add">+1</button>
    </div>
    <functional-comp name="函数式组件"></functional-comp>
    <async-watch-comp></async-watch-comp>
  </div>
</template>
<script>
// https://blog.csdn.net/weixin_44420276/article/details/101621169
import {
  ref, reactive, toRefs, isRef, computed, watch, 
  onBeforeMount, onMounted, h, defineAsyncComponent
} from 'vue'

// 函数式组件
const FunctionalComp = (props, { slots, attrs, emit }) => {
  return h('div', `Hello! 我是 ${props.name}，我的名字来自 props`)
}

// 异步组件
const AsyncWatchComp = defineAsyncComponent(() => import('./Watch.vue'))

export default {
    components: {
      FunctionalComp,
      AsyncWatchComp
    },
    setup(props, context) {
      console.log("setup");
      const h2Ref = ref(null)
      onBeforeMount(()=>{
        console.log("onBeforeMount-1")
      });
      onMounted(() =>{
        console.log('onMounted-1');
        h2Ref.value.style.color = "red"
      })

      // ref 覆盖
      const c1 = ref(2)
      const state = reactive({
          c1
      })
      const c2 = ref(9)
      state.c1 = c2
      state.c1++
      console.log('state.c1', state.c1)  // 10
      console.log('c2.value', c2.value)  // 10
      console.log('c1.value', c1.value)  // 2


      // toRefs函数能将reactive创建的响应式对象，转化成为普通的对象，只不过，这个对象上的每个节点，都是ref()类型的响应式数据
      const state2 = reactive({count:0,name:'yp'});
      // 定义+1方法
      const add =()=>{
        state2.count += 1;
      }


      // computed 可以设置get和set
      const refCount = ref(0);
      const computedCount = computed({
        get: () => refCount.value + 1,
        set: a => {
          refCount.value = a + 112;
        }
      });
      computedCount.value = 33;


      // watch，不指定监听数据源，只执行一次
      const count = ref(0)
      watch(()=>console.log('watch'))
      setTimeout(() => {
        count.value += 2
        console.log('count.value changed');
      }, 2000);
      // 监听指定数据源，只有数据源发生变化才会触发
      // watch(state2, (state2, oldValue)=>{
      //   console.log(state2, oldValue)
      // })

      const sayHello = () => {
        console.log('父组件调用的方法');
      }

      

      return {
        //...state,  // reactive 展开运算符后就不响应了
        ...toRefs(state2),
        h2Ref,
        sayHello,
        add
      }
    },
    
    beforeCreate() {
      // setup里的比这里先执行
      console.log("beforeCreate-2");
    },
    created() {
      console.log("created-2");
    },
    mounted() {
      console.log('mounted-2');
    }
}
/**
setup
beforeCreate
created


vue2生命周期 	  vue3生命周期
beforeCreate 	  setup
created 	      setup
beforeMount 	  onBeforeMount
mounted 	      onMounted
beforeUpdate 	  onBeforeUpdate
updated 	      onUpdated
beforeDestory 	onBeforeDestory
destroyed 	    onUnmounted
errorCaptured 	onErrorCaptured
 * 
 */
</script>
