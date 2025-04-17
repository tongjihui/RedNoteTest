import {
  getShopList
} from "../../api/common";
import { postApi } from '../../api/index';
import { formatNumber } from '../../utils/util';
const app = getApp()

Page({
  data: {
    sortList: ['距离优先', '好评优先', '销量优先'],
    current: 0,
    shopList:[],
    swiperHeight:0,
    saleSortList:[],
    distanceSortList:[],
    rateSortList:[],
    currentTab: 'recommend', // 当前选中的标签页
    posts: [], // 笔记列表
    pageNum: 1, // 当前页码
    pageSize: 20, // 每页数量
    isLoading: false, // 是否正在加载
    isRefreshing: false, // 是否正在刷新
    noMore: false, // 是否没有更多数据
  },
 async onLoad () {
    const res = await getShopList();
    if (!res) {
      return;
    }
   const saleSortList=res.products?.slice().sort((a,b) => b.sales-a.sales);
   const distanceSortList=res?.products;
   const rateSortList=res.products?.slice().sort((a,b) => b.rating-a.rating);
   console.log(saleSortList,distanceSortList,rateSortList);
    this.setData({
      saleSortList,
      distanceSortList,
      rateSortList,
      shopList:res?.products,
    })
    this.loadPosts();
  },
  onReady(){
    this.getHeight();
  },
  switchTap(e){
    // 可在此处理选中后更新商品列表数据
    const {current} = e.detail;
    this.setData({
      current,
    })
    this.getHeight()
  },
  getHeight(){
    let that =this;
    tt.createSelectorQuery().select('#card').boundingClientRect(function(rect){
    }).exec(res=>{
      console.log(res);
      that.setData({
        swiperHeight:res[0].height+''
      })
    });
  },
  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (this.data.currentTab === tab) return;
    
    this.setData({
      currentTab: tab,
      posts: [],
      pageNum: 1,
      noMore: false
    }, () => {
      this.loadPosts();
    });
  },
  // 加载笔记列表
  async loadPosts() {
    if (this.data.isLoading || this.data.noMore) return;

    try {
      this.setData({ isLoading: true });

      const { currentTab, pageNum, pageSize, posts } = this.data;
      const api = currentTab === 'recommend' ? postApi.getRecommended : postApi.getFollowing;
      
      const res = await api({
        pageNum,
        pageSize
      });

      // 格式化数据
      const formattedPosts = res.list.map(post => ({
        ...post,
        likeCount: formatNumber(post.likeCount)
      }));

      this.setData({
        posts: pageNum === 1 ? formattedPosts : [...posts, ...formattedPosts],
        pageNum: pageNum + 1,
        noMore: formattedPosts.length < pageSize
      });
    } catch (error) {
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
      this.loadPosts();
    });
  },
  // 上拉加载更多
  onLoadMore() {
    this.loadPosts();
  },
  // 跳转到搜索页
  goToSearch() {
    tt.navigateTo({
      url: '/pages/search/search'
    });
  },
  // 跳转到笔记详情页
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    tt.navigateTo({
      url: `/pages/post-detail/post-detail?id=${id}`
    });
  },
  // 监听视频播放
  onVideoPlay(e) {
    // 停止其他正在播放的视频
    const videos = tt.createSelectorQuery().selectAll('.cover-video');
    videos.fields({
      node: true,
      size: true
    }, (res) => {
      res.forEach((item) => {
        if (item.node && item.node !== e.detail.videoContext) {
          item.node.pause();
        }
      });
    }).exec();
  }
})