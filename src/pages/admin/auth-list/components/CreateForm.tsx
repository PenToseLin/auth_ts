import React from 'react';
import { Input, Modal, Form } from 'antd';
import { FormComponentProps } from 'antd/es/form';

const FormItem = Form.Item;

interface CreateFormProps extends FormComponentProps {
  modalVisible: boolean;
  handleAdd: (
    fieldsValue: {
      username: string;
      mobile: string;
      password: string;
      password_confirm: string;
    },
    createForm,
  ) => void;
  handleModalVisible: () => void;
  checkPassword: (
    rule,
    value,
    callback: () => void,
  ) => void;
}

const CreateForm: React.SFC<CreateFormProps> = props => {
  const { modalVisible, form, handleAdd, handleModalVisible, checkPassword } = props;
  const okHandle = () => {

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleAdd(fieldsValue, form);
    });
  };

  return (
    <Modal
      destroyOnClose
      title="新建用户"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="用户名">
        {form.getFieldDecorator('username', {
          rules: [{ required: true, message: '用户名不能为空', min: 1 }],
        })(<Input placeholder="请输入" autoComplete="false" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="手机号码">
        {form.getFieldDecorator('mobile', {
          rules: [
            { required: true, message: '手机号码不正确', min: 11, pattern: /^1[2,3,4,5,6,7,8,9][0-9]{9}$/ },
          ],
        })(<Input placeholder="请输入" maxLength={11} autoComplete="false" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="密码">
        {form.getFieldDecorator('password', {
          rules: [{ required: true, message: '密码长度不少于8位数', min: 8 }],
        })(<Input placeholder="请输入" autoComplete="false" type="password" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="确认密码">
        {form.getFieldDecorator('password_confirm', {
          rules: [
            { required: true },
            { validator: checkPassword }
          ],
        })(<Input placeholder="请输入" autoComplete="false" type="password" />)}
      </FormItem>
    </Modal>
  );
};

export default CreateForm;
