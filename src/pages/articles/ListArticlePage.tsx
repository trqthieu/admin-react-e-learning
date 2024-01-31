import { ExclamationCircleFilled } from '@ant-design/icons';
import { ArticleResponse, deleteArticle, getArticles } from '@app/api/article.api';
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
import { defineColorByPriority, defineColorByStatus, defineColorRandom } from '@app/utils/utils';
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
const ListArticlePage: React.FC = () => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState<{ data: ArticleResponse[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const { isMounted } = useMounted();

  const fetch = useCallback(
    (pagination: Pagination) => {
      setTableData((tableData) => ({ ...tableData, loading: true }));
      getArticles({
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
      title: 'Are you sure delete this article?',
      icon: <ExclamationCircleFilled />,
      content: 'Some descriptions',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteArticle(id).then((res) => {
          if (res.affected) {
            fetch(initialPagination);
            notificationController.success({ message: 'Delete article successfully' });
          }
        });
      },
    });
  };

  const columns: ColumnsType<ArticleResponse> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render(value) {
        return (
          <Typography.Text ellipsis={true} style={{ width: 200 }}>
            {value}
          </Typography.Text>
        );
      },
    },
    {
      title: 'Banner',
      dataIndex: 'banner',
      render(value, record) {
        return <img style={{ maxWidth: '100px' }} src={record.banner} />;
      },
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      render: (_, record) => (
        <span>{record?.author?.id ? `${record?.author?.firstName} ${record?.author?.lastName}` : 'N/A'}</span>
      ),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <BaseRow gutter={[10, 10]}>
          {tags.map((tag: string) => {
            return (
              <BaseCol key={tag}>
                <Status color={defineColorRandom()} text={`# ${tag}`} />
              </BaseCol>
            );
          })}
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
              <Link to={`/articles/detail/${record.id}`}>{'Edit'}</Link>
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
      <PageTitle>{'Article List Page'}</PageTitle>
      <S.TablesWrapper>
        <S.Card id="basic-table" title={'Article List'} padding="1.25rem 1.25rem 0">
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

export default ListArticlePage;
