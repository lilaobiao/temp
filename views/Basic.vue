<template>
    <div>
        <h2>最基本的例子</h2>
        <p>
            <span>count is {{ count }}</span>
            <span>countDouble is {{ countDouble }}</span>
            <span>plusOne is {{ plusOne }}</span>
            <button @click="increment">count++</button>
        </p>
        <p>
            <span>state.count is {{ state.count }}, state.countDouble is {{ state.countDouble }}</span>
            <button @click="incrementObj">state.count++</button>
        </p>
        <p>pageX is {{x}}, pageY is {{y}}, 路由离开，监听事件将消失，可打开控制台查看</p>
    </div>
    <hr/>
    <p>
        <button @click="getList">getList</button>
        <button @click="sayHello">调用子组件方法</button>
    </p>
    <div>
        这里有个纯数组的循环
        <h3 v-for="item in articleList" :key="item.id">
            {{ item.title }} ------- {{ item.body }}
        </h3>
    </div>
    <div>
        这里有个list循环，会有结果
        <h3 v-for="item in articleObj.articleList" :key="item.id">
            {{ item.title }} ------- {{ item.body }}
        </h3>
    </div>
    <composition-api ref="childref"></composition-api>
</template>

<script>
import { ref, reactive, computed, watch, onMounted} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CompositionApi from '../components/CompositionApi'
import useMouse from '../components/useMouse'

export default {
    components: {
        CompositionApi
    },
    setup() {
        const route = useRoute()
        const router = useRouter()
        console.log(route)
        console.log('fullPath',route.fullPath)
        console.log('hash',route.hash)
        console.log('matched',route.matched)
        console.log('meta',route.meta)
        console.log('name',route.name)
        console.log('params',route.params)
        console.log('query',route.query)
        console.log(router)
        console.log(router.currentRoute.value) // 相当于route


        const childref = ref(null)
        const sayHello = () => {
            console.log(childref)
            childref.value.sayHello()
        }


        // reactive state
        const count = ref(0)
        // computed state
        const plusOne = computed(() => count.value + 1)
        // method
        const increment = () => { count.value++ }
        // watch
        watch(() => count.value * 2, val => {
            console.log(`count * 2 is ${val}`)
        })
        // 和上面对比
        const countDouble = computed(() => count.value * 2)
        watch(countDouble, val => {
            // 这里的打印先于上面执行
            console.log(`computed count * 2 is ${val}`)
        })


        // watching a getter
        const state = reactive({ 
            count: 0,
            // computed 用于内部
            countDouble: computed(() => state.count * 2)
        })
        const incrementObj = () => { state.count++ }
        watch(
            () => state.count,
            (count, prevCount) => {
                console.log(count, prevCount)
            }
        )

        // A watcher can also watch multiple sources at the same time using an array:
        // watch([fooRef, barRef], ([foo, bar], [prevFoo, prevBar]) => {
        /* ... */
        // })



        // lifecycle
        onMounted(() => {
            childref.value.sayHello() // 注意 .value  函数调用 
            // childref.value.sayHello is not a function
            console.log(`mounted`)
        })

        


        let articleList = reactive([]);
        let articleObj = reactive({
            articleList: []
        });
        const getList = async function(){
            console.log(0);
            console.time('count');
            let list = await new Promise((resolve) => {
                setTimeout(() => {
                    resolve([
                        {
                            id: new Date().getTime(),
                            title: 'title',
                            body: 'body'
                        }
                    ])
                }, 1000);
            }).then(res => {
                return res;
            });
            console.timeEnd('count');
            console.log(list);
            // articleList = list; // 如果这样使用，没有效果，因为重新指向了新的变量地址
            // 在Vue2中，只能通过$set来改变数组下标，但是V3不需要，直接通过index就行
            list.map((item, index) => articleList[index] = list[index]);

            articleObj.articleList = list;
        }

        // 思考：这里被解构了还具有响应式
        const { x, y } = useMouse();

        // expose bindings on render context
        return {
            childref,
            sayHello,
            count,
            countDouble,
            plusOne,
            state,
            increment,
            incrementObj,
            articleList,
            articleObj,
            getList,
            x,
            y,
        }
    }
}
</script>

<style lang="scss">
    span{
        display: inline-block;
        margin: 10px;
    }
</style>
