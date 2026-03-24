<template>
  <div class="user-table flex-column wh-100 relative">
    <div class="flex-sb flex-yc">
      <a-radio-group
        class="card-bg"
        @change="handleChangeQueryType"
        type="button"
        v-model="queryType"
      >
        <a-radio value="all"><icon-select-all class="mr-5" />全部</a-radio>
        <a-radio value="trashed"><icon-delete class="mr-5" />回收站</a-radio>
      </a-radio-group>
      <div class="flex-yc">
        <a-button type="primary" size="small" @click="dialogRef?.open()">
          <template #icon><icon-plus-circle-fill /></template>
          创建
        </a-button>
        <a-button type="primary" status="success" size="small" @click="fetchData()" class="ml-10">
          <template #icon><icon-refresh /></template>
          刷新
        </a-button>

        <a-popconfirm
          content="确认将所选数据批量移至回收站吗?"
          position="lt"
          type="warning"
          v-if="queryType === 'all'"
          @ok="handleRemove(selectedRowKeys)"
        >
          <a-button
            :disabled="selectedRowKeys.length === 0"
            status="warning"
            type="primary"
            size="small"
            class="ml-10"
          >
            <template #icon><icon-stop /></template>
            移除
          </a-button>
        </a-popconfirm>

        <a-popconfirm
          content="确认批量恢复所选数据吗?"
          position="lt"
          type="success"
          v-if="queryType === 'trashed'"
          @ok="handleRestore(selectedRowKeys)"
        >
          <a-button
            :disabled="selectedRowKeys.length === 0"
            status="success"
            type="primary"
            size="small"
            class="ml-10"
          >
            <template #icon><icon-sync /></template>
            恢复
          </a-button>
        </a-popconfirm>

        <a-tooltip v-if="queryType === 'trashed'" content="彻底删除" position="top" mini>
          <a-popconfirm
            content="确认批量彻底删除所选数据吗?"
            position="lt"
            type="error"
            @ok="handleDelete(selectedRowKeys)"
          >
            <a-button
              :disabled="selectedRowKeys.length === 0"
              status="danger"
              type="primary"
              size="small"
              class="ml-10"
            >
              <template #icon><icon-delete /></template>
            </a-button>
          </a-popconfirm>
        </a-tooltip>
      </div>
    </div>
    <a-divider></a-divider>
    <a-table
      show-empty-tree
      class="flex-1 relative h-0 overhide"
      ref="tableRef"
      :columns="columns"
      :data="dataList"
      :bordered="false"
      :stripe="false"
      :scrollbar="true"
      :column-resizable="true"
      :sticky-header="true"
      :row-selection="rowSelection"
      :loading="loading"
      :pagination="paginationProps"
      @selection-change="(e: any) => (selectedRowKeys = e)"
      row-key="id"
    >
      <template #avatar="{ record }">
        <a-avatar
          v-image-preview
          :class="{ pointer: !!record.avatar }"
          :imageUrl="record.avatar"
          shape="square"
          object-fit="cover"
          :size="28"
        ></a-avatar>
      </template>

      <template #gender="{ record }">
        <a-tag v-if="record.gender === UserEnum.Gender.BOY" size="small" color="#1586f9">男</a-tag>
        <a-tag v-else-if="record.gender === UserEnum.Gender.GIRL" size="small" color="#f6385b"
          >女</a-tag
        >
        <a-tag v-else>密</a-tag>
      </template>

      <template #status="{ record }">
        <a-switch
          type="round"
          :model-value="record.status"
          :checked-value="UserEnum.Status.BANNED"
          :unchecked-value="UserEnum.Status.NORMAL"
          checked-color="rgb(var(--red-6))"
          unchecked-color="rgb(var(--green-5))"
          @change="handleUpdate(record, { status: $event as UserEnum.Status })"
        >
          <template #unchecked> 正常 </template>
          <template #checked> 封禁 </template>
        </a-switch>
      </template>

      <template #action="{ record }">
        <a-button type="primary" size="mini" @click="dialogRef?.open(record)">
          <template #icon><icon-edit /></template>
          编辑
        </a-button>
      </template>
    </a-table>
    <user-dialog ref="dialogRef" @success="fetchData" />
  </div>
</template>

<script setup lang="ts">
import { userApi } from '@/apis'
import type { UserType } from '@/types'
import { UserEnum } from '@/data/enum'
import { format } from 'date-fns'
import UserDialog from './dialog.vue'
import type { CommTableHooksType } from '@/hooks/use-comm-table'

const dialogRef = ref()
const {
  loading,
  paginationProps,
  queryType,
  dataList,
  selectedRowKeys,
  rowSelection,
  tableRef,
  fetchData,
  handleRemove,
  handleRestore,
  handleDelete,
  handleUpdate,
  handleChangeQueryType
} = inject<CommTableHooksType>('hooks')!

const columns = [
  {
    title: '昵称',
    dataIndex: 'nickname',
    width: 120,
    tooltip: true,
    ellipsis: true
  },
  { title: '账号', dataIndex: 'account', width: 120, tooltip: true, ellipsis: true },
  { title: '头像', dataIndex: 'avatar', width: 80, slotName: 'avatar' },
  { title: '性别', dataIndex: 'gender', width: 80, slotName: 'gender' },
  { title: '状态', dataIndex: 'status', width: 80, slotName: 'status' },
  { title: '角色', dataIndex: 'role', width: 80 },
  { title: '邮箱', dataIndex: 'email', minWidth: 200, tooltip: true, ellipsis: true },
  {
    title: '上次登录IP',
    dataIndex: 'last_ip',
    width: 140,
    render: (data: { record: UserType.Datum }) => data.record.last_ip || '-'
  },
  {
    title: '上次登录',
    dataIndex: 'login_at',
    width: 180,
    render: (data: { record: UserType.Datum }) =>
      data.record.login_at ? format(data.record.login_at, 'yyyy-MM-dd HH:mm:ss') : '-',
    sortable: { sortDirections: ['ascend', 'descend'] }
  },
  // {
  //   title: '更新时间',
  //   dataIndex: 'updated_at',
  //   width: 180,
  //   render: (data: { record: UserType.Datum }) =>
  //     format(data.record.updated_at, 'yyyy-MM-dd HH:mm:ss'),
  //   sortable: { sortDirections: ['ascend', 'descend'] }
  // },
  {
    title: '注册时间',
    dataIndex: 'created_at',
    width: 180,
    render: (data: { record: UserType.Datum }) =>
      format(data.record.created_at, 'yyyy-MM-dd HH:mm:ss'),
    sortable: { sortDirections: ['ascend', 'descend'] }
  },
  { title: '操作', fixed: 'right', dataIndex: 'action', width: 200, slotName: 'action' }
]

fetchData()
</script>

<style lang="scss">
.user-table {
  .arco-switch {
    height: 20px;
    line-height: 20px;
    width: 55px;
    .arco-switch-handle {
      top: 3px;
      width: 14px;
      height: 14px;
    }
  }
}
</style>
