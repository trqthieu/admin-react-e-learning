import { LoadingOutlined, MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { getCourseGroups } from '@app/api/course-group.api';
import { AddUserRequest, getUsers } from '@app/api/users.api';
import { BaseButton } from '@app/components/common/BaseButton/BaseButton';
import { BaseCard } from '@app/components/common/BaseCard/BaseCard';
import { BaseCol } from '@app/components/common/BaseCol/BaseCol';
import { BaseRadio } from '@app/components/common/BaseRadio/BaseRadio';
import { BaseRow } from '@app/components/common/BaseRow/BaseRow';
import { BaseUpload } from '@app/components/common/BaseUpload/BaseUpload';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { BaseButtonsForm } from '@app/components/common/forms/BaseButtonsForm/BaseButtonsForm';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { BaseInput } from '@app/components/common/inputs/BaseInput/BaseInput';
import { InputNumber } from '@app/components/common/inputs/InputNumber/InputNumber';
import { BaseSelect } from '@app/components/common/selects/BaseSelect/BaseSelect';
import type { UploadProps } from 'antd';
import { Button, DatePicker, Form, Input, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
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

const AddCoursePage: React.FC = () => {
  const [isFieldsChanged, setFieldsChanged] = useState(false);
  const [form] = useForm();
  const [teacherOption, setTeacherOption] = useState<Array<{ value: number; label: string }>>([]);
  const [courseGroupOption, setCourseGroupOption] = useState<Array<{ value: number; label: string }>>([]);
  const initialValues = useMemo(() => {
    return {
      category: 'OTHERS',
      courseGroupId: undefined,
      description: ['description test'],
      discount: 10,
      duration: 5,
      guideline: 'test guideline',
      level: 'C2',
      name: 'test name',
      price: 1,
      status: 'APPROVED',
      target: ['target test', 'target test 2'],
      teacherId: 12,
      timeDiscount: [moment('2024-01-26T03:47:28.301Z'), moment('2027-01-26T03:47:28.301Z')],
    };
  }, []);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const router = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(
    'http://res.cloudinary.com/dqzfbcoia/image/upload/v1706239830/oyxj83oafi659dth0inv.jpg',
  );

  const handleChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj as any, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
    }
  };

  const onFinish = async (values: AddUserRequest) => {
    console.log(values);
    console.log(imageUrl);

    // setIsLoading(true);
    // const addUserPayload: AddUserRequest = {
    //   email: values.email,
    //   firstName: values.firstName,
    //   lastName: values.lastName,
    //   phoneNumber: values.phoneNumber,
    //   password: values.password,
    //   role: values.role,
    //   isVerify: values.isVerify,
    //   EXP: values.EXP,
    // };
    // if (router.id) {
    //   const data = await updateUser(+router.id, addUserPayload);
    //   if (data?.id) {
    //     notificationController.success({ message: t('common.success') });
    //     setIsLoading(false);
    //     setFieldsChanged(false);
    //   }
    //   return;
    // }
    // const data = await addUser(addUserPayload);
    // if (data?.id) {
    //   notificationController.success({ message: t('common.success') });
    //   navigate('/users/list');
    // }
    // setIsLoading(false);
    // setFieldsChanged(false);
  };

  // useEffect(() => {
  //   const id = router.id;
  //   const fetchUser = async (id: number) => {
  //     const data = await getUser(id);
  //     form.setFieldsValue({
  //       ...data,
  //       password: '',
  //     });
  //   };
  //   if (id) {
  //     fetchUser(+id);
  //   } else {
  //     form.setFieldsValue({ ...initialValues });
  //   }
  // }, [router, form, initialValues]);
  useEffect(() => {
    const fetchUser = async () => {
      const response = await getUsers({ page: 1, take: 50 });
      const teacherData = response.data.filter((user) => user.role === 'TEACHER');
      setTeacherOption(
        teacherData.map((teacher) => ({ value: teacher.id, label: `${teacher.firstName} ${teacher.lastName}` })),
      );
    };
    fetchUser();
    const fetchCourseGroup = async () => {
      const response = await getCourseGroups({ page: 1, take: 50 });
      setCourseGroupOption(response.data.map((courseGroup) => ({ value: courseGroup.id, label: courseGroup.name })));
    };
    fetchCourseGroup();
  }, []);
  return (
    <>
      <PageTitle>{router.id ? 'Edit Course Page' : 'Add Course Page'}</PageTitle>
      <BaseRow gutter={[30, 30]}>
        <BaseCol xs={24} sm={24} xl={24}>
          <BaseCard id="validation form" title={router.id ? 'Edit Course' : 'Add Course'} padding="1.25rem">
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
                  action="https://nest-e-learning.onrender.com/files/upload-image"
                  listType="picture"
                  maxCount={1}
                  multiple={false}
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  onChange={handleChange}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="avatar" style={{ width: '100%' }} />
                  ) : (
                    <BaseButton type="default" icon={loading ? <LoadingOutlined /> : <UploadOutlined />}>
                      {t('forms.validationFormLabels.clickToUpload')}
                    </BaseButton>
                  )}
                </BaseUpload>
              </BaseButtonsForm.Item>
              <BaseForm.Item name="name" label={'Name'} rules={[{ required: true, message: 'Name is required' }]}>
                <BaseInput />
              </BaseForm.Item>
              <BaseButtonsForm.Item
                label={'Duration'}
                rules={[
                  { required: true, message: 'Duration is required' },
                  {
                    type: 'number',
                    message: 'Duration must be number',
                  },
                ]}
              >
                <label>
                  <BaseButtonsForm.Item name="duration" noStyle>
                    <InputNumber min={0} />
                  </BaseButtonsForm.Item>
                </label>
                <span> {'minutes'}</span>
              </BaseButtonsForm.Item>
              <BaseRow gutter={[30, 30]} style={{ width: '100%' }}>
                <BaseCol xs={24} sm={8} xl={8}>
                  <BaseButtonsForm.Item
                    name="teacherId"
                    label={'Teacher'}
                    hasFeedback
                    rules={[{ required: true, message: 'Teacher is require' }]}
                  >
                    <BaseSelect
                      showSearch
                      placeholder="Select teacher"
                      filterOption={(input, option) =>
                        (option?.label?.toLowerCase() ?? '').includes(input?.toLowerCase())
                      }
                      filterSort={(optionA, optionB) =>
                        (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                      }
                      options={teacherOption}
                    />
                  </BaseButtonsForm.Item>
                </BaseCol>
                <BaseCol xs={24} sm={8} xl={8}>
                  <BaseButtonsForm.Item name="courseGroupId" label={'Course Group'} hasFeedback>
                    <BaseSelect
                      showSearch
                      placeholder="Select course group"
                      filterOption={(input, option) =>
                        (option?.label?.toLowerCase() ?? '').includes(input?.toLowerCase())
                      }
                      filterSort={(optionA, optionB) =>
                        (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                      }
                      options={courseGroupOption}
                    />
                  </BaseButtonsForm.Item>
                </BaseCol>
              </BaseRow>
              <BaseButtonsForm.Item
                name="status"
                label={'Status'}
                rules={[{ required: true, message: 'Status is require' }]}
              >
                <BaseRadio.Group>
                  <BaseRadio value="DRAFT">Draft</BaseRadio>
                  <BaseRadio value="PENDING">Pending</BaseRadio>
                  <BaseRadio value="APPROVED">Approved</BaseRadio>
                  <BaseRadio value="REJECTED">Rejected</BaseRadio>
                </BaseRadio.Group>
              </BaseButtonsForm.Item>

              <BaseButtonsForm.Item
                name="category"
                label={'Category'}
                rules={[{ required: true, message: 'Category is require' }]}
              >
                <BaseRadio.Group>
                  <BaseRadio value="IELTS">IELTS</BaseRadio>
                  <BaseRadio value="TOEIC">TOEIC</BaseRadio>
                  <BaseRadio value="TOEFL">TOEFL</BaseRadio>
                  <BaseRadio value="ENGLISH_BASIC">English Basic</BaseRadio>
                  <BaseRadio value="OTHERS">Others</BaseRadio>
                </BaseRadio.Group>
              </BaseButtonsForm.Item>

              <BaseButtonsForm.Item
                name="level"
                label={'Level'}
                rules={[{ required: true, message: 'Level is require' }]}
              >
                <BaseRadio.Group>
                  <BaseRadio value="A1">A1</BaseRadio>
                  <BaseRadio value="A2">A2</BaseRadio>
                  <BaseRadio value="B1">B1</BaseRadio>
                  <BaseRadio value="B2">B2</BaseRadio>
                  <BaseRadio value="C1">C1</BaseRadio>
                  <BaseRadio value="C2">C2</BaseRadio>
                </BaseRadio.Group>
              </BaseButtonsForm.Item>

              <Form.List
                name="description"
                rules={[
                  {
                    validator: async (_, names) => {
                      if (!names || names.length < 1) {
                        return Promise.reject(new Error('At least 1 description'));
                      }
                    },
                  },
                ]}
              >
                {(fields, { add, remove }, { errors }) => (
                  <>
                    {fields.map((field, index) => (
                      <Form.Item label={index === 0 ? 'Descriptions' : ''} required={false} key={field.key}>
                        <Form.Item
                          {...field}
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            {
                              required: true,
                              whitespace: true,
                              message:
                                fields.length === 1
                                  ? 'Please input description'
                                  : 'Please input description or delete this field.',
                            },
                          ]}
                          noStyle
                        >
                          <Input />
                        </Form.Item>
                        {fields.length > 1 ? (
                          <MinusCircleOutlined className="dynamic-delete-button" onClick={() => remove(field.name)} />
                        ) : null}
                      </Form.Item>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} style={{ width: '40%' }} icon={<PlusOutlined />}>
                        Add description
                      </Button>
                      <Form.ErrorList errors={errors} />
                    </Form.Item>
                  </>
                )}
              </Form.List>
              <Form.List
                name="target"
                rules={[
                  {
                    validator: async (_, names) => {
                      if (!names || names.length < 1) {
                        return Promise.reject(new Error('At least 1 target'));
                      }
                    },
                  },
                ]}
              >
                {(fields, { add, remove }, { errors }) => (
                  <>
                    {fields.map((field, index) => (
                      <Form.Item label={index === 0 ? 'Targets' : ''} required={false} key={field.key}>
                        <Form.Item
                          {...field}
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            {
                              required: true,
                              whitespace: true,
                              message:
                                fields.length === 1
                                  ? 'Please input target'
                                  : 'Please input target or delete this field.',
                            },
                          ]}
                          noStyle
                        >
                          <Input />
                        </Form.Item>
                        {fields.length > 1 ? (
                          <MinusCircleOutlined className="dynamic-delete-button" onClick={() => remove(field.name)} />
                        ) : null}
                      </Form.Item>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} style={{ width: '40%' }} icon={<PlusOutlined />}>
                        Add target
                      </Button>
                      <Form.ErrorList errors={errors} />
                    </Form.Item>
                  </>
                )}
              </Form.List>
              <BaseForm.Item
                name="guideline"
                label={'Guideline'}
                rules={[{ required: true, message: 'Guideline is required' }]}
              >
                <Input.TextArea placeholder="Guideline to the students" autoSize={{ minRows: 2, maxRows: 6 }} />
              </BaseForm.Item>
              <BaseRow gutter={[30, 30]}>
                <BaseCol xs={24} sm={8} xl={8}>
                  <BaseButtonsForm.Item
                    label={'Price'}
                    name={'price'}
                    rules={[
                      { required: true, message: 'Price is required' },
                      {
                        type: 'number',
                        message: 'Price must be number',
                      },
                    ]}
                  >
                    <label>
                      <BaseButtonsForm.Item name="price" noStyle>
                        <InputNumber min={0} />
                      </BaseButtonsForm.Item>
                    </label>
                    <span> {'$'}</span>
                  </BaseButtonsForm.Item>
                </BaseCol>
                <BaseCol xs={24} sm={8} xl={8}>
                  <BaseButtonsForm.Item
                    label={'Discount'}
                    name={'discount'}
                    rules={[
                      { required: true, message: 'Discount is required' },
                      {
                        type: 'number',
                        message: 'Discount must be number',
                      },
                    ]}
                  >
                    <label>
                      <BaseButtonsForm.Item name="discount" noStyle>
                        <InputNumber min={0} max={100} />
                      </BaseButtonsForm.Item>
                    </label>
                    <span> {'%'}</span>
                  </BaseButtonsForm.Item>
                </BaseCol>
                <BaseCol xs={24} sm={8} xl={8}>
                  <BaseForm.Item
                    name="timeDiscount"
                    label={'Time Discount'}
                    rules={[{ required: true, message: 'Time Discount is required' }]}
                  >
                    <RangePicker />
                  </BaseForm.Item>
                </BaseCol>
              </BaseRow>
            </BaseButtonsForm>
          </BaseCard>
        </BaseCol>
      </BaseRow>
    </>
  );
};

export default AddCoursePage;
