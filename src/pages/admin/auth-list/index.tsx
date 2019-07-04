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
  Tooltip,
} from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { SorterResult } from 'antd/es/table';
import StandardTable, { StandardTableColumnProps } from './components/StandardTable';
import { TableListItem, TableListParams, TableListPagination } from './data';
import { Dispatch } from 'redux';
import { IStateType as AuthType } from './model';
import styles from './style.less';
import UpdateForm, { UpdateValsType } from './components/UpdateForm';
import CreateForm from './components/CreateForm';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { fromatRangeDate } from '@/utils/utils';
import LinesEllipsis from 'react-lines-ellipsis';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const getValue = (obj: { [x: string]: string[] }) =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

interface TableListProps extends FormComponentProps {
  dispatch: Dispatch<any>;
  loading: boolean;
  auth: AuthType;
}

interface TableListState {
  modalVisible: boolean;
  updateModalVisible: boolean;
  expandForm: boolean;
  selectedRows: Array<TableListItem>;
  formValues: Partial<TableListParams>;
  stepFormValues: Partial<TableListItem>;
  authByMenuList: Array<TableListItem>;
}

/* eslint react/no-multi-comp:0 */
@connect(
  ({
    auth,
    loading,
  }: {
    auth: AuthType;
    loading: {
      models: {
        [key: string]: boolean;
      };
    };
  }) => ({
    auth,
    loading: loading.models.auth,
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
    authByMenuList: [],
  };

  columns: StandardTableColumnProps[] = [
    {
      title: '权限名称',
      width: 200,
      dataIndex: 'auth_name',
    },
    {
      title: '描述',
      dataIndex: 'depict',
      width: 200,
      render: (val: string) => {
        return (
          <Tooltip placement="top" title={val}>
            <LinesEllipsis text={val} maxLine={2} ellipsis='...' />
          </Tooltip>
        );
      }
    },
    {
      title: '方法',
      dataIndex: 'method',
    },
    {
      title: '权限路径',
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
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.handleUpdateModalVisible(true, record)}>修改</a>
          <Divider type="vertical" />
          <Popconfirm
            title="确认删除该菜单?"
            onConfirm={() => this.handleDisable(record)}
            icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
          >
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'auth/list',
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
      type: 'auth/list',
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
      type: 'auth/list',
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
    const { pagination } = this.props.auth.data;
    const { formValues } = this.state;
    dispatch({
      type: 'auth/disable',
      payload: {
        id: record.id,
      },
      callback: (response) => {
        if (response.code === 200) {
          dispatch({
            type: 'auth/list',
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
    const { pagination } = this.props.auth.data;
    const { formValues } = this.state;
    dispatch({
      type: 'auth/enable',
      payload: {
        id: record.id,
      },
      callback: (response) => {
        if (response.code === 200) {
          dispatch({
            type: 'auth/list',
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
      type: 'auth/list',
      payload: values,
    });
  };

  handleModalVisible = (flag?: boolean) => {
    const { dispatch } = this.props;
    if (flag) {
      dispatch({
        type: 'auth/allMenu',
        payload: {
          pageNo: 1,
          pageSize: 10
        },
        callback: (res) => {
          this.setState({
            modalVisible: !!flag,
          });
        }
      });
    } else {
      this.setState({
        authByMenuList: [],
        modalVisible: !!flag,
      });
    }
  };

  handleUpdateModalVisible = (flag?: boolean, record?: UpdateValsType) => {
    const { dispatch } = this.props;
    if (flag) {
      dispatch({
        type: 'auth/allMenu',
        payload: {
          pageNo: 1,
          pageSize: 10
        },
        callback: (res) => {
          if (record) this.handleQueryByMenu(record.menu_id)
          this.setState({
            updateModalVisible: !!flag,
            stepFormValues: record || {},
          });
        }
      });
    } else {
      this.setState({
        authByMenuList: [],
        updateModalVisible: !!flag,
        stepFormValues: record || {},
      });
    }

  };

  handleAdd = (fields, createForm) => {
    const { dispatch } = this.props;
    const { pagination } = this.props.auth.data;
    dispatch({
      type: 'auth/add',
      payload: {...fields},
      callback: (response) => {
        if (response.code === 200) {
          message.success("添加成功");
          this.handleModalVisible();
          createForm.resetFields();
          dispatch({
            type: 'auth/list',
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
    const { pagination } = this.props.auth.data;
    dispatch({
      type: 'auth/update',
      payload: {...fields},
      callback: (response) => {
        if (response.code === 200) {
          message.success("修改成功");
          this.handleUpdateModalVisible();
          createForm.resetFields();
          dispatch({
            type: 'auth/list',
            payload: {...pagination},
          });
        } else {
          message.error(response.msg);
        }
      }
    });
  };

  handleQueryByMenu = (menuId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'auth/queryByMenu',
      payload: { menu_id: menuId },
      callback: res => {
        this.setState({
          authByMenuList: res.data
        })
      }
    })
  }

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

  render() {
    const {
      auth: { data, menuList },
      loading,
      form
    } = this.props;

    const { selectedRows, modalVisible, updateModalVisible, stepFormValues, authByMenuList } = this.state;

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
      handleQueryByMenu: this.handleQueryByMenu,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
      handleQueryByMenu: this.handleQueryByMenu,
    };
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新建
              </Button>
              {selectedRows.length > 0 && (
                <span>
                  <Button>批量操作</Button>
                </span>
              )}
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
        <CreateForm
          {...parentMethods}
          menuList={menuList}
          authByMenuList={ authByMenuList }
          modalVisible={modalVisible}
          form={form}
        />
        {stepFormValues && Object.keys(stepFormValues).length ? (
          <UpdateForm
            {...updateMethods}
            menuList={menuList}
            authByMenuList={ authByMenuList }
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
