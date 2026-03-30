<script setup lang="ts">
import { ref } from "vue";
import { useCustomer } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Delete from "~icons/ep/delete";
import EditPen from "~icons/ep/edit-pen";
import Refresh from "~icons/ep/refresh";
import AddFill from "~icons/ri/add-circle-line";
import Upload from "~icons/ep/upload";
import Download from "~icons/ep/download";

defineOptions({
  name: "CustomerManage"
});

const formRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  importVisible,
  importLoading,
  importPreview,
  onSearch,
  resetForm,
  openDialog,
  handleDelete,
  handleExport,
  handleImport,
  handleDownloadTemplate,
  handleFileChange,
  handleImportConfirm,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange
} = useCustomer();
</script>

<template>
  <div class="main">
    <!-- 查询区域 -->
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-3 overflow-auto"
    >
      <el-form-item label="姓名：" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入姓名"
          clearable
          class="w-45!"
        />
      </el-form-item>
      <el-form-item label="客户等级：" prop="level">
        <el-select
          v-model="form.level"
          placeholder="请选择等级"
          clearable
          class="w-45!"
        >
          <el-option label="A" value="A" />
          <el-option label="B" value="B" />
          <el-option label="C" value="C" />
          <el-option label="D" value="D" />
        </el-select>
      </el-form-item>
      <el-form-item label="坐席：" prop="agent">
        <el-input
          v-model="form.agent"
          placeholder="请输入坐席"
          clearable
          class="w-45!"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('ri/search-line')"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 表格区域 -->
    <PureTableBar title="客户管理" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog()"
        >
          新增
        </el-button>
        <el-button :icon="useRenderIcon(Upload)" @click="handleImport">
          导入
        </el-button>
        <el-button
          :icon="useRenderIcon(Download)"
          :loading="loading"
          @click="handleExport"
        >
          导出
        </el-button>
      </template>

      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          adaptive
          :adaptiveConfig="{ offsetBottom: 108 }"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="{ ...pagination, size }"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @selection-change="handleSelectionChange"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(EditPen)"
              @click="openDialog('修改', row)"
            >
              修改
            </el-button>
            <el-popconfirm
              :title="`确认删除客户【${row.name}】吗？`"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="danger"
                  :size="size"
                  :icon="useRenderIcon(Delete)"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <!-- 导入弹窗 -->
    <el-dialog
      v-model="importVisible"
      title="导入客户数据"
      width="480px"
      :close-on-click-modal="false"
      :close-on-press-escape="!importLoading"
    >
      <el-alert
        type="info"
        :closable="false"
        class="mb-4"
        description="请按模板格式填写数据，必填字段：姓名、电话1。不支持 id 和创建时间列，导入时将自动忽略。"
      />

      <el-button class="mb-4" @click="handleDownloadTemplate">
        <template #icon>
          <IconifyIconOffline icon="ep:download" />
        </template>
        下载导入模板
      </el-button>

      <el-upload
        drag
        accept=".xlsx,.xls"
        :auto-upload="false"
        :limit="1"
        :show-file-list="true"
        :on-change="handleFileChange"
      >
        <el-icon class="el-icon--upload text-4xl mb-2">
          <IconifyIconOffline icon="ep:upload-filled" />
        </el-icon>
        <div class="el-upload__text">
          将 Excel 文件拖到此处，或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">仅支持 .xlsx、.xls 格式</div>
        </template>
      </el-upload>

      <div v-if="importPreview.count > 0" class="mt-4">
        <el-alert
          type="success"
          :closable="false"
          :title="`已解析到 ${importPreview.count} 条有效数据，点击确认导入`"
        />
      </div>
      <div
        v-else-if="importPreview.data.length === 0 && importPreview.count === 0"
      />

      <template #footer>
        <el-button :disabled="importLoading" @click="importVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="importLoading"
          :disabled="importPreview.count === 0"
          @click="handleImportConfirm"
        >
          确认导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
