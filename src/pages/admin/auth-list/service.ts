import request from 'umi-request';
import { TableListParams } from './data';

export async function queryUserList(params: TableListParams) {
  return request(`/admin-api/user/list`, {
    params,
  });
}

export async function disableUser(params) {
  return request('/admin-api/user/disable', {
    method: 'DELETE',
    data: { ...params },
  });
}

export async function enableUser(params) {
  return request('/admin-api/user/enable', {
    method: 'PUT',
    data: { ...params },
  });
}

export async function addUser(params) {
  return request('/admin-api/user/add', {
    method: 'POST',
    data: { ...params },
  });
}

export async function updateUser(params) {
  return request('/admin-api/user/update', {
    method: 'PUT',
    data: { ...params },
  });
}
