import React, { Component, Fragment, ReactHTML } from 'react';
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
  Badge,
  Divider,
  Popconfirm,
  notification,
  Modal,
} from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { SorterResult } from 'antd/es/table';
import StandardTable, { StandardTableColumnProps } from './components/StandardTable';
import { TableListItem, TableListParams, TableListPagination } from './data';
import { TableListItem as RoleItemType } from '@/pages/admin/role-list/data'
import { Dispatch } from 'redux';
import { IStateType } from './model';
import styles from './style.less';
import UpdateForm, { UpdateValsType } from './components/UpdateForm';
import CreateForm from './components/CreateForm';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { fromatRangeDate } from '@/utils/utils';
import Authorized from '@/components/Authorized/Authorized';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const getValue = (obj: { [x: string]: string[] }) =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

type IStatusMapType = 'error' | 'processing';
const statusMap = ['error', 'success'];
const status = ['禁用', '启用']

interface TableListProps extends FormComponentProps {
  dispatch: Dispatch<any>;
  loading: boolean;
  userManage: IStateType;
}

interface TableListState {
  modalVisible: boolean;
  updateModalVisible: boolean;
  expandForm: boolean;
  selectedRows: Array<TableListItem>;
  formValues: Partial<TableListParams>;
  stepFormValues: Partial<TableListItem>;
  roleList: Array<RoleItemType>;
  targetKeys: string[];
}

/* eslint react/no-multi-comp:0 */
@connect(
  ({
    userManage,
    loading,
  }: {
    userManage: IStateType;
    loading: {
      models: {
        [key: string]: boolean;
      };
    };
  }) => ({
    userManage,
    loading: loading.models.admin,
  }),
)
class TableList extends Component<TableListProps, TableListState> {
  state: TableListState = {
    modalVisible: false,
    updateModalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    stepFormValues: {},
    roleList: [],
    targetKeys: [],
  };

