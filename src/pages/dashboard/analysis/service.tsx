// import request from 'umi-request';
import request from '@/utils/request.axios';

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}
