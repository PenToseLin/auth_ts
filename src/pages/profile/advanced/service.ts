// import request from 'umi-request';
import request from '@/utils/request.axios';

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}
