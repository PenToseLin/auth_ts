import { queryRoleList, disableRole, addRole, updateRole, enableRole, queryAuth, removeRole } from './service';
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
    queryAuth: Effect;
  };
  reducers: {
    save: Reducer<IStateType>;
  };
}

const Model: ModelType = {
  namespace: 'role',

  state: {
    data: {
      list: [],
      pagination: {},
    }
  },

  effects: {
    *list({ payload }, { call, put }) {
      try {
        const response = yield call(queryRoleList, payload);
        if (response.code === 200) {
          yield put({
            type: 'save',
            payload: response.data,
          });
        } else {
          yield put({ type: 'save' });
          notification.error({ message: response.msg });
        }
      } catch (error) {
        yield put({ type: 'save' });
      }

    },
    *add({ payload, callback }, { call }) {
      const response = yield call(addRole, payload);
      if (callback) callback(response);
    },
    *disable({ payload, callback }, { call }) {
      const response = yield call(disableRole, payload);
      if (callback) callback(response);
    },
    *enable({ payload, callback }, { call }) {
      const response = yield call(enableRole, payload);
      if (callback) callback(response);
    },
    *remove({ payload, callback }, { call }) {
      const response = yield call(removeRole, payload);
      if (response.code === 200) {
        if (callback) callback(response);
      } else {
        notification.error({ message: response.msg });
      }
    },
    *update({ payload, callback }, { call }) {
      const response = yield call(updateRole, payload);
      if (callback) callback(response);
    },
    *queryAuth({ payload, callback }, { call }) {
      const response = yield call(queryAuth, payload);
      if (response.code === 200) {
        if (callback) callback(response);
      } else {
        notification.error({ message: response.msg });
      }
    },
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
