export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/interview/interview',
    'pages/shenlun/shenlun',
    'pages/news/news',
    'pages/profile/profile',
  ],
  subPackages: [
    {
      root: 'subpkg-practice',
      pages: [
        'pages/mode-select/index',
        'pages/question/index',
        'pages/result/index',
        'pages/custom/index',
        'pages/set-select/index',
        'pages/set-question/index',
        'pages/set-result/index',
      ],
    },
    {
      root: 'subpkg-zhenti',
      pages: [
        'pages/list/index',
        'pages/detail/index',
      ],
    },
    {
      root: 'subpkg-shenlun',
      pages: [
        'pages/list/index',
        'pages/detail/index',
        'pages/ocr/index',
      ],
    },
    {
      root: 'subpkg-history',
      pages: [
        'pages/list/index',
        'pages/detail/index',
      ],
    },
    {
      root: 'subpkg-supply',
      pages: [
        'pages/draw/index',
        'pages/collection/index',
        'pages/collection/detail',
      ],
    },
  ],
  tabBar: {
    color: '#999999',
    selectedColor: '#3b82f6',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
      },
      {
        pagePath: 'pages/interview/interview',
        text: '面试',
      },
      {
        pagePath: 'pages/shenlun/shenlun',
        text: '申论',
      },
      {
        pagePath: 'pages/news/news',
        text: '要闻',
      },
      {
        pagePath: 'pages/profile/profile',
        text: '我的',
      },
    ],
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '申面智能小助手',
    navigationBarTextStyle: 'black',
  },
})
