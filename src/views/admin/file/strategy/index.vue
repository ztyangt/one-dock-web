<template>
  <div class="storage-strategy-container">
    <div class="page-header">
      <h2>存储策略管理</h2>
      <p>配置和管理不同云存储服务商的存储策略</p>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <Button
        label="新增存储策略"
        icon="pi pi-plus"
        @click="showCreateDialog"
        :style="{ backgroundColor: 'var(--color-btn-bg)', color: 'var(--color-btn-text)' }"
        hoverStyle="{ backgroundColor: 'var(--color-btn-hover)' }"
      />
    </div>

    <!-- 存储策略列表 -->
    <Card class="strategy-list-card">
      <template #header>
        <div class="card-header">
          <h3>存储策略列表</h3>
          <div class="search-box">
            <InputText
              v-model="searchQuery"
              placeholder="搜索存储策略..."
              icon="pi pi-search"
              :style="{ backgroundColor: 'var(--color-input-bg)' }"
            />
          </div>
        </div>
      </template>

      <div v-if="loading" class="loading-state">
        <ProgressSpinner style="width: 50px; height: 50px" />
        <p>加载中...</p>
      </div>

      <div v-else-if="strategies.length === 0" class="empty-state">
        <img src="@/assets/icons/empty.svg" alt="空状态" class="empty-icon" />
        <p>暂无存储策略，请点击上方按钮添加</p>
      </div>

      <DataTable
        v-else
        :value="filteredStrategies"
        responsiveLayout="scroll"
        class="strategy-table"
      >
        <Column field="name" header="策略名称" sortable>
          <template #body="{ data }">
            <div class="strategy-name">
              <SvgIcon :name="getProviderIcon(data.type)" class="provider-icon" />
              {{ data.name }}
              <Badge v-if="data.is_default" value="默认" severity="primary" class="default-badge" />
            </div>
          </template>
        </Column>
        <Column field="typeLabel" header="存储类型" sortable />
        <Column field="bucket" header="存储桶" sortable />
        <Column field="region" header="区域" sortable />
        <Column field="statusLabel" header="状态" sortable>
          <template #body="{ data }">
            <Badge :value="data.statusLabel" :severity="getStatusSeverity(data.status)" />
          </template>
        </Column>
        <Column field="created_at" header="创建时间" sortable />
        <Column header="操作" style="width: 180px">
          <template #body="{ data }">
            <div class="action-buttons-row">
              <Button
                icon="pi pi-pencil"
                @click="showEditDialog(data)"
                class="action-btn edit-btn"
              />
              <Button
                icon="pi pi-trash"
                @click="confirmDelete(data.id)"
                class="action-btn delete-btn"
              />
              <Button
                icon="pi pi-refresh"
                @click="testConnection(data)"
                class="action-btn test-btn"
              />
              <Button
                v-if="!data.is_default"
                icon="pi pi-star"
                @click="setDefault(data.id)"
                class="action-btn default-btn"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </Card>

    <!-- 创建/编辑对话框 -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="dialogTitle"
      :modal="true"
      class="strategy-dialog"
    >
      <div class="dialog-content">
        <div @submit.prevent="saveStrategy">
          <div class="form-grid">
            <div class="form-group">
              <div class="form-label">策略名称</div>
              <InputText
                id="name"
                v-model="formData.name"
                required
                placeholder="请输入策略名称"
                :style="{ backgroundColor: 'var(--color-input-bg)' }"
              />
            </div>

            <div class="form-group">
              <div class="form-label">存储类型</div>
              <Dropdown
                id="type"
                v-model="formData.type"
                :options="providerOptions"
                optionLabel="label"
                optionValue="value"
                required
                placeholder="请选择存储类型"
                :style="{ backgroundColor: 'var(--color-input-bg)' }"
              />
            </div>

            <div class="form-group">
              <div class="form-label">存储桶</div>
              <InputText
                id="bucket"
                v-model="formData.bucket"
                required
                placeholder="请输入存储桶名称"
                :style="{ backgroundColor: 'var(--color-input-bg)' }"
              />
            </div>

            <div class="form-group">
              <div class="form-label">区域</div>
              <InputText
                id="region"
                v-model="formData.region"
                required
                placeholder="请输入区域"
                :style="{ backgroundColor: 'var(--color-input-bg)' }"
              />
            </div>

            <div class="form-group">
              <div class="form-label">Endpoint</div>
              <InputText
                id="endpoint"
                v-model="formData.endpoint"
                placeholder="请输入Endpoint (可选)"
                :style="{ backgroundColor: 'var(--color-input-bg)' }"
              />
            </div>

            <div class="form-group">
              <div class="form-label">Access Key</div>
              <InputText
                id="access_key"
                v-model="formData.access_key"
                required
                placeholder="请输入Access Key"
                :style="{ backgroundColor: 'var(--color-input-bg)' }"
              />
            </div>

            <div class="form-group">
              <div class="form-label">Secret Key</div>
              <InputText
                id="secret_key"
                v-model="formData.secret_key"
                required
                placeholder="请输入Secret Key"
                type="password"
                :style="{ backgroundColor: 'var(--color-input-bg)' }"
              />
            </div>

            <div class="form-group">
              <div class="form-label">自定义域名</div>
              <InputText
                id="domain"
                v-model="formData.domain"
                placeholder="请输入自定义域名 (可选)"
                :style="{ backgroundColor: 'var(--color-input-bg)' }"
              />
            </div>

            <div class="form-group">
              <div class="form-label">路径前缀</div>
              <InputText
                id="path_prefix"
                v-model="formData.path_prefix"
                placeholder="请输入路径前缀 (可选)"
                :style="{ backgroundColor: 'var(--color-input-bg)' }"
              />
            </div>

            <div class="form-group checkbox-group">
              <Checkbox id="is_default" v-model="formData.is_default" label="设为默认策略" />
            </div>
          </div>

          <div class="form-actions">
            <Button
              label="取消"
              @click="dialogVisible = false"
              :style="{ borderColor: 'var(--color-border)' }"
            />
            <Button
              label="保存"
              @click="saveStrategy"
              :style="{ backgroundColor: 'var(--color-btn-bg)', color: 'var(--color-btn-text)' }"
              hoverStyle="{ backgroundColor: 'var(--color-btn-hover)' }"
            />
            <Button
              label="测试连接"
              @click="testConnection(formData)"
              :style="{ backgroundColor: 'var(--color-success)', color: '#ffffff' }"
            />
          </div>
        </div>
      </div>
    </Dialog>

    <!-- 连接测试结果对话框 -->
    <Dialog v-model:visible="testResultVisible" header="连接测试结果" :modal="true">
      <div class="test-result">
        <div class="result-icon" :class="testResult.success ? 'success' : 'error'">
          <i :class="testResult.success ? 'pi pi-check-circle' : 'pi pi-exclamation-circle'" />
        </div>
        <h4>{{ testResult.success ? '连接成功' : '连接失败' }}</h4>
        <p>{{ testResult.message }}</p>
      </div>
      <template #footer>
        <Button
          label="确定"
          @click="testResultVisible = false"
          :style="{ backgroundColor: 'var(--color-btn-bg)', color: 'var(--color-btn-text)' }"
        />
      </template>
    </Dialog>

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      v-model:visible="deleteConfirmVisible"
      header="删除确认"
      message="确定要删除此存储策略吗？此操作不可撤销。"
      icon="pi pi-exclamation-triangle"
    >
      <div class="confirm-dialog-actions">
        <Button
          label="取消"
          @click="deleteConfirmVisible = false"
          :style="{ borderColor: 'var(--color-border)' }"
        />
        <Button
          label="删除"
          @click="deleteStrategy"
          :style="{ backgroundColor: '#ef4444', color: '#ffffff' }"
        />
      </div>
    </ConfirmDialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import {
  Button,
  Card,
  DataTable,
  Column,
  InputText,
  Dropdown,
  Checkbox,
  Dialog,
  ConfirmDialog,
  ProgressSpinner,
  Badge,
} from 'primevue'
import { storageStrategyApi } from '@/apis/modues/storage-strategy'
import type { StorageStrategyType } from '@/types/file'
import SvgIcon from '@/components/SvgIcon/index.vue'

