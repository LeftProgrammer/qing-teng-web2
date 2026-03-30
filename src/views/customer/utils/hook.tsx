import dayjs from "dayjs";
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
  deleteCustomer
} from "@/api/customer";
import { reactive, ref, onMounted, h, toRaw } from "vue";

export function useCustomer() {
  const form = reactive({
    name: "",
    level: "",
    agent: ""
  });
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
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

  function handleExport() {
    message("导出功能开发中", { type: "info" });
  }

  function handleImport() {
    message("导入功能开发中", { type: "info" });
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
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleExport,
    handleImport,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
