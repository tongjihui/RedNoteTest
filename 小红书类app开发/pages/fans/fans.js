const { userApi } = require('../../api/index');
const { formatNumber } = require('../../utils/util');

Page({
  data: {
    userId: '',
    fans: [],
    page: 1,
    pageSize: 20,
    isLoading: false,
    hasMore: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        userId: options.id
      });
      this.loadFans();
    }
  },

  // 加载粉丝列表
  async loadFans() {
    if (this.data.isLoading || !this.data.hasMore) {
      return;
    }

    this.setData({ isLoading: true });

    try {
      const fans = await userApi.getUserFans({
        userId: this.data.userId,
        page: this.data.page,
        pageSize: this.data.pageSize
      });

      // 格式化数据
      const formattedFans = fans.map(fan => ({
        ...fan,
        followerCount: formatNumber(fan.followerCount),
        followingCount: formatNumber(fan.followingCount)
      }));

      this.setData({
        fans: [...this.data.fans, ...formattedFans],
        page: this.data.page + 1,
        hasMore: formattedFans.length === this.data.pageSize,
        isLoading: false
      });
    } catch (error) {
      console.error('加载粉丝列表失败:', error);
      this.setData({ 
        isLoading: false,
        hasMore: false
      });
      tt.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 关注/取消关注用户
  async toggleFollow(e) {
    const { userId, index } = e.currentTarget.dataset;
    
    try {
      const result = await userApi.toggleFollow(userId);
      
      if (result.success) {
        const fan = this.data.fans[index];
        this.setData({
          [`fans[${index}].isFollowing`]: !fan.isFollowing
        });
        
        tt.showToast({
          title: fan.isFollowing ? '已取消关注' : '已关注',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('关注操作失败:', error);
      tt.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 跳转到用户主页
  navigateToUserProfile(e) {
    const { userId } = e.currentTarget.dataset;
    tt.navigateTo({
      url: `/pages/profile/profile?id=${userId}`
    });
  },

  // 下拉刷新
  async onPullDownRefresh() {
    this.setData({
      fans: [],
      page: 1,
      hasMore: true
    });
    await this.loadFans();
    tt.stopPullDownRefresh();
  },

  // 触底加载更多
  onReachBottom() {
    this.loadFans();
  }
}); 