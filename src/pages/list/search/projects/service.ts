// import request from 'umi-request';
import request from '@/utils/request.axios';

export async function queryFakeList(params: { count: number }) {
  return request(`/api/fake_list`, {
    params,
  });
}
