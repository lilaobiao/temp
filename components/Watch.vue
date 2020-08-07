```html

<template>
  <h1>watch api</h1>
  <div class="wrapper">
    <p>refCount:{{refCount}}<button @click="refCount += 1">refCount +1</button></p>
    <p>count:{{count}}<button @click="count += 1">count +1</button></p>
    <p>name:{{name}}<button @click="name += 1">name +1</button></p>
    <p>
        stopCount:{{stopCount}}
        <button @click="stopCount += 1">stopCount +1</button>
        <button @click="stopwatch">stopwatch</button>
    </p>
    <p>
        watch 清除无效的异步
        <input type="text" v-model="kw">
    </p>
    
  </div>
</template>
<script>
import { watch, ref } from "vue";
export default {
    setup() {
        const refCount = ref(0)
        setTimeout(()=>{
            refCount.value += 2;
        },1000)

        // 问题-----------------------------------------------------------------------
        // 监听任意数据源，这样可以触发
        watch(()=>console.log('refCount changed', refCount.value))
        // 这样不行
        watch(()=>console.log('refCount2 changed'))
        // 问题结束-----------------------------------------------------------------------
        


        const count = ref(2)
        watch(count,(count,oldCount)=>{
            console.log('count changed', count)
        })
        setTimeout(() => {
            count.value += 2;
        }, 1000);


        const name = ref('yp1')
        // 监听多数据源，当count改变时，两个watch都会触发
        watch(
            [count,name],
            ([count,name],[oldCount,oldName])=>{
                console.log(count, '------------',  name)
            },
            {
                lazy:true
            }
        )

        // 停止watch
        const stopCount = ref(0)
        const stop = watch(stopCount, ()=>{
            console.log("监听到stopCount的变化", stopCount.value)
        })
        const stopwatch = ()=>{
            stop()
        }

        // 清除无效的异步
        const kw = ref("");
        const asyncprint = val => {
            return setTimeout(() => {
                console.log(val);
            }, 1000);
        };

        watch(
            kw,
            (kw, oldkw, callback) => {
                const timeId = asyncprint(kw);
                // 如果我们没有下面的操作，连续输入一串字符，结果是这样的
                // Watch.vue?841e:71 1
                // Watch.vue?841e:71 12
                // Watch.vue?841e:71 123
                // Watch.vue?841e:71 1232
                // Watch.vue?841e:71 12324
                // Watch.vue?841e:71 123243
                // Watch.vue?841e:71 1232434
                // Watch.vue?841e:71 12324345
                // Watch.vue?841e:71 123243453
                // Watch.vue?841e:71 1232434532
                callback(()=>clearTimeout(timeId));
                // 有了上面这一行，基本只会到最后打印一次1232434532，跟lazy无关
            }
        );

        return {
            refCount,
            count,
            name,
            stopCount,
            stopwatch,
            kw
        }
    }
}
</script>
```
