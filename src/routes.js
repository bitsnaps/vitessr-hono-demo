export default [
    {
      path: '/',
      component: () => import('./pages/Home.vue'),
      name: 'home',
    },
    {
      path: '/about',
      component: () => import('./pages/About.vue'),
      name: 'about',
    },
    {
      path: '/:catchAll(.*)',
      name: 'not-found',
      component: () => import('./pages/404.vue'),
    },
  ]