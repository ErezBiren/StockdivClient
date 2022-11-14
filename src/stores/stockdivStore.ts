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
    },
    dividendAlerts: [] as IDividendAlert[],
    announcements: [] as { theDate: string; theMessage: string }[],
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
    getDividendAlerts(state) {
      return state.dividendAlerts;
    },
    getAnnouncements(state) {
      return state.announcements;
    },
  },

  actions: {},
});
