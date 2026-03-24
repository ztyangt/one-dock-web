<template>
  <a-drawer
    :width="600"
    :visible="visible"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :ok-loading="loading"
    unmountOnClose
  >
    <template #title> {{ editData?.id ? '编辑' : '创建' }}存储策略 </template>
    <a-form
      :model="editData"
      :rules="rules"
      ref="formRef"
      layout="vertical"
      auto-label-width
      @submit="handleSubmit"
    >
      <a-form-item
        label="策略名称"
        field="name"
        :rules="[{ required: true, message: '请输入策略名称' }]"
      >
        <a-input v-model="editData.name" placeholder="请输入策略名称" allow-clear />
      </a-form-item>
      <a-form-item
        label="策略类型"
        field="type"
        :rules="[{ required: true, message: '请选择策略类型' }]"
        :disabled="editData.id !== undefined"
      >
        <a-select v-model="editData.type" placeholder="请选择策略类型" allow-clear>
          <a-option v-for="item in strategy_options" :key="item.value" :value="item.value">
            <div class="flex-yc">
              <img
                :src="strategyMap[item.value].icon"
                class="mr-5 strategy-filter-strategy-icon flex-shrink-0"
              />
              <span>{{ item.label }}</span>
            </div>
          </a-option>
        </a-select>
      </a-form-item>
      <CosForm v-model:config="editData.config" v-if="editData.type === StrategyEnumType.COS" />
      <OssForm v-model:config="editData.config" v-if="editData.type === StrategyEnumType.OSS" />

      <!-- <LocalForm v-model:config="editData.config" v-if="editData.type === StrategyEnumType.LOCAL" /> -->
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
import { strategy_options } from '@/data/const/option'
import LocalForm from './local-form.vue'
import CosForm from './cos-form.vue'
import OssForm from './oss-form.vue'
import { StrategyEnumType } from '@/data/enum/file'
import type { StrategyType } from '@/types'
import { Message } from '@arco-design/web-vue'
import { useStorageStore } from '@/stores/storage'

const formRef = ref()
const visible = defineModel<boolean>('visible', { default: false })
const editData = defineModel<StrategyType.Datum>('editData', { default: { config: {} } })

const loading = ref<boolean>(false)

const storageStore = useStorageStore()
const { strategyMap } = storageStore

const { fetchStrategyList } = storageStore

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) return
  const method = editData.value.id ? 'update' : 'create'
  loading.value = true
  const { code } = await strategyApi[method](editData.value)
  loading.value = false
  if (code === 200) {
    Message.success('操作成功！')
    fetchStrategyList()
    visible.value = false
  }
}

const handleCancel = () => {
  visible.value = false
}

const rules = reactive({
  name: [{ required: true, message: '请输入策略名称' }],
  type: [{ required: true, message: '请选择策略类型' }]
})
</script>

<style lang="scss" scoped>
.strategy-filter-strategy-icon {
  width: 18px;
  height: 18px;
}
</style>