// 状态管理
const strategies = ref<StorageStrategyType.StorageStrategy[]>([])
const loading = ref(false)
const searchQuery = ref('')
const dialogVisible = ref(false)
const dialogTitle = ref('新增存储策略')
const formData = ref<StorageStrategyType.StorageStrategyFormData>({
  name: '',
  type: 'local',
  bucket: '',
  region: '',
  endpoint: '',
  access_key: '',
  secret_key: '',
  domain: '',
  path_prefix: '',
  is_default: false,
})
const deleteConfirmVisible = ref(false)
const deleteId = ref<number | null>(null)
const testResultVisible = ref(false)
const testResult = ref<StorageStrategyType.TestConnectionResult>({ success: false, message: '' })

// 存储提供商选项
const providerOptions = [
  { value: 'local', label: '本地存储' },
  { value: 'cos', label: '腾讯云 COS' },
  { value: 'oss', label: '阿里云 OSS' },
  { value: 'obs', label: '华为云 OBS' },
  { value: 'kodo', label: '七牛云 Kodo' },
  { value: 'upyun', label: '又拍云' },
]

// 计算属性
const filteredStrategies = computed(() => {
  if (!searchQuery.value) return strategies.value
  const query = searchQuery.value.toLowerCase()
  return strategies.value.filter(
    (strategy) =>
      strategy.name.toLowerCase().includes(query) ||
      strategy.typeLabel.toLowerCase().includes(query) ||
      strategy.bucket.toLowerCase().includes(query) ||
      strategy.region.toLowerCase().includes(query),
  )
})

