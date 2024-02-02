import { LoadingOutlined, MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { AddArticleRequest, addArticle, getArticle, updateArticle } from '@app/api/article.api';
import { getUsers } from '@app/api/users.api';
import { BaseButton } from '@app/components/common/BaseButton/BaseButton';
import { BaseCard } from '@app/components/common/BaseCard/BaseCard';
import { BaseCol } from '@app/components/common/BaseCol/BaseCol';
import { BaseRow } from '@app/components/common/BaseRow/BaseRow';
import { BaseUpload } from '@app/components/common/BaseUpload/BaseUpload';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { BaseButtonsForm } from '@app/components/common/forms/BaseButtonsForm/BaseButtonsForm';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { BaseInput } from '@app/components/common/inputs/BaseInput/BaseInput';
import { BaseSelect } from '@app/components/common/selects/BaseSelect/BaseSelect';
import { BACKEND_BASE_URL } from '@app/constants/config/api';
import { beforeUploadImage } from '@app/constants/config/upload';
import { notificationController } from '@app/controllers/notificationController';
import type { UploadProps } from 'antd';
import { Button, Form, Input } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
// import MarkdownIt from 'markdown-it';
// import MarkdownEditor from 'react-markdown-editor-lite';
// import 'react-markdown-editor-lite/lib/index.css';
import { useNavigate, useParams } from 'react-router-dom';
const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
};
// const mdParser = new MarkdownIt();

const normFile = (e = { fileList: [] }) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

