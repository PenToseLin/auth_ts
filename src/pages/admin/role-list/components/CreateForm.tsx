import React from 'react';
import { Input, Modal, Form } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { TableListItem as AuthItemType } from '@/pages/admin/auth-list/data';
import Transfer, { TransferItem } from 'antd/lib/transfer';

const FormItem = Form.Item;
const { TextArea } = Input;

interface CreateFormProps extends FormComponentProps {
  modalVisible: boolean;
  handleAdd: (
    fieldsValue: {
      role_name: string;
      depict: string;
      auth_ids: string[];
    },
    createForm,
  ) => void;
  handleModalVisible: () => void;
  handleTargetKeys: (targetKeys) => void;
  authList: AuthItemType[];
  targetKeys: string[];
}

const CreateForm: React.SFC<CreateFormProps> = props => {
  const { modalVisible, form, handleAdd, handleModalVisible, authList, handleTargetKeys, targetKeys } = props;
  const okHandle = () => {

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleAdd(fieldsValue, form);
    });
  };

  const handleChange = (nextTargetKeys) => {
    handleTargetKeys(nextTargetKeys);
  }

  const renderTransfor = () => {

    const dataSource:TransferItem[] = authList.map(item => {
      return {
        key: `${item.id}`,
        title: `${item.auth_name}-${item.menu.menu_name}`,
        description: item.depict,
      }
    });

    return (
      <Transfer
        listStyle={{ width: 210, height: 300, }}
        dataSource={dataSource}
        titles={['未分配权限', '已分配权限']}
        targetKeys={targetKeys}
        render={item => `${item.title}`}
        onChange={handleChange}
        showSearch
      />
    );
  };

  return (
    <Modal
      destroyOnClose
      title="新建角色"
      width={800}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="角色名称">
        {form.getFieldDecorator('role_name', {
          rules: [{ required: true, message: '角色名称不能为空', min: 1 }],
        })(<Input placeholder="请输入" autoComplete="false" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="描述">
        {form.getFieldDecorator('depict')
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

export default CreateForm;
