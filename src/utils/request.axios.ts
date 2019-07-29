/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import axios from 'axios';
import { notification } from 'antd';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '未登录或登录信息过期',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  405: '无效的请求方法',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 * 异常处理程序
 */
const errorHandler = (response) => {
  const { status } = response;
  const errortext = codeMessage[response.status] || response.statusText;
  // 若401并且有刷新token则请求重新刷新token后再次调用之前的请求

  notification.error({
    message: `请求错误 ${status}`,
    description: errortext,
  });

  return response;
};

/**
 * 刷新token处理
 */
const handleRefresh = async (url, config) => {
  if (localStorage.getItem('refresh_token')) {
    const res = await request('/admin-api/refresh_access', {
      headers: {
        'refresh_token': `${localStorage.getItem('refresh_token')}`,
      },
      method: 'POST',
    })
    if (res.code === 200) {
      localStorage.setItem('access_token', res.data.access_token);
      const response = await axios(url, config);
      return response;
    } else {
      localStorage.removeItem('antd-pro-authority');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      location.href = '/user/login';
      return;
    }

  } else {
    localStorage.removeItem('antd-pro-authority');
    localStorage.removeItem('access_token');
    location.href = '/user/login';
    return;
  }
}

/**
 * 配置request请求时的默认参数
 */
const request = (url, config={}) => axios(url, config).catch(async error => {
  const { response } = error;
  const { status } = response;
  if (status === 401) {
    const newResponse = await handleRefresh(url, config);
    if ( newResponse ) return newResponse;
  } else {
    return errorHandler(response);
  }
});


/**
 * 添加token
 */
axios.interceptors.request.use((config) => {

  if ( config.headers && localStorage.getItem('access_token')) {
    if (!config.headers['refresh_token']) {
      config.headers['access_token'] = localStorage.getItem('access_token');
    } else {
      config.headers['access_token'] = config.headers['refresh_token'];
      delete config.headers['refresh_token'];
    }
  }

  return config;
});

/**
 * 返回错误处理程序
 */
axios.interceptors.response.use(async (response) => {
  const { data } = response;
  if (data.code && data.code !== 200) {
    notification.error({
      message: `提示`,
      description: data.msg,
    });
  }
  return response.data;
});

export default request;
