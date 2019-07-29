// import request from 'umi-request';
import request from '@/utils/request.axios';
import { FromDataType } from './index';

export async function fakeAccountLogin(params: FromDataType) {
  return request('/admin-api/login', {
    method: 'POST',
    data: params,
  });
}

export async function getFakeCaptcha(mobile: string) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}
