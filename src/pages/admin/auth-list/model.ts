import { queryAuthList, disableAuth, addAuth, updateAuth, enableAuth, queryAuthByMenu } from './service';
import { queryMenuList } from '@/pages/admin/menu-list/service';
import { TableListItem as menuItemType } from '@/pages/admin/menu-list/data'
import { TableListDate } from './data';
import { Reducer } from 'redux';
import { EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import { notification } from 'antd';

export interface IStateType {
  data: TableListDate;
  menuList: menuItemType[];
}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: IStateType) => T) => T },
) => void;

export interface ModelType {
  namespace: string;
  state: IStateType;
  effects: {
    list: Effect;
    add: Effect;
    disable: Effect;
    enable: Effect;
    update: Effect;
    allMenu: Effect;
    queryByMenu: Effect;
  };
  reducers: {
    saveAuth: Reducer<IStateType>;
    saveMenu: Reducer<IStateType>;
  };
}

const Model: ModelType = {
  namespace: 'auth',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    menuList: [],
  },

  effects: {
    *list({ payload }, { call, put }) {
      try {
        const response = yield call(queryAuthList, payload);
        if (response.code === 200) {
          yield put({
            type: 'saveAuth',
            payload: response.data,
          });
        } else {
          notification.error({ message: response.msg });
        }
      } catch (error) {
        yield put({
          type: 'save',
          payload: {
            list: [],
            pagination: {}
          },
        });
      }
    },
    *queryByMenu({ payload, callback }, { call }){
      const response = yield call(queryAuthByMenu, payload)
      if (response.code === 200) {
        if (callback) callback(response)
      } else {
        notification.error({ message: response.msg });
      }
    },
    *add({ payload, callback }, { call }) {
      const response = yield call(addAuth, payload);
      if (callback) callback(response);
    },
    *disable({ payload, callback }, { call }) {
      const response = yield call(disableAuth, payload);
      if (callback) callback(response);
    },
    *enable({ payload, callback }, { call }) {
      const response = yield call(enableAuth, payload);
      if (callback) callback(response);
    },
    *update({ payload, callback }, { call }) {
      const response = yield call(updateAuth, payload);
      if (callback) callback(response);
    },
    *allMenu({ payload, callback }, { put, call }) {
      const response = yield call(queryMenuList, payload);
      if (response.code === 200) {
        console.log('response.code: ', response.code);
        yield put({
          type: 'saveMenu',
          payload: response.data.list,
        });
      } else {
        notification.error({ message: response.msg });
      }
      if (callback) callback(response);
    }
  },

  reducers: {
    saveAuth(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    saveMenu(state, action) {
      return {
        ...state,
        menuList: action.payload,
      };
    },
  },
};

export default Model;
