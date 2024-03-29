import { TableListItem as RoleItemType } from '@/pages/admin/role-list/data'

export interface TableListItem {
  id: number;
  username: string;
  mobile: string;
  avatar: string;
  status: number;
  is_root: number;
  last_login: Date;
  update_time: Date;
  create_time: Date;
  progress: number;
  disabled: boolean;
  roles?: RoleItemType[];
}

export interface TableListPagination {
  total: number;
  pageSize: number;
  pageNo: number;
  current: number;
}

export interface TableListDate {
  list: TableListItem[];
  pagination: Partial<TableListPagination>;
}

export interface TableListParams {
  sorter: string;
  status: string;
  name: string;
  pageSize: number;
  pageNo: number;
}
