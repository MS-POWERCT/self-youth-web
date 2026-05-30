export default [
  {
    path: "/userSettings/account-login",
    name: "userSettingsAccountLogin",
    component: () => import('./AccountLoginView.vue'),
    meta: { requiresAuth: true },
  }
];
