import React from 'react';
import { Input, Modal, Form, TreeSelect, InputNumber } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { TableListItem } from '../data';
import { TableListItem as menuItem } from '@/pages/admin/menu-list/data'

const FormItem = Form.Item;
const { TextArea } = Input;

interface CreateFormProps extends FormComponentProps {
  modalVisible: boolean;
  authByMenuList: TableListItem[];
  handleAdd: (
    fieldsValue: {
      menu_id: number;
      parent_id: number;
      auth_name: string;
      queue: string;
      depict: string;
    },
    createForm,
  ) => void;
  handleModalVisible: () => void;
  menuList: menuItem[];
  handleQueryByMenu: (menuId: number) => void;
}

const CreateForm: React.SFC<CreateFormProps> = props => {
  const {
    modalVisible,
    form,
    handleAdd,
    handleModalVisible,
    menuList,
    handleQueryByMenu,
    authByMenuList
  } = props;

  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleAdd(fieldsValue, form);
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
      title="新建菜单"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="菜单">
        {form.getFieldDecorator('menu_id',
        )(<TreeSelect
          style={{ width: '100%' }}
          treeDefaultExpandAll
          showSearch
          allowClear
          onSelect={ handleSelect }
          treeNodeFilterProp='title'
          filterTreeNode={(val, treeNode) => treeNode.props.title.indexOf(val) > -1}
        >
          {renderMenuTree(menuList, 'menu_name')}
        </TreeSelect>)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="上级权限">
        {form.getFieldDecorator('parent_id',
        )(<TreeSelect style={{ width: '100%' }} 
          treeDefaultExpandAll showSearch allowClear
          treeNodeFilterProp='title'
          filterTreeNode={(val, treeNode) => treeNode.props.title.indexOf(val) > -1}>
          {renderMenuTree(authByMenuList, 'auth_name')}
        </TreeSelect>)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="权限名称">
        {form.getFieldDecorator('auth_name', {
          rules: [{ required: true, message: '权限名称不能为空', min: 1 }],
        })(<Input placeholder="请输入" autoComplete="false" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="方法">
        {form.getFieldDecorator('method', {
          rules: [{ required: true, message: '方法不能为空', min: 1 }],
        })(<Input placeholder="请输入" autoComplete="false" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="序号">
        {form.getFieldDecorator('queue', {
        })(<InputNumber placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="描述">
        {form.getFieldDecorator('depict')
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

export default CreateForm;
