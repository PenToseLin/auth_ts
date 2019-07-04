import React from 'react';
import { Input, Modal, Form, TreeSelect, InputNumber } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { TableListItem } from '../data';

const FormItem = Form.Item;

interface CreateFormProps extends FormComponentProps {
  modalVisible: boolean;
  handleAdd: (
    fieldsValue: {
      parent_id: number;
      menu_name: string;
      url: string;
      queue: string;
    },
    createForm,
  ) => void;
  handleModalVisible: () => void;
  list: TableListItem[];
}

const CreateForm: React.SFC<CreateFormProps> = props => {
  const { modalVisible, form, handleAdd, handleModalVisible, list } = props;
  const okHandle = () => {

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleAdd(fieldsValue, form);
    });
  };

  const renderMenuTree = (data) => {
    return data.map(item => {
      if (item.children && item.children.length > 0) {
        return (
          <TreeSelect.TreeNode value={item.id} title={item.menu_name} key={item.id}>
            {renderMenuTree(item.children)}
          </TreeSelect.TreeNode>
        );
      } else {
        return (
          <TreeSelect.TreeNode value={item.id} title={item.menu_name} key={item.id} />
        );
      }
    });
  }

  return (
    <Modal
      destroyOnClose
      title="新建菜单"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="上级菜单">
        {form.getFieldDecorator('parent_id',
        )(<TreeSelect style={{ width: '100%' }} treeDefaultExpandAll showSearch allowClear>
          {renderMenuTree(list)}
        </TreeSelect>)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="菜单名称">
        {form.getFieldDecorator('menu_name', {
          rules: [{ required: true, message: '菜单名称不能为空', min: 1 }],
        })(<Input placeholder="请输入" autoComplete="false" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="菜单路径">
        {form.getFieldDecorator('url', {
          rules: [{ required: true, message: '菜单路径不能为空', min: 1 }],
        })(<Input placeholder="请输入" autoComplete="false" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="序号">
        {form.getFieldDecorator('queue', {
        })(<InputNumber placeholder="请输入" />)}
      </FormItem>
    </Modal>
  );
};

export default CreateForm;