// 方法
const loadStrategies = async () => {
  loading.value = true
  try {
    const response = await storageStrategyApi.all<StorageStrategyType.StorageStrategy>()
    strategies.value = response.data
  } catch (error) {
    console.error('加载存储策略失败:', error)
  } finally {
    loading.value = false
  }
}

const showCreateDialog = () => {
  dialogTitle.value = '新增存储策略'
  formData.value = {
    name: '',
    type: 'local',
    bucket: '',
    region: '',
    endpoint: '',
    access_key: '',
    secret_key: '',
    domain: '',
    path_prefix: '',
    is_default: false,
  }
  dialogVisible.value = true
}

const showEditDialog = (strategy: StorageStrategyType.StorageStrategy) => {
  dialogTitle.value = '编辑存储策略'
  formData.value = {
    id: strategy.id,
    name: strategy.name,
    type: strategy.type,
    bucket: strategy.bucket,
    region: strategy.region,
    endpoint: strategy.endpoint,
    access_key: strategy.access_key,
    secret_key: strategy.secret_key,
    domain: strategy.domain,
    path_prefix: strategy.path_prefix,
    is_default: strategy.is_default,
  }
  dialogVisible.value = true
}

const saveStrategy = async () => {
  try {
    if (formData.value.id) {
      await storageStrategyApi.update(formData.value)
    } else {
      await storageStrategyApi.create(formData.value)
    }
    dialogVisible.value = false
    await loadStrategies()
  } catch (error) {
    console.error('保存存储策略失败:', error)
  }
}

const confirmDelete = (id: number) => {
  deleteId.value = id
  deleteConfirmVisible.value = true
}

const deleteStrategy = async () => {
  if (deleteId.value) {
    try {
      await storageStrategyApi.delete({ ids: [deleteId.value] })
      deleteConfirmVisible.value = false
      await loadStrategies()
    } catch (error) {
      console.error('删除存储策略失败:', error)
    }
  }
}

