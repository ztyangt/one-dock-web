export const customPageRoutes: Record<string, string> = {
  links: 'front-page-links',
  archives: 'front-page-archives',
}

export const genderJson: Record<string, string> = {
  boy: '男',
  girl: '女',
}

export const bindTypeJson: Record<string, string> = {
  article: '文章',
  page: '页面',
}

export const expJson: Record<string, any> = {
  login: {
    name: '登录',
    icon: 'renli',
    value: 5,
    limit: 1,
    text: '登录了系统',
  },
  'check-in': {
    name: '签到',
    icon: 'calendar-1',
    value: 30,
    limit: 1,
    text: '签到成功',
  },
  visit: {
    name: '访问',
    icon: 'zuji',
    value: 1,
    limit: 1,
    text: '访问了',
  },
  collect: {
    name: '收藏',
    icon: 'collect',
    value: 1,
    limit: 10,
    text: '收藏了',
  },
  like: {
    name: '点赞',
    icon: 'thumb',
    value: 1,
    limit: 10,
    text: '点赞了',
  },
  comment: {
    name: '评论',
    icon: 'comment-1',
    value: 1,
    limit: 10,
    text: '评论了',
  },
  share: {
    name: '分享',
    icon: 'share',
    value: 1,
    limit: 10,
    text: '分享了',
  },
}
