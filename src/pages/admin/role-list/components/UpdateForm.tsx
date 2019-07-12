import React from 'react';
import { Input, Modal, Form } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { TableListItem as AuthItemType } from '@/pages/admin/auth-list/data';
import { TableListItem } from '../data';
import Transfer, { TransferItem } from 'antd/lib/transfer';

const FormItem = Form.Item;
const { TextArea } = Input;

export type UpdateValsType = {} & Partial<TableListItem>;

interface UpdateFormProps extends FormComponentProps {
  updateModalVisible: boolean;
  values: Partial<TableListItem>;
  handleUpdate: (
    fieldsValue: {
      id: number;
      role_name: string;
      depict: string;
      auth_ids: string[];
    },
    updateForm
  ) => void;
  handleUpdateModalVisible: () => void;
  handleTargetKeys: (targetKeys) => void;
  authList: AuthItemType[];
  targetKeys: string[];
}

const UpdateForm: React.SFC<UpdateFormProps> = props => {
  const {
    updateModalVisible,
    form,
    handleUpdate,
    handleUpdateModalVisible,
    values,
    authList,
    handleTargetKeys,
    targetKeys
  } = props;
  const okHandle = () => {

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleUpdate(fieldsValue, form);
    });
  };

  const handleChange = (nextTargetKeys) => {
    handleTargetKeys(nextTargetKeys);
  }

  const renderTransfor = () => {
    console.log('authList: ', authList);
    const dataSource:TransferItem[] = authList.map(item => {
      return {
        key: `${item.id}`,
        title: `${item.auth_name}-${item.menu.menu_name}`,
        description: item.depict,
      }
    });

    return (
      <Transfer
        listStyle={{ width: 210 }}
        dataSource={dataSource}
        titles={['未分配权限', '已分配权限']}
        targetKeys={targetKeys}
        render={item => `${item.title}`}
        onChange={handleChange}
      />
    );
  };

  return (
    <Modal
      destroyOnClose
      title="修改角色"
      width={800}
      visible={updateModalVisible}
      onOk={okHandle}
      onCancel={() => handleUpdateModalVisible()}
    >
      <FormItem>
        {form.getFieldDecorator('id', {
          initialValue: values.id,
        })(<Input type="hidden" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="角色名称">
        {form.getFieldDecorator('role_name', {
          initialValue: values.role_name,
          rules: [{ required: true, message: '角色名称不能为空', min: 1 }],
        })(<Input placeholder="请输入" autoComplete="false" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="描述">
        {form.getFieldDecorator('depict', {
          initialValue: values.depict,
        })
          (<TextArea
            placeholder="角色描述"
            autosize={{ minRows: 4, maxRows: 6 }}
            style={{'resize': 'none'}}
          />)
        }
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="分配权限">
        {form.getFieldDecorator('auth_ids')(renderTransfor())}
      </FormItem>
    </Modal>
  );
};

export default UpdateForm;
