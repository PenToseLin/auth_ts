// import request from 'umi-request';
import request from '@/utils/request.axios';

export async function fakeSubmitForm(params: any) {
  return request('/api/forms', {
    method: 'POST',
    data: params,
  });
}
