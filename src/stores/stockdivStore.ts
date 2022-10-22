import { defineStore } from 'pinia';

export const stockdivStore = defineStore('stockdiv', {
  state: () => ({
    token: '',
    portfolios: []
  }),

  getters: {
    getToken(state) {
      return state.token;
    },
    getPortfolios(state) {
      return state.portfolios;
    }
  },

  actions: {},
});
