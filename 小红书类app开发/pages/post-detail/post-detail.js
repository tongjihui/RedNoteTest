const { postApi, commentApi, userApi } = require('../../api/index');
const { formatTime, formatNumber } = require('../../utils/util');

Page({
  data: {
    postId: '',
    post: null,
    isAuthor: false,
    isFollowing: false,
    currentMediaIndex: 0,
    comments: [],
    commentSortType: 'hot', // 'hot' or 'time'
    commentPage: 1,
    commentPageSize: 10,
    isLoadingComments: false,
    hasMoreComments: true,
    commentText: '',
    isLiked: false,
    isCollected: false,
    replyTo: null, // { userId, nickname } 回复目标用户信息
    showShareMenu: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        postId: options.id
      });
      this.loadPostDetail();
      this.loadComments();
    }
  },

  onShow() {
    // 页面显示时刷新点赞、收藏状态
    if (this.data.postId) {
      this.checkInteractionStatus();
    }
  },

  // 加载笔记详情
  async loadPostDetail() {
    try {
      tt.showLoading({
        title: '加载中'
      });

      const post = await postApi.getPostDetail(this.data.postId);
      const currentUser = await userApi.getCurrentUser();
      
      this.setData({
        post,
        isAuthor: post.userId === currentUser.id,
        isFollowing: post.author.isFollowing
      });

      // 更新标题
      tt.setNavigationBarTitle({
        title: post.title || '笔记详情'
      });

      tt.hideLoading();
    } catch (error) {
      tt.hideLoading();
      tt.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 加载评论列表
  async loadComments(refresh = false) {
    if (refresh) {
      this.setData({
        comments: [],
        commentPage: 1,
        hasMoreComments: true
      });
    }

    if (!this.data.hasMoreComments || this.data.isLoadingComments) {
      return;
    }

    this.setData({ isLoadingComments: true });

    try {
      const comments = await commentApi.getPostComments({
        postId: this.data.postId,
        page: this.data.commentPage,
        pageSize: this.data.commentPageSize,
        sortType: this.data.commentSortType
      });

      // 格式化时间
      comments.forEach(comment => {
        comment.createTime = formatTime(comment.createTime);
        if (comment.replies) {
          comment.replies.forEach(reply => {
            reply.createTime = formatTime(reply.createTime);
          });
        }
      });

      this.setData({
        comments: [...this.data.comments, ...comments],
        commentPage: this.data.commentPage + 1,
        hasMoreComments: comments.length === this.data.commentPageSize,
        isLoadingComments: false
      });
    } catch (error) {
      this.setData({ isLoadingComments: false });
      tt.showToast({
        title: '加载评论失败',
        icon: 'none'
      });
    }
  },

  // 切换评论排序方式
  async toggleCommentSort() {
    if (this.data.isLoadingComments) {
      return; // 防止重复操作
    }

    const newSortType = this.data.commentSortType === 'hot' ? 'time' : 'hot';
    
    try {
      tt.showLoading({
        title: '切换中'
      });

      this.setData({
        commentSortType: newSortType,
        comments: [],
        commentPage: 1,
        hasMoreComments: true,
        isLoadingComments: true
      });

      await this.loadComments();
      
      tt.hideLoading();
    } catch (error) {
      console.error('切换评论排序失败:', error);
      tt.hideLoading();
      tt.showToast({
        title: '切换失败',
        icon: 'none'
      });
    }
  },

  // 检查交互状态（点赞、收藏）
  async checkInteractionStatus() {
    try {
      const status = await postApi.getInteractionStatus(this.data.postId);
      this.setData({
        isLiked: status.isLiked,
        isCollected: status.isCollected
      });
    } catch (error) {
      console.error('获取交互状态失败', error);
    }
  },

  // 切换关注状态
  async toggleFollow() {
    try {
      const isFollowing = this.data.isFollowing;
      const result = await userApi.toggleFollow(this.data.post.author.id);
      
      if (result.success) {
        this.setData({
          isFollowing: !isFollowing
        });
        tt.showToast({
          title: isFollowing ? '已取消关注' : '已关注',
          icon: 'none'
        });
      }
    } catch (error) {
      tt.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 切换点赞状态
  async toggleLike() {
    try {
      const isLiked = this.data.isLiked;
      const result = await postApi.toggleLike(this.data.postId);
      
      if (result.success) {
        this.setData({
          isLiked: !isLiked,
          'post.likeCount': this.data.post.likeCount + (isLiked ? -1 : 1)
        });
      }
    } catch (error) {
      tt.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 切换收藏状态
  async toggleCollect() {
    try {
      const isCollected = this.data.isCollected;
      const result = await postApi.toggleCollect(this.data.postId);
      
      if (result.success) {
        this.setData({
          isCollected: !isCollected,
          'post.collectCount': this.data.post.collectCount + (isCollected ? -1 : 1)
        });
      }
    } catch (error) {
      tt.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 发表评论
  async submitComment() {
    if (!this.data.commentText.trim()) {
      return;
    }

    try {
      tt.showLoading({
        title: '发送中'
      });

      const comment = await commentApi.createComment({
        postId: this.data.postId,
        content: this.data.commentText.trim(),
        replyTo: this.data.replyTo
      });

      // 格式化时间
      comment.createTime = formatTime(comment.createTime);

      // 更新评论列表和计数
      this.setData({
        comments: [comment, ...this.data.comments],
        commentText: '',
        replyTo: null,
        'post.commentCount': (this.data.post.commentCount || 0) + 1
      });

      tt.hideLoading();
      tt.showToast({
        title: '评论成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('发表评论失败:', error);
      tt.hideLoading();
      tt.showToast({
        title: '评论失败',
        icon: 'none'
      });
    }
  },

  // 点赞评论
  async likeComment(e) {
    const { commentId, index } = e.currentTarget.dataset;
    
    try {
      tt.showLoading({
        title: '处理中'
      });

      const result = await commentApi.toggleCommentLike(commentId);
      
      if (result.success) {
        const comment = this.data.comments[index];
        const newLikeCount = (comment.likeCount || 0) + (comment.isLiked ? -1 : 1);
        
        this.setData({
          [`comments[${index}].isLiked`]: !comment.isLiked,
          [`comments[${index}].likeCount`]: newLikeCount
        });
      }

      tt.hideLoading();
    } catch (error) {
      console.error('评论点赞失败:', error);
      tt.hideLoading();
      tt.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 设置回复目标
  setReplyTarget(e) {
    const { userId, nickname } = e.currentTarget.dataset;
    this.setData({
      replyTo: { userId, nickname }
    });
    // 聚焦评论输入框
    this.selectComponent('#commentInput').focus();
  },

  // 取消回复
  cancelReply() {
    this.setData({
      replyTo: null
    });
  },

  // 查看更多回复
  navigateToCommentDetail(e) {
    const { commentId } = e.currentTarget.dataset;
    tt.navigateTo({
      url: `/pages/comment-detail/comment-detail?id=${commentId}&postId=${this.data.postId}`
    });
  },

  // 分享
  onShareAppMessage() {
    const post = this.data.post;
    return {
      title: post.title || '分享一个有趣的笔记',
      imageUrl: post.mediaList[0],
      path: `/pages/post-detail/post-detail?id=${this.data.postId}`
    };
  },

  // 显示分享菜单
  showShare() {
    this.setData({
      showShareMenu: true
    });
  },

  // 隐藏分享菜单
  hideShare() {
    this.setData({
      showShareMenu: false
    });
  },

  // 保存图片到相册
  async saveImage() {
    const currentImage = this.data.post.mediaList[this.data.currentMediaIndex];
    try {
      await tt.saveImageToPhotosAlbum({
        filePath: currentImage
      });
      tt.showToast({
        title: '保存成功',
        icon: 'success'
      });
    } catch (error) {
      tt.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
    this.hideShare();
  },

  // 轮播图切换
  onSwiperChange(e) {
    this.setData({
      currentMediaIndex: e.detail.current
    });
  },

  // 预览图片
  previewImage(e) {
    const { index } = e.currentTarget.dataset;
    const { mediaList } = this.data.post;
    const imageUrls = mediaList.filter(item => item.type === 'image').map(item => item.url);
    
    tt.previewImage({
      current: imageUrls[index],
      urls: imageUrls
    });
  },

  // 视频播放控制
  onVideoPlay(e) {
    // 停止其他正在播放的视频
    const videos = tt.createSelectorQuery().selectAll('.media-item');
    videos.fields({
      node: true,
      size: true,
    }).exec((res) => {
      res[0].forEach((item) => {
        if (item.node && item.node !== e.detail.videoContext) {
          item.node.pause();
        }
      });
    });
  },

  // 保存媒体到本地
  async saveMedia() {
    const { mediaList, currentMediaIndex } = this.data;
    const currentMedia = mediaList[currentMediaIndex];

    try {
      if (currentMedia.type === 'image') {
        await tt.saveImageToPhotosAlbum({
          filePath: currentMedia.url
        });
      } else if (currentMedia.type === 'video') {
        await tt.saveVideoToPhotosAlbum({
          filePath: currentMedia.url
        });
      }

      tt.showToast({
        title: '保存成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('保存失败:', error);
      tt.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  },

  // 监听媒体加载失败
  onMediaLoadError(e) {
    const { index } = e.currentTarget.dataset;
    tt.showToast({
      title: '媒体加载失败',
      icon: 'none'
    });
    
    // 更新媒体状态
    this.setData({
      [`post.mediaList[${index}].loadError`]: true
    });
  },

  // 跳转到用户主页
  navigateToUserProfile(e) {
    const { userId } = e.currentTarget.dataset;
    tt.navigateTo({
      url: `/pages/profile/profile?id=${userId}`
    });
  },

  // 跳转到话题页
  navigateToTopic(e) {
    const { topicId } = e.currentTarget.dataset;
    tt.navigateTo({
      url: `/pages/topic/topic?id=${topicId}`
    });
  },

  // 跳转到位置页
  navigateToLocation(e) {
    const { location } = e.currentTarget.dataset;
    tt.navigateTo({
      url: `/pages/location/location?name=${location}`
    });
  },

  // 监听评论输入
  onCommentInput(e) {
    this.setData({
      commentText: e.detail.value
    });
  },

  // 页面上拉触底事件
  onReachBottom() {
    this.loadComments();
  },

  // 页面下拉刷新事件
  async onPullDownRefresh() {
    await Promise.all([
      this.loadPostDetail(),
      this.loadComments(true)
    ]);
    tt.stopPullDownRefresh();
  },

  // 加载更多评论
  async loadMoreComments() {
    if (this.data.isLoadingComments || !this.data.hasMoreComments) {
      return;
    }

    try {
      this.setData({ isLoadingComments: true });

      const comments = await commentApi.getPostComments({
        postId: this.data.postId,
        page: this.data.commentPage,
        pageSize: this.data.commentPageSize,
        sortType: this.data.commentSortType
      });

      if (!Array.isArray(comments)) {
        throw new Error('Invalid comments data');
      }

      // 格式化评论数据
      const formattedComments = comments.map(comment => ({
        ...comment,
        createTime: formatTime(comment.createTime),
        likeCount: comment.likeCount || 0,
        replies: comment.replies?.map(reply => ({
          ...reply,
          createTime: formatTime(reply.createTime)
        })) || []
      }));

      this.setData({
        comments: [...this.data.comments, ...formattedComments],
        commentPage: this.data.commentPage + 1,
        hasMoreComments: formattedComments.length === this.data.commentPageSize,
        isLoadingComments: false
      });
    } catch (error) {
      console.error('加载评论失败:', error);
      this.setData({ 
        isLoadingComments: false,
        hasMoreComments: false  // 出错时停止加载更多
      });
      tt.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 加载评论回复
  async loadCommentReplies(e) {
    const { commentId, index } = e.currentTarget.dataset;
    const comment = this.data.comments[index];

    if (comment.isLoadingReplies) {
      return;
    }

    this.setData({
      [`comments[${index}].isLoadingReplies`]: true
    });

    try {
      const replies = await commentApi.getCommentReplies({
        commentId,
        page: comment.replyPage || 1,
        pageSize: 5
      });

      // 格式化回复时间
      const formattedReplies = replies.map(reply => ({
        ...reply,
        createTime: formatTime(reply.createTime)
      }));

      this.setData({
        [`comments[${index}].replies`]: comment.replies ? [...comment.replies, ...formattedReplies] : formattedReplies,
        [`comments[${index}].replyPage`]: (comment.replyPage || 1) + 1,
        [`comments[${index}].hasMoreReplies`]: formattedReplies.length === 5,
        [`comments[${index}].isLoadingReplies`]: false
      });
    } catch (error) {
      console.error('加载回复失败:', error);
      this.setData({
        [`comments[${index}].isLoadingReplies`]: false
      });
      tt.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },
}); 