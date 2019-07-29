/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { notification } from 'antd';

interface ResponseError<D = any> extends Error {
  name: string;
  data: D;
  response: Response;
}

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
const errorHandler = (error: ResponseError) => {
  const { response = {} as Response  } = error;
  const errortext = codeMessage[response.status] || response.statusText;
  const { status } = response;
  // 若401并且有刷新token则请求重新刷新token后再次调用之前的请求
  if ( status === 401 ) {
    return response;
    // if (localStorage.getItem('refresh_token')) {
    //   request('/admin-api/refresh_access', {
    //     headers: {
    //       'access_token': `${localStorage.getItem('refresh_token')}`,
    //     },
    //     method: 'POST',
    //   }).then(res => {
    //     if (res.code === 200) {
    //       localStorage.setItem('access_token', res.data.access_token);
    //       // return request(response.url);
    //     } else {
    //       localStorage.removeItem('antd-pro-authority');
    //       localStorage.removeItem('access_token');
    //       location.href = '/user/login';
    //     }
    //   });
    // } else {
    //   localStorage.removeItem('antd-pro-authority');
    //   localStorage.removeItem('access_token');
    //   location.href = '/user/login';
    // }
  }

  notification.error({
    message: `请求错误 ${status}`,
    description: errortext,
  });

  return response;
};

/**
 * 配置request请求时的默认参数
 */
const handleRefresh = async (url, options) => {
  if (localStorage.getItem('refresh_token')) {
    const res = await request('/admin-api/refresh_access', {
      headers: {
        'refresh_token': `${localStorage.getItem('refresh_token')}`,
      },
      method: 'POST',
    })

    if (res.code === 200) {
      localStorage.setItem('access_token', res.data.access_token);
      const response = await request(url, options);
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
const request = extend({
  errorHandler, // 默认错误处理
  // credentials: 'omit', // 默认请求是否带上cookie
});

request.interceptors.request.use((url, options) => {

  if ( options.headers && localStorage.getItem('access_token')) {
    if (!options.headers['refresh_token']) {
      options.headers['access_token'] = localStorage.getItem('access_token');
    } else {
      options.headers['access_token'] = options.headers['refresh_token'];
      delete options.headers['refresh_token'];
    }
  }

  return (
    {
      url: `${url}`,
      options: {
        ...options,
        interceptors: true,
      },
    }
  );
});

/**
 * 返回错误处理程序
 */
request.interceptors.response.use(async (response, options) => {
  const data = await response.clone().json();
  const { status, url } = response;
  console.log(status)
  if ( status === 401 ) {
    const newResponse = await handleRefresh(url, options);
    if (newResponse) response = newResponse;
    console.log('newResponse from await: ', response);
  } else {
    if (data.code && data.code !== 200) {
      notification.error({
        message: `提示`,
        description: data.msg,
      });
    }
  }
  console.log('newResponse from use: ', response);
  return response;
});

export default request;
