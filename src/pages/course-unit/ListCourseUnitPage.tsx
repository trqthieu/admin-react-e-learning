import { ExclamationCircleFilled, MenuOutlined } from '@ant-design/icons';
import {
  AddCourseUnitRequest,
  CourseUnitResponse,
  addCourseUnit,
  changeOrderCourseUnits,
  deleteCourseUnit,
  getCourseUnits,
  updateCourseUnit,
} from '@app/api/course-unit.api';
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
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
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

interface DataType extends CourseUnitResponse {
  key: number;
}
const ListCourseUnitPage: React.FC = () => {
  const [courseUnitForm] = BaseForm.useForm();
  const [editForm] = BaseForm.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [openModalCourseUnit, setOpenModalCourseUnit] = useState(false);
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
      getCourseUnits({
        page: pagination.current,
        take: pagination.pageSize,
        courseSectionId: router?.sectionId ? +router?.sectionId : 0,
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
      title: 'Are you sure delete this course unit?',
      icon: <ExclamationCircleFilled />,
      content: 'Some descriptions',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setTableData({ ...tableData, loading: true });
        deleteCourseUnit(rowId).then((res) => {
          if (res?.affected) {
            fetch(initialPagination);
            notificationController.success({ message: 'Delete course unit successfully' });
          }
        });
      },
    });
  };

  const handleOk = () => {
    const theLastUnit = tableData.data[tableData.data.length - 1];
    courseUnitForm
      .validateFields()
      .then(async (values) => {
        setConfirmLoading(true);
        const addCourseUnitPayload: AddCourseUnitRequest = {
          title: values.title,
          description: values.description,
          courseSectionId: router?.sectionId ? +router?.sectionId : 0,
          order: theLastUnit ? theLastUnit.order + 1 : 0,
        };
        const data = await addCourseUnit(addCourseUnitPayload);
        if (data?.id) {
          notificationController.success({ message: t('common.success') });
        } else {
          notificationController.error({ message: 'Add course unit failed' });
        }
        setOpenModalCourseUnit(false);
        setConfirmLoading(false);
        fetch(initialPagination);
        courseUnitForm.resetFields();
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
        const editCourseUnitPayload: AddCourseUnitRequest = {
          title: values.title,
          description: values.description,
          courseSectionId: values.courseSectionId,
          order: values.order,
        };
        const data = await updateCourseUnit(values.id, editCourseUnitPayload);
        if (data?.id) {
          notificationController.success({ message: t('common.success') });
        } else {
          notificationController.error({ message: 'Update course unit failed' });
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
    setOpenModalCourseUnit(true);
  };

  const handleEdit = (record: DataType) => {
    setOpenModalEdit(true);
    editForm.setFieldsValue({
      id: record.id,
      title: record.title,
      description: record.description,
      order: record.order,
      courseSectionId: record.courseSection.id,
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
        const data = await changeOrderCourseUnits({ activeId: +active.id, overId: +over.id });
        if (data?.affected) {
          fetch(initialPagination);
          notificationController.success({ message: 'Update order course unit successfully' });
          return;
        }
        fetch(initialPagination);
        notificationController.error({ message: 'Update order course unit successfully' });
      }
    }
  };

  return (
    <BaseCard id="validation form" title={'Course units'} padding="1.25rem">
      <BaseButton
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
        }}
        type="default"
      >
        <Link to={`/courses/detail/${router.courseId}/sections`}>Back to course section</Link>
      </BaseButton>
      <BaseButton onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
        Add a new course unit
      </BaseButton>
      <Modal
        zIndex={1000}
        open={openModalCourseUnit}
        title="Create a new course unit"
        okText="Create"
        cancelText="Cancel"
        onCancel={() => setOpenModalCourseUnit(false)}
        onOk={handleOk}
        confirmLoading={confirmLoading}
      >
        <Form form={courseUnitForm} layout="vertical" name="form_in_modal">
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
        title="Edit course unit"
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
  );
};

export default ListCourseUnitPage;
