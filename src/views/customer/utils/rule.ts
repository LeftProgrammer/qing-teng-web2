import { reactive } from "vue";
import type { FormRules } from "element-plus";
import type { FormItemProps } from "./types";

export const formRules = reactive<FormRules<FormItemProps>>({
  name: [{ required: true, message: "姓名不能为空", trigger: "blur" }],
  phone1: [
    { required: true, message: "电话1不能为空", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号",
      trigger: "blur"
    }
  ]
});
