import { InboxOutlined, LoadingOutlined, MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import {
  AddCourseExerciseRequest,
  CourseExerciseResponse,
  addCourseExercise,
  getCourseExercise,
  getCourseExercises,
  updateCourseExercise,
} from '@app/api/course-exercise.api';
import { BaseButton } from '@app/components/common/BaseButton/BaseButton';
import { BaseCard } from '@app/components/common/BaseCard/BaseCard';
import { BaseCol } from '@app/components/common/BaseCol/BaseCol';
import { BaseRow } from '@app/components/common/BaseRow/BaseRow';
import { BaseUpload } from '@app/components/common/BaseUpload/BaseUpload';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { BaseButtonsForm } from '@app/components/common/forms/BaseButtonsForm/BaseButtonsForm';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { BaseInput } from '@app/components/common/inputs/BaseInput/BaseInput';
import { BACKEND_BASE_URL } from '@app/constants/config/api';
import { beforeUploadDocument, beforeUploadImage, beforeUploadVideo } from '@app/constants/config/upload';
import { notificationController } from '@app/controllers/notificationController';
import type { UploadProps } from 'antd';
import { Input, Typography } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';

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

import { ExclamationCircleFilled, MenuOutlined } from '@ant-design/icons';
import {
  AddQuestionRequest,
  AddQuestionSelectRequest,
  QuestionResponse,
  addQuestion,
  changeOrderQuestions,
  deleteQuestion,
  getQuestions,
  updateQuestion,
} from '@app/api/question.api';
import { BaseCheckbox } from '@app/components/common/BaseCheckbox/BaseCheckbox';
import { BaseRadio } from '@app/components/common/BaseRadio/BaseRadio';
import { BaseSpace } from '@app/components/common/BaseSpace/BaseSpace';
import { BaseTable } from '@app/components/common/BaseTable/BaseTable';
import { useMounted } from '@app/hooks/useMounted';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Form, Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Pagination } from 'api/table.api';
const { confirm } = Modal;
const initialPagination: Pagination = {
  current: 1,
  pageSize: 50,
};

interface DataType extends QuestionResponse {
  key: number;
}

