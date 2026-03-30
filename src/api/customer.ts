import { supabase } from "@/supabase";
import type { FormItemProps } from "@/views/customer/utils/types";

type ListParams = {
  name?: string;
  level?: string;
  agent?: string;
  currentPage?: number;
  pageSize?: number;
};

/** 获取客户列表（分页 + 筛选） */
export async function getCustomerList(params: ListParams = {}) {
  const { name, level, agent, currentPage = 1, pageSize = 10 } = params;
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .range(from, to)
    .order("created_at", { ascending: false });

  if (name) query = query.ilike("name", `%${name}%`);
  if (level) query = query.eq("level", level);
  if (agent) query = query.ilike("agent", `%${agent}%`);

  const { data, count, error } = await query;
  if (error) return { code: -1, message: error.message, data: null };

  return {
    code: 0,
    message: "操作成功",
    data: {
      list: data ?? [],
      total: count ?? 0,
      pageSize,
      currentPage
    }
  };
}

/** 将空字符串的可选字段转为 null，避免 TIMESTAMPTZ 等类型 400 报错 */
function sanitize(row: Record<string, any>) {
  const result: Record<string, any> = {};
  for (const key of Object.keys(row)) {
    result[key] = row[key] === "" ? null : row[key];
  }
  return result;
}

/** 新增客户 */
export async function createCustomer(
  row: Omit<FormItemProps, "id" | "created_at">
) {
  const { error } = await supabase.from("customers").insert(sanitize(row));
  if (error) return { code: -1, message: error.message };
  return { code: 0, message: "操作成功" };
}

/** 修改客户 */
export async function updateCustomer(row: FormItemProps) {
  const { id, created_at: _created_at, ...rest } = row;
  const { error } = await supabase
    .from("customers")
    .update(sanitize(rest))
    .eq("id", id!);
  if (error) return { code: -1, message: error.message };
  return { code: 0, message: "操作成功" };
}

/** 删除客户 */
export async function deleteCustomer(id: number) {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) return { code: -1, message: error.message };
  return { code: 0, message: "操作成功" };
}
