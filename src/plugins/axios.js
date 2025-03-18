/**
 * axiosの共通設定
 */
import axios from 'axios';
import cf from '../mixins/commonFunctions';

const ENV = cf.getEnvironment();
let baseURL = import.meta.env.VITE_APP_APIBASE;
let Authorization = import.meta.env.VITE_APP_TOKEN;

// 環境変数の切り替え
switch (ENV.name) {
  case 'develop':
    Authorization = import.meta.env.VITE_APP_DEV_TOKEN;
    baseURL = import.meta.env.VITE_APP_DEV_APIBASE;
    break;
  case 'production':
    Authorization = import.meta.env.VITE_APP_PROD_TOKEN;
    baseURL = import.meta.env.VITE_APP_PROD_APIBASE;
    break;
  default: break;
}


export default axios.create({
  headers: {
    Authorization,
  },
  baseURL,
  responseType: 'json',
});
