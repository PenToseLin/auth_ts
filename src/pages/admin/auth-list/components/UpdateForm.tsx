import React from 'react';
import { Input, Modal, Form, TreeSelect, InputNumber } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { TableListItem } from '../data';
import { TableListItem as menuItem } from '@/pages/admin/menu-list/data'

const FormItem = Form.Item;
const { TextArea } = Input;

export type UpdateValsType = {} & Partial<TableListItem>;

interface UpdateFormProps extends FormComponentProps {
  updateModalVisible: boolean;
  values: Partial<TableListItem>;
  authByMenuList: TableListItem[];
  handleUpdate: (
    fieldsValue: {
      id: number;
      auth_name: string;
      queue: string;
      depict: string;
    },
    updateForm
  ) => void;
  handleUpdateModalVisible: () => void;
  menuList: menuItem[];
  handleQueryByMenu: (menuId) => void;
}

const UpdateForm: React.SFC<UpdateFormProps> = props => {
  const {
    updateModalVisible,
    form,
    handleUpdate,
    handleUpdateModalVisible,
    values,
    menuList,
    handleQueryByMenu,
    authByMenuList
  } = props;

  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleUpdate(fieldsValue, form);
    });
  };

  const renderMenuTree = (data, name) => {
    return data.map(item => {
      if (item.children && item.children.length > 0) {
        return (
          <TreeSelect.TreeNode value={item.id} title={item[name]} key={item.id}>
            {renderMenuTree(item.children, name)}
          </TreeSelect.TreeNode>
        );
      } else {
        return (
          <TreeSelect.TreeNode value={item.id} title={item[name]} key={item.id} />
        );
      }
    });
  }

  const handleSelect = menuId => {
    console.log(menuId)
    handleQueryByMenu(menuId)
  }

  return (
    <Modal
      destroyOnClose
      title="修改用户"
      visible={updateModalVisible}
      onOk={okHandle}
      onCancel={() => handleUpdateModalVisible()}
    >
      <FormItem>
        {form.getFieldDecorator('id', {
          initialValue: values.id,
        })(<Input type="hidden" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="菜单">
        {form.getFieldDecorator('menu_id',{
          initialValue: values.menu_id,
        })(<TreeSelect
          style={{ width: '100%' }}
          treeDefaultExpandAll
          showSearch
          allowClear
          disabled
          onSelect={ handleSelect }
        >
          {renderMenuTree(menuList, 'menu_name')}
        </TreeSelect>)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="上级权限">
        {form.getFieldDecorator('parent_id',{
          initialValue: values.parent_id,
        })(<TreeSelect style={{ width: '100%' }} treeDefaultExpandAll disabled showSearch allowClear>
          {values.parent_id === 0 ?
          <TreeSelect.TreeNode value={0} title='无' key={0} />
          : renderMenuTree(authByMenuList, 'auth_name')}
        </TreeSelect>)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="权限名称">
        {form.getFieldDecorator('auth_name', {
          initialValue: values.auth_name,
          rules: [{ required: true, message: '权限名称不能为空', min: 1 }],
        })(<Input placeholder="请输入" autoComplete="false" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="方法">
        {form.getFieldDecorator('method', {
          initialValue: values.method,
          rules: [{ required: true, message: '方法不能为空', min: 1 }],
        })(<Input placeholder="请输入" disabled autoComplete="false" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="序号">
        {form.getFieldDecorator('queue', {
          initialValue: values.queue,
        })(<InputNumber placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="描述">
        {form.getFieldDecorator('depict', {
          initialValue: values.depict,
        })
          (<TextArea
            placeholder="权限描述"
            autosize={{ minRows: 4, maxRows: 6 }}
            style={{'resize': 'none'}}
          />)
        }
      </FormItem>
    </Modal>
  );
};

export default UpdateForm;
