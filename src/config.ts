import type { Site, SocialObjects } from './types'

export const SITE: Site = {
  website: 'https://dev-hobin.github.io/',
  author: 'Hobin Jang',
  desc: '개발자로서 여러 생각을 기록합니다',
  title: '장호빈',
  ogImage: 'blog-og.jpeg',
  lightAndDarkMode: true,
  postPerPage: 10,
}

export const LOCALE = ['ko']

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
}

export const SOCIALS: SocialObjects = [
  {
    name: 'Github',
    href: 'https://github.com/dev-hobin',
    linkTitle: ` ${SITE.title}의 깃허브`,
    active: true,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/janghobin',
    linkTitle: `${SITE.title}의 링크드인`,
    active: true,
  },
  {
    name: 'Mail',
    href: 'mailto:devhobin@gmail.com',
    linkTitle: `${SITE.title}에게 이메일 보내기`,
    active: true,
  },
]
