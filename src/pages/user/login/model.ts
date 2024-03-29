import { routerRedux } from 'dva/router';
import { getPageQuery, setAuthority } from './utils/utils';
import { fakeAccountLogin, getFakeCaptcha } from './service';
import { Reducer } from 'redux';
import { EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import { notification } from 'antd';
import { reloadAuthorized } from '@/utils/Authorized';
import { getAuthority } from '@/utils/authority';

export interface IStateType {
  status?: 'ok' | 'error';
  type?: string;
  currentAuthority?: 'user' | 'guest' | 'admin';
}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: IStateType) => T) => T },
) => void;

export interface ModelType {
  namespace: string;
  state: IStateType;
  effects: {
    login: Effect;
    getCaptcha: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<IStateType>;
  };
}

const Model: ModelType = {
  namespace: 'userLogin',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(fakeAccountLogin, payload);
      // Login successfully
      if (response.code === 200) {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            ...response.data,
            code: response.code,
            type: payload.type
          },
        });
        reloadAuthorized();
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params as { redirect: string };
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = redirect;
            return;
          }
        }
        yield put(routerRedux.replace(redirect || '/'));
      } else {
        notification.error({ message: response.msg });
      }
    },
    *getCaptcha({ payload }, { call }) {
      yield call(getFakeCaptcha, payload);
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.auth_list);
      localStorage.setItem('access_token', payload.access_token);
      localStorage.setItem('refresh_token', payload.refresh_token);
      return {
        ...state,
        status: payload.code === 200 ? 'ok' : 'error',
        type: payload.type,
      };
    },
  },
};

export default Model;
