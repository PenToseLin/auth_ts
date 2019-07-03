import request from 'umi-request';
import { TableListParams } from './data';

export async function queryAuthList(params: TableListParams) {
  return request(`/admin-api/auth/list`, {
    params,
  });
}

export async function disableAuth(params) {
  return request('/admin-api/auth/disable', {
    method: 'DELETE',
    data: { ...params },
  });
}

export async function enableAuth(params) {
  return request('/admin-api/auth/enable', {
    method: 'PUT',
    data: { ...params },
  });
}

export async function addAuth(params) {
  return request('/admin-api/auth/add', {
    method: 'POST',
    data: { ...params },
  });
}

export async function updateAuth(params) {
  return request('/admin-api/auth/update', {
    method: 'PUT',
    data: { ...params },
  });
}
