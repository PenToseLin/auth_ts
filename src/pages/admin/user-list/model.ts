import {
  queryUserList,
  disableUser,
  addUser,
  updateUser,
  enableUser,
  removeUsers,
  queryRoles
} from './service';
import { TableListDate } from './data';
import { Reducer } from 'redux';
import { EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import { notification } from 'antd';

export interface IStateType {
  data: TableListDate;
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
    remove: Effect;
    queryRoles: Effect;
  };
  reducers: {
    save: Reducer<IStateType>;
  };
}

const Model: ModelType = {
  namespace: 'userManage',

  state: {
    data: {
      list: [],
      pagination: {},
    }
  },

  effects: {
    *list({ payload }, { call, put }) {
      const response = yield call(queryUserList, payload);
      if (response.code && response.code === 200) {
        yield put({
          type: 'save',
          payload: response.data,
        });
      }
    },
    *add({ payload, callback }, { call }) {
      const response = yield call(addUser, payload);
      if (response.code && response.code === 200) {
        if (callback) callback(response);
      }
    },
    *update({ payload, callback }, { call }) {
      const response = yield call(updateUser, payload);
      if (callback) callback(response);
    },
    *disable({ payload, callback }, { call }) {
      const response = yield call(disableUser, payload);
      if (callback) callback(response);
    },
    *enable({ payload, callback }, { call }) {
      const response = yield call(enableUser, payload);
      if (callback) callback(response);
    },
    *remove({ payload, callback }, { call }) {
      const response = yield call(removeUsers, payload);
      if (callback) callback(response);
    },
    *queryRoles({ payload, callback }, { call }) {
      const response = yield call(queryRoles, payload);
      if (callback) callback(response);
    }
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    }
  },
};

export default Model;
