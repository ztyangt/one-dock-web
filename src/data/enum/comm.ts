export namespace CommEnum {
  /**
   * 标签类型
   */
  export enum TagType {
    ARTICLE = 1, // 文章
    DIARY = 2, // 日记
    ALBUM = 3, // 相册
    MEMO = 4, // 便签
  }

  /**
   * 分类类型
   */
  export enum CategoryType {
    ARTICLE = 1, // 文章
    LINKS = 2, // 友链
  }

  /**
   * 编辑器类型
   */
  export enum EditorType {
    MARKDOWN = "markdown", // markdown
    RICH_TEXT = "rich-text", // 富文本
  }

  /**
   * 链接打开方式
   */
  export enum Target {
    SELF = "_self", // 当前窗口
    BLANK = "_blank", // 新开窗口
  }

  /**
   * 网络请求类型
   */
  export enum MethodType {
    GET = "GET", // GET请求
    POST = "POST", // POST请求
    PUT = "PUT", // PUT请求
    DELETE = "DELETE", // DELETE请求
    PATCH = "PATCH", // PATCH请求
    OPTIONS = "OPTIONS", // OPTIONS请求
    HEAD = "HEAD", // HEAD请求
  }

  export enum ActionType {
    LOGIN = "login", // 登录
    CHECKIN = "check-in", // 签到
    VISIT = "visit", // 访问
    COLLECT = "collect", // 收藏
    LIKE = "like", // 点赞
    COMMENT = "comment", // 评论
    SHARE = "share", // 分享
  }
}
