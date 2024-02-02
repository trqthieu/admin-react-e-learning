import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { CourseExerciseResponse } from '@app/api/course-exercise.api';
import { BaseButton } from '@app/components/common/BaseButton/BaseButton';
import { BaseCard } from '@app/components/common/BaseCard/BaseCard';
import { BaseCol } from '@app/components/common/BaseCol/BaseCol';
import { BaseRow } from '@app/components/common/BaseRow/BaseRow';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { BaseButtonsForm } from '@app/components/common/forms/BaseButtonsForm/BaseButtonsForm';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { BaseInput } from '@app/components/common/inputs/BaseInput/BaseInput';
import { notificationController } from '@app/controllers/notificationController';
import { Input, Typography } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
};

import { ExclamationCircleFilled, MenuOutlined } from '@ant-design/icons';
import { AddExamRequest, addExam, getExam, updateExam } from '@app/api/exam.api';
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
import { getUsers } from '@app/api/users.api';
import { BaseCheckbox } from '@app/components/common/BaseCheckbox/BaseCheckbox';
import { BaseRadio } from '@app/components/common/BaseRadio/BaseRadio';
import { BaseSpace } from '@app/components/common/BaseSpace/BaseSpace';
import { BaseTable } from '@app/components/common/BaseTable/BaseTable';
import { BaseSelect } from '@app/components/common/selects/BaseSelect/BaseSelect';
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
  const [teacherOption, setTeacherOption] = useState<Array<{ value: number; label: string }>>([]);
  const [form] = useForm();
  const initialValues = useMemo(() => {
    return {
      title: '',
      content: '',
      description: '',
      category: 'OTHERS',
    };
  }, []);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const router = useParams();
  const [isLoading, setIsLoading] = useState(false);
  console.log(router);
  const patio = router.examId ? 12 : 24;

  const onFinish = async (values: any) => {
    console.log('values', values);
    setIsLoading(true);
    const addExamPayload: AddExamRequest = {
      title: values.title,
      description: values.description,
      content: values.content,
      category: values.category,
      authorId: values.authorId,
    };
    if (router.examId) {
      const data = await updateExam(+router.examId, addExamPayload);
      if (data?.id) {
        notificationController.success({ message: t('common.success') });
        setIsLoading(false);
        setFieldsChanged(false);
      }
      setIsLoading(false);
      setFieldsChanged(false);
      return;
    }
    const data = await addExam(addExamPayload);
    if (data?.id) {
      notificationController.success({ message: t('common.success') });
      navigate('/exams/list');
    }
    setIsLoading(false);
    setFieldsChanged(false);
  };

  useEffect(() => {
    const id = router.examId;
    const fetchExam = async (id: number) => {
      const data = await getExam(id);
      form.setFieldsValue({
        title: data.title,
        description: data.description,
        content: data.content,
        category: data.category,
        authorId: data.author.id,
      });
    };
    if (id) {
      fetchExam(+id);
    } else {
      form.resetFields();
    }
  }, [form, router.examId]);

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

  const fetchQuestion = useCallback(
    (pagination: Pagination) => {
      setTableData((tableData) => ({ ...tableData, loading: true }));
      getQuestions({
        page: pagination.current,
        take: pagination.pageSize,
        examId: router?.examId ? +router?.examId : 0,
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
    [isMounted, router?.examId],
  );

  useEffect(() => {
    if (router.examId) {
      fetchQuestion(initialPagination);
    }
    const fetchUser = async () => {
      const response = await getUsers({ page: 1, take: 50 });
      const teacherData = response.data.filter((user) => user.role === 'TEACHER');
      setTeacherOption(
        teacherData.map((teacher) => ({ value: teacher.id, label: `${teacher.firstName} ${teacher.lastName}` })),
      );
    };
    fetchUser();
  }, [fetchQuestion, router.examId]);

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
            fetchQuestion(initialPagination);
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
          questionType: 'EXAM',
          examId: router.examId ? +router.examId : 0,
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
        fetchQuestion(initialPagination);
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
          questionType: 'EXAM',
          examId: router.examId ? +router.examId : 0,
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
        fetchQuestion(initialPagination);
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
        const data = await changeOrderQuestions({ activeId: +active.id, overId: +over.id, type: 'EXAM' });
        if (data?.affected) {
          fetchQuestion(initialPagination);
          notificationController.success({ message: 'Update order question successfully' });
          return;
        }
        fetchQuestion(initialPagination);
        notificationController.error({ message: 'Update order question successfully' });
      }
    }
  };

  return (
    <>
      <PageTitle>{router.examId ? 'Edit Exam Page' : 'Add Exam Page'}</PageTitle>
      <BaseRow gutter={[30, 30]}>
        <BaseCol xs={patio} sm={patio} xl={patio}>
          <BaseCard id="validation form" title={router.examId ? 'Edit Exam' : 'Add Exam'} padding="1.25rem">
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
        {router.examId && (
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
