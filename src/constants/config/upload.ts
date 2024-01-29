import { message } from 'antd';

export const uploadFileValidation = {
  image: {
    pattern: ['image/jpeg', 'image/png'],
    messagePattern: 'You can only upload JPG/PNG file!',
    limit: 2,
    messageLimit: 'Image must smaller than 2MB!',
  },
  video: {
    pattern: ['video/mp4'],
    messagePattern: 'You can only upload MP4 file!',
    limit: 20,
    messageLimit: 'Video must smaller than 20MB!',
  },
  document: {
    pattern: [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    messagePattern: 'You can only upload PDF/DOCX/TXT/PPTX file!',
    limit: 20,
    messageLimit: 'Document must smaller than 20MB!',
  },
};

export const beforeUploadImage = (file: File) => {
  const isJpgOrPng = uploadFileValidation.image.pattern.includes(file.type);
  if (!isJpgOrPng) {
    message.error(uploadFileValidation.image.messagePattern);
  }
  const isLt2M = file.size / 1024 / 1024 < uploadFileValidation.image.limit;
  if (!isLt2M) {
    message.error(uploadFileValidation.image.messageLimit);
  }
  return isJpgOrPng && isLt2M;
};

export const beforeUploadVideo = (file: File) => {
  const isJpgOrPng = uploadFileValidation.video.pattern.includes(file.type);
  if (!isJpgOrPng) {
    message.error(uploadFileValidation.video.messagePattern);
  }
  const isLt2M = file.size / 1024 / 1024 < uploadFileValidation.video.limit;
  if (!isLt2M) {
    message.error(uploadFileValidation.video.messageLimit);
  }
  return isJpgOrPng && isLt2M;
};

export const beforeUploadDocument = (file: File) => {
  const isJpgOrPng = uploadFileValidation.document.pattern.includes(file.type);
  if (!isJpgOrPng) {
    message.error(uploadFileValidation.document.messagePattern);
  }
  const isLt2M = file.size / 1024 / 1024 < uploadFileValidation.document.limit;
  if (!isLt2M) {
    message.error(uploadFileValidation.document.messageLimit);
  }
  return isJpgOrPng && isLt2M;
};
