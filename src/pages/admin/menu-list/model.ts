import { queryMenuList, disableMenu, addMenu, updateMenu, enableMenu, removeMenu } from './service';
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
    remove: Effect;
    update: Effect;
  };
  reducers: {
    save: Reducer<IStateType>;
  };
}

const Model: ModelType = {
  namespace: 'menu',

  state: {
    data: {
      list: [],
      pagination: {},
    }
  },

  effects: {
    *list({ payload }, { call, put }) {
      const response = yield call(queryMenuList, payload);
      if (response.code === 200) {
        yield put({
          type: 'save',
          payload: response.data,
        });
      }
    },
    *add({ payload, callback }, { call }) {
      const response = yield call(addMenu, payload);
      if (response.code === 200) {
        if (callback) callback(response);
      } else {
        notification.error({ message: response.msg });
      }
    },
    *update({ payload, callback }, { call }) {
      const response = yield call(updateMenu, payload);
      if (response.code === 200) {
        if (callback) callback(response);
      } else {
        notification.error({ message: response.msg });
      }
    },
    *disable({ payload, callback }, { call }) {
      const response = yield call(disableMenu, payload);
      if (response.code === 200) {
        if (callback) callback(response);
      } else {
        notification.error({ message: response.msg });
      }
    },
    *enable({ payload, callback }, { call }) {
      const response = yield call(enableMenu, payload);
      if (response.code === 200) {
        if (callback) callback(response);
      } else {
        notification.error({ message: response.msg });
      }
    },
    *remove({ payload, callback }, { call }) {
      const response = yield call(removeMenu, payload);
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
