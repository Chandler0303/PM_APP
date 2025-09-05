<template>
	<view class="index-view">
		<uv-status-bar></uv-status-bar>
		<view class="header">
			<view class="input-view">
				<uv-input v-model="searchForm.name" placeholder="请输入名称"></uv-input>
				<uv-button size="small" type="primary" @tap="search">搜索</uv-button>
			</view>
		</view>
		<scroll-view scroll-y="true" @scrolltolower="loadMore">
			<uv-list class="list">
				<block v-for="item in list">
					<uv-list-item>
						<view class="item" @tap="goPage(item)">
							<uv-avatar class="avatar" size="160rpx" :src="item.avatar" shape="square"></uv-avatar>
							<view class="info-view">
								<view class="name-view">
									<text class="name two-ellipsis" :class="item.delay ? 'name-indent' : ''">{{ item.name }}</text>
								</view>
								<view class="project-count-list">
									<view>
										<text>管理项目：</text>
										<text>{{ item.projectList.length }}</text>
									</view>
								</view>
								<view class="project-status-list">
									<view class="normal-item">
										<text>正常推进：</text>
										<text>{{ item.normalNum || 0 }}</text>
									</view>
									<view class="delay-item">
										<text>延期：</text>
										<text>{{ item.delayNum || 0 }}</text>
									</view>
								</view>
							</view>
						</view> 
					</uv-list-item> 
				</block>
				<block v-if="!list.length">
					<uv-empty mode="list"></uv-empty>
				</block>
				<block v-if="list.length && (list.length === allList.length)">
					<uv-divider text="没有更多数据了！"></uv-divider>
				</block>
			</uv-list>
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
	import { reactive, ref } from 'vue';
	import request from '@/utils/request';
	import { onLoad } from '@dcloudio/uni-app'
	import { getImageUrl } from '@/utils/tool'
	import ProcessHandlerFactory from '../../utils/processHandle';
	
	const processHandler = ProcessHandlerFactory.create("A");

	
	const searchForm = reactive({
		name: ''
	})
	
	const allList = ref([])
	const list = ref([])
	
	const pageSize = reactive({
		page: 1,
		size: 20,
		total: 0
	})
	
	onLoad(() => {
		getProjectList();
	})
	
	const search = () => {
		list.value = []
		allList.value = []
		pageSize.page = 1
		pageSize.total = 0
		getProjectList()
	}	
	const loadMore = () => {
		if (list.value.length === allList.value.length) {
			return
		}
		pageSize.page = pageSize.page + 1
		list.value = list.value.concat(allList.value.slice((pageSize.page - 1) * pageSize.size, pageSize.page * pageSize.size))
	}
	

	const getProjectList = async () => {
	  try {
	    const res: any = await request({
	      url: '/project/list',
	      method: 'GET',
		  data: {
			  name: ''
		  }
	    });
		
		// console.log(res)
		
		processHandler.tableDataSortHandler(res.data)
		const projectMgObj = {}
		const projectManagerList = []
		
		res.data.forEach((item: any) => {
			const stage = processHandler.calcProjectStage(item)
			item.stage = stage.seq
			item.stageLabel = stage.name
			item.delay = processHandler.calcProcedureDelay(item)
			// console.log(item.delay)
			if (item.user) {
				const userId = item.user.id
				if (projectMgObj[userId]) {
					 projectMgObj[item.user.id].projectList.push(item)
				} else {
					projectMgObj[item.user.id] = {
						...item.user,
						projectList: [item]
					}
				}
			}	
		})
		for (const i in projectMgObj) {
			const userItem = projectMgObj[i]
			userItem.avatar = userItem.avatar ? getImageUrl(userItem.avatar) : 'https://via.placeholder.com/200x200.png/2878ff'
			userItem.normalNum = userItem.projectList.filter(p => p.delay === 0).length
			userItem.delayNum = userItem.projectList.filter(p => p.delay !== 0).length
			projectManagerList.push(userItem)
		}
		
		
		const tmpData = filterData(projectManagerList)
		
		allList.value = tmpData
		list.value = tmpData.slice(0, pageSize.size)
		pageSize.total = tmpData.length;
		// console.log(tmpData)
	  } catch (error) {
	    console.error('获取项目失败', error);
	  }
	};
	
	const filterData = (list: any[]) => {
		let filterData = list
		
		if (searchForm.name) {
			filterData = filterData.filter((item: any) => item.name.indexOf(searchForm.name) !== -1)
		}
		
		return filterData
	}
	
	
	  const goPage = (record: any) => {
		  uni.navigateTo({
		  	url: '/pages/index/index?id=' + record.id + '&name=' + record.name
		  })
	  }
	
	
	
	
</script>

<style lang="scss" scoped>
	page{
		width: 100%;
		height: 100%;
		.index-view{
			width: 100%;
			height: 100%;
			.input-view{
				display: flex;
				align-items: center;
				justify-content: center;
				flex-direction: row;
				background-color: white;
				padding: 20rpx;
				border-bottom: 1px solid #eee;
				.uv-input{
					width: 70%;
					height: 60rpx;
					line-height: 60rpx;
					border-radius: 50rpx;
					border: 1px solid #eee;
					padding: 0 20rpx;
					margin-right: 20rpx;
				}
			}
			scroll-view{
				width: 100%;
				height: calc(100% - 102rpx - var(--status-bar-height));
				background-color: white;
				
				.list{
					display: flex;
					flex-direction: column;
					padding: 20rpx 20rpx 0 20rpx;
				}
				.item{
					display: flex;
					width: 100%;
					border-radius: 20rpx;
					background-color: white;
					margin-bottom: 20rpx;
					border-radius: 24rpx;        
					box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12); 
					padding: 20rpx;
					.info-view{
						display: flex;
						flex-direction: column;
						justify-content: space-between;
					}
					
					.name{
						font-size: 32rpx;
						font-weight: bold;
						line-height: 40rpx;
					}
					
					.avatar{
						flex-shrink: 0;
						margin-right: 20rpx;
					}
					.project-count-list{
						display: flex;
						align-items: center;
						font-size: 24rpx;
						color: #666;
						margin-bottom: 40rpx;
						
					}
					
					.project-status-list{
						display: flex;
						align-items: center;
						font-size: 28rpx;
						.normal-item{
							color: #3c9cff;
						}
						.delay-item{
							margin-left: 50rpx;
							color: #f9ae3d;
						}
					}
				}
			}
		}
	}
</style>