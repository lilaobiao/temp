<template>
    <Teleport to="#modal-layer">
        <div class="modal">hello</div>
        <p>
            Teleport 是 vue3 中提供特定的标签用于创建一个 Portals。

            Teleport 中间出现的内容会出现在 to 指定的节点中：
        </p>
    </Teleport>
    <p>
        <button @click="getList">getList</button>
    </p>
    <div>
        <div v-for="item in articleList" :key="item.id">
            <article>
                <h2>{{ item.title }} ------- {{ item.body }}</h2>
            </article>
        </div>
    </div>
    <div>
        <div v-for="item in articleObj.articleList" :key="item.id">
            <article>
                <h2>{{ item.title }} ------- {{ item.body }}</h2>
            </article>
        </div>
    </div>
</template>

<script>
import { reactive } from 'vue'
// import axios from 'axios'
export default {
    setup() {
        // let articleList = await 
        // axios.get('https://jsonplaceholder.typicode.com/posts')
        // .then(response => {
        //     console.log(response)
        //     return response.data
        // })
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
                            id: 1,
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
            articleList = list;
            articleObj.articleList = list;
        }
        
        return {
            articleObj,
            articleList,
            getList
        }
    }
}
</script>
