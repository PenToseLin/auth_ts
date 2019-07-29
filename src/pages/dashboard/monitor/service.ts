// import request from 'umi-request';
import request from '@/utils/request.axios';

export async function queryTags() {
  return request('/api/tags');
}
