// 格式化时间
export const formatTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;

  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前';
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前';
  } else if (diff < month) {
    return Math.floor(diff / day) + '天前';
  } else if (diff < year) {
    return Math.floor(diff / month) + '个月前';
  } else {
    return Math.floor(diff / year) + '年前';
  }
};

// 格式化数字
export const formatNumber = (num) => {
  if (num < 1000) {
    return num;
  } else if (num < 10000) {
    return (num / 1000).toFixed(1) + 'k';
  } else {
    return (num / 10000).toFixed(1) + 'w';
  }
};

// 防抖函数
export const debounce = (func, wait = 500) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
};

// 节流函数
export const throttle = (func, wait = 500) => {
  let previous = 0;
  return function (...args) {
    const now = Date.now();
    if (now - previous > wait) {
      func.apply(this, args);
      previous = now;
    }
  };
};

// 深拷贝
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  const clone = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  return clone;
};

// 随机字符串
export const randomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
};

// 检查文件类型
export const checkFileType = (filePath, types) => {
  const extension = filePath.substring(filePath.lastIndexOf('.') + 1).toLowerCase();
  return types.includes(extension);
};

// 检查文件大小
export const checkFileSize = (size, maxSize) => {
  return size <= maxSize;
};

// 获取文件扩展名
export const getFileExtension = (filename) => {
  return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
};

// 格式化文件大小
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};

// URL参数转对象
export const parseQueryString = (url) => {
  const query = url.split('?')[1] || '';
  const params = {};
  const pairs = query.split('&');
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return params;
};

// 对象转URL参数
export const stringifyQueryString = (obj) => {
  const pairs = [];
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.length ? '?' + pairs.join('&') : '';
};

// 检查是否为空对象
export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

// 获取数据类型
export const getType = (value) => {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}; 