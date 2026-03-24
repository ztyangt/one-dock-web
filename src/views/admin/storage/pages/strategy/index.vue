<template>
  <div class="file-strategy-page h-100 p-20" v-loading="loading">
    <div class="strategy-list">
      <div
        @click="handleEdit()"
        class="new-strategy-card pointer p-15 br-5 secondary-bg text-center"
      >
        <div class="mb-5">
          <c-icon :size="28" name="add-fill" />
        </div>
        <div class="title fs-14">新建存储策略</div>
      </div>
      <div
        v-for="item in strategyList"
        :key="item.id"
        class="strategy-card card-bg p-15 br-5 local-strategy relative"
      >
        <div class="card-header flex-yc">
          <div class="strategy-icon mr-5 flex-shrink-0">
            <img :src="storageStore.strategyMap[item.type].icon" alt="" />
          </div>
          <div class="title-color fw-500 h-1x">{{ item.name }}</div>
        </div>
        <div class="flex-yc mt-15 flex-sb">
          <span class="fs-12 muted-color">{{ storageStore.strategyMap[item.type].title }}</span>

          <div class="flex-yc">
            <div
              @click.stop="handleEdit(item)"
              class="opera-btn text-color flex-center mr-5 pointer br-50 secondary-bg"
            >
              <c-icon :size="14" name="edit-2-line" />
            </div>
            <div
              @click.stop="handleDelete(item)"
              class="opera-btn delete-color flex-center pointer ml-5 br-50 secondary-bg"
            >
              <c-icon :size="14" name="delete-bin-6-line" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <StrategyConfig :data="editData" v-model:visible="visible" v-model:editData="editData" />
  </div>
</template>

<script setup lang="ts">
import StrategyConfig from './config/index.vue'
import { StrategyEnumType } from '@/data/enum/file'
import { strategyApi } from '@/apis'
import type { StrategyType } from '@/types'
import { Message, Modal } from '@arco-design/web-vue'
import { cloneDeep } from 'lodash'
import { useStorageStore } from '@/stores/storage'
import { storeToRefs } from 'pinia'

const visible = defineModel<boolean>('visible', { default: false })
const editData = ref<any>({})

const handleEdit = (data?: any) => {
  editData.value = cloneDeep(data || { config: {} })
  visible.value = true
}

const storageStore = useStorageStore()
const { fetchStrategyList } = storageStore
const { strategyList, loading } = storeToRefs(storageStore)

const handleDelete = (item: StrategyType.Datum) => {
  Modal.warning({
    simple: true,
    hideCancel: false,
    alignCenter: true,
    titleAlign: 'start',
    title: '删除存储策略',
    content: '删除后数据不可恢复，确认继续吗吗？',

    onOk: () => {
      strategyApi.delete(item.id).then(({ code }) => {
        if (code === 200) {
          Message.success('删除成功！')
          fetchStrategyList()
        }
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.file-strategy-page {
  .strategy-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;

    .strategy-icon {
      img {
        width: 24px;
        height: 24px;
      }
    }

    .opera-btn {
      height: 24px;
      width: 24px;
      &:hover {
        box-shadow: var(--shadow);
      }
    }

    .new-strategy-card {
      border: 1px dashed var(--muted-color);
      background-color: var(--card-bg);

      &:hover {
        border-color: var(--theme-color);
        color: var(--pure-color);
      }
    }
  }
}
</style>
