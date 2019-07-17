import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Icon,
  Button,
  DatePicker,
  message,
  Divider,
  Popconfirm,
  Modal,
  notification,
} from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { SorterResult } from 'antd/es/table';
import StandardTable, { StandardTableColumnProps } from './components/StandardTable';
import { TableListItem, TableListParams, TableListPagination } from './data';
import { Dispatch } from 'redux';
import { IStateType } from './model';
import styles from './style.less';
import UpdateForm, { UpdateValsType } from './components/UpdateForm';
import CreateForm from './components/CreateForm';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { fromatRangeDate } from '@/utils/utils';
import Authorized from '@/components/Authorized/Authorized';

const FormItem = Form.Item;
const getValue = (obj: { [x: string]: string[] }) =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

interface TableListProps extends FormComponentProps {
  dispatch: Dispatch<any>;
  loading: boolean;
  menu: IStateType;
}

interface TableListState {
  modalVisible: boolean;
  updateModalVisible: boolean;
  selectedRows: Array<TableListItem>;
  formValues: Partial<TableListParams>;
  stepFormValues: Partial<TableListItem>;
}

/* eslint react/no-multi-comp:0 */
@connect(
  ({
    menu,
    loading,
  }: {
    menu: IStateType;
    loading: {
      models: {
        [key: string]: boolean;
      };
    };
  }) => ({
    menu,
    loading: loading.models.menu,
  }),
)
class TableList extends Component<TableListProps, TableListState> {
  state: TableListState = {
    modalVisible: false,
    updateModalVisible: false,
    selectedRows: [],
    formValues: {},
    stepFormValues: {},
  };

