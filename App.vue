<script>
	import request from '@/utils/request';
	export default {
		onLaunch: function() {
			console.log('App Launch')
			this.globalData.checkUpdate()
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
				
				// #ifdef APP-PLUS  
				plus.runtime.getProperty(plus.runtime.appid, (widgetInfo) => { 
					request({
					  url: '/version',
					  method: 'GET'
					}).then(res => {
						if (res.success && res.data.length) {
							const newApp = res.data[0]
							const newVersion = newApp.name.split('.').join('') - 0
							const nowVersion = widgetInfo.version.split('.').join('') - 0
							// console.log(newVersion, nowVersion)
							if (nowVersion < newVersion){
								uni.showModal({
									title: newApp.name + '更新提示',
									content: newApp.remark || '问题修复',
									showCancel: false,
									confirmText: '更新'
								}).then(res => {
					
									this.downloadApp(newApp.wgtUrl)
								})
							}
							
						}
					});
				    
				});  
				// #endif
			},
			downloadApp(wgtUrl) {
				// console.log('start', wgtUrl)
				
				uni.downloadFile({
				    url: wgtUrl,  
				    success: (downloadResult) => {  
						console.log('downloadResult', downloadResult)
				        if (downloadResult.statusCode === 200) {  
				            plus.runtime.install(downloadResult.tempFilePath, {  
				                force: false  
				            }, function() {  
				                console.log('install success...');  
				                plus.runtime.restart();  
				            }, function(e) {  
				                console.error('install fail...', e);  
				            });  
				        }  
				    },
					  fail: err => {
						  console.log('error', err)
					  }
				}); 
			}
		}
		
	}
</script>

<style>
	/*每个页面公共css */
	@import '@/styles/index.css';
</style>
