export interface FormItemProps {
  id?: number;
  name: string;
  level: string;
  gender: string;
  phone1: string;
  phone2: string;
  phone3: string;
  address: string;
  agent: string;
  illness: string;
  consult_product: string;
  next_contact_at: string;
  remark: string;
  created_at?: string;
}

export interface FormProps {
  formInline: FormItemProps;
}
