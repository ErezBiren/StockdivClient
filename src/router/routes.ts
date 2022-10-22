import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/mainLayout.vue'),
    children: [
      { path: '/login', component: () => import('pages/login.vue') },
      {
        name: 'overview',
        path: '/overview',
        component: () => import('pages/overview.vue'),
      },
      {        
        path: '/ticker/:portfolio/:ticker',
        component: () => import('pages/tickerPage.vue'),
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
