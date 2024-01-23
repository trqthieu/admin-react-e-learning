import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tables } from '@app/components/tables/Tables/Tables';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';

const UserListPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle>{t('common.dataTables')}</PageTitle>
      <Tables />
    </>
  );
};

export default UserListPage;
