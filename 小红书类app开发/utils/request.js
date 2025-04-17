const BASE_URL = 'https://api.example.com/v1';

const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = tt.getStorageSync('token');
    
    tt.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // Token过期，跳转登录
          tt.redirectTo({
            url: '/pages/custom-login/login/login'
          });
          reject(new Error('未登录或登录已过期'));
        } else {
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail: (err) => {
        tt.showToast({
          title: '网络错误',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

export default {
  get: (url, data) => request({ url, method: 'GET', data }),
  post: (url, data) => request({ url, method: 'POST', data }),
  put: (url, data) => request({ url, method: 'PUT', data }),
  delete: (url, data) => request({ url, method: 'DELETE', data }),
  upload: (url, filePath) => {
    return new Promise((resolve, reject) => {
      const token = tt.getStorageSync('token');
      
      tt.uploadFile({
        url: `${BASE_URL}${url}`,
        filePath,
        name: 'file',
        header: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(res.data));
          } else {
            reject(new Error('上传失败'));
          }
        },
        fail: (err) => {
          tt.showToast({
            title: '上传失败',
            icon: 'none'
          });
          reject(err);
        }
      });
    });
  }
}; 