// import request from 'umi-request';
import request from '@/utils/request';
import { TableListParams } from './data';

export async function queryRoleList(params: TableListParams) {
  return request(`/admin-api/role/list`, {
    params,
  });
}

export async function queryAuth(params) {
  return request(`/admin-api/auth/all`, {
    params,
  });
}

export async function disableRole(params) {
  return request('/admin-api/role/disable', {
    method: 'PUT',
    data: { ...params },
  });
}

export async function removeRole(params) {
  return request('/admin-api/role/remove', {
    method: 'DELETE',
    data: { ...params },
  });
}

export async function enableRole(params) {
  return request('/admin-api/role/enable', {
    method: 'PUT',
    data: { ...params },
  });
}

export async function addRole(params) {
  return request('/admin-api/role/add', {
    method: 'POST',
    data: { ...params },
  });
}

export async function updateRole(params) {
  return request('/admin-api/role/update', {
    method: 'PUT',
    data: { ...params },
  });
}
