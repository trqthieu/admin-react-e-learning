import { InboxOutlined, LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import {
  AddCourseLessonRequest,
  CourseLessonResponse,
  addCourseLesson,
  getCourseLesson,
  getCourseLessons,
  updateCourseLesson,
} from '@app/api/course-lesson.api';
import { BaseButton } from '@app/components/common/BaseButton/BaseButton';
import { BaseCard } from '@app/components/common/BaseCard/BaseCard';
import { BaseCol } from '@app/components/common/BaseCol/BaseCol';
import { BaseRow } from '@app/components/common/BaseRow/BaseRow';
import { BaseUpload } from '@app/components/common/BaseUpload/BaseUpload';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { BaseButtonsForm } from '@app/components/common/forms/BaseButtonsForm/BaseButtonsForm';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { BaseInput } from '@app/components/common/inputs/BaseInput/BaseInput';
import { BACKEND_BASE_URL } from '@app/constants/config/api';
import { beforeUploadDocument, beforeUploadImage, beforeUploadVideo } from '@app/constants/config/upload';
import { notificationController } from '@app/controllers/notificationController';
import type { UploadProps } from 'antd';
import { Input } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
};

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

const AddLessonPage: React.FC = () => {
  const [isFieldsChanged, setFieldsChanged] = useState(false);
  const [lessonList, setLessonList] = useState<Array<CourseLessonResponse>>([]);
  console.log('lessonList', lessonList);

  const [form] = useForm();
  const initialValues = useMemo(() => {
    return {
      title: '',
      // banner: 'http://res.cloudinary.com/dqzfbcoia/image/upload/v1706546211/dvt3ccbdfqhcktvfe8s9.jpg',
      description: '',
      content: '',
      // video:
      //   'https://firebasestorage.googleapis.com/v0/b/e-learning-25868.appspot.com/o/eb3aca17-3b69-4bea-ac34-26bd7523c4ca-movie-app.mp4?alt=media',
      // attachments: [
      //   'https://firebasestorage.googleapis.com/v0/b/e-learning-25868.appspot.com/o/85a41ec6-dfcf-4eb9-ae7f-b9672356fb6b-e-learning.pdf?alt=media',
      //   'https://firebasestorage.googleapis.com/v0/b/e-learning-25868.appspot.com/o/c3a609f2-3b8b-4151-a5e3-533ba588a899-ImprovingPerformanceAndroid.pptx?alt=media',
      // ],
    };
  }, []);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const router = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  console.log(router);
  const fetchLesson = useCallback(async (unitId: number) => {
    const data = await getCourseLessons({ courseUnitId: unitId, page: 1, take: 50 });
    setLessonList(data.data.sort((a, b) => a.order - b.order));
  }, []);

  useEffect(() => {
    if (router.unitId) {
      fetchLesson(+router.unitId);
    }
  }, [fetchLesson, router.unitId]);

  const handleChangeImage: UploadProps['onChange'] = (info) => {
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
    console.log('values', values);
    setIsLoading(true);
    const theLastLesson = lessonList[lessonList.length - 1];
    const theLastOrder = theLastLesson ? theLastLesson.order + 1 : 0;
    const addLessonPayload: AddCourseLessonRequest = {
      title: values.title,
      description: values.description,
      content: values.content,
      banner: values?.banner?.[0]?.response?.url || imageUrl,
      courseUnitId: router?.unitId ? +router?.unitId : 0,
      video: values?.video?.[0]?.response?.url || values?.video?.[0]?.url,
      attachments: values?.attachments?.map((attachment: any) => attachment?.url || attachment?.response?.url),
      order: values.order ?? theLastOrder,
    };
    if (router.lessonId) {
      const data = await updateCourseLesson(+router.lessonId, addLessonPayload);
      if (data?.id) {
        notificationController.success({ message: t('common.success') });
        setIsLoading(false);
        setFieldsChanged(false);
      }
      setIsLoading(false);
      setFieldsChanged(false);
      return;
    }
    const data = await addCourseLesson(addLessonPayload);
    if (data?.id) {
      notificationController.success({ message: t('common.success') });
      navigate(`/courses/detail/${router.courseId}/sections/${router.sectionId}/units/${router.unitId}`);
    }
    setIsLoading(false);
    setFieldsChanged(false);
  };

  useEffect(() => {
    const id = router.lessonId;
    const fetchLesson = async (id: number) => {
      const data = await getCourseLesson(id);
      form.setFieldsValue({
        banner: undefined,
        title: data.title,
        description: data.description,
        content: data.content,
        order: data.order || 0,
        video: [
          {
            name: 'Click to see video',
            url: data.video,
          },
        ],
        attachments: [
          ...data.attachments.map((attachment, index) => ({
            name: `Attachment ${index + 1}`,
            url: attachment,
          })),
        ],
      });
      setImageUrl(data.banner);
    };
    if (id) {
      fetchLesson(+id);
    } else {
      form.resetFields();
      setImageUrl(undefined);
    }
  }, [form, router.lessonId]);

  return (
    <>
      <PageTitle>{router.lessonId ? 'Edit Lesson Page' : 'Add Lesson Page'}</PageTitle>
      <BaseRow gutter={[30, 30]}>
        <BaseCol xs={24} sm={24} xl={24}>
          <BaseCard id="validation form" title={router.lessonId ? 'Edit Lesson' : 'Add Lesson'} padding="1.25rem">
            <BaseButton
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
              }}
              type="default"
            >
              <Link to={`/courses/detail/${router.courseId}/sections/${router.sectionId}/units/${router.unitId}`}>
                Back to course lesson
              </Link>
            </BaseButton>
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
                rules={[{ required: imageUrl ? false : true, message: 'Course banner is required' }]}
              >
                <BaseUpload
                  name="file"
                  action={`${BACKEND_BASE_URL}/files/upload-image`}
                  listType="picture"
                  maxCount={1}
                  multiple={false}
                  showUploadList={false}
                  beforeUpload={beforeUploadImage}
                  onChange={handleChangeImage}
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
              <BaseForm.Item
                name="order"
                label={'Order'}
                // rules={[{ required: true, message: 'Order is required' }]}
                hidden
              >
                <BaseInput />
              </BaseForm.Item>
              <BaseForm.Item
                name="description"
                label={'Description'}
                rules={[{ required: true, message: 'Description is required' }]}
              >
                <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} />
              </BaseForm.Item>
              <BaseForm.Item
                name="content"
                label={'Content'}
                rules={[{ required: true, message: 'Content is required' }]}
              >
                <Input.TextArea autoSize={{ minRows: 4, maxRows: 7 }} />
              </BaseForm.Item>
              <BaseButtonsForm.Item name="video" label={'Video'} valuePropName="fileList" getValueFromEvent={normFile}>
                <BaseUpload
                  name="file"
                  action={`${BACKEND_BASE_URL}/files/upload-document`}
                  listType="picture"
                  beforeUpload={beforeUploadVideo}
                  maxCount={1}
                >
                  <BaseButton type="default" icon={<UploadOutlined />}>
                    {t('forms.validationFormLabels.clickToUpload')}
                  </BaseButton>
                </BaseUpload>
              </BaseButtonsForm.Item>
              <BaseButtonsForm.Item label={'Attachments'}>
                <BaseButtonsForm.Item name="attachments" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                  <BaseUpload.Dragger
                    name="file"
                    action={`${BACKEND_BASE_URL}/files/upload-document`}
                    beforeUpload={beforeUploadDocument}
                  >
                    <p>
                      <InboxOutlined />
                    </p>
                    <p>{t('forms.validationFormLabels.clickToDrag')}</p>
                  </BaseUpload.Dragger>
                </BaseButtonsForm.Item>
              </BaseButtonsForm.Item>
            </BaseButtonsForm>
          </BaseCard>
        </BaseCol>
      </BaseRow>
    </>
  );
};

export default AddLessonPage;
