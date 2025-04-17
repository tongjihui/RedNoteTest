import request from '../utils/request';

// 用户相关接口
export const userApi = {
  // 登录
  login: (data) => request.post('/auth/login', data),
  // 注册
  register: (data) => request.post('/auth/register', data),
  // 获取用户信息
  getUserInfo: () => request.get('/user/info'),
  // 更新用户信息
  updateUserInfo: (data) => request.put('/user/info', data),
  // 上传头像
  uploadAvatar: (filePath) => request.upload('/user/avatar', filePath),
  // 关注用户
  followUser: (userId) => request.post(`/user/follow/${userId}`),
  // 取消关注
  unfollowUser: (userId) => request.delete(`/user/follow/${userId}`),
  // 获取关注列表
  getFollowing: (userId) => request.get(`/user/${userId}/following`),
  // 获取粉丝列表
  getFollowers: (userId) => request.get(`/user/${userId}/followers`)
};

// 笔记相关接口
export const postApi = {
  // 获取推荐笔记
  getRecommended: (params) => request.get('/posts/recommended', params),
  // 获取关注的笔记
  getFollowing: (params) => request.get('/posts/following', params),
  // 获取笔记详情
  getDetail: (postId) => request.get(`/posts/${postId}`),
  // 发布笔记
  create: (data) => request.post('/posts', data),
  // 上传笔记图片
  uploadImage: (filePath) => request.upload('/posts/image', filePath),
  // 上传笔记视频
  uploadVideo: (filePath) => request.upload('/posts/video', filePath),
  // 点赞笔记
  like: (postId) => request.post(`/posts/${postId}/like`),
  // 取消点赞
  unlike: (postId) => request.delete(`/posts/${postId}/like`),
  // 收藏笔记
  collect: (postId) => request.post(`/posts/${postId}/collect`),
  // 取消收藏
  uncollect: (postId) => request.delete(`/posts/${postId}/collect`),
  // 获取评论列表
  getComments: (postId, params) => request.get(`/posts/${postId}/comments`, params),
  // 发表评论
  comment: (postId, data) => request.post(`/posts/${postId}/comments`, data),
  // 删除评论
  deleteComment: (postId, commentId) => request.delete(`/posts/${postId}/comments/${commentId}`)
};

// 消息相关接口
export const messageApi = {
  // 获取消息列表
  getList: () => request.get('/messages'),
  // 获取未读消息数
  getUnreadCount: () => request.get('/messages/unread/count'),
  // 标记消息已读
  markRead: (messageId) => request.put(`/messages/${messageId}/read`),
  // 获取聊天记录
  getChatHistory: (userId, params) => request.get(`/messages/chat/${userId}`, params),
  // 发送消息
  sendMessage: (data) => request.post('/messages', data)
};

// 商城相关接口
export const shopApi = {
  // 获取商品列表
  getProducts: (params) => request.get('/products', params),
  // 获取商品详情
  getProductDetail: (productId) => request.get(`/products/${productId}`),
  // 加入购物车
  addToCart: (data) => request.post('/cart', data),
  // 获取购物车列表
  getCart: () => request.get('/cart'),
  // 更新购物车商品数量
  updateCartItem: (itemId, data) => request.put(`/cart/${itemId}`, data),
  // 删除购物车商品
  removeFromCart: (itemId) => request.delete(`/cart/${itemId}`),
  // 创建订单
  createOrder: (data) => request.post('/orders', data),
  // 获取订单列表
  getOrders: (params) => request.get('/orders', params),
  // 获取订单详情
  getOrderDetail: (orderId) => request.get(`/orders/${orderId}`),
  // 取消订单
  cancelOrder: (orderId) => request.put(`/orders/${orderId}/cancel`)
};

// 搜索相关接口
export const searchApi = {
  // 搜索
  search: (params) => request.get('/search', params),
  // 获取热搜榜
  getHotSearch: () => request.get('/search/hot'),
  // 获取搜索建议
  getSuggestions: (keyword) => request.get('/search/suggestions', { keyword })
};

// 话题相关接口
export const topicApi = {
  // 获取热门话题
  getHotTopics: () => request.get('/topics/hot'),
  // 获取话题详情
  getTopicDetail: (topicId) => request.get(`/topics/${topicId}`),
  // 获取话题下的笔记
  getTopicPosts: (topicId, params) => request.get(`/topics/${topicId}/posts`, params)
}; 