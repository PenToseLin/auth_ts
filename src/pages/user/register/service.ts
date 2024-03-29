// import request from 'umi-request';
import request from '@/utils/request.axios';
import { IUserRegisterParams } from './index';

export async function fakeRegister(params: IUserRegisterParams) {
  return request('/api/register', {
    method: 'POST',
    data: params,
  });
}
