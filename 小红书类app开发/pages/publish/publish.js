import { postApi } from '../../api/index';
import { FILE, POST } from '../../utils/constants';
import { checkFileType, checkFileSize } from '../../utils/util';

Page({
  data: {
    title: '', // 标题
    content: '', // 正文
    mediaList: [], // 媒体列表
    topics: [], // 话题列表
    location: null, // 位置信息
    maxTitleLength: POST.MAX_TITLE_LENGTH,
    maxContentLength: POST.MAX_CONTENT_LENGTH,
    maxMediaCount: FILE.MAX_IMAGE_COUNT,
    canPublish: false, // 是否可以发布
    isPublishing: false // 是否正在发布
  },

  onLoad() {
    // 检查是否有草稿
    const draft = tt.getStorageSync('post_draft');
    if (draft) {
      this.setData({
        ...draft,
        canPublish: this.checkCanPublish(draft)
      });
    }
  },

  // 检查是否可以发布
  checkCanPublish(data) {
    const { title, content, mediaList } = data || this.data;
    return (title || content) && !this.data.isPublishing;
  },

  // 标题输入
  onTitleInput(e) {
    const title = e.detail.value;
    this.setData({
      title,
      canPublish: this.checkCanPublish({ ...this.data, title })
    });
    this.saveDraft();
  },

  // 正文输入
  onContentInput(e) {
    const content = e.detail.value;
    this.setData({
      content,
      canPublish: this.checkCanPublish({ ...this.data, content })
    });
    this.saveDraft();
  },

  // 选择媒体文件
  async chooseMedia() {
    const { mediaList, maxMediaCount } = this.data;
    
    // 如果已有视频，不能再添加
    if (mediaList.some(item => item.type === 'video')) {
      tt.showToast({
        title: '视频和图片不能同时添加',
        icon: 'none'
      });
      return;
    }

    try {
      // 选择图片或视频
      const res = await tt.chooseMedia({
        count: maxMediaCount - mediaList.length,
        mediaType: ['image', 'video'],
        sourceType: ['album', 'camera'],
        maxDuration: 60,
        camera: 'back'
      });

      // 检查文件类型和大小
      const validFiles = res.tempFiles.filter(file => {
        const isImage = checkFileType(file.path, FILE.IMAGE_TYPES);
        const isVideo = checkFileType(file.path, FILE.VIDEO_TYPES);
        const isValidSize = isImage 
          ? checkFileSize(file.size, FILE.MAX_IMAGE_SIZE)
          : checkFileSize(file.size, FILE.MAX_VIDEO_SIZE);

        if (!isValidSize) {
          tt.showToast({
            title: `文件大小超出限制`,
            icon: 'none'
          });
          return false;
        }

        return isImage || isVideo;
      });

      // 更新媒体列表
      const newMediaList = [
        ...mediaList,
        ...validFiles.map(file => ({
          type: checkFileType(file.path, FILE.IMAGE_TYPES) ? 'image' : 'video',
          path: file.path,
          size: file.size
        }))
      ];

      this.setData({
        mediaList: newMediaList,
        canPublish: this.checkCanPublish({ ...this.data, mediaList: newMediaList })
      });
      this.saveDraft();
    } catch (error) {
      console.error('选择媒体文件失败:', error);
    }
  },

  // 预览媒体
  previewMedia(e) {
    const { index } = e.currentTarget.dataset;
    const { mediaList } = this.data;
    const item = mediaList[index];

    if (item.type === 'image') {
      tt.previewImage({
        urls: mediaList.filter(m => m.type === 'image').map(m => m.path),
        current: item.path
      });
    }
  },

  // 删除媒体
  deleteMedia(e) {
    const { index } = e.currentTarget.dataset;
    const mediaList = [...this.data.mediaList];
    mediaList.splice(index, 1);
    this.setData({
      mediaList,
      canPublish: this.checkCanPublish({ ...this.data, mediaList })
    });
    this.saveDraft();
  },

  // 选择话题
  async chooseTopic() {
    try {
      // 这里应该跳转到话题选择页面
      tt.navigateTo({
        url: '/pages/topic-choose/topic-choose'
      });
    } catch (error) {
      console.error('选择话题失败:', error);
    }
  },

  // 删除话题
  deleteTopic(e) {
    const { index } = e.currentTarget.dataset;
    const topics = [...this.data.topics];
    topics.splice(index, 1);
    this.setData({ topics });
    this.saveDraft();
  },

  // 选择位置
  async chooseLocation() {
    try {
      const res = await tt.chooseLocation({
        type: 'gcj02'
      });
      this.setData({
        location: {
          name: res.name,
          address: res.address,
          latitude: res.latitude,
          longitude: res.longitude
        }
      });
      this.saveDraft();
    } catch (error) {
      console.error('选择位置失败:', error);
    }
  },

  // 删除位置
  deleteLocation() {
    this.setData({ location: null });
    this.saveDraft();
  },

  // 保存草稿
  saveDraft() {
    const { title, content, mediaList, topics, location } = this.data;
    tt.setStorageSync('post_draft', {
      title,
      content,
      mediaList,
      topics,
      location
    });
  },

  // 清除草稿
  clearDraft() {
    tt.removeStorageSync('post_draft');
  },

  // 取消发布
  cancel() {
    tt.showModal({
      title: '提示',
      content: '是否保存为草稿？',
      success: (res) => {
        if (res.confirm) {
          this.saveDraft();
          tt.navigateBack();
        } else {
          this.clearDraft();
          tt.navigateBack();
        }
      }
    });
  },

  // 发布笔记
  async publish() {
    if (!this.data.canPublish || this.data.isPublishing) return;

    try {
      this.setData({ isPublishing: true });

      // 上传媒体文件
      const mediaUrls = await Promise.all(
        this.data.mediaList.map(async (item) => {
          const res = await (item.type === 'image' 
            ? postApi.uploadImage(item.path)
            : postApi.uploadVideo(item.path));
          return {
            type: item.type,
            url: res.url
          };
        })
      );

      // 创建笔记
      await postApi.create({
        title: this.data.title,
        content: this.data.content,
        mediaList: mediaUrls,
        topics: this.data.topics,
        location: this.data.location
      });

      // 发布成功
      this.clearDraft();
      tt.showToast({
        title: '发布成功',
        icon: 'success'
      });

      // 返回上一页
      setTimeout(() => {
        tt.navigateBack();
      }, 1500);
    } catch (error) {
      tt.showToast({
        title: '发布失败',
        icon: 'none'
      });
    } finally {
      this.setData({ isPublishing: false });
    }
  }
}); 