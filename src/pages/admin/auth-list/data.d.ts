export interface TableListItem {
  id: number;
  username: string;
  mobile: string;
  avatar: string;
  status: number;
  last_login: Date;
  update_time: Date;
  create_time: Date;
  progress: number;
  disabled: boolean;
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
