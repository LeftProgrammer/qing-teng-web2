<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import type { FormProps } from "./utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    name: "",
    level: "",
    gender: "",
    phone1: "",
    phone2: "",
    phone3: "",
    address: "",
    agent: "",
    illness: "",
    consult_product: "",
    next_contact_at: "",
    remark: ""
  })
});

const formRef = ref();
const curFormData = ref(props.formInline);

function getRef() {
  return formRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="formRef"
    :model="curFormData"
    :rules="formRules"
    label-width="100px"
  >
    <el-row :gutter="16">
      <el-col :span="12">
        <el-form-item label="姓名" prop="name">
          <el-input
            v-model="curFormData.name"
            placeholder="请输入姓名"
            clearable
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="客户等级" prop="level">
          <el-select
            v-model="curFormData.level"
            placeholder="请选择等级"
            clearable
            class="w-full"
          >
            <el-option label="A" value="A" />
            <el-option label="B" value="B" />
            <el-option label="C" value="C" />
            <el-option label="D" value="D" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="性别" prop="gender">
          <el-select
            v-model="curFormData.gender"
            placeholder="请选择性别"
            clearable
            class="w-full"
          >
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="坐席" prop="agent">
          <el-input
            v-model="curFormData.agent"
            placeholder="请输入坐席"
            clearable
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="电话1" prop="phone1">
          <el-input
            v-model="curFormData.phone1"
            placeholder="请输入电话1"
            clearable
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="电话2" prop="phone2">
          <el-input
            v-model="curFormData.phone2"
            placeholder="请输入电话2"
            clearable
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="电话3" prop="phone3">
          <el-input
            v-model="curFormData.phone3"
            placeholder="请输入电话3"
            clearable
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="下次联系" prop="next_contact_at">
          <el-date-picker
            v-model="curFormData.next_contact_at"
            type="datetime"
            placeholder="请选择下次联系时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
            class="w-full"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="地址" prop="address">
          <el-input
            v-model="curFormData.address"
            placeholder="请输入地址"
            clearable
          />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="咨询产品" prop="consult_product">
          <el-input
            v-model="curFormData.consult_product"
            placeholder="请输入咨询产品"
            clearable
          />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="病情" prop="illness">
          <el-input
            v-model="curFormData.illness"
            type="textarea"
            :rows="2"
            placeholder="请输入病情描述"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="curFormData.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
