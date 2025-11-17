const runtime = (typeof window !== 'undefined' && window._env_) ? window._env_ : {};

const config = {
  API_BASE_URL:
    runtime.API_BASE_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    'http://localhost:8080',

  S3_BUCKET_URL:
    runtime.S3_BUCKET_URL ||
    process.env.REACT_APP_S3_BUCKET_URL ||
    process.env.VITE_S3_BUCKET_URL ||
    'https://beauty-barreto-source.s3.us-east-1.amazonaws.com',

  GOOGLE_OAUTH_PATH:
    runtime.GOOGLE_OAUTH_PATH ||
    process.env.REACT_APP_GOOGLE_OAUTH_PATH ||
    process.env.VITE_GOOGLE_OAUTH_PATH ||
    '/oauth2/authorization/google'
};

export default config;