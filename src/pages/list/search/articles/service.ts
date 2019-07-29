// import request from 'umi-request';
import request from '@/utils/request.axios';
import { ListItemDataType } from './data';

export async function queryFakeList(params: ListItemDataType) {
  return request(`/api/fake_list`, {
    params,
  });
}
