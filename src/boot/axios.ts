import { boot } from 'quasar/wrappers';
import axios from 'axios';
import { stockdivStore } from 'stores/stockdivStore';
import VueApexCharts from 'vue3-apexcharts';
import VueHorizontalTimeline from 'vue-horizontal-timeline';

//const baseURLProd = 'http://localhost:3000/api/';
const baseURLProd = 'https://stockdiv.com:8445/api';

const api = axios.create({ baseURL: baseURLProd });
api.interceptors.request.use(
  (config) => {
    if (config != null && config.headers != null) {
      config.headers['Authorization'] = `Bearer ${stockdivStore().token}`;
    }
    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
  app.use(VueApexCharts);
  app.use(VueHorizontalTimeline);
});

export { api };
