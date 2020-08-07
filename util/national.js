import {ref, inject } from "vue";
const createNational = config => ({
  locale: ref(config.locale), // ref创建一个响应式对象
  messages: config.messages,
  $t(key) {
    return this.messages[this.locale.value][key];
  }
});

const nationalSymbol = Symbol();

export function provideNational(app, i18nConfig) {
  const i18n = createNational(i18nConfig);
  // 向下层组件提供 i18n 对象
  app.provide(nationalSymbol, i18n);
}

export function useNational() {
  const i18n = inject(nationalSymbol);
  if (!i18n) throw new Error("No i18n provided!!!");

  return i18n;
}
