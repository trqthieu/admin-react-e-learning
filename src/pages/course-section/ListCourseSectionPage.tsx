import { BaseButton } from '@app/components/common/BaseButton/BaseButton';
import { BaseCard } from '@app/components/common/BaseCard/BaseCard';
import { BasePopconfirm } from '@app/components/common/BasePopconfirm/BasePopconfirm';
import { BaseSpace } from '@app/components/common/BaseSpace/BaseSpace';
import { BaseTable } from '@app/components/common/BaseTable/BaseTable';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { EditableCell } from '@app/components/tables/editableTable/EditableCell';
import { useMounted } from '@app/hooks/useMounted';
import { BasicTableRow, Pagination, getEditableTableData } from 'api/table.api';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 4,
};
const ListCourseSectionPage: React.FC = () => {
  const [form] = BaseForm.useForm();
  const [tableData, setTableData] = useState<{ data: BasicTableRow[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const [editingKey, setEditingKey] = useState(0);
  const { t } = useTranslation();
  const { isMounted } = useMounted();
  const router = useParams();

  const fetch = useCallback(
    (pagination: Pagination) => {
      setTableData((tableData) => ({ ...tableData, loading: true }));
      getEditableTableData(pagination).then((res) => {
        if (isMounted.current) {
          setTableData({ data: res.data, pagination: res.pagination, loading: false });
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
    cancel();
  };

  const isEditing = (record: BasicTableRow) => record.key === editingKey;

  const edit = (record: Partial<BasicTableRow> & { key: React.Key }) => {
    form.setFieldsValue({ name: '', age: '', address: '', ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey(0);
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as BasicTableRow;

      const newData = [...tableData.data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
      } else {
        newData.push(row);
      }
      setTableData({ ...tableData, data: newData });
      setEditingKey(0);
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const handleDeleteRow = (rowId: number) => {
    setTableData({ ...tableData, data: tableData.data.filter((item) => item.key !== rowId) });
  };

  const columns = [
    {
      title: t('common.name'),
      dataIndex: 'name',
      width: '25%',
      editable: true,
    },
    {
      title: t('common.age'),
      dataIndex: 'age',
      width: '15%',
      editable: true,
    },
    {
      title: t('common.address'),
      dataIndex: 'address',
      width: '30%',
      editable: true,
    },
    {
      title: t('tables.actions'),
      dataIndex: 'actions',
      width: '15%',
      render: (text: string, record: BasicTableRow) => {
        const editable = isEditing(record);
        return (
          <BaseSpace>
            {editable ? (
              <>
                <BaseButton type="primary" onClick={() => save(record.key)}>
                  {t('common.save')}
                </BaseButton>
                <BasePopconfirm title={t('tables.cancelInfo')} onConfirm={cancel}>
                  <BaseButton type="ghost">{t('common.cancel')}</BaseButton>
                </BasePopconfirm>
              </>
            ) : (
              <>
                <BaseButton type="ghost" disabled={editingKey !== 0} onClick={() => edit(record)}>
                  {t('common.edit')}
                </BaseButton>
                <BaseButton type="default" danger onClick={() => handleDeleteRow(record.key)}>
                  {t('tables.delete')}
                </BaseButton>
              </>
            )}
          </BaseSpace>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: BasicTableRow) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

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
      <BaseForm form={form} component={false}>
        <BaseTable
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={tableData.data}
          columns={mergedColumns}
          rowClassName="editable-row"
          // pagination={{
          //   ...tableData.pagination,
          //   onChange: cancel,
          // }}
          onChange={handleTableChange}
          loading={tableData.loading}
          scroll={{ x: 800 }}
        />
      </BaseForm>
    </BaseCard>
  );
};

export default ListCourseSectionPage;