const getBase64 = (img: File, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const AddArticlePage: React.FC = () => {
  const [isFieldsChanged, setFieldsChanged] = useState(false);
  const [form] = useForm();
  const [teacherOption, setTeacherOption] = useState<Array<{ value: number; label: string }>>([]);
  const initialValues = useMemo(() => {
    return {
      title: '',
      content: '',
      tags: [],
    };
  }, []);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const router = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [value, setValue] = React.useState('**Hello world!!!**');

  const handleChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj as File, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
    }
  };

  const onFinish = async (values: any) => {
    setIsLoading(true);
    const addArticlePayload: AddArticleRequest = {
      title: values.title,
      content: values.content,
      tags: values.tags,
      banner: values?.banner?.[0]?.response?.url || imageUrl,
      video: values.video,
      authorId: values.authorId,
    };

    console.log('addArticlePayload', addArticlePayload);

    if (router.articleId) {
      const data = await updateArticle(+router.articleId, addArticlePayload);
      if (data?.id) {
        notificationController.success({ message: t('common.success') });
        setIsLoading(false);
        setFieldsChanged(false);
      }
      return;
    }
    const data = await addArticle(addArticlePayload);
    if (data?.id) {
      notificationController.success({ message: t('common.success') });
      navigate('/articles/list');
    }
    setIsLoading(false);
    setFieldsChanged(false);
  };

  useEffect(() => {
    const id = router.articleId;
    const fetchUser = async (id: number) => {
      const data = await getArticle(id);
      form.setFieldsValue({
        ...data,
        banner: undefined,
        authorId: data.author.id,
      });
      setImageUrl(data.banner);
    };
    if (id) {
      fetchUser(+id);
    } else {
      form.resetFields();
      setImageUrl(undefined);
    }
  }, [router, form, initialValues]);
  useEffect(() => {
    const fetchUser = async () => {
      const response = await getUsers({ page: 1, take: 50 });
      setTeacherOption(
        response.data.map((author) => ({ value: author.id, label: `${author.firstName} ${author.lastName}` })),
      );
    };
    fetchUser();
  }, []);
  return (
    <>
      <PageTitle>{router.articleId ? 'Edit Article Page' : 'Add Article Page'}</PageTitle>
      <BaseRow gutter={[30, 30]}>
        <BaseCol xs={24} sm={24} xl={24}>
          <BaseCard id="validation form" title={router.articleId ? 'Edit Article' : 'Add Article'} padding="1.25rem">
            <BaseButtonsForm
              {...formItemLayout}
              isFieldsChanged={isFieldsChanged}
              onFieldsChange={() => setFieldsChanged(true)}
              name="validateForm"
              initialValues={initialValues}
              form={form}
              footer={
                <BaseButtonsForm.Item>
                  <BaseButton type="primary" htmlType="submit" loading={isLoading}>
                    {t('common.submit')}
                  </BaseButton>
                </BaseButtonsForm.Item>
              }
              onFinish={onFinish}
            >
              <BaseButtonsForm.Item
                name="banner"
                label={'Banner'}
                valuePropName="fileList"
                getValueFromEvent={normFile}
                rules={[{ required: imageUrl ? false : true, message: 'Article banner is required' }]}
              >
                <BaseUpload
                  name="file"
                  action={`${BACKEND_BASE_URL}/files/upload-image`}
                  listType="picture"
                  maxCount={1}
                  multiple={false}
                  showUploadList={false}
                  beforeUpload={beforeUploadImage}
                  onChange={handleChange}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="avatar" style={{ maxWidth: '500px', borderRadius: '10px' }} />
                  ) : (
                    <BaseButton type="default" icon={loading ? <LoadingOutlined /> : <UploadOutlined />}>
                      {t('forms.validationFormLabels.clickToUpload')}
                    </BaseButton>
                  )}
                </BaseUpload>
              </BaseButtonsForm.Item>
              <BaseForm.Item name="title" label={'Title'} rules={[{ required: true, message: 'Title is required' }]}>
                <BaseInput />
              </BaseForm.Item>

              <BaseRow gutter={[30, 30]} style={{ width: '100%' }}>
                <BaseCol xs={24} sm={9} xl={9}>
                  <BaseButtonsForm.Item
                    name="authorId"
                    label={'Author'}
                    hasFeedback
                    rules={[{ required: true, message: 'Author is require' }]}
                  >
                    <BaseSelect
                      showSearch
                      placeholder="Select teacher"
                      filterOption={(input, option) =>
                        (option?.label?.toLowerCase() ?? '').includes(input?.toLowerCase())
                      }
                      filterSort={(optionA, optionB) =>
                        (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                      }
                      options={teacherOption}
                    />
                  </BaseButtonsForm.Item>
                </BaseCol>
              </BaseRow>
              <Form.List
                name="tags"
                rules={[
                  {
                    validator: async (_, names) => {
                      if (!names || names.length < 1) {
                        return Promise.reject(new Error('At least 1 tag'));
                      }
                    },
                  },
                ]}
              >
                {(fields, { add, remove }, { errors }) => (
                  <>
                    {fields.map((field, index) => (
                      <Form.Item label={index === 0 ? 'Tags' : ''} required={false} key={field.key}>
                        <Form.Item
                          {...field}
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            {
                              required: true,
                              whitespace: true,
                              message:
                                fields.length === 1 ? 'Please input tag' : 'Please input tag or delete this field.',
                            },
                          ]}
                          noStyle
                        >
                          <Input />
                        </Form.Item>
                        {fields.length > 1 ? (
                          <MinusCircleOutlined className="dynamic-delete-button" onClick={() => remove(field.name)} />
                        ) : null}
                      </Form.Item>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} style={{ width: '40%' }} icon={<PlusOutlined />}>
                        Add tag
                      </Button>
                      <Form.ErrorList errors={errors} />
                    </Form.Item>
                  </>
                )}
              </Form.List>
              <BaseForm.Item
                name="content"
                label={'Content'}
                rules={[{ required: true, message: 'Content is required' }]}
              >
                <Input.TextArea autoSize={{ minRows: 4, maxRows: 7 }} />
              </BaseForm.Item>
            </BaseButtonsForm>
          </BaseCard>
        </BaseCol>
        {/* <MDEditor value={value} onChange={(e: any) => setValue(e.target.value)} /> */}
        {/* <MDEditor.Markdown source={value} style={{ whiteSpace: 'pre-wrap' }} /> */}

        {/* <ReactMarkdown>*React-Markdown* is **Awesome**</ReactMarkdown> */}
        {/* <MarkdownEditor
          value={'*React-Markdown* is **Awesome**'}
          style={{ height: '500px' }}
          //   onChange={handleEditorChange}
          renderHTML={(text) => mdParser.render(text)}
        /> */}
        {/* <div
                      dangerouslySetInnerHTML={{
                        __html: mdParser.render(newsData.content),
                      }}
                    /> */}
      </BaseRow>
    </>
  );
};

export default AddArticlePage;
