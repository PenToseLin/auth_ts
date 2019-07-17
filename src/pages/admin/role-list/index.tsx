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
  message,
  Badge,
  Divider,
  Popconfirm,
  Tooltip,
  notification,
  Modal,
} from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { SorterResult } from 'antd/es/table';
import StandardTable, { StandardTableColumnProps } from './components/StandardTable';
import { TableListItem, TableListParams, TableListPagination } from './data';
import { TableListItem as AuthItemType } from '@/pages/admin/auth-list/data';
import { Dispatch } from 'redux';
import { IStateType } from './model';
import styles from './style.less';
import UpdateForm, { UpdateValsType } from './components/UpdateForm';
import CreateForm from './components/CreateForm';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import LinesEllipsis from 'react-lines-ellipsis';
import Authorized from '@/components/Authorized/Authorized';

const FormItem = Form.Item;
const getValue = (obj: { [x: string]: string[] }) =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

type IStatusMapType = 'error' | 'processing';
const statusMap = ['processing', 'default'];
const status = ['否', '是']

interface TableListProps extends FormComponentProps {
  dispatch: Dispatch<any>;
  loading: boolean;
  role: IStateType;
}

interface TableListState {
  modalVisible: boolean;
  updateModalVisible: boolean;
  selectedRows: Array<TableListItem>;
  formValues: Partial<TableListParams>;
  stepFormValues: Partial<TableListItem>;
  authList: Array<AuthItemType>;
  targetKeys: Array<string>;
}

/* eslint react/no-multi-comp:0 */
@connect(
  ({
    role,
    loading,
  }: {
    role: IStateType;
    loading: {
      models: {
        [key: string]: boolean;
      };
    };
  }) => ({
    role,
    loading: loading.models.role,
  }),
)
class TableList extends Component<TableListProps, TableListState> {
  state: TableListState = {
    modalVisible: false,
    updateModalVisible: false,
    selectedRows: [],
    formValues: {},
    stepFormValues: {},
    authList: [],
    targetKeys: [],
  };

  columns: StandardTableColumnProps[] = [
    {
      title: '角色名称',
      dataIndex: 'role_name',
    },
    {
      title: '描述',
      dataIndex: 'depict',
      width: 300,
      render: (val: string) => {
        return (
          <Tooltip placement="top" title={val}>
            <LinesEllipsis text={val} maxLine={2} ellipsis='...' />
          </Tooltip>
        );
      }
    },
    {
      title: '是否内置',
      dataIndex: 'is_root',
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
          <Authorized authority="admin:role:update">
            { record.is_root === 0 &&
              <a onClick={() => this.handleUpdateModalVisible(true, record)}>修改</a>
            }
            <Divider type="vertical" />
            {record.status === 1 && record.is_root === 0 &&
              <Popconfirm
                title="确认禁用该用户?"
                onConfirm={() => this.handleDisable(record)}
                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
              >
                <a style={{ color: 'red' }}>禁用</a>
              </Popconfirm>
            }
            {record.status === 0 && record.is_root === 0 &&
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
      type: 'role/list',
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
      type: 'role/list',
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
      type: 'role/list',
      payload: {
        pageNo: 1,
        pageSize: 10
      },
    });
  };

  handleDisable = (record) => {
    const { dispatch } = this.props;
    const { pagination } = this.props.role.data;
    const { formValues } = this.state;
    dispatch({
      type: 'role/disable',
      payload: {
        id: record.id,
      },
      callback: (response) => {
        if (response.code === 200) {
          dispatch({
            type: 'role/list',
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
    const { pagination } = this.props.role.data;
    const { formValues } = this.state;
    dispatch({
      type: 'role/enable',
      payload: {
        id: record.id,
      },
      callback: (response) => {
        if (response.code === 200) {
          dispatch({
            type: 'role/list',
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

  handleRemove = (e: React.FormEvent) => {
    e.preventDefault();
    const { dispatch, role:{data:{pagination}}} = this.props;
    const { selectedRows, formValues } = this.state;
    const namesStr = selectedRows.map(item => item.role_name).join('、')
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
            description: '没有选择任何角色'
          })
          return;
        }
        dispatch({
          type: 'role/remove',
          payload: { id_list },
          callback: () => {
            dispatch({
              type: 'role/list',
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
      role_name: valueObj.search_role_name,
    };

    this.setState({
      formValues: values,
    });

    dispatch({
      type: 'role/list',
      payload: values,
    });
  };

  handleModalVisible = (flag?: boolean) => {
    const { dispatch } = this.props;
    if (flag) {
      dispatch({
        type: 'role/queryAuth',
        callback: res => {
          this.setState({
            modalVisible: !!flag,
            authList: res.data,
            targetKeys: [],
          });
        }
      })
    } else {
      this.setState({
        modalVisible: !!flag,
        authList: [],
        targetKeys: [],
      });
    }
  };

  handleUpdateModalVisible = (flag?: boolean, record?: UpdateValsType) => {
    const { dispatch } = this.props;
    if (flag) {
      let targetKeys:string[] = [];
      if (record && record.auth_list) targetKeys = record.auth_list.map(item => `${item.id}`);
      dispatch({
        type: 'role/queryAuth',
        callback: res => {
          this.setState({
            updateModalVisible: !!flag,
            stepFormValues: record || {},
            authList: res.data,
            targetKeys,
          });
        }
      })
    } else {
      this.setState({
        updateModalVisible: !!flag,
        stepFormValues: record || {},
        authList: [],
        targetKeys: [],
      });
    }
  };

  handleTargetKeys = (targetKeys) => {
    this.setState({ targetKeys });
  };

  handleAdd = (fields, createForm) => {
    const { dispatch } = this.props;
    const { pagination } = this.props.role.data;
    dispatch({
      type: 'role/add',
      payload: {...fields},
      callback: (response) => {
        if (response.code === 200) {
          message.success("添加成功");
          this.handleModalVisible();
          createForm.resetFields();
          dispatch({
            type: 'role/list',
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
    const { pagination } = this.props.role.data;
    dispatch({
      type: 'role/update',
      payload: {...fields},
      callback: (response) => {
        if (response.code === 200) {
          message.success("修改成功");
          this.handleUpdateModalVisible();
          createForm.resetFields();
          dispatch({
            type: 'role/list',
            payload: {...pagination},
          });
        } else {
          message.error(response.msg);
        }
      }
    });
  };

  renderAdvancedForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="角色名称">
              {getFieldDecorator('search_role_name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'left', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
          </div>
        </div>
      </Form>
    );
  }

  renderForm() {
    return this.renderAdvancedForm();
  }

  render() {
    const {
      role: { data },
      loading,
      form,
    } = this.props;

    const { selectedRows, modalVisible, updateModalVisible, stepFormValues, authList, targetKeys } = this.state;

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
      handleTargetKeys: this.handleTargetKeys,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
      handleTargetKeys: this.handleTargetKeys,
    };
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Authorized authority="admin:role:add">
                <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                  新建
                </Button>
              </Authorized>
              <Authorized authority="admin:role:delete">
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
        <CreateForm
          {...parentMethods}
          authList={authList}
          targetKeys={targetKeys}
          modalVisible={modalVisible}
          form={form}
        />
        {stepFormValues && Object.keys(stepFormValues).length ? (
          <UpdateForm
            {...updateMethods}
            authList={authList}
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
