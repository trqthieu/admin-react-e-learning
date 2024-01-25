import { Pagination } from '@app/api/table.api';
import { UserResponse, deleteUser, getUsers } from '@app/api/users.api';
import { BaseButton } from '@app/components/common/BaseButton/BaseButton';
import { BaseCol } from '@app/components/common/BaseCol/BaseCol';
import { BaseRow } from '@app/components/common/BaseRow/BaseRow';
import { BaseSpace } from '@app/components/common/BaseSpace/BaseSpace';
import { BaseTable } from '@app/components/common/BaseTable/BaseTable';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Status } from '@app/components/profile/profileCard/profileFormNav/nav/payments/paymentHistory/Status/Status';
import { useMounted } from '@app/hooks/useMounted';
import { defineColorByRole } from '@app/utils/utils';
import { Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import * as S from '../components/tables/Tables/Tables.styles';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { notificationController } from '@app/controllers/notificationController';
const { confirm } = Modal;

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};
const UserListPage: React.FC = () => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState<{ data: UserResponse[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const { isMounted } = useMounted();

  const fetch = useCallback(
    (pagination: Pagination) => {
      setTableData((tableData) => ({ ...tableData, loading: true }));
      getUsers({
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
      title: 'Are you sure delete this user?',
      icon: <ExclamationCircleFilled />,
      content: 'Some descriptions',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteUser(id).then((res) => {
          if (res.affected) {
            fetch(initialPagination);
            notificationController.success({ message: 'Delete user successfully' });
          }
        });
      },
    });
    // setTableData({
    //   ...tableData,
    //   data: tableData.data.filter((item) => item.id !== rowId),
    //   pagination: {
    //     ...tableData.pagination,
    //     total: tableData.pagination.total ? tableData.pagination.total - 1 : tableData.pagination.total,
    //   },
    // });
  };

  const columns: ColumnsType<UserResponse> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <span>{`${record.firstName} ${record.lastName}`}</span>,
      // filterMode: 'tree',
      // filterSearch: true,
      // filters: [
      //   {
      //     text: t('common.firstName'),
      //     value: 'firstName',
      //     children: [
      //       {
      //         text: 'Joe',
      //         value: 'Joe',
      //       },
      //       {
      //         text: 'Pavel',
      //         value: 'Pavel',
      //       },
      //       {
      //         text: 'Jim',
      //         value: 'Jim',
      //       },
      //       {
      //         text: 'Josh',
      //         value: 'Josh',
      //       },
      //     ],
      //   },
      //   {
      //     text: t('common.lastName'),
      //     value: 'lastName',
      //     children: [
      //       {
      //         text: 'Green',
      //         value: 'Green',
      //       },
      //       {
      //         text: 'Black',
      //         value: 'Black',
      //       },
      //       {
      //         text: 'Brown',
      //         value: 'Brown',
      //       },
      //     ],
      //   },
      // ],
      // onFilter: (value: string | number | boolean, record: BasicTableRow) => record.name.includes(value.toString()),
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      // sorter: (a: BasicTableRow, b: BasicTableRow) => a.age - b.age,
      // showSorterTooltip: false,
    },
    {
      title: 'Role',
      key: 'role',
      dataIndex: 'role',
      render: (_, record) => (
        <BaseRow gutter={[10, 10]}>
          <BaseCol>
            <Status color={defineColorByRole(record.role)} text={record.role} />
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
            <BaseButton
              type="ghost"
              // onClick={() => {
              //   notificationController.info({ message: t('tables.inviteMessage', { name: record.id }) });
              // }}
            >
              <Link to={`/users/detail/${record.id}`}>{'View'}</Link>
            </BaseButton>
            {record.role !== 'ADMIN' && (
              <BaseButton type="default" danger onClick={() => handleDeleteRow(record.id)}>
                {'Delete'}
              </BaseButton>
            )}
          </BaseSpace>
        );
      },
    },
  ];
  return (
    <>
      <PageTitle>{'User List Page'}</PageTitle>
      <S.TablesWrapper>
        <S.Card id="basic-table" title={'User List'} padding="1.25rem 1.25rem 0">
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

export default UserListPage;
