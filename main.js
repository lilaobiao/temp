import { createApp } from 'vue';
import App from './App.vue'
import router from './router'
import store from './store'
import { provideNational } from './utils/national'

const myApp = createApp(App);
provideNational(myApp, {
    locale: "en",
    messages: {
        en: {
            hello_world: "Hello world"
        },
        zh: {
            hello_world: "你好，世界"
        }
    }
})
myApp.use(router).use(store).mount('#app')
// createApp(App).use(router).use(store).mount('#app')



// before----------------------------------------------------------
// import Vue from 'vue'
// Vue.config.ignoredElements = [/^app-/]
// Vue.prototype.customProperty = () => {}
// const MyDirective = {
//     bind(el, binding, vnode, prevVnode) {},
//     inserted() {},
//     update() {},
//     componentUpdated() {},
//     unbind() {}
// }

// now------------------------------------------------------------
// import { createApp } from 'vue'
// import App from './App.vue'
// const app = createApp(App)
// app.config.isCustomElement = tag => tag.startsWith('app-')
// app.config.globalProperties.customProperty = () => {}
// const MyDirective = {
//     beforeMount(el, binding, vnode, prevVnode) {},
//     mounted() {},
//     beforeUpdate() {},
//     updated() {},
//     beforeUnmount() {}, // new
//     unmounted() {}
// }
