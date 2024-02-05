import { message } from 'antd';

export const uploadFileValidation = {
  image: {
    pattern: ['image/jpeg', 'image/png', 'image/webp'],
    messagePattern: 'You can only upload JPG/PNG/WEBP file!',
    limit: 2,
    messageLimit: 'Image must smaller than 2MB!',
  },
  video: {
    pattern: ['video/mp4'],
    messagePattern: 'You can only upload MP4 file!',
    limit: 20,
    messageLimit: 'Video must smaller than 20MB!',
  },
  audio: {
    pattern: ['audio/mpeg'],
    messagePattern: 'You can only upload MP3 file!',
    limit: 50,
    messageLimit: 'Audio must smaller than 20MB!',
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

export const beforeUploadAudio = (file: File) => {
  const isJpgOrPng = uploadFileValidation.audio.pattern.includes(file.type);
  if (!isJpgOrPng) {
    message.error(uploadFileValidation.audio.messagePattern);
  }
  const isLt2M = file.size / 1024 / 1024 < uploadFileValidation.audio.limit;
  if (!isLt2M) {
    message.error(uploadFileValidation.audio.messageLimit);
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
