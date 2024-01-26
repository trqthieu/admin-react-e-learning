import { ExclamationCircleFilled } from '@ant-design/icons';
import { CourseGroupResponse, deleteCourseGroup, getCourseGroups } from '@app/api/course-group.api';
import { Pagination } from '@app/api/table.api';
import { BaseButton } from '@app/components/common/BaseButton/BaseButton';
import { BaseSpace } from '@app/components/common/BaseSpace/BaseSpace';
import { BaseTable } from '@app/components/common/BaseTable/BaseTable';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { notificationController } from '@app/controllers/notificationController';
import { useMounted } from '@app/hooks/useMounted';
import { Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import * as S from '../../components/tables/Tables/Tables.styles';
const { confirm } = Modal;

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};
const ListCourseGroupPage: React.FC = () => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState<{ data: CourseGroupResponse[]; pagination: Pagination; loading: boolean }>(
    {
      data: [],
      pagination: initialPagination,
      loading: false,
    },
  );
  const { isMounted } = useMounted();

  const fetch = useCallback(
    (pagination: Pagination) => {
      setTableData((tableData) => ({ ...tableData, loading: true }));
      getCourseGroups({
        page: pagination.current,
        take: pagination.pageSize,
      }).then((res) => {
        if (isMounted.current) {
          setTableData({
            data: res.data,
            pagination: {
              current: res.meta?.page,
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

  const handleTableChange = (pagination: Pagination) => {
    fetch(pagination);
  };

  const handleDeleteRow = (id: number) => {
    confirm({
      title: 'Are you sure delete this course group?',
      icon: <ExclamationCircleFilled />,
      content: 'Some descriptions',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteCourseGroup(id).then((res) => {
          if (res.affected) {
            fetch(initialPagination);
            notificationController.success({ message: 'Delete course group successfully' });
          }
        });
      },
    });
  };

  const columns: ColumnsType<CourseGroupResponse> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (_, record) => <span>{record.description}</span>,
    },
    {
      title: 'Teacher',
      dataIndex: 'teacher',
      key: 'teacher',
      render: (_, record) => (
        <span>{record?.author?.id ? `${record?.author?.firstName} ${record?.author?.lastName}` : 'N/A'}</span>
      ),
    },
    {
      title: t('tables.actions'),
      dataIndex: 'actions',
      width: '15%',
      render: (text, record) => {
        return (
          <BaseSpace>
            <BaseButton type="ghost">
              <Link to={`/courseGroup/detail/${record.id}`}>{'Edit'}</Link>
            </BaseButton>
            <BaseButton type="default" danger onClick={() => handleDeleteRow(record.id)}>
              {'Delete'}
            </BaseButton>
          </BaseSpace>
        );
      },
    },
  ];
  return (
    <>
      <PageTitle>{'Course Group List Page'}</PageTitle>
      <S.TablesWrapper>
        <S.Card id="basic-table" title={'Course Group List'} padding="1.25rem 1.25rem 0">
          <BaseTable
            columns={columns}
            dataSource={tableData.data}
            pagination={tableData.pagination}
            loading={tableData.loading}
            onChange={handleTableChange}
            scroll={{ x: 800 }}
            bordered
          />
        </S.Card>
      </S.TablesWrapper>
    </>
  );
};

export default ListCourseGroupPage;
