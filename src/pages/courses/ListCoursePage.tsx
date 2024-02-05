import { ExclamationCircleFilled } from '@ant-design/icons';
import { CourseResponse, deleteCourse, getCourses } from '@app/api/courses.api';
import { Pagination } from '@app/api/table.api';
import { BaseButton } from '@app/components/common/BaseButton/BaseButton';
import { BaseCol } from '@app/components/common/BaseCol/BaseCol';
import { BaseRow } from '@app/components/common/BaseRow/BaseRow';
import { BaseSpace } from '@app/components/common/BaseSpace/BaseSpace';
import { BaseTable } from '@app/components/common/BaseTable/BaseTable';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Status } from '@app/components/profile/profileCard/profileFormNav/nav/payments/paymentHistory/Status/Status';
import { notificationController } from '@app/controllers/notificationController';
import { useMounted } from '@app/hooks/useMounted';
import { defineColorByStatus } from '@app/utils/utils';
import { Modal, Typography } from 'antd';
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
const ListCoursePage: React.FC = () => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState<{ data: CourseResponse[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const { isMounted } = useMounted();

  const fetch = useCallback(
    (pagination: Pagination) => {
      setTableData((tableData) => ({ ...tableData, loading: true }));
      getCourses({
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
      // getBasicTableData(pagination).then((res) => {
      //   if (isMounted.current) {
      //     console.log('res', res);

      //     setTableData({ data: res.data, pagination: res.pagination, loading: false });
      //   }
      // });
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
      title: 'Are you sure delete this course?',
      icon: <ExclamationCircleFilled />,
      content: 'Some descriptions',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteCourse(id).then((res) => {
          if (res.affected) {
            fetch(initialPagination);
            notificationController.success({ message: 'Delete course successfully' });
          }
        });
      },
    });
  };

  const columns: ColumnsType<CourseResponse> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Teacher',
      dataIndex: 'teacher',
      key: 'teacher',
      render: (_, record) => (
        <span>{record?.teacher?.id ? `${record?.teacher?.firstName} ${record?.teacher?.lastName}` : 'N/A'}</span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => (
        <Typography.Text ellipsis={true} style={{ width: 200 }}>
          {record.description[0]}
        </Typography.Text>
      ),
    },
    {
      title: 'Guideline',
      dataIndex: 'guideline',
      render: (text, record) => (
        <Typography.Text ellipsis={true} style={{ width: 200 }}>
          {text}
        </Typography.Text>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (_, record) => (
        <BaseRow gutter={[10, 10]}>
          <BaseCol>
            <Status color={defineColorByStatus(record.status)} text={record.status} />
          </BaseCol>
        </BaseRow>
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
              <Link to={`/courses/detail/${record.id}`}>{'Edit'}</Link>
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
      <PageTitle>{'Course List Page'}</PageTitle>
      <S.TablesWrapper>
        <S.Card id="basic-table" title={'Course List'} padding="1.25rem 1.25rem 0">
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

export default ListCoursePage;
