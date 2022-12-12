import { defineStore } from 'pinia';
import { SortByEnum } from 'src/utils/enums/SortByEnum';
import { SortDirectionEnum } from 'src/utils/enums/SortDirectionEnum';
import { ViewModeEnum } from 'src/utils/enums/ViewModeEnum';
import { IDividendAlert } from 'src/utils/interfaces/IDividendAlert';

export const stockdivStore = defineStore('stockdiv', {
  state: () => ({
    token: '',
    portfolios: [],
    selectedPortfolio: '',
    settings: {
      dateFormat: 'YYYY-MM-DD',
      defaultTax: 0,
      decimalDigits: 2,
      portfolioView: {
        mode: ViewModeEnum.CARD,
        sortBy: SortByEnum.PROFITLOSSPERCENT,
        sortDirection: SortDirectionEnum.DESC,
        visibleColumns: [],
      },
      screenerView: {
        mode: ViewModeEnum.CARD,
        sortBy: SortByEnum.YEARS,
        sortDirection: SortDirectionEnum.DESC,
        visibleColumns: [],
      },
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
    getDecimalDigits(state) {
      return state.settings.decimalDigits;
    },
    getPortfolioView(state) {
      return state.settings.portfolioView;
    },
    getScreenerViewMode(state) {
      return state.settings.screenerView;
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
