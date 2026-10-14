export interface Ticket {
  id: number;
  ref: string;
  fk_soc: number;
  fk_soc_name: string;
  date_create: number | Date;
  date_close: number;
  subject: string;
  origin_email: string;
  email: string;
  timing: string;
  severity_label: string;
  type_label: string;
  fk_user_assign: number;
  status: number;
}