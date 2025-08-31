const config =  {
	// #ifdef H5
	BASE_URL: '/api',  // 设置你的 API 基础 URL
	// #endif
	// #ifndef H5
	BASE_URL: 'http://8.138.23.120:7001',  // 设置你的 API 基础 URL
	// #endif
	
	IMG_URL: 'http://8.138.23.120/uploads/'
}

export default config