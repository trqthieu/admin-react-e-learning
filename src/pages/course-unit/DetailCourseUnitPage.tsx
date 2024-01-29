import { ExclamationCircleFilled, MenuOutlined } from '@ant-design/icons';
import {
  CourseLessonResponse,
  changeOrderCourseLessons,
  deleteCourseLesson,
  getCourseLessons,
} from '@app/api/course-lesson.api';
import { BaseButton } from '@app/components/common/BaseButton/BaseButton';
import { BaseCard } from '@app/components/common/BaseCard/BaseCard';
import { BaseSpace } from '@app/components/common/BaseSpace/BaseSpace';
import { BaseTable } from '@app/components/common/BaseTable/BaseTable';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { BaseInput } from '@app/components/common/inputs/BaseInput/BaseInput';
import { notificationController } from '@app/controllers/notificationController';
import { useMounted } from '@app/hooks/useMounted';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Form, Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Pagination } from 'api/table.api';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
const { confirm } = Modal;
const initialPagination: Pagination = {
  current: 1,
  pageSize: 50,
};

interface DataType extends CourseLessonResponse {
  key: number;
}
const DetailCourseLessonPage: React.FC = () => {
  const [courseLessonForm] = BaseForm.useForm();
  const [editForm] = BaseForm.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [openModalCourseLesson, setOpenModalCourseLesson] = useState(false);
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

  const { t } = useTranslation();
  const { isMounted } = useMounted();
  const router = useParams();
  console.log('router', router);

  const fetch = useCallback(
    (pagination: Pagination) => {
      setTableData((tableData) => ({ ...tableData, loading: true }));
      getCourseLessons({
        page: pagination.current,
        take: pagination.pageSize,
        courseUnitId: router?.unitId ? +router?.unitId : 0,
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
    fetch(initialPagination);
  }, [fetch]);

  const handleDeleteRow = (rowId: number) => {
    confirm({
      title: 'Are you sure delete this course lesson?',
      icon: <ExclamationCircleFilled />,
      content: 'Some descriptions',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setTableData({ ...tableData, loading: true });
        deleteCourseLesson(rowId).then((res) => {
          if (res?.affected) {
            fetch(initialPagination);
            notificationController.success({ message: 'Delete course lesson successfully' });
          }
        });
      },
    });
  };

  const handleOk = () => {
    const theLastlesson = tableData.data[tableData.data.length - 1];
    courseLessonForm
      .validateFields()
      .then(async (values) => {
        console.log('values', values);

        // setConfirmLoading(true);
        // const addCourseLessonPayload: AddCourseLessonRequest = {
        //   title: values.title,
        //   description: values.description,
        //   courseUnitId: router?.unitId ? +router?.unitId : 0,
        //   order: theLastlesson ? theLastlesson.order + 1 : 0,
        // };
        // const data = await addCourseLesson(addCourseLessonPayload);
        // if (data?.id) {
        //   notificationController.success({ message: t('common.success') });
        // } else {
        //   notificationController.error({ message: 'Add course lesson failed' });
        // }
        // setOpenModalCourseLesson(false);
        // setConfirmLoading(false);
        // fetch(initialPagination);
        // courseLessonForm.resetFields();
      })
      .catch((info) => {
        notificationController.error({ message: info });
      });
  };
  const handleEditOk = () => {
    editForm
      .validateFields()
      .then(async (values) => {
        console.log('values', values);

        // setConfirmLoading(true);
        // const editCourseLessonPayload: AddCourseLessonRequest = {
        //   title: values.title,
        //   description: values.description,
        //   courseSectionId: values.courseSectionId,
        //   order: values.order,
        // };
        // const data = await updateCourseLesson(values.id, editCourseLessonPayload);
        // if (data?.id) {
        //   notificationController.success({ message: t('common.success') });
        // } else {
        //   notificationController.error({ message: 'Update course lesson failed' });
        // }
        // setOpenModalEdit(false);
        // setConfirmLoading(false);
        // fetch(initialPagination);
        // editForm.resetFields();
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
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: t('tables.actions'),
      dataIndex: 'actions',
      width: '15%',
      render: (text, record) => {
        return (
          <BaseSpace>
            <BaseButton type="ghost">
              <Link to={`${record.id}`}>{'View'}</Link>
            </BaseButton>
            <BaseButton type="ghost" onClick={() => handleEdit(record)}>
              {'Edit'}
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
    setOpenModalCourseLesson(true);
  };

  const handleEdit = (record: DataType) => {
    setOpenModalEdit(true);
    editForm.setFieldsValue({
      id: record.id,
      title: record.title,
      description: record.description,
      order: record.order,
      courseUnitId: record.courseUnit.id,
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
        const data = await changeOrderCourseLessons({ activeId: +active.id, overId: +over.id });
        if (data?.affected) {
          fetch(initialPagination);
          notificationController.success({ message: 'Update order course lesson successfully' });
          return;
        }
        fetch(initialPagination);
        notificationController.error({ message: 'Update order course lesson successfully' });
      }
    }
  };

  return (
    <>
      <BaseCard id="validation form" title={'Course lessons'} padding="1.25rem">
        <BaseButton
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
          }}
          type="default"
        >
          <Link to={`/courses/detail/${router.courseId}/sections/${router.sectionId}/units`}>Back to course unit</Link>
        </BaseButton>
        <BaseButton onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
          <Link to={'lessons/create'}>Add a new lesson</Link>
        </BaseButton>
        <Modal
          zIndex={1000}
          open={openModalCourseLesson}
          title="Create a new course lesson"
          okText="Create"
          cancelText="Cancel"
          onCancel={() => setOpenModalCourseLesson(false)}
          onOk={handleOk}
          confirmLoading={confirmLoading}
        >
          <Form form={courseLessonForm} layout="vertical" name="form_in_modal">
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
          </Form>
        </Modal>
        <Modal
          open={openModalEdit}
          title="Edit course lesson"
          okText="Edit"
          cancelText="Cancel"
          onCancel={() => setOpenModalEdit(false)}
          onOk={handleEditOk}
          confirmLoading={confirmLoading}
        >
          <Form form={editForm} layout="vertical" name="form_in_modal">
            <Form.Item name="id" label="id" hidden>
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
            <Form.Item name="order" label="Order" hidden>
              <BaseInput />
            </Form.Item>
            <Form.Item name="courseSectionId" label="courseSectionId" hidden>
              <BaseInput />
            </Form.Item>
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
    </>
  );
};

export default DetailCourseLessonPage;
