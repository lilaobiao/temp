<template>
    <p>
        我们都知道 v-models 用于双向数据绑定。一般用于与表单元素一起使用。有时我们会在自定义组件中使用它。<br>

        Vue 2 只允许在一个组件上使用一个 v-models。在 Vue 3 中，我们可以将任意数量的 v-model 绑定到我们的定制组件上:
    </p>
    <survey-form v-model:name="name" v-model:age="age"></survey-form>
    <p>
        name is {{name}}, and age is {{age}}
    </p>
    <p>
        {{message}}
    </p>
</template>
<script>
import { ref, computed } from 'vue'
import SurveyForm from './SurveyForm'
export default {
    components: {
        SurveyForm
    },
    setup(){
        const name = ref('init name');
        const age = ref(18);
        const message = computed(() => {
            return `this str is computed: name is ${name.value}, and age is ${age.value}`
        })
        return {
            name,
            age,
            message
        }
    }
}
</script>
