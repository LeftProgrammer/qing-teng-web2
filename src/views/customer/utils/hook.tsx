import dayjs from "dayjs";
import * as XLSX from "xlsx";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "./types";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import {
  getCustomerList,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  exportCustomerAll,
  batchCreateCustomer
} from "@/api/customer";
import { reactive, ref, onMounted, h, toRaw } from "vue";
import type { UploadFile } from "element-plus";

// 导出列映射（字段名 -> 中文表头）
const EXPORT_COLS: Array<{ key: keyof FormItemProps; label: string }> = [
  { key: "id", label: "ID" },
  { key: "name", label: "姓名" },
  { key: "level", label: "客户等级" },
  { key: "gender", label: "性别" },
  { key: "phone1", label: "电话1" },
  { key: "phone2", label: "电话2" },
  { key: "phone3", label: "电话3" },
  { key: "address", label: "地址" },
  { key: "agent", label: "坐席" },
  { key: "illness", label: "病情" },
  { key: "consult_product", label: "咨询产品" },
  { key: "next_contact_at", label: "下次联系时间" },
  { key: "remark", label: "备注" },
  { key: "created_at", label: "创建时间" }
];

// 导入列映射（中文表头 -> 字段名），不含 id/created_at
const IMPORT_COL_MAP: Record<
  string,
  keyof Omit<FormItemProps, "id" | "created_at">
> = {
  姓名: "name",
  客户等级: "level",
  性别: "gender",
  电话1: "phone1",
  电话2: "phone2",
  电话3: "phone3",
  地址: "address",
  坐席: "agent",
  病情: "illness",
  咨询产品: "consult_product",
  下次联系时间: "next_contact_at",
  备注: "remark"
};

