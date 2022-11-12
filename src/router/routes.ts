import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/mainLayout.vue'),
    children: [
      { path: '/login', component: () => import('pages/login.vue') },
      {
        path: '/overview',
        component: () => import('pages/overview.vue'),
      },
      {
        path: '/ticker/:portfolio/:ticker',
        component: () => import('pages/tickerPage.vue'),
      },
      {
        path: '/yearlyPaymentMatrix',
        component: () => import('src/pages/YearlyPaymentMatrix.vue'),
      },
      {
        path: '/monthlyDividendsView/:month',
        component: () => import('src/pages/MonthlyDividendsView.vue'),
      },
      {
        path: '/dividendAlerts',
        component: () => import('src/pages/DividendAlerts.vue'),
      },
      {
        path: '/announcements',
        component: () => import('src/pages/Announcements.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
