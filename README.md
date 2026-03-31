# one-dock-web

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```



新增一个菜单名称为：人生手账，包含二级菜单：博客文章、日常备忘、心事日记、灵感笔记、光影相册、足迹打卡；
并完成每个功能模块功能：
1. 博客文章：
markdown编辑，可插入图片、链接、排版格式化；
提供公开 / 私密发布权限控制，支持分类、标签管理；
支持文章搜索、阅读量统计、评论开关、草稿自动保存；
可生成分享链接，对外展示个人博客主页。

2. 日常备忘：
支持快速创建文字备忘、待办事项，可标记完成 / 未完成；
支持设置日期提醒、重复提醒（每日 / 每周 / 每月）；
支持置顶、分类、搜索、归档，支持轻量优先级排序。

3. 心事日记：
仅本人可见，支持按日期自动归档，支持日历视图查阅；
支持文字、表情、图片记录，
支持心情标记、天气标记、关键词检索。需要有纸质日记的效果

4. 灵感笔记：
支markdown编辑、清单、图片、代码片段等；
支持文件夹分类、星标收藏、全文搜索；
支持笔记复制 / 分享。分享卡片生成，笔记卡片

5. 时光相册
支持图片上传、批量管理、按时间 / 相册分组；
支持创建自定义相册，设置公开 / 私密权限；
支持图片预览、滑动查看、删除 / 重命名 / 移动。

6. 足迹打卡：
支持地图可视化展示（leaflet）
支持定位打卡，记录地点、时间、文字描述、图片；
自动生成足迹地图 / 时间线，支持按年月统计；
支持足迹隐藏 / 分享，支持导出旅行 / 生活轨迹。

样式风格保持清新优雅，基于本系统已有样式，偏向腾讯云网站UI样式
