// import request from 'umi-request';
import request from '@/utils/request.axios';

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}
