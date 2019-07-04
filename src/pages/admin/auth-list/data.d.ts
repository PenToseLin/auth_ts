export interface TableListItem {
  id: number;
  auth_name: string;
  queue: string;
  depict: string;
  method: string;
  menu_id: number;
  parent_id: number;
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
  status: string;
  name: string;
  pageSize: number;
  pageNo: number;
}
