// import request from 'umi-request';
import request from '@/utils/request.axios';
import { TableListParams } from './data';

export async function queryMenuList(params: TableListParams) {
  return request(`/admin-api/manage/menu/list`, {
    params,
  });
}

export async function disableMenu(params) {
  return request('/admin-api/manage/menu/disable', {
    method: 'PUT',
    data: { ...params },
  });
}

export async function removeMenu(params) {
  return request('/admin-api/manage/menu/remove', {
    method: 'DELETE',
    data: { ...params },
  });
}

export async function enableMenu(params) {
  return request('/admin-api/manage/menu/enable', {
    method: 'PUT',
    data: { ...params },
  });
}

export async function addMenu(params) {
  return request('/admin-api/manage/menu/add', {
    method: 'POST',
    data: { ...params },
  });
}

export async function updateMenu(params) {
  return request('/admin-api/manage/menu/update', {
    method: 'PUT',
    data: { ...params },
  });
}