  columns: StandardTableColumnProps[] = [
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '手机号码',
      dataIndex: 'mobile',
    },
    {
      title: '角色',
      dataIndex: 'roles',
      render(roles:[]) {
        return (
          roles.map((item: RoleItemType) => <li key={item.id}>{item.role_name}</li>)
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      filters: [
        {
          text: status[0],
          value: '0',
        },
        {
          text: status[1],
          value: '1',
        },
      ],
      render(val: IStatusMapType) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '最后登录时间',
      dataIndex: 'last_login',
      sorter: true,
      render: (val: string) => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
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
          <Authorized authority="admin:manage:user:update">
            <a onClick={() => this.handleUpdateModalVisible(true, record)}>修改</a>
          </Authorized>
          <Divider type="vertical" />
          
          <Authorized authority="admin:manage:user:disable">
            {record.status === 1 &&
              <Popconfirm
                title="确认禁用该用户?"
                onConfirm={() => this.handleDisable(record)}
                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
              >
                <a style={{ color: 'red' }}>禁用</a>
              </Popconfirm>
            }
          </Authorized>

          <Authorized authority="admin:manage:user:enable">
            {record.status === 0 &&
              <Popconfirm
                title="确认启用该用户?"
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
      type: 'userManage/list',
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
      type: 'userManage/list',
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
      type: 'userManage/list',
      payload: {
        pageNo: 1,
        pageSize: 10
      },
    });
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  handleDisable = (record) => {
    const { dispatch } = this.props;
    const { pagination } = this.props.userManage.data;
    const { formValues } = this.state;
    dispatch({
      type: 'userManage/disable',
      payload: {
        id: record.id,
      },
      callback: (response) => {
        if (response.code === 200) {
          dispatch({
            type: 'userManage/list',
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
    const { dispatch, userManage:{data:{pagination}} } = this.props;
    const { formValues } = this.state;
    dispatch({
      type: 'userManage/enable',
      payload: {
        id: record.id,
      },
      callback: (response) => {
        if (response.code === 200) {
          dispatch({
            type: 'userManage/list',
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
      username: valueObj.search_username,
      mobile: valueObj.search_mobile,
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
      type: 'userManage/list',
      payload: values,
    });
  };

  handleModalVisible = (flag?: boolean) => {
    const { dispatch } = this.props;
    if (flag) {
      dispatch({
        type: 'userManage/queryRoles',
        callback: (res) => {
          this.setState({ roleList: res.data });
          this.setState({
            modalVisible: !!flag,
          });
        }
      });
    } else {
      this.setState({
        modalVisible: !!flag,
        roleList: [],
        targetKeys: [],
      });
    }
  };

  handleUpdateModalVisible = (flag?: boolean, record?: UpdateValsType) => {
    const { dispatch } = this.props;
    if (flag) {
      let keys:string[] = []
      if (record && record.roles) keys = record.roles.map(item => `${item.id}`)
      dispatch({
        type: 'userManage/queryRoles',
        callback: (res) => {
          this.setState({
            updateModalVisible: !!flag,
            stepFormValues: record || {},
            roleList: res.data,
            targetKeys: keys,
          });
        }
      });
    } else {
      this.setState({
        updateModalVisible: !!flag,
        stepFormValues: record || {},
        roleList: [],
        targetKeys: [],
      });
    }
  };

  handleAdd = (fields, createForm) => {
    const { dispatch } = this.props;
    const { pagination } = this.props.userManage.data;
    dispatch({
      type: 'userManage/add',
      payload: {...fields},
      callback: (response) => {
        message.success("添加成功");
        this.handleModalVisible();
        createForm.resetFields();
        dispatch({
          type: 'userManage/list',
          payload: {...pagination},
        });
      }
    });

  };

  handleUpdate = (fields: UpdateValsType, createForm) => {
    const { dispatch } = this.props;
    const { pagination } = this.props.userManage.data;
    dispatch({
      type: 'userManage/update',
      payload: {...fields},
      callback: (response) => {
        if (response.code === 200) {
          message.success("修改成功");
          this.handleUpdateModalVisible();
          createForm.resetFields();
          dispatch({
            type: 'userManage/list',
            payload: {...pagination},
          });
        } else {
          message.error(response.msg);
        }
      }
    });
  };

  handleRemove = (e: React.FormEvent) => {
    e.preventDefault();
    const { dispatch, userManage:{data:{pagination}}} = this.props;
    const { selectedRows, formValues } = this.state;
    const namesStr = selectedRows.map(item => item.username).join('、')
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
            description: '没有选择任何用户'
          })
          return;
        }
        dispatch({
          type: 'userManage/remove',
          payload: { id_list },
          callback: () => {
            dispatch({
              type: 'userManage/list',
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

  renderSimpleForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="用户名称">
              {getFieldDecorator('search_username')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="手机号码">
              {getFieldDecorator('search_mobile')(<Input placeholder="请输入" />)}
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
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="用户名称">
              {getFieldDecorator('search_username')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="手机号码">
              {getFieldDecorator('search_mobile')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="创建时间">
                {getFieldDecorator('create_time')(
                  <RangePicker style={{ width: '100%' }} showTime />,
                )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={12} sm={24}>
            <FormItem label="更新时间">
              {getFieldDecorator('update_time')(
                <RangePicker style={{ width: '100%' }} showTime />,
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="最后登录时间">
              {getFieldDecorator('last_login')(
                <RangePicker style={{ width: '100%' }} showTime />,
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up" />
            </a>
          </div>
        </div>
      </Form>
    );
  }

  renderForm() {
    const { expandForm } = this.state;
    return expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
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

  handleTargetKeys = (targetKeys) => {
    this.setState({ targetKeys });
  };

  render() {
    const {
      userManage: { data },
      loading,
      form,
    } = this.props;

    const {
      selectedRows,
      modalVisible,
      updateModalVisible,
      stepFormValues,
      roleList,
      targetKeys
    } = this.state;

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
      checkPassword: this.checkPassword,
      handleTargetKeys: this.handleTargetKeys,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
      checkPassword: this.checkPassword,
      handleTargetKeys: this.handleTargetKeys,
    };
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Authorized authority="admin:manage:user:add">
                <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                  新建
                </Button>
              </Authorized>
              <Authorized authority="admin:manage:user:delete">
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
        <CreateForm {...parentMethods} modalVisible={modalVisible} roleList={roleList} targetKeys={targetKeys} form={form} />
        {stepFormValues && Object.keys(stepFormValues).length ? (
          <UpdateForm
            {...updateMethods}
            roleList={roleList}
            targetKeys={targetKeys}
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
