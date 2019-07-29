// import request from 'umi-request';
import request from '@/utils/request.axios';
import { TableListParams } from './data';

export async function queryRoleList(params: TableListParams) {
  return request(`/admin-api/manage/role/list`, {
    params,
  });
}

export async function queryAuth(params) {
  return request(`/admin-api/manage/auth/all`, {
    params,
  });
}

export async function disableRole(params) {
  return request('/admin-api/manage/role/disable', {
    method: 'PUT',
    data: { ...params },
  });
}

export async function removeRole(params) {
  return request('/admin-api/manage/role/remove', {
    method: 'DELETE',
    data: { ...params },
  });
}

export async function enableRole(params) {
  return request('/admin-api/manage/role/enable', {
    method: 'PUT',
    data: { ...params },
  });
}

export async function addRole(params) {
  return request('/admin-api/manage/role/add', {
    method: 'POST',
    data: { ...params },
  });
}

export async function updateRole(params) {
  return request('/admin-api/manage/role/update', {
    method: 'PUT',
    data: { ...params },
  });
}
