import { searchApi, topicApi, shopApi } from '../../api/index';
import { formatNumber } from '../../utils/util';

Page({
  data: {
    hotSearchList: [], // 热搜列表
    hotTopics: [], // 热门话题
    categories: [], // 兴趣分类
    products: [], // 好物推荐
    places: [], // 附近好去处
  },

  onLoad() {
    this.loadHotSearch();
    this.loadHotTopics();
    this.loadCategories();
    this.loadProducts();
    this.loadNearbyPlaces();
  },

  // 加载热搜榜
  async loadHotSearch() {
    try {
      const res = await searchApi.getHotSearch();
      this.setData({
        hotSearchList: res.list
      });
    } catch (error) {
      console.error('加载热搜榜失败:', error);
    }
  },

  // 加载热门话题
  async loadHotTopics() {
    try {
      const res = await topicApi.getHotTopics();
      const formattedTopics = res.list.map(topic => ({
        ...topic,
        postCount: formatNumber(topic.postCount)
      }));
      this.setData({
        hotTopics: formattedTopics
      });
    } catch (error) {
      console.error('加载热门话题失败:', error);
    }
  },

  // 加载兴趣分类
  loadCategories() {
    // 这里使用模拟数据，实际项目中应该从服务器获取
    const categories = [
      { id: 1, name: '美食', icon: '../../assets/icons/category/food.png' },
      { id: 2, name: '旅行', icon: '../../assets/icons/category/travel.png' },
      { id: 3, name: '美妆', icon: '../../assets/icons/category/beauty.png' },
      { id: 4, name: '时尚', icon: '../../assets/icons/category/fashion.png' },
      { id: 5, name: '数码', icon: '../../assets/icons/category/digital.png' },
      { id: 6, name: '运动', icon: '../../assets/icons/category/sports.png' },
      { id: 7, name: '家居', icon: '../../assets/icons/category/home.png' },
      { id: 8, name: '更多', icon: '../../assets/icons/category/more.png' }
    ];
    this.setData({ categories });
  },

  // 加载好物推荐
  async loadProducts() {
    try {
      const res = await shopApi.getProducts({
        pageNum: 1,
        pageSize: 10,
        sort: 'recommend'
      });
      this.setData({
        products: res.list
      });
    } catch (error) {
      console.error('加载好物推荐失败:', error);
    }
  },

  // 加载附近好去处
  async loadNearbyPlaces() {
    try {
      // 获取用户位置
      const location = await this.getUserLocation();
      if (!location) return;

      // 这里使用模拟数据，实际项目中应该调用位置服务API
      const places = [
        {
          id: 1,
          name: '网红咖啡店',
          address: '市中心商务区A座1楼',
          image: '../../assets/images/place1.jpg',
          distance: '500m',
          rating: 4.8
        },
        {
          id: 2,
          name: '创意书店',
          address: '文化街道10号',
          image: '../../assets/images/place2.jpg',
          distance: '800m',
          rating: 4.6
        }
      ];
      this.setData({ places });
    } catch (error) {
      console.error('加载附近好去处失败:', error);
    }
  },

  // 获取用户位置
  getUserLocation() {
    return new Promise((resolve, reject) => {
      tt.getLocation({
        type: 'gcj02',
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude
          });
        },
        fail: (err) => {
          tt.showToast({
            title: '获取位置失败',
            icon: 'none'
          });
          reject(err);
        }
      });
    });
  },

  // 刷新热搜榜
  refreshHotSearch() {
    this.loadHotSearch();
  },

  // 搜索热搜词
  searchHot(e) {
    const keyword = e.currentTarget.dataset.keyword;
    tt.navigateTo({
      url: `/pages/search/search?keyword=${encodeURIComponent(keyword)}`
    });
  },

  // 跳转到搜索页
  goToSearch() {
    tt.navigateTo({
      url: '/pages/search/search'
    });
  },

  // 查看更多话题
  viewMoreTopics() {
    tt.navigateTo({
      url: '/pages/topic-list/topic-list'
    });
  },

  // 跳转到话题详情
  goToTopic(e) {
    const id = e.currentTarget.dataset.id;
    tt.navigateTo({
      url: `/pages/topic-detail/topic-detail?id=${id}`
    });
  },

  // 跳转到分类页
  goToCategory(e) {
    const id = e.currentTarget.dataset.id;
    tt.navigateTo({
      url: `/pages/category/category?id=${id}`
    });
  },

  // 查看更多商品
  viewMoreProducts() {
    tt.navigateTo({
      url: '/pages/shop/shop'
    });
  },

  // 跳转到商品详情
  goToProduct(e) {
    const id = e.currentTarget.dataset.id;
    tt.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    });
  },

  // 查看更多地点
  viewMorePlaces() {
    tt.navigateTo({
      url: '/pages/place-list/place-list'
    });
  },

  // 跳转到地点详情
  goToPlace(e) {
    const id = e.currentTarget.dataset.id;
    tt.navigateTo({
      url: `/pages/place-detail/place-detail?id=${id}`
    });
  }
}); 