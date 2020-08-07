<template>
  <div class="home">
    <div>
        <h2>测试路由功能</h2>
        <button @click="toViewFoo">跳转foo</button>
        <button @click="toViewBar">跳转bar</button>
        <button @click="toViewOther">跳转other</button>
        <button @click="toViewOther2">跳转other2</button>
        <button @click="toViewOther3">跳转到正则匹配路由的页面</button>
        <button @click="toViewOther4">跳转到正则匹配路由的页面</button>
        <p>从 "/route/other/prea?param=0" 跳转到 "/route/other/a123?param=0" 时，不会刷新</p>
        <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { useRoute, useRouter } from 'vue-router'
export default {
    setup(){
        const route = useRoute()
        const router = useRouter()

        const toViewFoo = () => {
            // /route/for?param=0
            router.push({
                name: 'RouteFoo',
                query: {
                    param: 0
                }
            })
        }

        const toViewBar = () => {
            // /route/bar/1?param=0
            router.push({
                path: '/route/bar/1',
                // name: 'RouteBar',
                // params: {
                //     id: 1
                // },
                query: {
                    param: 0
                }
            })
        }

        const toViewOther = () => {
            // /route/other/prea?param=0
            // 跳转到页面时获取到的参数：params: {pre: "p", catchAll: "rea"} fullPath: "/route/other/prea?param=0"
            router.push({
                path: '/route/other/prea',
                query: {
                    param: 0
                }
            })
        }

        const toViewOther2 = () => {
            // /route/other/a123?param=0
            // 跳转到页面时获取到的参数：params: {pre: "a", catchAll: "123"} fullPath: "/route/other/a123?param=0"
            router.push({
                name: 'RouteOther',
                params: {
                    pre: 'a',
                    catchAll: '123'
                },
                query: {
                    param: 0
                }
            })
        }

        const toViewOther3 = () => {
            // /route/other2/PRE123?param=0
            // 跳转到页面时获取到的参数：params: {pre: "PRE", catchAll: "123"} fullPath: "/route/other2/PRE123?param=0"
            router.push({
                name: 'RouteOther2',
                params: {
                    pre: 'PRE',
                    catchAll: '123'
                },
                query: {
                    param: 0
                }
            })
        }

        const toViewOther4 = () => {
            // /route/other2/a123?param=0
            // 跳转到页面时获取到的参数：params: {pre: "a12", catchAll: "3"} fullPath: "/route/other2/a123?param=0"
            router.push({
                path: '/route/other2/a123',
                query: {
                    param: 0
                }
            })
        }

        return {
            toViewFoo,
            toViewBar,
            toViewOther,
            toViewOther2,
            toViewOther3,
            toViewOther4
        }
    }
}
/*
### Bar,Foo,Other,Other,Other2

<template>
  <div class="home">
    <div>
        <h2>我是bar页面</h2>
    </div>
  </div>
</template>

<script>
import { useRoute, useRouter } from 'vue-router'
export default {
    setup(){
        const route = useRoute()
        const router = useRouter()
        console.log(router.currentRoute.value);
        return {}
    }
}
</script>
*/
</script>






