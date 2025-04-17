const { shopApi } = require('../../api/index');
const { formatNumber } = require('../../utils/util');

Page({
  data: {
    products: [],
    page: 1,
    pageSize: 10,
    isLoading: false,
    hasMore: true,
    categories: [
      { id: 'all', name: '全部' },
      { id: 'clothes', name: '服饰' },
      { id: 'beauty', name: '美妆' },
      { id: 'digital', name: '数码' },
      { id: 'food', name: '美食' }
    ],
    currentCategory: 'all'
  },

  onLoad() {
    this.loadProducts();
  },

  // 加载商品列表
  async loadProducts(refresh = false) {
    if (this.data.isLoading || (!refresh && !this.data.hasMore)) {
      return;
    }

    this.setData({ isLoading: true });

    try {
      const params = {
        page: refresh ? 1 : this.data.page,
        pageSize: this.data.pageSize,
        category: this.data.currentCategory === 'all' ? '' : this.data.currentCategory
      };

      const products = await shopApi.getProducts(params);

      // 格式化数据
      const formattedProducts = products.map(product => ({
        ...product,
        price: (product.price / 100).toFixed(2), // 转换为元
        originalPrice: product.originalPrice ? (product.originalPrice / 100).toFixed(2) : null,
        salesCount: formatNumber(product.salesCount || 0)
      }));

      this.setData({
        products: refresh ? formattedProducts : [...this.data.products, ...formattedProducts],
        page: refresh ? 2 : this.data.page + 1,
        hasMore: formattedProducts.length === this.data.pageSize,
        isLoading: false
      });
    } catch (error) {
      console.error('加载商品列表失败:', error);
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

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    if (category === this.data.currentCategory) {
      return;
    }

    this.setData({
      currentCategory: category,
      products: [],
      page: 1,
      hasMore: true
    }, () => {
      this.loadProducts(true);
    });
  },

  // 跳转到商品详情
  navigateToDetail(e) {
    const { id } = e.currentTarget.dataset;
    tt.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    });
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadProducts(true);
    tt.stopPullDownRefresh();
  },

  // 触底加载更多
  onReachBottom() {
    this.loadProducts();
  }
}); 