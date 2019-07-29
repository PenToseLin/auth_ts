// import request from 'umi-request';
import request from '@/utils/request.axios';
import { TableListParams } from './data';

export async function queryUserList(params: TableListParams) {
  return request(`/admin-api/manage/user/list`, {
    params,
  });
}

export async function disableUser(params) {
  return request('/admin-api/manage/user/disable', {
    method: 'PUT',
    data: { ...params },
  });
}

export async function removeUsers(params) {
  return request('/admin-api/manage/user/remove', {
    method: 'DELETE',
    data: { ...params },
  });
}

export async function enableUser(params) {
  return request('/admin-api/manage/user/enable', {
    method: 'PUT',
    data: { ...params },
  });
}

export async function addUser(params) {
  return request('/admin-api/manage/user/add', {
    method: 'POST',
    data: { ...params },
  });
}

export async function updateUser(params) {
  return request('/admin-api/manage/user/update', {
    method: 'PUT',
    data: { ...params },
  });
}


export async function queryRoles(params) {
  return request('/admin-api/manage/role/all', {
    method: 'GET',
    data: { ...params },
  });
}
