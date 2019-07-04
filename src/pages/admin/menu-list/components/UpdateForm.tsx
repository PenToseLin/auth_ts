import React from 'react';
import { Input, Modal, Form, TreeSelect, InputNumber } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { TableListItem } from '../data';

const FormItem = Form.Item;

export type UpdateValsType = {} & Partial<TableListItem>;

interface UpdateFormProps extends FormComponentProps {
  updateModalVisible: boolean;
  values: Partial<TableListItem>;
  handleUpdate: (
    fieldsValue: {
      id: number;
      menu_name: string;
      queue: string;
    },
    updateForm
  ) => void;
  handleUpdateModalVisible: () => void;
  list: TableListItem[];
}

const UpdateForm: React.SFC<UpdateFormProps> = props => {
  const { updateModalVisible, form, handleUpdate, handleUpdateModalVisible, values, list } = props;
  const okHandle = () => {

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleUpdate(fieldsValue, form);
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
      title="修改菜单"
      visible={updateModalVisible}
      onOk={okHandle}
      onCancel={() => handleUpdateModalVisible()}
    >
      <FormItem>
        {form.getFieldDecorator('id', {
          initialValue: values.id,
        })(<Input type="hidden" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="上级菜单">
        {form.getFieldDecorator('parent_id',{
          initialValue: values.parent_id,
        })(<TreeSelect style={{ width: '100%' }} treeDefaultExpandAll disabled showSearch allowClear>
          {renderMenuTree(list)}
        </TreeSelect>)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="菜单名称">
        {form.getFieldDecorator('menu_name', {
          initialValue: values.menu_name,
          rules: [{ required: true, message: '菜单名称不能为空', min: 1 }],
        })(<Input placeholder="请输入" autoComplete="false" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="菜单路径">
        {form.getFieldDecorator('url', {
          initialValue: values.url,
          rules: [{ required: true, message: '菜单路径不能为空', min: 1 }],
        })(<Input placeholder="请输入" disabled autoComplete="false" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="序号">
        {form.getFieldDecorator('queue', {
          initialValue: values.queue,
        })(<InputNumber placeholder="请输入" />)}
      </FormItem>
    </Modal>
  );
};

export default UpdateForm;
