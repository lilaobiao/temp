template

```html
<template>
  <div class="app-container">
    <aside>
      The guide page is useful for some people who entered the project for the first time. You can briefly introduce the
      features of the project. Demo is based on
      <a href="https://github.com/kamranahmedse/driver.js" target="_blank">driver.js.</a>
    </aside>
    <el-button icon="el-icon-question" type="primary" @click.prevent.stop="guide">
      Show Guide
    </el-button>
    <el-select v-model="value1" multiple placeholder="请选择" @change="change">
      <el-option v-for="item in options" :key="item.value" :collapse-tags="true" :label="item.label" :value="item.value" />
    </el-select>
  </div>
</template>
```

js
```js
import Driver from 'driver.js' // import driver.js
import 'driver.js/dist/driver.min.css' // import driver.js css
import steps from './steps'
let oldOptions = []
const allOptions = ['id1','id2','id3','id4','id5']
export default {
  name: 'Guide',
  data() {
    return {
      driver: null,
      options: [{
        value: 'all',
        label: '全部'
      }, {
        value: 'id1',
        label: '黄金糕'
      }, {
        value: 'id2',
        label: '双皮奶'
      }, {
        value: 'id3',
        label: '蚵仔煎'
      }, {
        value: 'id4',
        label: '龙须面'
      }, {
        value: 'id5',
        label: '北京烤鸭'
      }, {
        value: 'exec',
        label: '包含特列'
      }, {
        value: 'include',
        label: '不包含特列'
      }],
      value1: [],
      value2: []
    }
  },
  mounted() {
    this.driver = new Driver()
  },
  methods: {
    guide() {
      this.driver.defineSteps(steps)
      this.driver.start()
    },
    change(value) {
      // debugger
      const lastValue = value[value.length - 1]
      let newValue;
      if (lastValue === 'exec' || lastValue === 'include') {
        newValue = [lastValue]
      } else {
        if (lastValue === 'all') {
          // 选择了 all 选项
          if (value.length > oldOptions.length) {
            newValue = [...allOptions]
            newValue.push('all')
          } else { // 取消了某个选项
            newValue = [...value]
            newValue.pop()
          }
        } else {
          // 如果是新增加了一个选项
          if( value.length > oldOptions.length) {
            newValue = [...value].filter( item => {
              return item != 'exec' && item != 'include'
            })
            if (newValue.length === allOptions.length) {
              newValue.push('all')
            }
          } else {
            newValue = [...value]
          }
        }
      }
      
      // console.log(newValue)
      oldOptions = newValue
      this.setOptions(oldOptions)
    },
    setOptions(options){
      this.value1 = options
    }
  }
}
```