const AddExercisePage: React.FC = () => {
  const [isFieldsChanged, setFieldsChanged] = useState(false);
  const [exerciseList, setExerciseList] = useState<Array<CourseExerciseResponse>>([]);
  console.log('exerciseList', exerciseList);

  const [form] = useForm();
  const initialValues = useMemo(() => {
    return {
      title: '',
      // banner: 'http://res.cloudinary.com/dqzfbcoia/image/upload/v1706546211/dvt3ccbdfqhcktvfe8s9.jpg',
      description: '',
      content: '',
      // video:
      //   'https://firebasestorage.googleapis.com/v0/b/e-learning-25868.appspot.com/o/eb3aca17-3b69-4bea-ac34-26bd7523c4ca-movie-app.mp4?alt=media',
      // attachments: [
      //   'https://firebasestorage.googleapis.com/v0/b/e-learning-25868.appspot.com/o/85a41ec6-dfcf-4eb9-ae7f-b9672356fb6b-e-learning.pdf?alt=media',
      //   'https://firebasestorage.googleapis.com/v0/b/e-learning-25868.appspot.com/o/c3a609f2-3b8b-4151-a5e3-533ba588a899-ImprovingPerformanceAndroid.pptx?alt=media',
      // ],
    };
  }, []);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const router = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  console.log(router);
  const fetchExercise = useCallback(async (unitId: number) => {
    const data = await getCourseExercises({ courseUnitId: unitId, page: 1, take: 50 });
    setExerciseList(data.data.sort((a, b) => a.order - b.order));
  }, []);
  const patio = router?.exerciseId ? 12 : 24;
  useEffect(() => {
    if (router.unitId) {
      fetchExercise(+router.unitId);
    }
  }, [fetchExercise, router.unitId]);

  const handleChangeImage: UploadProps['onChange'] = (info) => {
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
    setIsLoading(true);
    const theLastExercise = exerciseList[exerciseList.length - 1];
    const theLastOrder = theLastExercise ? theLastExercise.order + 1 : 0;
    const addExercisePayload: AddCourseExerciseRequest = {
      title: values.title,
      description: values.description,
      content: values.content,
      banner: values?.banner?.[0]?.response?.url || imageUrl,
      courseUnitId: router?.unitId ? +router?.unitId : 0,
      video: values?.video?.[0]?.response?.url || values?.video?.[0]?.url,
      attachments: values?.attachments?.map((attachment: any) => attachment?.url || attachment?.response?.url),
      order: values.order ?? theLastOrder,
    };
    if (router.exerciseId) {
      const data = await updateCourseExercise(+router.exerciseId, addExercisePayload);
      if (data?.id) {
        notificationController.success({ message: t('common.success') });
        setIsLoading(false);
        setFieldsChanged(false);
      }
      setIsLoading(false);
      setFieldsChanged(false);
      return;
    }
    const data = await addCourseExercise(addExercisePayload);
    if (data?.id) {
      notificationController.success({ message: t('common.success') });
      navigate(`/courses/detail/${router.courseId}/sections/${router.sectionId}/units/${router.unitId}`);
    }
    setIsLoading(false);
    setFieldsChanged(false);
  };

  useEffect(() => {
    const id = router.exerciseId;
    const fetchExercise = async (id: number) => {
      const data = await getCourseExercise(id);
      form.setFieldsValue({
        banner: undefined,
        title: data.title,
        description: data.description,
        content: data.content,
        order: data.order || 0,
        video: [
          {
            name: 'Click to see video',
            url: data.video,
          },
        ],
        attachments: [
          ...data.attachments.map((attachment, index) => ({
            name: `Attachment ${index + 1}`,
            url: attachment,
          })),
        ],
      });
      setImageUrl(data.banner);
    };
    if (id) {
      fetchExercise(+id);
    } else {
      form.resetFields();
      setImageUrl(undefined);
    }
  }, [form, router.exerciseId]);

  const [questionForm] = BaseForm.useForm();
  const [editForm] = BaseForm.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [openModalQuestion, setOpenModalQuestion] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [tableData, setTableData] = useState<{
    data: DataType[];
    pagination: Pagination;
    loading: boolean;
  }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });

  const { isMounted } = useMounted();

  const fetch = useCallback(
    (pagination: Pagination) => {
      setTableData((tableData) => ({ ...tableData, loading: true }));
      getQuestions({
        page: pagination.current,
        take: pagination.pageSize,
        exerciseId: router?.exerciseId ? +router?.exerciseId : 0,
      }).then((res) => {
        if (isMounted.current) {
          setTableData({
            data: res.data.sort((a, b) => a.order - b.order).map((item) => ({ ...item, key: item.id })),
            pagination: {
              current: res.meta.page,
              pageSize: res.meta.take,
              total: res.meta.totalItem,
            },
            loading: false,
          });
        }
      });
    },
    [isMounted],
  );

  useEffect(() => {
    if (router.exerciseId) {
      fetch(initialPagination);
    }
  }, [fetch]);

  const handleDeleteRow = (rowId: number) => {
    confirm({
      title: 'Are you sure delete this question?',
      icon: <ExclamationCircleFilled />,
      content: 'Some descriptions',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setTableData({ ...tableData, loading: true });
        deleteQuestion(rowId).then((res) => {
          if (res?.affected) {
            fetch(initialPagination);
            notificationController.success({ message: 'Delete question successfully' });
          }
        });
      },
    });
  };

  const handleOk = () => {
    questionForm
      .validateFields()
      .then(async (values) => {
        console.log('values', values);

        setConfirmLoading(true);
        const addQuestionRequest: AddQuestionRequest = {
          title: values.title,
          content: values.content,
          description: values.description,
          order: tableData.data.length,
          answerType: values.answerType,
          questionType: 'EXERCISE',
          exerciseId: router.exerciseId ? +router.exerciseId : 0,
          selections: values?.selections?.map((selection: AddQuestionSelectRequest, index: number) => ({
            key: selection.key,
            isCorrect: selection.isCorrect === true,
            order: index,
            questionId: 0,
          })),
        };
        const data = await addQuestion(addQuestionRequest);
        if (data?.id) {
          notificationController.success({ message: t('common.success') });
        } else {
          notificationController.error({ message: 'Add question failed' });
        }
        setOpenModalQuestion(false);
        setConfirmLoading(false);
        fetch(initialPagination);
        questionForm.resetFields();
      })
      .catch((info) => {
        notificationController.error({ message: info });
      });
  };
  const handleEditOk = () => {
    editForm
      .validateFields()
      .then(async (values) => {
        setConfirmLoading(true);
        const editQuestionRequest: AddQuestionRequest = {
          title: values.title,
          content: values.content,
          description: values.description,
          order: values.order,
          answerType: values.answerType,
          questionType: 'EXERCISE',
          exerciseId: router.exerciseId ? +router.exerciseId : 0,
          selections: values?.selections?.map((selection: AddQuestionSelectRequest, index: number) => ({
            id: selection.id,
            key: selection.key,
            isCorrect: selection.isCorrect === true,
            order: index,
            questionId: 0,
          })),
        };
        console.log('editQuestionRequest', editQuestionRequest);
        const data = await updateQuestion(values.id, editQuestionRequest);
        if (data?.id) {
          notificationController.success({ message: t('common.success') });
        } else {
          notificationController.error({ message: 'Update question failed' });
        }
        setOpenModalEdit(false);
        setConfirmLoading(false);
        fetch(initialPagination);
        editForm.resetFields();
      })
      .catch((info) => {
        notificationController.error({ message: info });
      });
  };

  const columns: ColumnsType<DataType> = [
    {
      key: 'sort',
    },
    {
      title: 'No.',
      dataIndex: 'order',
      render(value, record, index) {
        return <span>{record.order + 1}</span>;
      },
    },
    {
      title: 'Title',
      dataIndex: 'title',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      render: (text, record) => (
        <Typography.Text ellipsis={true} style={{ width: 200 }}>
          {text}
        </Typography.Text>
      ),
    },
    {
      title: t('tables.actions'),
      dataIndex: 'actions',
      width: '15%',
      render: (text, record) => {
        return (
          <BaseSpace>
            <BaseButton type="ghost" onClick={() => handleEdit(record)}>
              {'View'}
            </BaseButton>
            <BaseButton type="default" danger onClick={() => handleDeleteRow(record.id)}>
              {'Delete'}
            </BaseButton>
          </BaseSpace>
        );
      },
    },
  ];

  const handleAdd = () => {
    setOpenModalQuestion(true);
  };

  const handleEdit = (record: DataType) => {
    setOpenModalEdit(true);
    editForm.setFieldsValue({
      id: record.id,
      title: record.title,
      description: record.description,
      content: record.content,
      answerType: record.answerType,
      selections: record.questionSelects,
      order: record.order,
    });
  };

  interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    'data-row-key': string;
  }

  const Row = ({ children, ...props }: RowProps) => {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
      id: props['data-row-key'],
    });

    const style: React.CSSProperties = {
      ...props.style,
      transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
      transition,
      ...(isDragging ? { position: 'relative', zIndex: 99 } : {}),
    };

    return (
      <tr {...props} ref={setNodeRef} style={style} {...attributes}>
        {React.Children.map(children, (child) => {
          if ((child as React.ReactElement).key === 'sort') {
            return React.cloneElement(child as React.ReactElement, {
              children: (
                <MenuOutlined
                  ref={setActivatorNodeRef}
                  style={{ touchAction: 'none', cursor: 'move' }}
                  {...listeners}
                />
              ),
            });
          }
          return child;
        })}
      </tr>
    );
  };

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setTableData((previousData) => {
        const previous = previousData.data;
        const activeIndex = previous.findIndex((i) => i.key === active.id);
        const overIndex = previous.findIndex((i) => i.key === over?.id);
        return {
          ...previousData,
          data: arrayMove(previous, activeIndex, overIndex),
          loading: true,
        };
      });
      if (over) {
        const data = await changeOrderQuestions({ activeId: +active.id, overId: +over.id, type: 'EXERCISE' });
        if (data?.affected) {
          fetch(initialPagination);
          notificationController.success({ message: 'Update order question successfully' });
          return;
        }
        fetch(initialPagination);
        notificationController.error({ message: 'Update order question successfully' });
      }
    }
  };

  return (
    <>
      <PageTitle>{router.exerciseId ? 'Edit Exercise Page' : 'Add Exercise Page'}</PageTitle>
      <BaseRow gutter={[30, 30]}>
        <BaseCol xs={patio} sm={patio} xl={patio}>
          <BaseCard id="validation form" title={router.exerciseId ? 'Edit Exercise' : 'Add Exercise'} padding="1.25rem">
            <BaseButton
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
              }}
              type="default"
            >
              <Link to={`/courses/detail/${router.courseId}/sections/${router.sectionId}/units/${router.unitId}`}>
                Back to course exercise
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
                  beforeUpload={beforeUploadImage}
                  onChange={handleChangeImage}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="avatar" style={{ maxWidth: '500px', borderRadius: '10px' }} />
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
              <BaseForm.Item name="order" label={'Order'} hidden>
                <BaseInput />
              </BaseForm.Item>
              <BaseForm.Item
                name="content"
                label={'Content'}
                rules={[{ required: true, message: 'Content is required' }]}
              >
                <Input.TextArea autoSize={{ minRows: 4, maxRows: 7 }} />
              </BaseForm.Item>
              <BaseForm.Item name="description" label={'Description'}>
                <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} />
              </BaseForm.Item>
              <BaseButtonsForm.Item name="video" label={'Video'} valuePropName="fileList" getValueFromEvent={normFile}>
                <BaseUpload
                  name="file"
                  action={`${BACKEND_BASE_URL}/files/upload-document`}
                  listType="picture"
                  beforeUpload={beforeUploadVideo}
                  maxCount={1}
                >
                  <BaseButton type="default" icon={<UploadOutlined />}>
                    {t('forms.validationFormLabels.clickToUpload')}
                  </BaseButton>
                </BaseUpload>
              </BaseButtonsForm.Item>
              <BaseButtonsForm.Item label={'Attachments'}>
                <BaseButtonsForm.Item name="attachments" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                  <BaseUpload.Dragger
                    name="file"
                    action={`${BACKEND_BASE_URL}/files/upload-document`}
                    beforeUpload={beforeUploadDocument}
                  >
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
        {router.exerciseId && (
          <BaseCol xs={12} sm={12} xl={12}>
            <BaseCard id="validation form" title={'Manage questions'} padding="1.25rem">
              <BaseButton onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
                Add a new question
              </BaseButton>
              <Modal
                zIndex={1000}
                open={openModalQuestion}
                title="Create a new question"
                okText="Create"
                cancelText="Cancel"
                onCancel={() => setOpenModalQuestion(false)}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                width={'80vw'}
              >
                <Form form={questionForm} layout="vertical" name="form_in_modal">
                  <BaseRow gutter={[10, 10]} align="top" justify="space-between">
                    <BaseCol span={12}>
                      <Form.Item
                        name="title"
                        label="Title"
                        rules={[
                          {
                            required: true,
                            message: 'Title is require',
                          },
                        ]}
                      >
                        <BaseInput />
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
                        <BaseInput />
                      </Form.Item>
                      <Form.Item
                        name="content"
                        label="Content"
                        rules={[
                          {
                            required: true,
                            message: 'Content is require',
                          },
                        ]}
                      >
                        <BaseInput />
                      </Form.Item>
                      <BaseButtonsForm.Item
                        name="answerType"
                        label={'Answer Type'}
                        rules={[{ required: true, message: 'Answer Type is require' }]}
                      >
                        <BaseRadio.Group>
                          <BaseRadio value="SELECTION">Selection</BaseRadio>
                          <BaseRadio value="TEXT">Text</BaseRadio>
                        </BaseRadio.Group>
                      </BaseButtonsForm.Item>
                    </BaseCol>
                    <BaseCol span={12}>
                      <BaseButtonsForm.List
                        name="selections"
                        rules={[
                          {
                            validator: async (_, names) => {
                              if (!names || names.length < 1) {
                                return Promise.reject(new Error('At least 1 answer'));
                              }
                            },
                          },
                        ]}
                      >
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map((field, index) => (
                              <BaseRow
                                key={field.key}
                                wrap={false}
                                gutter={[10, 10]}
                                align="middle"
                                justify="space-between"
                              >
                                <MinusCircleOutlined onClick={() => remove(field.name)} />
                                <BaseCol span={12}>
                                  <BaseButtonsForm.Item
                                    {...field}
                                    label={`Answer ${index + 1}`}
                                    name={[field.name, 'key']}
                                    rules={[{ required: true, message: 'Missing answer key' }]}
                                  >
                                    <BaseInput />
                                  </BaseButtonsForm.Item>
                                </BaseCol>
                                <BaseCol span={12}>
                                  <BaseButtonsForm.Item
                                    {...field}
                                    label={'Correct'}
                                    name={[field.name, 'isCorrect']}
                                    valuePropName="checked"
                                  >
                                    <BaseCheckbox />
                                  </BaseButtonsForm.Item>
                                  {/*  */}
                                </BaseCol>
                              </BaseRow>
                            ))}

                            <BaseButtonsForm.Item>
                              <BaseButton type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                Add answer
                              </BaseButton>
                            </BaseButtonsForm.Item>
                          </>
                        )}
                      </BaseButtonsForm.List>
                    </BaseCol>
                  </BaseRow>
                </Form>
              </Modal>
              <Modal
                open={openModalEdit}
                title="Edit question"
                okText="Edit"
                cancelText="Cancel"
                onCancel={() => setOpenModalEdit(false)}
                onOk={handleEditOk}
                confirmLoading={confirmLoading}
                width={'80vw'}
              >
                <Form form={editForm} layout="vertical" name="form_in_modal">
                  <BaseRow gutter={[10, 10]} align="top" justify="space-between">
                    <BaseCol span={12}>
                      <Form.Item
                        name="order"
                        label="Order"
                        rules={[
                          {
                            required: true,
                            message: 'Order is require',
                          },
                        ]}
                        hidden
                      >
                        <BaseInput />
                      </Form.Item>
                      <Form.Item name="id" label={'Id'} rules={[{ required: true, message: 'Id is required' }]} hidden>
                        <BaseInput />
                      </Form.Item>
                      <Form.Item
                        name="title"
                        label="Title"
                        rules={[
                          {
                            required: true,
                            message: 'Title is require',
                          },
                        ]}
                      >
                        <BaseInput />
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
                        <BaseInput />
                      </Form.Item>
                      <Form.Item
                        name="content"
                        label="Content"
                        rules={[
                          {
                            required: true,
                            message: 'Content is require',
                          },
                        ]}
                      >
                        <BaseInput />
                      </Form.Item>
                      <BaseButtonsForm.Item
                        name="answerType"
                        label={'Answer Type'}
                        rules={[{ required: true, message: 'Answer Type is require' }]}
                      >
                        <BaseRadio.Group>
                          <BaseRadio value="SELECTION">Selection</BaseRadio>
                          <BaseRadio value="TEXT">Text</BaseRadio>
                        </BaseRadio.Group>
                      </BaseButtonsForm.Item>
                    </BaseCol>
                    <BaseCol span={12}>
                      <BaseButtonsForm.List
                        name="selections"
                        rules={[
                          {
                            validator: async (_, names) => {
                              if (!names || names.length < 1) {
                                return Promise.reject(new Error('At least 1 answer'));
                              }
                            },
                          },
                        ]}
                      >
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map((field, index) => (
                              <BaseRow
                                key={field.key}
                                wrap={false}
                                gutter={[10, 10]}
                                align="middle"
                                justify="space-between"
                              >
                                <MinusCircleOutlined onClick={() => remove(field.name)} />
                                <BaseCol span={12}>
                                  <BaseButtonsForm.Item
                                    {...field}
                                    label={`Answer ${index + 1}`}
                                    name={[field.name, 'key']}
                                    rules={[{ required: true, message: 'Missing answer key' }]}
                                  >
                                    <BaseInput />
                                  </BaseButtonsForm.Item>
                                </BaseCol>
                                <BaseCol span={12}>
                                  <BaseButtonsForm.Item
                                    {...field}
                                    label={'Correct'}
                                    name={[field.name, 'isCorrect']}
                                    valuePropName="checked"
                                  >
                                    <BaseCheckbox />
                                  </BaseButtonsForm.Item>
                                  {/*  */}
                                </BaseCol>
                              </BaseRow>
                            ))}

                            <BaseButtonsForm.Item>
                              <BaseButton type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                Add answer
                              </BaseButton>
                            </BaseButtonsForm.Item>
                          </>
                        )}
                      </BaseButtonsForm.List>
                    </BaseCol>
                  </BaseRow>
                </Form>
              </Modal>
              <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
                <SortableContext items={tableData.data.map((i) => i.key)} strategy={verticalListSortingStrategy}>
                  <BaseTable
                    bordered
                    components={{
                      body: {
                        row: Row,
                      },
                    }}
                    rowKey="key"
                    columns={columns}
                    dataSource={tableData.data}
                    loading={tableData.loading}
                  />
                </SortableContext>
              </DndContext>
            </BaseCard>
          </BaseCol>
        )}
      </BaseRow>
    </>
  );
};

export default AddExercisePage;
