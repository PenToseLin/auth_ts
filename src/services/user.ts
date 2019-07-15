import request from '@/utils/request';

export async function query(): Promise<any> {
  return request('/api/users');
}

export async function queryCurrent(params): Promise<any> {
  return request('/admin-api/current_user', {
    params,
  });
}

export async function queryNotices(): Promise<any> {
  return request('/api/notices');
}
