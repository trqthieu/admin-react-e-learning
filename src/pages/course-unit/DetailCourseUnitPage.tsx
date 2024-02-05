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
import { notificationController } from '@app/controllers/notificationController';
import { useMounted } from '@app/hooks/useMounted';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Modal, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Pagination } from 'api/table.api';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  CourseExerciseResponse,
  changeOrderCourseExercises,
  deleteCourseExercise,
  getCourseExercises,
} from '@app/api/course-exercise.api';
const { confirm } = Modal;
const initialPagination: Pagination = {
  current: 1,
  pageSize: 50,
};
const initialPaginationEx: Pagination = {
  current: 1,
  pageSize: 50,
};

interface DataType extends CourseLessonResponse {
  key: number;
}
interface DataTypeEx extends CourseExerciseResponse {
  key: number;
}

const DetailCourseLessonPage: React.FC = () => {
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
    [isMounted, router?.unitId],
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

  const columns: ColumnsType<DataType> = [
    {
      key: 'sort',
    },
    {
      title: 'No.',
      dataIndex: 'order',
      render(value, record) {
        return <span>{record.order + 1}</span>;
      },
    },
    // {
    //   title: 'Banner',
    //   dataIndex: 'banner',
    //   render(value, record) {
    //     return <img style={{ maxWidth: '100px' }} src={record.banner} />;
    //   },
    // },
    {
      title: 'Title',
      dataIndex: 'title',
      render(value, record) {
        return (
          <Typography.Text ellipsis={true} style={{ width: 200 }}>
            {record.title}
          </Typography.Text>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render(value, record) {
        return (
          <Typography.Text ellipsis={true} style={{ width: 200 }}>
            {record.description}
          </Typography.Text>
        );
      },
    },
    {
      title: 'Content',
      dataIndex: 'content',
      render(value, record) {
        return (
          <Typography.Text ellipsis={true} style={{ width: 200 }}>
            {record.content}
          </Typography.Text>
        );
      },
    },
    {
      title: t('tables.actions'),
      dataIndex: 'actions',
      width: '15%',
      render: (text, record) => {
        return (
          <BaseSpace>
            <BaseButton type="ghost">
              <Link to={`lessons/${record.id}`}>{'View'}</Link>
            </BaseButton>
            <BaseButton type="default" danger onClick={() => handleDeleteRow(record.id)}>
              {'Delete'}
            </BaseButton>
          </BaseSpace>
        );
      },
    },
  ];

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

  const [tableDataEx, setTableDataEx] = useState<{
    data: DataTypeEx[];
    pagination: Pagination;
    loading: boolean;
  }>({
    data: [],
    pagination: initialPaginationEx,
    loading: false,
  });

  const fetchEx = useCallback(
    (pagination: Pagination) => {
      setTableDataEx((tableData) => ({ ...tableData, loading: true }));
      getCourseExercises({
        page: pagination.current,
        take: pagination.pageSize,
        courseUnitId: router?.unitId ? +router?.unitId : 0,
      }).then((res) => {
        if (isMounted.current) {
          setTableDataEx({
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
    [isMounted, router?.unitId],
  );

  useEffect(() => {
    fetchEx(initialPaginationEx);
  }, [fetchEx]);

  const handleDeleteRowEx = (rowId: number) => {
    confirm({
      title: 'Are you sure delete this course exercise?',
      icon: <ExclamationCircleFilled />,
      content: 'Some descriptions',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setTableDataEx({ ...tableDataEx, loading: true });
        deleteCourseExercise(rowId).then((res) => {
          if (res?.affected) {
            fetch(initialPagination);
            notificationController.success({ message: 'Delete course exercise successfully' });
          }
        });
      },
    });
  };

  const columnsEx: ColumnsType<DataType> = [
    {
      key: 'sort',
    },
    {
      title: 'No.',
      dataIndex: 'order',
      render(value, record) {
        return <span>{record.order + 1}</span>;
      },
    },
    // {
    //   title: 'Banner',
    //   dataIndex: 'banner',
    //   render(value, record) {
    //     return <img style={{ maxWidth: '100px' }} src={record.banner} />;
    //   },
    // },
    {
      title: 'Title',
      dataIndex: 'title',
      render(value, record) {
        return (
          <Typography.Text ellipsis={true} style={{ width: 200 }}>
            {record.title}
          </Typography.Text>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render(value, record) {
        return (
          <Typography.Text ellipsis={true} style={{ width: 200 }}>
            {record.description}
          </Typography.Text>
        );
      },
    },
    {
      title: 'Content',
      dataIndex: 'content',
      render(value, record) {
        return (
          <Typography.Text ellipsis={true} style={{ width: 200 }}>
            {record.content}
          </Typography.Text>
        );
      },
    },
    {
      title: t('tables.actions'),
      dataIndex: 'actions',
      width: '15%',
      render: (text, record) => {
        return (
          <BaseSpace>
            <BaseButton type="ghost">
              <Link to={`exercises/${record.id}`}>{'View'}</Link>
            </BaseButton>
            <BaseButton type="default" danger onClick={() => handleDeleteRowEx(record.id)}>
              {'Delete'}
            </BaseButton>
          </BaseSpace>
        );
      },
    },
  ];

  interface RowPropsEx extends React.HTMLAttributes<HTMLTableRowElement> {
    'data-row-key': string;
  }

  const RowEx = ({ children, ...props }: RowPropsEx) => {
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

  const onDragEndEx = async ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setTableDataEx((previousData) => {
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
        const data = await changeOrderCourseExercises({ activeId: +active.id, overId: +over.id });
        if (data?.affected) {
          fetchEx(initialPaginationEx);
          notificationController.success({ message: 'Update order course exercise successfully' });
          return;
        }
        fetchEx(initialPaginationEx);
        notificationController.error({ message: 'Update order course exercise successfully' });
      }
    }
  };

  return (
    <>
      <BaseCard
        id="validation form"
        title={'Course lessons'}
        padding="1.25rem"
        style={{
          height: 'auto',
        }}
      >
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
        <BaseButton type="primary" style={{ marginBottom: 16 }}>
          <Link to={'lessons/create'}>Add a new lesson</Link>
        </BaseButton>
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
      <BaseCard
        id="validation form"
        title={'Course exercises'}
        padding="1.25rem"
        style={{
          height: 'auto',
        }}
      >
        <BaseButton type="primary" style={{ marginBottom: 16 }}>
          <Link to={'exercises/create'}>Add a new exercise</Link>
        </BaseButton>
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEndEx}>
          <SortableContext items={tableDataEx.data.map((i) => i.key)} strategy={verticalListSortingStrategy}>
            <BaseTable
              bordered
              components={{
                body: {
                  row: RowEx,
                },
              }}
              rowKey="key"
              columns={columnsEx}
              dataSource={tableDataEx.data}
              loading={tableDataEx.loading}
            />
          </SortableContext>
        </DndContext>
      </BaseCard>
    </>
  );
};

export default DetailCourseLessonPage;
