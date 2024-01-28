import { ExclamationCircleFilled, MenuOutlined } from '@ant-design/icons';
import {
  AddCourseSectionRequest,
  CourseSectionResponse,
  addCourseSection,
  deleteCourseSection,
  getCourseSections,
  updateCourseSection,
} from '@app/api/course-section.api';
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
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
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

interface DataType extends CourseSectionResponse {
  key: number;
}
const ListCourseSectionPage: React.FC = () => {
  const [courseSectionForm] = BaseForm.useForm();
  const [editForm] = BaseForm.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [openModalCourseSection, setOpenModalCourseSection] = useState(false);
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

  const fetch = useCallback(
    (pagination: Pagination) => {
      setTableData((tableData) => ({ ...tableData, loading: true }));
      getCourseSections({
        page: pagination.current,
        take: pagination.pageSize,
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
      title: 'Are you sure delete this course section?',
      icon: <ExclamationCircleFilled />,
      content: 'Some descriptions',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setTableData({ ...tableData, loading: true });
        deleteCourseSection(rowId).then((res) => {
          if (res.affected) {
            fetch(initialPagination);
            notificationController.success({ message: 'Delete course section successfully' });
          }
        });
      },
    });
  };

  const handleOk = () => {
    const theLastSection = tableData.data[tableData.data.length - 1];
    courseSectionForm
      .validateFields()
      .then(async (values) => {
        setConfirmLoading(true);
        const addCourseSectionPayload: AddCourseSectionRequest = {
          title: values.title,
          description: values.description,
          courseId: router?.id ? +router?.id : 0,
          order: theLastSection ? theLastSection.order + 1 : 0,
        };
        const data = await addCourseSection(addCourseSectionPayload);
        if (data?.id) {
          notificationController.success({ message: t('common.success') });
        } else {
          notificationController.error({ message: 'Add course section failed' });
        }
        setOpenModalCourseSection(false);
        setConfirmLoading(false);
        fetch(initialPagination);
        courseSectionForm.resetFields();
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
        const editCourseSectionPayload: AddCourseSectionRequest = {
          title: values.title,
          description: values.description,
          courseId: values.courseId,
          order: values.order,
        };
        const data = await updateCourseSection(values.id, editCourseSectionPayload);
        if (data?.id) {
          notificationController.success({ message: t('common.success') });
        } else {
          notificationController.error({ message: 'Update course section failed' });
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
    setOpenModalCourseSection(true);
  };

  const handleEdit = (record: DataType) => {
    setOpenModalEdit(true);
    editForm.setFieldsValue({
      id: record.id,
      title: record.title,
      description: record.description,
      order: record.order,
      courseId: record.course.id,
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
      ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
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

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      console.log(active.id);
      console.log(over?.id);
      // setDataSource((previous) => {
      //   const activeIndex = previous.findIndex((i) => i.key === active.id);
      //   const overIndex = previous.findIndex((i) => i.key === over?.id);
      //   return arrayMove(previous, activeIndex, overIndex);
      // });
    }
  };

  return (
    <BaseCard id="validation form" title={'Course sections'} padding="1.25rem">
      <BaseButton
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
        }}
        type="default"
      >
        <Link to={`/courses/detail/${router.id}`}>Back to course</Link>
      </BaseButton>
      <BaseButton onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
        Add a new course section
      </BaseButton>
      <Modal
        open={openModalCourseSection}
        title="Create a new course section"
        okText="Create"
        cancelText="Cancel"
        onCancel={() => setOpenModalCourseSection(false)}
        onOk={handleOk}
        confirmLoading={confirmLoading}
      >
        <Form form={courseSectionForm} layout="vertical" name="form_in_modal">
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
        title="Edit course section"
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
          <Form.Item name="courseId" label="courseId" hidden>
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
  );
};

export default ListCourseSectionPage;
