import { defineStore } from 'pinia';
import { IDividendAlert } from 'src/utils/interfaces/IDividendAlert';

export const stockdivStore = defineStore('stockdiv', {
  state: () => ({
    token: '',
    portfolios: [],
    selectedPortfolio: '',
    settings: {
      dateFormat: 'YYYY-MM-DD',
      defaultTax: 0,
      portfolios: [],
    },
    dividendAlerts: [] as IDividendAlert[],
  }),

  getters: {
    getToken(state) {
      return state.token;
    },
    getPortfolios(state) {
      return state.portfolios;
    },
    getSelectedPortfolio(state) {
      return state.selectedPortfolio;
    },
    getDateFormat(state) {
      return state.settings.dateFormat;
    },
    getDefaultTax(state) {
      return state.settings.defaultTax;
    },
    getPortfoliosSettings(state) {
      return state.settings.portfolios;
    },
    getDividendAlerts(state) {
      return state.dividendAlerts;
    },
  },

  actions: {},
});
