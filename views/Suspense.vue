<template>
  <Suspense>
    <template #default>
      <div v-for="item in articleList" :key="item.id">
        <article>
          <h2>{{ item.title }}</h2>
          <p>{{ item.body }}</p>
        </article>
      </div>
    </template>
    <template #fallback>
      Articles loading...
      <div>
            Suspense 是一个 Vue 3 新特性。

            通常前后端交互是一个异步的过程： 默认我们提供一个加载中的动画，当数据返回时配合使用 v-if 来控制数据显示。

            Suspense 的出现大大简化了这个过程：它提供了 default 和 fallback 两种状态：
      </div>    
    </template>
  </Suspense>
</template>
<script>
import axios from 'axios'
export default {
  async setup() {
    let articleList = await axios
      .get('https://jsonplaceholder.typicode.com/posts')
      .then(response => {
        console.log(response)
        return response.data
      })
    return {
      articleList
    }
  }
}
</script>
