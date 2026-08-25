export default [
  {
    path: "/userSettings/statistics",
    name: "sUserSetting",
    component: () => import('./UserSettingView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: "/userSettings/activity-log",
    name: "userActivityLog",
    component: () => import('./UserActivityLogView.vue'),
    meta: { requiresAuth: true },
  },
];
