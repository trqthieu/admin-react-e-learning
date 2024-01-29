import { InboxOutlined, LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { AddCourseGroupRequest, addCourseGroup, getCourseGroups } from '@app/api/course-group.api';
import { AddCourseRequest, addCourse, getCourse, updateCourse } from '@app/api/courses.api';
import { getUsers } from '@app/api/users.api';
import { BaseButton } from '@app/components/common/BaseButton/BaseButton';
import { BaseCard } from '@app/components/common/BaseCard/BaseCard';
import { BaseCol } from '@app/components/common/BaseCol/BaseCol';
import { BaseRow } from '@app/components/common/BaseRow/BaseRow';
import { BaseUpload } from '@app/components/common/BaseUpload/BaseUpload';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { BaseButtonsForm } from '@app/components/common/forms/BaseButtonsForm/BaseButtonsForm';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { BaseInput } from '@app/components/common/inputs/BaseInput/BaseInput';
import { BaseSelect } from '@app/components/common/selects/BaseSelect/BaseSelect';
import { BACKEND_BASE_URL } from '@app/constants/config/api';
import { notificationController } from '@app/controllers/notificationController';
import type { UploadProps } from 'antd';
import { DatePicker, Form, Input, Modal, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
const { RangePicker } = DatePicker;

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
};

const normFile = (e = { fileList: [] }) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

const getBase64 = (img: File, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
};

const AddLessonPage: React.FC = () => {
  const [isFieldsChanged, setFieldsChanged] = useState(false);
  const [form] = useForm();
  const [courseGroupForm] = useForm();
  const [teacherOption, setTeacherOption] = useState<Array<{ value: number; label: string }>>([]);
  const [courseGroupOption, setCourseGroupOption] = useState<Array<{ value: number; label: string }>>([]);
  const [openModalCourseGroup, setOpenModalCourseGroup] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const initialValues = useMemo(() => {
    return {
      name: '',
      banner: undefined,
      teacherId: undefined,
      courseGroupId: undefined,
      category: 'OTHERS',
      discount: 0,
      duration: 0,
      level: 'A1',
      price: 0,
      status: 'DRAFT',
      description: [],
      target: [],
      guideline: '',
      timeDiscount: [],
    };
  }, []);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const router = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();

  const fetchCourseGroup = async () => {
    const response = await getCourseGroups({ page: 1, take: 50 });
    setCourseGroupOption(response.data.map((courseGroup) => ({ value: courseGroup.id, label: courseGroup.name })));
  };

  const handleChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj as File, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
    }
  };

  const onFinish = async (values: any) => {
    console.log('values', values);

    // setIsLoading(true);
    // const addCoursePayload: AddCourseRequest = {
    //   name: values.name,
    //   description: values.description,
    //   target: values.target,
    //   guideline: values.guideline,
    //   duration: values.duration,
    //   banner: values?.banner?.[0]?.response?.url || imageUrl,
    //   level: values.level,
    //   status: values.status,
    //   teacherId: values.teacherId,
    //   courseGroupId: values.courseGroupId || 0,
    //   category: values.category,
    //   price: values.price,
    //   discount: values.discount,
    //   timeDiscountStart: values.timeDiscount[0].toISOString(),
    //   timeDiscountEnd: values.timeDiscount[1].toISOString(),
    // };

    // if (router.lessonId) {
    //   const data = await updateCourse(+router.lessonId, addCoursePayload);
    //   if (data?.id) {
    //     notificationController.success({ message: t('common.success') });
    //     setIsLoading(false);
    //     setFieldsChanged(false);
    //   }
    //   return;
    // }
    // const data = await addCourse(addCoursePayload);
    // if (data?.id) {
    //   notificationController.success({ message: t('common.success') });
    //   navigate('/courses/list');
    // }
    // setIsLoading(false);
    // setFieldsChanged(false);
  };

  const handleOk = () => {
    courseGroupForm
      .validateFields()
      .then(async (values) => {
        console.log(values);
        setConfirmLoading(true);
        const addCourseGroupPayload: AddCourseGroupRequest = {
          name: values.name,
          description: values.description,
          authorId: values.authorId,
        };
        const data = await addCourseGroup(addCourseGroupPayload);
        if (data?.id) {
          notificationController.success({ message: t('common.success') });
        } else {
          notificationController.error({ message: 'Add Lesson group failed' });
        }
        setOpenModalCourseGroup(false);
        setConfirmLoading(false);
        fetchCourseGroup();
        courseGroupForm.resetFields();
      })
      .catch((info) => {
        notificationController.error({ message: info });
      });
  };

  useEffect(() => {
    const id = router.lessonId;
    const fetchUser = async (id: number) => {
      const data = await getCourse(id);
      form.setFieldsValue({
        ...data,
        banner: undefined,
        timeDiscount: [moment(data.timeDiscountStart), moment(data.timeDiscountEnd)],
        teacherId: data?.teacher?.id,
        courseGroupId: data?.courseGroup?.id,
      });
      setImageUrl(data.banner);
    };
    if (id) {
      fetchUser(+id);
    } else {
      form.resetFields();
      setImageUrl(undefined);
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
    fetchCourseGroup();
  }, []);
  return (
    <>
      <PageTitle>{router.lessonId ? 'Edit Lesson Page' : 'Add Lesson Page'}</PageTitle>
      <Modal
        open={openModalCourseGroup}
        title="Create a new course group"
        okText="Create"
        cancelText="Cancel"
        onCancel={() => setOpenModalCourseGroup(false)}
        onOk={handleOk}
        confirmLoading={confirmLoading}
      >
        <Form form={courseGroupForm} layout="vertical" name="form_in_modal">
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
        </Form>
      </Modal>
      <BaseRow gutter={[30, 30]}>
        <BaseCol xs={24} sm={24} xl={24}>
          <BaseCard id="validation form" title={router.lessonId ? 'Edit Lesson' : 'Add Lesson'} padding="1.25rem">
            <BaseButton
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
              }}
              type="default"
            >
              <Link to={`/courses/detail/${router.courseId}/sections/${router.sectionId}/units/${router.unitId}`}>
                Back to course lesson
              </Link>
            </BaseButton>
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
              <BaseButtonsForm.Item
                name="banner"
                label={'Banner'}
                valuePropName="fileList"
                getValueFromEvent={normFile}
                rules={[{ required: imageUrl ? false : true, message: 'Course banner is required' }]}
              >
                <BaseUpload
                  name="file"
                  action={`${BACKEND_BASE_URL}/files/upload-image`}
                  listType="picture"
                  maxCount={1}
                  multiple={false}
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  onChange={handleChange}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="avatar" style={{ maxWidth: '500px', borderRadius: '20px' }} />
                  ) : (
                    <BaseButton type="default" icon={loading ? <LoadingOutlined /> : <UploadOutlined />}>
                      {t('forms.validationFormLabels.clickToUpload')}
                    </BaseButton>
                  )}
                </BaseUpload>
              </BaseButtonsForm.Item>
              <BaseForm.Item name="title" label={'Title'} rules={[{ required: true, message: 'Title is required' }]}>
                <BaseInput />
              </BaseForm.Item>
              <BaseForm.Item
                name="description"
                label={'Description'}
                rules={[{ required: true, message: 'Description is required' }]}
              >
                <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} />
              </BaseForm.Item>
              <BaseForm.Item
                name="content"
                label={'Content'}
                rules={[{ required: true, message: 'Content is required' }]}
              >
                <Input.TextArea autoSize={{ minRows: 4, maxRows: 7 }} />
              </BaseForm.Item>
              <BaseButtonsForm.Item label={'Attachments'}>
                <BaseButtonsForm.Item name="attachments" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                  <BaseUpload.Dragger name="file" action={`${BACKEND_BASE_URL}/files/upload-document`}>
                    <p>
                      <InboxOutlined />
                    </p>
                    <p>{t('forms.validationFormLabels.clickToDrag')}</p>
                  </BaseUpload.Dragger>
                </BaseButtonsForm.Item>
              </BaseButtonsForm.Item>
            </BaseButtonsForm>
          </BaseCard>
        </BaseCol>
      </BaseRow>
    </>
  );
};

export default AddLessonPage;
