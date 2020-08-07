<template>
  <div>
    <h2>后面的文字来自国际化：{{ i18n.$t('hello_world') }}</h2>
    <button @click="switchLanguage">点击修改国际化</button>
  </div>
</template>

<script>
    import { useI18n } from "../utils/vue3i18nPlugin";

    export default {
        setup() {
            const i18n = useI18n();

            // const defaultLanguage = ref('en');
            // const plusOne = computed(() => count.value + 1)

            const switchLanguage = () => {
                const locale = i18n.locale.value === "en" ? "zh" : "en";
                i18n.locale.value = locale;
            };

            return { 
                i18n,
                switchLanguage
            };
        }
    };
</script>
