import { query as queryUsers, queryCurrent } from '@/services/user';
import { Effect } from 'dva';
import { Reducer } from 'redux';
import { notification } from 'antd';
import { setAuthority } from '@/pages/user/login/utils/utils';

export interface CurrentUser {
  avatar?: string;
  username?: string;
  title?: string;
  group?: string;
  signature?: string;
  geographic?: any;
  tags?: {
    key: string;
    label: string;
  }[];
  unreadCount?: number;
}

export interface UserModelState {
  currentUser?: CurrentUser;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetch: Effect;
    fetchCurrent: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
    changeNotifyCount: Reducer<UserModelState>;
  };
}

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: {},
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent({ payload }, { call, put }) {
      const response = yield call(queryCurrent, payload);
      if (response.code === 200) {
        yield put({
          type: 'saveCurrentUser',
          payload: response.data,
        });
      } else {
        notification.error({ message: response.msg });
      }
    },
  },

  reducers: {
    saveCurrentUser(state, { payload }) {
      setAuthority(payload.auth_list)
      return {
        ...state,
        currentUser: payload.user_info || {},
      };
    },
    changeNotifyCount(
      state = {
        currentUser: {},
      },
      action,
    ) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};

export default UserModel;
