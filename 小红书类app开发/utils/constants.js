// 文件相关常量
export const FILE = {
  // 图片类型
  IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'gif'],
  // 视频类型
  VIDEO_TYPES: ['mp4', 'mov'],
  // 最大图片大小 (10MB)
  MAX_IMAGE_SIZE: 10 * 1024 * 1024,
  // 最大视频大小 (100MB)
  MAX_VIDEO_SIZE: 100 * 1024 * 1024,
  // 最大上传图片数量
  MAX_IMAGE_COUNT: 9,
  // 图片压缩质量
  IMAGE_QUALITY: 0.8
};

// 笔记相关常量
export const POST = {
  // 最大标题长度
  MAX_TITLE_LENGTH: 50,
  // 最大内容长度
  MAX_CONTENT_LENGTH: 1000,
  // 最大话题数量
  MAX_TOPIC_COUNT: 10,
  // 最大位置字符长度
  MAX_LOCATION_LENGTH: 50
};

// 用户相关常量
export const USER = {
  // 最大昵称长度
  MAX_NICKNAME_LENGTH: 20,
  // 最大签名长度
  MAX_BIO_LENGTH: 100,
  // 密码最小长度
  MIN_PASSWORD_LENGTH: 6,
  // 密码最大长度
  MAX_PASSWORD_LENGTH: 20
};

// 评论相关常量
export const COMMENT = {
  // 最大评论长度
  MAX_CONTENT_LENGTH: 200,
  // 评论分页大小
  PAGE_SIZE: 20
};

// 消息相关常量
export const MESSAGE = {
  // 消息类型
  TYPES: {
    SYSTEM: 'system',    // 系统消息
    LIKE: 'like',        // 点赞消息
    COMMENT: 'comment',  // 评论消息
    FOLLOW: 'follow',    // 关注消息
    CHAT: 'chat'         // 聊天消息
  },
  // 聊天消息类型
  CHAT_TYPES: {
    TEXT: 'text',    // 文本消息
    IMAGE: 'image',  // 图片消息
    VOICE: 'voice'   // 语音消息
  }
};

// 订单相关常量
export const ORDER = {
  // 订单状态
  STATUS: {
    PENDING_PAYMENT: 'pending_payment',   // 待支付
    PAID: 'paid',                        // 已支付
    SHIPPED: 'shipped',                  // 已发货
    COMPLETED: 'completed',              // 已完成
    CANCELLED: 'cancelled',              // 已取消
    REFUNDING: 'refunding',              // 退款中
    REFUNDED: 'refunded'                 // 已退款
  }
};

// 通用常量
export const COMMON = {
  // 默认分页大小
  PAGE_SIZE: 20,
  // 性别选项
  GENDER: {
    MALE: 1,
    FEMALE: 2,
    OTHER: 0
  },
  // 主题色
  THEME_COLOR: '#FF2442',
  // 辅助色
  ASSISTANT_COLOR: '#666666'
}; 