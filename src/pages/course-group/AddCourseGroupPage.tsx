import { AddCourseGroupRequest, addCourseGroup, getCourseGroup, updateCourseGroup } from '@app/api/course-group.api';
import { getUsers } from '@app/api/users.api';
import { BaseButton } from '@app/components/common/BaseButton/BaseButton';
import { BaseCard } from '@app/components/common/BaseCard/BaseCard';
import { BaseCol } from '@app/components/common/BaseCol/BaseCol';
import { BaseRow } from '@app/components/common/BaseRow/BaseRow';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { BaseButtonsForm } from '@app/components/common/forms/BaseButtonsForm/BaseButtonsForm';
import { BaseSelect } from '@app/components/common/selects/BaseSelect/BaseSelect';
import { notificationController } from '@app/controllers/notificationController';
import { Form, Input } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
};

const AddCourseGroupPage: React.FC = () => {
  const [isFieldsChanged, setFieldsChanged] = useState(false);
  const [teacherOption, setTeacherOption] = useState<Array<{ value: number; label: string }>>([]);
  const [form] = useForm();
  const initialValues = useMemo(() => {
    return {
      name: '',
      description: '',
      authorId: undefined,
    };
  }, []);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const router = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async (values: any) => {
    setIsLoading(true);
    const addCourseGroupPayload: AddCourseGroupRequest = {
      name: values.name,
      description: values.description,
      authorId: values.authorId,
    };

    if (router.id) {
      const data = await updateCourseGroup(+router.id, addCourseGroupPayload);
      if (data?.id) {
        notificationController.success({ message: t('common.success') });
        setIsLoading(false);
        setFieldsChanged(false);
      }
      return;
    }
    const data = await addCourseGroup(addCourseGroupPayload);
    if (data?.id) {
      notificationController.success({ message: t('common.success') });
      navigate('/courseGroup/list');
    }
    setIsLoading(false);
    setFieldsChanged(false);
  };

  useEffect(() => {
    const id = router.id;
    const fetchUser = async (id: number) => {
      const data = await getCourseGroup(id);
      form.setFieldsValue({
        ...data,
        authorId: data.author.id,
      });
    };
    if (id) {
      fetchUser(+id);
    } else {
      form.resetFields();
    }
  }, [router, form, initialValues]);
  useEffect(() => {
    const fetchUser = async () => {
      const response = await getUsers({ page: 1, take: 50 });
      const teacherData = response.data.filter((user) => user.role === 'TEACHER');
      setTeacherOption(
        teacherData.map((teacher) => ({ value: teacher.id, label: `${teacher.firstName} ${teacher.lastName}` })),
      );
    };
    fetchUser();
  }, []);
  return (
    <>
      <PageTitle>{router.id ? 'Edit Course Page' : 'Add Course Page'}</PageTitle>
      <BaseRow gutter={[30, 30]}>
        <BaseCol xs={24} sm={24} xl={24}>
          <BaseCard id="validation form" title={router.id ? 'Edit Course Group' : 'Add Course Group'} padding="1.25rem">
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
              <Form.Item
                name="name"
                label="Name"
                rules={[
                  {
                    required: true,
                    message: 'Name is require',
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
                rules={[
                  {
                    required: true,
                    message: 'Description is require',
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <BaseButtonsForm.Item
                name="authorId"
                label={'Teacher'}
                hasFeedback
                rules={[{ required: true, message: 'Teacher is require' }]}
              >
                <BaseSelect
                  showSearch
                  placeholder="Select teacher"
                  filterOption={(input, option) => (option?.label?.toLowerCase() ?? '').includes(input?.toLowerCase())}
                  filterSort={(optionA, optionB) =>
                    (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                  }
                  options={teacherOption}
                />
              </BaseButtonsForm.Item>
            </BaseButtonsForm>
          </BaseCard>
        </BaseCol>
      </BaseRow>
    </>
  );
};

export default AddCourseGroupPage;
