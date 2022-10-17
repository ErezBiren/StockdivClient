import { defineStore } from 'pinia';

export const stockdivStore = defineStore('stockdiv', {
  state: () => ({
    token: '',
  }),

  getters: {
    getToken(state) {
      return state.token;
    },
  },

  actions: {},
});
