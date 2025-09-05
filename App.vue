<script>
	import request from '@/utils/request';
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// this.globalData.checkUpdate()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		globalData:{
			checkUpdate() {
				console.log('触发')
				request({
				  url: '/update',
				  method: 'GET',
				  data: {
					  version: '1.0.0',
					  name: ''
				  }
				}).then(res => {
					console.log(res)
				});
				// #ifdef APP-PLUS  
				plus.runtime.getProperty(plus.runtime.appid, function(widgetInfo) {  
				    uni.request({  
				        url: 'http://www.example.com/update/',  
				        data: {  
				            version: widgetInfo.version,  
				            name: widgetInfo.name  
				        },  
				        success: (result) => {  
				            var data = result.data;  
				            if (data.update && data.wgtUrl) {  
				                uni.downloadFile({  
				                    url: data.wgtUrl,  
				                    success: (downloadResult) => {  
				                        if (downloadResult.statusCode === 200) {  
				                            plus.runtime.install(downloadResult.tempFilePath, {  
				                                force: false  
				                            }, function() {  
				                                console.log('install success...');  
				                                plus.runtime.restart();  
				                            }, function(e) {  
				                                console.error('install fail...');  
				                            });  
				                        }  
				                    }  
				                });  
				            }  
				        }  
				    });  
				});  
				// #endif
			}
		}
		
	}
</script>

<style>
	/*每个页面公共css */
	@import '@/styles/index.css';
</style>
