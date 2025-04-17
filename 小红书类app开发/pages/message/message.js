import { messageApi, userApi } from '../../api/index';
import { formatTime } from '../../utils/util';

Page({
  data: {
    currentType: 'chat', // 当前消息类型：chat-聊天，notification-通知
    unreadCounts: {
      chat: 0,
      notification: 0
    },
    chatList: [], // 聊天列表
    likeList: [], // 点赞通知
    commentList: [], // 评论通知
    followList: [], // 关注通知
    systemList: [], // 系统通知
    isRefreshing: false, // 是否正在刷新
    hasNotifications: false // 是否有通知消息
  },

  onLoad() {
    this.loadUnreadCount();
    this.loadMessages();
  },

  onShow() {
    // 每次页面显示时更新未读消息数
    this.loadUnreadCount();
  },

  // 加载未读消息数
  async loadUnreadCount() {
    try {
      const res = await messageApi.getUnreadCount();
      this.setData({
        unreadCounts: res
      });
    } catch (error) {
      console.error('获取未读消息数失败:', error);
    }
  },

  // 切换消息类型
  switchType(e) {
    const type = e.currentTarget.dataset.type;
    if (this.data.currentType === type) return;

    this.setData({
      currentType: type
    });

    // 加载对应类型的消息
    this.loadMessages();
  },

  // 加载消息列表
  async loadMessages() {
    const { currentType } = this.data;

    try {
      if (currentType === 'chat') {
        await this.loadChatList();
      } else {
        await Promise.all([
          this.loadLikeList(),
          this.loadCommentList(),
          this.loadFollowList(),
          this.loadSystemList()
        ]);
      }
    } catch (error) {
      console.error('加载消息列表失败:', error);
      tt.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({
        isRefreshing: false
      });
    }
  },

  // 加载聊天列表
  async loadChatList() {
    try {
      const res = await messageApi.getList();
      const formattedList = res.list.map(item => ({
        ...item,
        lastTime: formatTime(item.lastTime)
      }));
      this.setData({
        chatList: formattedList
      });
    } catch (error) {
      console.error('加载聊天列表失败:', error);
    }
  },

  // 加载点赞通知
  async loadLikeList() {
    try {
      const res = await messageApi.getList({ type: 'like' });
      const formattedList = res.list.map(item => ({
        ...item,
        time: formatTime(item.time)
      }));
      this.setData({
        likeList: formattedList,
        hasNotifications: this.checkHasNotifications()
      });
    } catch (error) {
      console.error('加载点赞通知失败:', error);
    }
  },

  // 加载评论通知
  async loadCommentList() {
    try {
      const res = await messageApi.getList({ type: 'comment' });
      const formattedList = res.list.map(item => ({
        ...item,
        time: formatTime(item.time)
      }));
      this.setData({
        commentList: formattedList,
        hasNotifications: this.checkHasNotifications()
      });
    } catch (error) {
      console.error('加载评论通知失败:', error);
    }
  },

  // 加载关注通知
  async loadFollowList() {
    try {
      const res = await messageApi.getList({ type: 'follow' });
      const formattedList = res.list.map(item => ({
        ...item,
        time: formatTime(item.time)
      }));
      this.setData({
        followList: formattedList,
        hasNotifications: this.checkHasNotifications()
      });
    } catch (error) {
      console.error('加载关注通知失败:', error);
    }
  },

  // 加载系统通知
  async loadSystemList() {
    try {
      const res = await messageApi.getList({ type: 'system' });
      const formattedList = res.list.map(item => ({
        ...item,
        time: formatTime(item.time)
      }));
      this.setData({
        systemList: formattedList,
        hasNotifications: this.checkHasNotifications()
      });
    } catch (error) {
      console.error('加载系统通知失败:', error);
    }
  },

  // 检查是否有通知消息
  checkHasNotifications() {
    const { likeList, commentList, followList, systemList } = this.data;
    return likeList.length > 0 || 
           commentList.length > 0 || 
           followList.length > 0 || 
           systemList.length > 0;
  },

  // 下拉刷新
  onRefresh() {
    this.setData({
      isRefreshing: true
    });
    this.loadMessages();
  },

  // 跳转到聊天页面
  goToChat(e) {
    const id = e.currentTarget.dataset.id;
    tt.navigateTo({
      url: `/pages/chat/chat?id=${id}`
    });
  },

  // 跳转到笔记详情
  goToPost(e) {
    const id = e.currentTarget.dataset.id;
    tt.navigateTo({
      url: `/pages/post-detail/post-detail?id=${id}`
    });
  },

  // 跳转到用户主页
  goToUser(e) {
    const id = e.currentTarget.dataset.id;
    tt.navigateTo({
      url: `/pages/user-detail/user-detail?id=${id}`
    });
  },

  // 跳转到系统通知详情
  goToSystem(e) {
    const id = e.currentTarget.dataset.id;
    tt.navigateTo({
      url: `/pages/notification-detail/notification-detail?id=${id}`
    });
  },

  // 关注/取消关注
  async toggleFollow(e) {
    const { id, index } = e.currentTarget.dataset;
    const { followList } = this.data;
    const user = followList[index];

    try {
      if (user.isFollowing) {
        await userApi.unfollowUser(id);
      } else {
        await userApi.followUser(id);
      }

      // 更新关注状态
      followList[index].isFollowing = !user.isFollowing;
      this.setData({ followList });
    } catch (error) {
      tt.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  }
}); 