  columns: StandardTableColumnProps[] = [
    {
      title: '菜单名称',
      dataIndex: 'menu_name',
    },
    {
      title: '菜单路径',
      dataIndex: 'url',
    },
    {
      title: '序号',
      dataIndex: 'queue',
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      sorter: true,
      render: (val: string) => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      sorter: true,
      render: (val: string) => {
        return (<span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>);
      },
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <Authorized authority="admin:menu:update">
            <a onClick={() => this.handleUpdateModalVisible(true, record)}>修改</a>
            <Divider type="vertical" />
            {record.status === 1 &&
              <Popconfirm
                title="确认禁用该菜单?"
                onConfirm={() => this.handleDisable(record)}
                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
              >
                <a style={{ color: 'red' }}>禁用</a>
              </Popconfirm>
            }
            {record.status === 0 &&
              <Popconfirm
                title="确认启用该菜单?"
                onConfirm={() => this.handleEnable(record)}
                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
              >
                <a style={{ color: 'green' }}>启用</a>
              </Popconfirm>
            }
          </Authorized>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'menu/list',
      payload: {
        pageNo: 1,
        pageSize: 10
      }
    });
  }

  handleStandardTableChange = (
    pagination: Partial<TableListPagination>,
    filtersArg: Record<keyof TableListItem, string[]>,
    sorter: SorterResult<TableListItem>,
  ) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;
    // 获取table筛选数据
    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params: Partial<TableListParams> = {
      ...formValues,
      ...filters,
    };

    // 是否有排序，若没有排序则取消排序
    if (sorter.field) {
      params.sorter = `${sorter.field}~${sorter.order}`;
      params.sorter = params.sorter.substring(0, params.sorter.indexOf('end'));
    } else if (params.sorter) {
      delete params.sorter;
    }
    // 记录table的搜索、筛选、排序数据
    this.setState({
      formValues: params
    })

    dispatch({
      type: 'menu/list',
      payload: {
        ...params,
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
      },
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'menu/list',
      payload: {
        pageNo: 1,
        pageSize: 10
      },
    });
  };

  handleDisable = (record) => {
    const { dispatch } = this.props;
    const { pagination } = this.props.menu.data;
    const { formValues } = this.state;
    dispatch({
      type: 'menu/disable',
      payload: {
        id: record.id,
      },
      callback: (response) => {
        if (response.code === 200) {
          dispatch({
            type: 'menu/list',
            payload: {...pagination, ...formValues}
          })
          this.setState({
            selectedRows: [],
          });
        } else {
          message.error(response.msg);
        }
      },
    });
  };

  handleEnable = (record) => {
    const { dispatch } = this.props;
    const { pagination } = this.props.menu.data;
    const { formValues } = this.state;
    dispatch({
      type: 'menu/enable',
      payload: {
        id: record.id,
      },
      callback: (response) => {
        if (response.code === 200) {
          dispatch({
            type: 'menu/list',
            payload: {...pagination,...formValues}
          })
          this.setState({
            selectedRows: [],
          });
        } else {
          message.error(response.msg);
        }
      },
    });
  };

  handleRemove = (e: React.FormEvent) => {
    e.preventDefault();
    const { dispatch, menu:{data:{pagination}}} = this.props;
    const { selectedRows, formValues } = this.state;
    const namesStr = selectedRows.map(item => item.menu_name).join('、')
    Modal.confirm({
      title: '提示',
      content: `是否删除${namesStr}`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const id_list = selectedRows.map(item => item.id)
        if (id_list.length === 0) {
          notification.warning({
            message: '提示',
            description: '没有选择任何菜单'
          })
          return;
        }
        dispatch({
          type: 'menu/remove',
          payload: { id_list },
          callback: () => {
            dispatch({
              type: 'menu/list',
              payload: {...pagination, ...formValues}
            })
            this.setState({
              selectedRows: [],
            });
          }
        })
      }
    });
  };

  handleSelectRows = (rows: TableListItem[]) => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const { dispatch, form } = this.props;
    const valueObj = form.getFieldsValue();
    const values:{ [key: string]: string } = {
      menu_name: valueObj.search_menu_name,
    };

    if (valueObj.update_time && valueObj.update_time.length) {
      values.update_time = fromatRangeDate(valueObj.update_time.valueOf())
    }
    if (valueObj.create_time && valueObj.create_time.length) {
      values.create_time = fromatRangeDate(valueObj.create_time.valueOf())
    }
    if (valueObj.last_login && valueObj.last_login.length) {
      values.last_login = fromatRangeDate(valueObj.last_login.valueOf())
    }

    this.setState({
      formValues: values,
    });

    dispatch({
      type: 'menu/list',
      payload: values,
    });
  };

  handleModalVisible = (flag?: boolean) => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleUpdateModalVisible = (flag?: boolean, record?: UpdateValsType) => {
    this.setState({
      updateModalVisible: !!flag,
      stepFormValues: record || {},
    });
  };

  handleAdd = (fields, createForm) => {
    const { dispatch } = this.props;
    const { pagination } = this.props.menu.data;
    dispatch({
      type: 'menu/add',
      payload: {...fields},
      callback: (response) => {
        if (response.code === 200) {
          message.success("添加成功");
          this.handleModalVisible();
          createForm.resetFields();
          dispatch({
            type: 'menu/list',
            payload: {...pagination},
          });
        } else {
          message.error(response.msg);
        }
      }
    });

  };

  handleUpdate = (fields: UpdateValsType, createForm) => {
    const { dispatch } = this.props;
    const { pagination } = this.props.menu.data;
    dispatch({
      type: 'menu/update',
      payload: {...fields},
      callback: (response) => {
        if (response.code === 200) {
          message.success("修改成功");
          this.handleUpdateModalVisible();
          createForm.resetFields();
          dispatch({
            type: 'menu/list',
            payload: {...pagination},
          });
        } else {
          message.error(response.msg);
        }
      }
    });
  };

  renderSimpleForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="菜单名称">
              {getFieldDecorator('search_menu_name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderForm() {
    return this.renderSimpleForm();
  }

  checkPassword = (rule, value, callback) => {
    const { form } = this.props;
    const password = form.getFieldValue('password');
    if (value !== password) {
      callback('两次输入密码不一致！');
    } else {
      callback();
    }
  };

  render() {
    const {
      menu: { data },
      loading,
      form,
    } = this.props;

    const { selectedRows, modalVisible, updateModalVisible, stepFormValues } = this.state;

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
      checkPassword: this.checkPassword,
    };
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Authorized authority="admin:menu:add">
                <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                  新建
                </Button>
              </Authorized>
              <Authorized authority="admin:menu:delete">
                {selectedRows.length > 0 && (
                  <span>
                    <Button onClick={this.handleRemove} icon="delete" type="danger">删除</Button>
                  </span>
                )}
              </Authorized>
            </div>
            <StandardTable
              rowKey="id"
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <CreateForm {...parentMethods} list={data.list} modalVisible={modalVisible} form={form} />
        {stepFormValues && Object.keys(stepFormValues).length ? (
          <UpdateForm
            {...updateMethods}
            list={data.list}
            updateModalVisible={updateModalVisible}
            values={stepFormValues}
            form={form}
          />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default Form.create<TableListProps>()(TableList);