const testConnection = async (data: any) => {
  try {
    const result = await storageStrategyApi.testConnection(data)
    testResult.value = result.data
    testResultVisible.value = true
  } catch (error) {
    console.error('测试连接失败:', error)
    testResult.value = { success: false, message: '测试连接失败，请检查网络或配置' }
    testResultVisible.value = true
  }
}

const setDefault = async (id: number) => {
  try {
    await storageStrategyApi.update({ id, is_default: true })
    await loadStrategies()
  } catch (error) {
    console.error('设置默认策略失败:', error)
  }
}

const getProviderIcon = (type: StorageStrategyType.ProviderType) => {
  const iconMap: Record<StorageStrategyType.ProviderType, string> = {
    local: 'storage',
    cos: 'tencent',
    oss: 'aliyun',
    obs: 'huawei',
    kodo: 'qiniu',
    upyun: 'upyun',
    s3: 'storage',
  }
  return iconMap[type] || 'storage'
}

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'error':
      return 'danger'
    case 'inactive':
      return 'warning'
    default:
      return 'info'
  }
}

// 生命周期
onMounted(() => {
  loadStrategies()
})
</script>

<style lang="scss" scoped>
.storage-strategy-container {
  padding: 20px;
  min-height: 100vh;
  background-color: var(--color-bg);
  color: var(--color-text-main);
}

.page-header {
  margin-bottom: 24px;
  h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
    background: linear-gradient(90deg, var(--color-headline-start), var(--color-headline-end));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  p {
    color: var(--color-text-muted);
    font-size: 14px;
  }
}

.action-buttons {
  margin-bottom: 20px;
}

.strategy-list-card {
  background-color: var(--color-panel);
  border-radius: 12px;
  box-shadow: var(--shadow-panel);
  transition: all 0.3s ease;
  &:hover {
    box-shadow: var(--shadow-panel-hover);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }
  .search-box {
    width: 300px;
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  p {
    margin-top: 16px;
    color: var(--color-text-muted);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  .empty-icon {
    width: 80px;
    height: 80px;
    opacity: 0.5;
    margin-bottom: 16px;
  }
  p {
    color: var(--color-text-muted);
    font-size: 14px;
  }
}

.strategy-table {
  .strategy-name {
    display: flex;
    align-items: center;
    gap: 8px;
    .provider-icon {
      width: 20px;
      height: 20px;
      opacity: 0.8;
    }
    .default-badge {
      margin-left: 8px;
    }
  }
  .action-buttons-row {
    display: flex;
    gap: 8px;
    .action-btn {
      width: 32px;
      height: 32px;
      min-width: 32px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      &.edit-btn {
        color: var(--color-primary-solid);
      }
      &.delete-btn {
        color: #ef4444;
      }
      &.test-btn {
        color: var(--color-success);
      }
      &.default-btn {
        color: #f59e0b;
      }
    }
  }
}

.strategy-dialog {
  .dialog-content {
    max-height: 70vh;
    overflow-y: auto;
  }
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  .form-group {
    .form-label {
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--color-text-main);
      font-size: 14px;
    }
    .p-inputtext,
    .p-dropdown {
      width: 100%;
    }
    .p-checkbox {
      margin-top: 8px;
    }
  }
  .checkbox-group {
    grid-column: 1 / -1;
  }
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }
}

.test-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 0;
  .result-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    font-size: 32px;
    &.success {
      background-color: rgba(16, 185, 129, 0.1);
      color: var(--color-success);
    }
    &.error {
      background-color: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  }
  h4 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
  }
  p {
    color: var(--color-text-muted);
    margin: 0;
  }
}

@media (max-width: 768px) {
  .storage-strategy-container {
    padding: 12px;
  }
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    .search-box {
      width: 100%;
    }
  }
  .strategy-dialog {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
