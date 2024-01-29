import { AddUserRequest, addUser, getUser, updateUser } from '@app/api/users.api';
import { BaseButton } from '@app/components/common/BaseButton/BaseButton';
import { BaseCard } from '@app/components/common/BaseCard/BaseCard';
import { BaseCol } from '@app/components/common/BaseCol/BaseCol';
import { BaseRadio } from '@app/components/common/BaseRadio/BaseRadio';
import { BaseRow } from '@app/components/common/BaseRow/BaseRow';
import { BaseSwitch } from '@app/components/common/BaseSwitch/BaseSwitch';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { BaseButtonsForm } from '@app/components/common/forms/BaseButtonsForm/BaseButtonsForm';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { BaseInput } from '@app/components/common/inputs/BaseInput/BaseInput';
import { InputNumber } from '@app/components/common/inputs/InputNumber/InputNumber';
import { InputPassword } from '@app/components/common/inputs/InputPassword/InputPassword.styles';
import { FirstNameItem } from '@app/components/profile/profileCard/profileFormNav/nav/PersonalInfo/FirstNameItem/FirstNameItem';
import { LastNameItem } from '@app/components/profile/profileCard/profileFormNav/nav/PersonalInfo/LastNameItem/LastNameItem';
import { notificationController } from '@app/controllers/notificationController';
import { useForm } from 'antd/lib/form/Form';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
};

const normFile = (e = { fileList: [] }) => {
  console.log(e);

  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

const AddUserPage: React.FC = () => {
  const [isFieldsChanged, setFieldsChanged] = useState(false);
  const [form] = useForm();
  const initialValues: AddUserRequest = useMemo(() => {
    return {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      phoneNumber: '',
      role: 'STUDENT',
      EXP: 0,
      isVerify: true,
    };
  }, []);
  const [isLoading, setLoading] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const router = useParams();

  const onFinish = async (values: AddUserRequest) => {
    setLoading(true);
    const addUserPayload: AddUserRequest = {
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phoneNumber,
      password: values.password,
      role: values.role,
      isVerify: values.isVerify,
      EXP: values.EXP,
    };
    if (router.id) {
      const data = await updateUser(+router.id, addUserPayload);
      if (data?.id) {
        notificationController.success({ message: t('common.success') });
        setLoading(false);
        setFieldsChanged(false);
      }
      setLoading(false);
      setFieldsChanged(false);
      return;
    }
    const data = await addUser(addUserPayload);
    if (data?.id) {
      notificationController.success({ message: t('common.success') });
      navigate('/users/list');
    }
    setLoading(false);
    setFieldsChanged(false);
  };

  useEffect(() => {
    const id = router.id;
    const fetchUser = async (id: number) => {
      const data = await getUser(id);
      form.setFieldsValue({
        ...data,
        password: '',
      });
    };
    if (id) {
      fetchUser(+id);
    } else {
      form.resetFields();
    }
  }, [router, form, initialValues]);
  return (
    <>
      <PageTitle>{router.id ? 'Edit User Page' : 'Add User Page'}</PageTitle>
      <BaseRow gutter={[30, 30]}>
        <BaseCol xs={24} sm={24} xl={18}>
          <BaseCard id="validation form" title={router.id ? 'Edit User' : 'Add User'} padding="1.25rem">
            <BaseButtonsForm
              {...formItemLayout}
              isFieldsChanged={isFieldsChanged}
              onFieldsChange={() => setFieldsChanged(true)}
              name="validateForm"
              initialValues={initialValues}
              form={form}
              footer={
                <BaseButtonsForm.Item>
                  <BaseButton type="primary" htmlType="submit" loading={isLoading}>
                    {t('common.submit')}
                  </BaseButton>
                </BaseButtonsForm.Item>
              }
              onFinish={onFinish}
            >
              <BaseForm.Item
                name="email"
                label={'Email'}
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Email is invalid' },
                ]}
              >
                <BaseInput />
              </BaseForm.Item>
              <FirstNameItem />
              <LastNameItem />
              <BaseForm.Item
                name="phoneNumber"
                label={'Phone number'}
                rules={[
                  { required: true, message: 'Phone number is require' },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: 'Please enter a valid phone number',
                  },
                ]}
              >
                <BaseInput />
              </BaseForm.Item>
              <BaseForm.Item
                name="password"
                label={t('common.password')}
                rules={[
                  { required: true, message: t('forms.stepFormLabels.passwordError') },
                  {
                    min: 8,
                    message: 'Password must be at least 8 characters',
                  },
                ]}
              >
                <InputPassword />
              </BaseForm.Item>
              <BaseForm.Item
                name="confirmPassword"
                label={t('common.confirmPassword')}
                dependencies={['password']}
                rules={[
                  { required: true, message: t('common.confirmPasswordError') },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(t('common.confirmPasswordError')));
                    },
                  }),
                ]}
              >
                <InputPassword />
              </BaseForm.Item>

              <BaseButtonsForm.Item label={'EXP'}>
                <label>
                  <BaseButtonsForm.Item name="EXP" noStyle>
                    <InputNumber min={0} />
                  </BaseButtonsForm.Item>
                </label>
              </BaseButtonsForm.Item>

              <BaseButtonsForm.Item name="role" label={'Role'} rules={[{ required: true, message: 'Role is require' }]}>
                <BaseRadio.Group>
                  <BaseRadio value="ADMIN">Admin</BaseRadio>
                  <BaseRadio value="TEACHER">Teacher</BaseRadio>
                  <BaseRadio value="STUDENT">Student</BaseRadio>
                </BaseRadio.Group>
              </BaseButtonsForm.Item>

              <BaseButtonsForm.Item name="isVerify" label={'Verify'} valuePropName="checked">
                <BaseSwitch />
              </BaseButtonsForm.Item>

              {/* <BaseButtonsForm.Item
                name="avatar"
                label={t('forms.validationFormLabels.upload')}
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <BaseUpload
                  name="file"
                  action="https://nest-e-learning.onrender.com/files/upload-image"
                  listType="picture"
                  maxCount={1}
                  multiple={false}
                >
                  <BaseButton type="default" icon={<UploadOutlined />}>
                    {t('forms.validationFormLabels.clickToUpload')}
                  </BaseButton>
                </BaseUpload>
              </BaseButtonsForm.Item> */}
            </BaseButtonsForm>
          </BaseCard>
        </BaseCol>
      </BaseRow>
    </>
  );
};

export default AddUserPage;
