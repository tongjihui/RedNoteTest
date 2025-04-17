import { userApi, postApi } from '../../api/index';
import { formatNumber } from '../../utils/util';

Page({
  data: {
    userInfo: null,
    isCurrentUser: false,
    isFollowing: false,
    currentTab: 'posts',
    currentList: [],
    pageNum: 1,
    pageSize: 20,
    isLoading: false,
    isRefreshing: false,
    noMore: false,
    emptyTips: {
      posts: '还没有发布任何笔记',
      collections: '还没有收藏任何笔记',
      likes: '还没有赞过任何笔记'
    }
  },

  onLoad(options) {
    const userId = options.id;
    // 如果没有传入用户ID，则显示当前用户的主页
    this.setData({
      isCurrentUser: !userId
    });
    this.loadUserInfo(userId);
    this.loadContent();
  },

  // 加载用户信息
  async loadUserInfo(userId) {
    try {
      let userInfo;
      if (this.data.isCurrentUser) {
        userInfo = await userApi.getUserInfo();
      } else {
        userInfo = await userApi.getUserInfo(userId);
        // 检查是否已关注
        const isFollowing = await userApi.checkFollowing(userId);
        this.setData({ isFollowing });
      }

      // 格式化数据
      userInfo = {
        ...userInfo,
        followingCount: formatNumber(userInfo.followingCount),
        followerCount: formatNumber(userInfo.followerCount),
        likeCount: formatNumber(userInfo.likeCount)
      };

      this.setData({ userInfo });
    } catch (error) {
      console.error('加载用户信息失败:', error);
      tt.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (this.data.currentTab === tab) return;

    this.setData({
      currentTab: tab,
      currentList: [],
      pageNum: 1,
      noMore: false
    }, () => {
      this.loadContent();
    });
  },

  // 加载内容列表
  async loadContent() {
    if (this.data.isLoading || this.data.noMore) return;

    try {
      this.setData({ isLoading: true });

      const { currentTab, pageNum, pageSize, userInfo } = this.data;
      let api;
      let params = { pageNum, pageSize };

      // 根据不同标签页调用不同接口
      switch (currentTab) {
        case 'posts':
          api = postApi.getUserPosts;
          break;
        case 'collections':
          api = postApi.getUserCollections;
          break;
        case 'likes':
          api = postApi.getUserLikes;
          break;
      }

      if (!this.data.isCurrentUser) {
        params.userId = userInfo.id;
      }

      const res = await api(params);

      // 格式化数据
      const formattedList = res.list.map(item => ({
        ...item,
        likeCount: formatNumber(item.likeCount),
        commentCount: formatNumber(item.commentCount)
      }));

      this.setData({
        currentList: pageNum === 1 ? formattedList : [...this.data.currentList, ...formattedList],
        pageNum: pageNum + 1,
        noMore: formattedList.length < pageSize
      });
    } catch (error) {
      console.error('加载内容列表失败:', error);
      tt.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({
        isLoading: false,
        isRefreshing: false
      });
    }
  },

  // 下拉刷新
  onRefresh() {
    this.setData({
      isRefreshing: true,
      pageNum: 1,
      noMore: false
    }, () => {
      this.loadContent();
    });
  },

  // 上拉加载更多
  onLoadMore() {
    this.loadContent();
  },

  // 更换头像
  async changeAvatar() {
    try {
      const res = await tt.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });

      const filePath = res.tempFilePaths[0];
      await userApi.uploadAvatar(filePath);

      // 重新加载用户信息
      this.loadUserInfo();

      tt.showToast({
        title: '更新成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('更换头像失败:', error);
      tt.showToast({
        title: '更新失败',
        icon: 'none'
      });
    }
  },

  // 编辑资料
  editProfile() {
    tt.navigateTo({
      url: '/pages/edit-profile/edit-profile'
    });
  },

  // 前往设置页
  goToSettings() {
    tt.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  // 关注/取消关注
  async toggleFollow() {
    const { userInfo, isFollowing } = this.data;

    try {
      if (isFollowing) {
        await userApi.unfollowUser(userInfo.id);
      } else {
        await userApi.followUser(userInfo.id);
      }

      this.setData({
        isFollowing: !isFollowing
      });

      tt.showToast({
        title: isFollowing ? '已取消关注' : '已关注',
        icon: 'success'
      });
    } catch (error) {
      tt.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 发送消息
  sendMessage() {
    const { userInfo } = this.data;
    tt.navigateTo({
      url: `/pages/chat/chat?id=${userInfo.id}`
    });
  },

  // 查看关注列表
  goToFollowing() {
    const { userInfo } = this.data;
    tt.navigateTo({
      url: `/pages/following/following?id=${userInfo.id}`
    });
  },

  // 查看粉丝列表
  goToFans() {
    const { userInfo } = this.data;
    tt.navigateTo({
      url: `/pages/fans/fans?id=${userInfo.id}`
    });
  },

  // 前往笔记详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    tt.navigateTo({
      url: `/pages/post-detail/post-detail?id=${id}`
    });
  },

  // 前往发布页
  goToPublish() {
    tt.navigateTo({
      url: '/pages/publish/publish'
    });
  }
}); 