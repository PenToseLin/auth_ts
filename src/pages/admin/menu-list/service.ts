import request from 'umi-request';
import { TableListParams } from './data';

export async function queryMenuList(params: TableListParams) {
  return request(`/admin-api/menu/list`, {
    params,
  });
}

export async function disableMenu(params) {
  return request('/admin-api/user/disable', {
    method: 'DELETE',
    data: { ...params },
  });
}

export async function enableMenu(params) {
  return request('/admin-api/user/enable', {
    method: 'PUT',
    data: { ...params },
  });
}

export async function addMenu(params) {
  return request('/admin-api/menu/add', {
    method: 'POST',
    data: { ...params },
  });
}

export async function updateMenu(params) {
  return request('/admin-api/user/update', {
    method: 'PUT',
    data: { ...params },
  });
}
