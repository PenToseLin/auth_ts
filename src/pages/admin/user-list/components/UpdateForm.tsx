import React from 'react';
import { Input, Modal, Form, Transfer } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { TableListItem } from '../data';
import { TableListItem as RoleItemType } from '@/pages/admin/role-list/data'
import { TransferItem } from 'antd/lib/transfer';

const FormItem = Form.Item;

export type UpdateValsType = {
  password?: string;
  password_confirm?: string;
} & Partial<TableListItem>;

interface UpdateFormProps extends FormComponentProps {
  updateModalVisible: boolean;
  values: Partial<TableListItem>;
  handleUpdate: (
    fieldsValue: {
      username: string;
      mobile: string;
      password: string;
      password_confirm: string;
      role_ids: string[];
    },
    updateForm
  ) => void;
  handleUpdateModalVisible: () => void;
  checkPassword: (
    rule,
    value,
    callback: () => void,
  ) => void;
  roleList: RoleItemType[];
  targetKeys: string[];
  handleTargetKeys: (targetKeys) => void;
}

const UpdateForm: React.SFC<UpdateFormProps> = props => {
  const {
    updateModalVisible,
    form,
    handleUpdate,
    handleUpdateModalVisible,
    checkPassword,
    values,
    roleList,
    targetKeys,
    handleTargetKeys
  } = props;
  const okHandle = () => {

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleUpdate(fieldsValue, form);
    });
  };

  const handleChange = (nextTargetKeys, direction, moveKeys) => {
    handleTargetKeys(nextTargetKeys);
  }

  const renderRoleTransfor = () => {

    const dataSource:TransferItem[] = roleList.map(item => {
      return {
        key: `${item.id}`,
        title: item.role_name,
        description: item.depict,
      }
    });

    return (
      <Transfer
        dataSource={dataSource}
        titles={['未分配角色', '已分配角色']}
        targetKeys={targetKeys}
        render={item => `${item.title}-${item.description}`}
        onChange={handleChange}
      />
    );
  };

  return (
    <Modal
      destroyOnClose
      title="修改用户"
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
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="用户名">
        {form.getFieldDecorator('username', {
          initialValue: values.username,
          rules: [{ required: true, message: '用户名不能为空', min: 1 }],
        })(<Input placeholder="请输入" autoComplete="false" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="手机号码">
        {form.getFieldDecorator('mobile', {
          initialValue: values.mobile,
          rules: [
            { required: true, message: '手机号码不正确', min: 11, pattern: /^1[2,3,4,5,6,7,8,9][0-9]{9}$/ },
          ],
        })(<Input placeholder="请输入" maxLength={11} autoComplete="false" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="新密码">
        {form.getFieldDecorator('password', {
          rules: [{ message: '密码长度不少于8位数', min: 8 }],
        })(<Input placeholder="请输入" autoComplete="false" type="password" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="确认密码">
        {form.getFieldDecorator('password_confirm', {
          rules: [
            { validator: checkPassword }
          ],
        })(<Input placeholder="请输入" autoComplete="false" type="password" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="分配角色">
        {form.getFieldDecorator('role_ids')(renderRoleTransfor())}
      </FormItem>
    </Modal>
  );
};

export default UpdateForm;