export function useCustomer() {
  const form = reactive({
    name: "",
    level: "",
    agent: ""
  });
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const importVisible = ref(false);
  const importLoading = ref(false);
  const importPreview = ref<{ count: number; data: any[] }>({
    count: 0,
    data: []
  });

  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const columns: TableColumnList = [
    { type: "selection", width: 55, align: "left", fixed: "left" },
    { label: "ID", prop: "id", width: 80 },
    { label: "姓名", prop: "name", minWidth: 100 },
    { label: "等级", prop: "level", width: 70 },
    { label: "性别", prop: "gender", width: 70 },
    { label: "电话1", prop: "phone1", minWidth: 130 },
    { label: "电话2", prop: "phone2", minWidth: 130 },
    {
      label: "地址",
      prop: "address",
      minWidth: 200,
      showOverflowTooltip: true
    },
    { label: "坐席", prop: "agent", minWidth: 90 },
    {
      label: "病情",
      prop: "illness",
      minWidth: 120,
      showOverflowTooltip: true
    },
    {
      label: "咨询产品",
      prop: "consult_product",
      minWidth: 130,
      showOverflowTooltip: true
    },
    {
      label: "下次联系时间",
      prop: "next_contact_at",
      minWidth: 170,
      formatter: ({ next_contact_at }) =>
        next_contact_at
          ? dayjs(next_contact_at).format("YYYY-MM-DD HH:mm")
          : "-"
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      label: "创建时间",
      prop: "created_at",
      minWidth: 170,
      formatter: ({ created_at }) =>
        dayjs(created_at).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 130,
      slot: "operation"
    }
  ];

  async function onSearch() {
    loading.value = true;
    const { code, data } = await getCustomerList({
      ...toRaw(form),
      currentPage: pagination.currentPage,
      pageSize: pagination.pageSize
    });
    if (code === 0) {
      dataList.value = data.list;
      pagination.total = data.total;
      pagination.pageSize = data.pageSize;
      pagination.currentPage = data.currentPage;
    }
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  const resetForm = (formEl: any) => {
    if (!formEl) return;
    formEl.resetFields();
    pagination.currentPage = 1;
    onSearch();
  };

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}客户`,
      props: {
        formInline: {
          id: row?.id ?? undefined,
          name: row?.name ?? "",
          level: row?.level ?? "",
          gender: row?.gender ?? "",
          phone1: row?.phone1 ?? "",
          phone2: row?.phone2 ?? "",
          phone3: row?.phone3 ?? "",
          address: row?.address ?? "",
          agent: row?.agent ?? "",
          illness: row?.illness ?? "",
          consult_product: row?.consult_product ?? "",
          next_contact_at: row?.next_contact_at ?? "",
          remark: row?.remark ?? ""
        }
      },
      width: "52%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        FormRef.validate(async (valid: boolean) => {
          if (valid) {
            if (title === "新增") {
              const { code, message: msg } = await createCustomer(curData);
              if (code === 0) {
                message(`新增客户【${curData.name}】成功`, { type: "success" });
                done();
                onSearch();
              } else {
                message(msg, { type: "error" });
              }
            } else {
              const { code, message: msg } = await updateCustomer(curData);
              if (code === 0) {
                message(`修改客户【${curData.name}】成功`, { type: "success" });
                done();
                onSearch();
              } else {
                message(msg, { type: "error" });
              }
            }
          }
        });
      }
    });
  }

  async function handleDelete(row: FormItemProps) {
    const { code, message: msg } = await deleteCustomer(row.id);
    if (code === 0) {
      message(`已删除客户【${row.name}】`, { type: "success" });
      onSearch();
    } else {
      message(msg, { type: "error" });
    }
  }

  // ——————————————————————————————
  // 导出
  // ——————————————————————————————
  async function handleExport() {
    loading.value = true;
    const { code, data, message: msg } = await exportCustomerAll(toRaw(form));
    loading.value = false;
    if (code !== 0) {
      message(msg, { type: "error" });
      return;
    }
    const rows = (data as FormItemProps[]).map(item => {
      const row: Record<string, any> = {};
      for (const { key, label } of EXPORT_COLS) {
        if (key === "next_contact_at") {
          row[label] = item[key]
            ? dayjs(item[key]).format("YYYY-MM-DD HH:mm")
            : "";
        } else if (key === "created_at") {
          row[label] = item[key]
            ? dayjs(item[key]).format("YYYY-MM-DD HH:mm:ss")
            : "";
        } else {
          row[label] = item[key] ?? "";
        }
      }
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "客户列表");
    XLSX.writeFile(wb, `客户列表_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
    message(`已导出 ${rows.length} 条数据`, { type: "success" });
  }

  // ——————————————————————————————
  // 导入
  // ——————————————————————————————
  function handleImport() {
    importPreview.value = { count: 0, data: [] };
    importVisible.value = true;
  }

  /** 下载导入模板 */
  function handleDownloadTemplate() {
    const headers = Object.keys(IMPORT_COL_MAP);
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "客户导入模板");
    XLSX.writeFile(wb, "客户导入模板.xlsx");
  }

  /** 文件选择后解析预览 */
  function handleFileChange(uploadFile: UploadFile) {
    const file = uploadFile.raw;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const data = new Uint8Array(e.target!.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array", cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonRows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, {
        defval: ""
      });
      const parsed = jsonRows
        .map(row => {
          const record: Record<string, any> = {};
          for (const [cnKey, enKey] of Object.entries(IMPORT_COL_MAP)) {
            const val = row[cnKey];
            if (val === undefined || val === "") {
              record[enKey] = null;
            } else if (val instanceof Date) {
              record[enKey] = val.toISOString();
            } else {
              record[enKey] = String(val);
            }
          }
          return record;
        })
        .filter(r => r.name); // 姓名必填
      importPreview.value = { count: parsed.length, data: parsed };
    };
    reader.readAsArrayBuffer(file);
  }

  /** 确认导入 */
  async function handleImportConfirm() {
    if (importPreview.value.count === 0) {
      message("未解析到有效数据，请检查文件格式", { type: "warning" });
      return;
    }
    importLoading.value = true;
    const { code, message: msg } = await batchCreateCustomer(
      importPreview.value.data
    );
    importLoading.value = false;
    if (code === 0) {
      message(`成功导入 ${importPreview.value.count} 条数据`, {
        type: "success"
      });
      importVisible.value = false;
      onSearch();
    } else {
      message(msg, { type: "error" });
    }
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  function handleSelectionChange(val: FormItemProps[]) {
    console.log("handleSelectionChange", val);
  }

  onMounted(() => {
    onSearch();
  });

  return {
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
  };
}
