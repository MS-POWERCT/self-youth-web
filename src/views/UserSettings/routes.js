export default [
  {
    path: "/userSettings/account-login",
    name: "userSettingsAccountLogin",
    component: () => import('./AccountLoginView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: "/userSettings/statistics",
    name: "sUserSetting",
    component: () => import('./UserSettingView.vue'),
    meta: { requiresAuth: true },
  },
];
