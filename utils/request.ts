// src/utils/request.js

import config from '@/common/config'

const TIMEOUT = 10000;  // 请求超时时间

// 封装 request 请求
const request = async (options) => {
  uni.showLoading({ title: '加载中...' });

  // 设置默认的请求头和参数
  const defaultOptions = {
    method: 'GET',  // 默认 GET 请求
    headers: {
      'Content-Type': 'application/json',
      'Authorization': uni.getStorageSync('token') || '',  // 你可以存储 token 或其他必要的信息
    },
    timeout: TIMEOUT,
  };

  const finalOptions = { ...defaultOptions, ...options };  // 合并用户传入的参数

  try {
    // 执行请求
    const response = await uni.request({
      url: config.BASE_URL + finalOptions.url,
      method: finalOptions.method,
      data: finalOptions.data,
      header: finalOptions.headers,
      timeout: finalOptions.timeout,
    });

    // 请求成功
    uni.hideLoading();
    const { statusCode, data } = response;

    if (statusCode === 200) {
      return data;  // 返回请求的实际数据
    } else {
      // 错误处理
      uni.showToast({
        title: '请求失败',
        icon: 'none',
      });
      throw new Error('请求失败');
    }
  } catch (error) {
    // 请求失败
    uni.hideLoading();
    uni.showToast({
      title: error.message || '网络异常，请稍后再试',
      icon: 'none',
    });
    throw error;
  }
};

export default request;
