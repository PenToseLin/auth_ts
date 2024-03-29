// import request from 'umi-request';
import request from '@/utils/request.axios';
import { TableListParams } from './data';

export async function queryAuthList(params: TableListParams) {
  return request(`/admin-api/manage/auth/list`, {
    params,
  });
}

export async function queryAuthByMenu(params) {
  return request(`/admin-api/manage/auth/query_by_menu`, {
    params,
  });
}

export async function disableAuth(params) {
  return request('/admin-api/manage/auth/disable', {
    method: 'PUT',
    data: { ...params },
  });
}

export async function enableAuth(params) {
  return request('/admin-api/manage/auth/enable', {
    method: 'PUT',
    data: { ...params },
  });
}

export async function removeAuth(params) {
  return request('/admin-api/manage/auth/remove', {
    method: 'DELETE',
    data: { ...params },
  });
}

export async function addAuth(params) {
  return request('/admin-api/manage/auth/add', {
    method: 'POST',
    data: { ...params },
  });
}

export async function updateAuth(params) {
  return request('/admin-api/manage/auth/update', {
    method: 'PUT',
    data: { ...params },
  });
}
