export const PRIMARY_TAB_PAGES = [
  {
    route: '/weight',
    name: 'weight',
    label: '体重',
    icon: 'fluent-emoji-flat:balance-scale',
    componentName: 'WeightView',
  },
  {
    route: '/habits',
    name: 'habits',
    label: '习惯',
    icon: 'flat-color-icons:ok',
    componentName: 'HabitView',
  },
  {
    route: '/mark',
    name: 'mark',
    label: '标记',
    icon: 'twemoji:pushpin',
    componentName: 'MarkView',
  },
  {
    route: '/profile',
    name: 'profile',
    label: '我',
    icon: 'twemoji:anguished-face',
    componentName: 'ProfileView',
  },
]

export const TAB_PAGE_LABELS = Object.fromEntries(
  PRIMARY_TAB_PAGES.map((item) => [item.name, item.label])
)
