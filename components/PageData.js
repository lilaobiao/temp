import { onMounted, computed, watch, ref } from 'vue';
import { useStore } from 'vuex';

export const usePageData = (fetchApi, form) => {
  const initForm = Object.assign({}, form);
  const store = useStore();
  // computed 返回响应式数据
  const pageData = computed(() => store.state.pageData);
  const activeIndex = computed(() => store.state.activeIndex);
  const activeItem = computed(() => store.getters.activeItem);

  watch(activeItem, () => {
    if (!activeItem.value) return;
    for (let key in form) {
      form[key] = activeItem.value[key];
    }
  });

  // ref返回简单数据的响应式
  let isShowDetail = ref(false);
  const editItem = index => {
    isShowDetail.value = true;
    store.dispatch('SET_ACTIVE_ITEM', index);
  };
  const addItem = () => {
    isShowDetail.value = true;
    store.dispatch('SET_ACTIVE_ITEM', null);
  };
  const deleteItem = index => {
    store.dispatch('DELETE_ITEM', index);
  };
  const confirmItem = item => {
    isShowDetail.value = false;
    store.dispatch('CONFIRM_EDIT_ITEM', item);
    Object.assign(form, initForm);
  };
  const cancelEdit = () => {
    isShowDetail.value = false;
    store.dispatch('CLEAR_ACTIVE_ITEM');
    Object.assign(form, initForm);
  };


  onMounted(async () => {
    let resList = await fetchApi();
    // 传入store的list并不是响应式的，到了store里面就变成响应式了
    store.dispatch('GET_PAGE_DATA', resList);
  });

  return {
    isShowDetail,
    pageData,
    activeIndex,
    editItem,
    addItem,
    confirmItem,
    cancelEdit,
    deleteItem
  }
}

// usemouse.js
import { ref, onMounted, onUnmounted } from 'vue'
// 独立的功能
export default function useMouse() {
    const x = ref(0)
    const y = ref(0)
    const update = e => {
        x.value = e.pageX
        y.value = e.pageY
        console.log('mousemove');
    }
    onMounted(() => {
        window.addEventListener('mousemove', update)
    })
    onUnmounted(() => {
        window.removeEventListener('mousemove', update)
    })
    return { x, y }
}

