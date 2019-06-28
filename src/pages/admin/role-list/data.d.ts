export interface TableListItem {
  id: number;
  role_name: string;
  depict: string;
  is_root: number;
  update_time: Date;
  create_time: Date;
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
  is_root: string;
  role_name: string;
  pageSize: number;
  pageNo: number;
}
