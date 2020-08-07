<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" role="img" focusable="false" viewBox="0 -442 1363 636" aria-hidden="true" style="vertical-align: -0.439ex;width: 3.084ex;height: 1.439ex;"><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><g data-mml-node="math"><g data-mml-node="mi"><path data-c="6F" d="M201 -11Q126 -11 80 38T34 156Q34 221 64 279T146 380Q222 441 301 441Q333 441 341 440Q354 437 367 433T402 417T438 387T464 338T476 268Q476 161 390 75T201 -11ZM121 120Q121 70 147 48T206 26Q250 26 289 58T351 142Q360 163 374 216T388 308Q388 352 370 375Q346 405 306 405Q243 405 195 347Q158 303 140 230T121 120Z"></path></g><g data-mml-node="mi" transform="translate(485, 0)"><path data-c="6E" d="M21 287Q22 293 24 303T36 341T56 388T89 425T135 442Q171 442 195 424T225 390T231 369Q231 367 232 367L243 378Q304 442 382 442Q436 442 469 415T503 336T465 179T427 52Q427 26 444 26Q450 26 453 27Q482 32 505 65T540 145Q542 153 560 153Q580 153 580 145Q580 144 576 130Q568 101 554 73T508 17T439 -10Q392 -10 371 17T350 73Q350 92 386 193T423 345Q423 404 379 404H374Q288 404 229 303L222 291L189 157Q156 26 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 112 180T152 343Q153 348 153 366Q153 405 129 405Q91 405 66 305Q60 285 60 284Q58 278 41 278H27Q21 284 21 287Z"></path></g><g data-mml-node="mo" transform="translate(1085, 0)"><path data-c="2C" d="M78 35T78 60T94 103T137 121Q165 121 187 96T210 8Q210 -27 201 -60T180 -117T154 -158T130 -185T117 -194Q113 -194 104 -185T95 -172Q95 -168 106 -156T131 -126T157 -76T173 -3V9L172 8Q170 7 167 6T161 3T152 1T140 0Q113 0 96 17Z"></path></g></g></g></svg>
    </div>
    <button @click="addItem">新增</button>
    <table>
      <thead>
        <th>姓名</th>
        <th>部门</th>
        <th>职位</th>
        <th>入职日期</th>
        <th>操作</th>
      </thead>
      <tbody>
        <tr v-for="(staff, index) in pageData.list" :key="staff.id">
          <td>{{staff.name}}</td>
          <td>{{staff.department}}</td>
          <td>{{staff.position}}</td>
          <td>{{staff.date}}</td>
          <td>
            <button @click="editItem(index)">编辑</button>
            <button @click="deleteItem(index)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="dialog-detail" v-show="pageData.isShowDetail">
      <div class="form-item">
        <span class="label">姓名:</span>
        <input type="text" v-model="pageData.editForm.name">
      </div>
      <div class="form-item">
        <span class="label">部门:</span>
        <input type="text" v-model="pageData.editForm.department">
      </div>
      <div class="form-item">
        <span class="label">职位:</span>
         <input type="text" v-model="pageData.editForm.position">
      </div>
      <div class="form-item">
        <span class="label">入职日期:</span>
         <input type="text" v-model="pageData.editForm.date">
      </div>
      <div class="btn-group">
        <button @click="confirmItem">确认</button>
        <button @click="cancelEdit">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  ref, reactive, toRefs, isRef, computed, watch, 
  onBeforeMount, onMounted, h, defineAsyncComponent
} from 'vue'
import { fetchStaff } from '../api';
export default {
  setup(){
    const addEmptyObj = {
      name: '',
      department: '',
      position: '',
      date: ''
    }
    const pageData = reactive({
      list: [],
      editForm: {},
      editIndex: null,
      isShowDetail: false
    })

    const addItem = (obj = {}) => { // 为了最后把方法这些脱离出去，初始form采用参数传入的方式
      pageData.editIndex = null;
      pageData.editForm = Object.assign({}, addEmptyObj);
      pageData.isShowDetail = true;
    }
    const editItem = (index) => {
      pageData.editIndex = index;
      pageData.editForm = Object.assign({}, pageData.list[index]);
      pageData.isShowDetail = true;
    }
    const deleteItem = (index) => {
      pageData.list.splice(index, 1);
    }

    const cancelEdit = () => {
      pageData.editIndex = null;
      pageData.editForm = {};
      pageData.isShowDetail = false;
    }
    const confirmItem = () => {
      if(pageData.editIndex != null){
        pageData.list[pageData.editIndex] = Object.assign({}, pageData.editForm);
      }else{
        pageData.list.push(pageData.editForm);
      }
      cancelEdit()
    }

    onMounted(async () => {
      let result = await fetchStaff();
      pageData.list = result.list;
    });

    return {
      pageData,
      addItem,
      editItem,
      deleteItem,
      cancelEdit,
      confirmItem
    }
  }
}
</script>
