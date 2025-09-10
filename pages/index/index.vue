<template>
	<view class="index-view">
		<view class="header">
			<view class="input-view">
				<uv-input v-model="searchForm.name" placeholder="请输入名称"></uv-input>
				<uv-button size="small" type="primary" @tap="search">搜索</uv-button>
			</view>
		</view>
		<scroll-view scroll-y="true" @scrolltolower="loadMore">
			<view class="procedure-view">
				<block v-for="item in procedureList">
					<text :class="searchForm.stages[item.value] ? 'select': ''" @tap="selectChange(item)">{{item.label}}</text>
				</block>
			</view>
			<view class="delay-view">
				<text :class="searchForm.delay ? 'select': ''" @tap="delayChange">延期</text>
			</view>
			<uv-list class="list">
				<block v-for="item in list">
					<uv-list-item>
						<view class="item" @tap="goPage(item)">
							<uv-avatar class="avatar" size="180rpx" :src="item.userAvatar" shape="square"></uv-avatar>
							<view class="info-view">
								<view class="name-view">
									<block v-if="item.delay">
										<uv-tags class="tag" text="延期" size="mini" :type="item.delay === 1 ? 'warning' : 'error'"></uv-tags>
									</block>
									<text class="name two-ellipsis" :class="item.delay ? 'name-indent' : ''">{{ item.name }}</text>
								</view>
								<view class="cate-list">
									<text>{{ item.companyLabel }}</text>
									<uv-line direction="col" margin="0 10rpx" length="70%" color="#666"></uv-line>
									<text>{{ item.typeLabel }}</text>
									<uv-line direction="col" margin="0 10rpx" length="70%" color="#666"></uv-line>
									<text>{{ item.businessTypeLabel }}</text>
								</view>
								<view class="tag-list">
									<uv-tags class="tag" :text="item.statusLabel" plain size="mini" :type="item.status === 1 ? 'warning' : item.staus === 2 ? 'primary' : 'success'"></uv-tags>
									<uv-tags class="tag" :text="item.stageLabel" size="mini" plain type="success"></uv-tags>
									<block v-if="item.userName">
										<uv-tags class="tag" :text="item.userName" size="mini" plain type="success"></uv-tags>
									</block>
									<block v-if="item.shelve === 1">
										<uv-tags class="tag" text="搁置" size="mini" plain type="warning"></uv-tags>
									</block>
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
	import { onLoad, onReady } from '@dcloudio/uni-app'
	import { getDictLabel, getImageUrl } from '@/utils/tool'
	import { businessTypeDict, projectStatusDict, projectTypeDict } from '@/common/dict';
	import ProcessHandlerFactory from '../../utils/processHandle';
	
	const processHandler = ProcessHandlerFactory.create("A");

	
	const searchForm = reactive({
		name: '',
		stages: {},
		delay: false
	})
	
	const allList = ref([])
	const list = ref([])
	const procedureList = ref([])
	const managerInfo = ref()
	
	const pageSize = reactive({
		page: 1,
		size: 20,
		total: 0
	})
	
	onLoad((options) => {
		managerInfo.value = options
		getProjectList();
	})
	onReady(() => {
		uni.setNavigationBarTitle({
			title: managerInfo.value?.name || '项目管理'
		})
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
	
	const selectChange = (item: any) => {
		searchForm.stages = {
			...searchForm.stages,
			[item.value]: !searchForm.stages[item.value]
		}
		search()
	}
	
	const delayChange = () => {
		searchForm.delay = !searchForm.delay
		search()
	}

	const getProjectList = async () => {
	  try {
	    const res: any = await request({
	      url: '/project/list',
	      method: 'GET',
		  data: {
			  name: searchForm.name
		  }
	    });
		// console.log(res)
		
		// 项目数据初始化
		processHandler.tableDataSortHandler(res.data)
		res.data.forEach((item: any) => {	
			item.companyLabel = item.company.name
			item.typeLabel = getDictLabel(projectTypeDict, item.type)
			item.businessTypeLabel = getDictLabel(businessTypeDict, item.businessType)
			item.statusLabel = getDictLabel(projectStatusDict, item.status)
			item.userName = item.user ? item.user.name : null
			item.userAvatar = item.user ? getImageUrl(item.user.avatar) : 'https://via.placeholder.com/200x200.png/2878ff'
			const stage = processHandler.calcProjectStage(item)
			item.stage = stage.seq
			item.stageLabel = stage.name
			item.delay = processHandler.calcProcedureDelay(item)
			
		})
		// 流程获取
		procedureList.value = procedureList.value.length ? procedureList.value : res.data[0].stages.map((s: any) => {
			return {
				label: s.name,
				value: s.seq
			}
		})
		
		
		// 筛选条件
		const tmpData = filterData(res.data)
		allList.value = tmpData
		list.value = tmpData.slice(0, pageSize.size)
		pageSize.total = tmpData.length;
		
	  } catch (error) {
	    console.error('获取项目失败', error);
	  }
	};
	
	const filterData = (list: any[]) => {
		let filterData = list
		// 项目经理
		if (managerInfo.value && managerInfo.value.id) {
			filterData = filterData.filter(item => {
				return item.user && (item.user.id == managerInfo.value.id)
			})
		}
		
		// 项目阶段
		let isSelect = JSON.stringify(searchForm.stages).indexOf('true') !== -1
		if (!isSelect) {
			filterData = filterData
		} else {
			filterData = filterData.filter(item => searchForm.stages[item.stage])
		}
		// 延期
		if (searchForm.delay) {
			filterData = filterData.filter((item: any) => item.delay)
		}
		// 排序
		filterData.sort((a: any, b: any) => b.delay - a.delay)
		
		return filterData
	}
	
	
	  const goPage = (record: any) => {
		  uni.setStorageSync('details', record)
		  uni.navigateTo({
		  	url: '/pages/index/details'
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
				height: calc(100% - 102rpx);
				background-color: white;
				.delay-view{
					background-color: #fff;
					padding: 20rpx;
					display: flex;
					overflow: auto;
					font-size: 20rpx;
					text{
						white-space: nowrap;
						padding: 20rpx;
						background-color: #f5f7fa;
						border-radius: 10rpx;
						margin-right: 20rpx;
					}
					.select{
						background-color: #5ac725;
						color: white;
					}
				}
				.procedure-view{
					background-color: #f5f7fa;
					padding: 20rpx;
					display: flex;
					overflow: auto;
					font-size: 20rpx;
					text{
						white-space: nowrap;
						padding: 20rpx;
						background-color: #fff;
						border-radius: 10rpx;
						margin-right: 20rpx;
					}
					.select{
						background-color: #5ac725;
						color: white;
					}
				}
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
					.info-view{
						display: flex;
						flex-direction: column;
						justify-content: space-between;
					}
					.name-view{
						position: relative;
						.tag{
							position: absolute;
							left: 0;
							top: -4rpx;
						}
					}
					.name{
						font-size: 24rpx;
						font-weight: bold;
						line-height: 40rpx;
					}
					.name-indent{
						text-indent: 80rpx;
					}
					.avatar{
						
						flex-shrink: 0;
						margin-right: 20rpx;
					}
					.cate-list{
						display: flex;
						align-items: center;
						font-size: 20rpx;
						color: #666;
						
					}
					.tag-list{
						display: flex;
						flex-wrap: wrap;
						.tag{
							margin-right: 10rpx;
							margin-bottom: 10rpx;
						}
					}
				}
			}
		}
	}
</style>