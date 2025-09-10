<template>
	<view class="home-page">
		<uv-status-bar></uv-status-bar>
		<view class="logo-view">
			<image src="/static/logo.png"></image>
			<text>项目管理</text>
		</view>
		<view class="static-list">
			<view class="static-item">
				<text>项目总数</text>
				<text>{{ staticNum.count }}</text>
			</view>
			<view class="static-item">
				<text>未开工</text>
				<text>{{ staticNum.pending }}</text>
			</view>
			<view class="static-item">
				<text>在施工</text>
				<text>{{ staticNum.inProgress }}</text>
			</view>
			<view class="static-item">
				<text>已完工</text>
				<text>{{ staticNum.completed }}</text>
			</view>
		</view>
		
		<view class="stage-list">
			<view v-for="item in stagesStatic" :key="item.seq" class="stage-item">
				<text>{{ item.name }}（{{ item.count }}/{{ staticNum.count }}）</text>
				<uv-line-progress
					:percentage="(item.count/staticNum.count* 100).toFixed()"
					:activeColor="item.count === staticNum.count ? '#5ac725' : '#3c9cff'"
					height="40rpx"
				></uv-line-progress>
			</view>
		</view>
		
		<view class="menus-list">
			<view class="menus-item gray-border-right" @click="goPage('/pages/index/index')">
				<image src="/static/proejct.png"></image>
				<text>项目管理</text>
			</view>
			<view class="menus-item" @click="goPage('/pages/projectManager/index')">
				<image src="/static/manager.png"></image>
				<text>项目经理</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import request from '@/utils/request';
	import { onLoad } from '@dcloudio/uni-app'
	import { ref, reactive } from 'vue';
	import ProcessHandlerFactory from '../../utils/processHandle';
	
	const processHandler = ProcessHandlerFactory.create("A");
	
	onLoad(() => {
		getProjectList()
	})
	const stagesStatic = ref([])
	const staticNum = reactive({
		count: 0,
		pending: 0,
		inProgress: 0,
		completed: 0
	})
	
	const goPage = (url: string) => {
		uni.navigateTo({
			url
		})
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
		processHandler.tableDataSortHandler(res.data)
		
		const stages = res.data[0].stages.map((s: any) => {
		  return {
			seq: s.seq,
			name: s.name,
			count: 0
		  }
		})
		const statusObj: any = {};
		res.data.forEach(item => {
			item.sourceStage = item.stage
			const stage = processHandler.calcProjectStage(item)
			item.stage = stage.seq
			// 状态统计
			  if (statusObj[item.status]) {
				statusObj[item.status]++;
			  } else {
				statusObj[item.status] = 1;
			  }
			  
			  // 任务统计
			item.stages.forEach((s: any) => {
			  // 未设置过stage则按完成时间是否填写判断完成
			  let isNodeComplete = s.nodes.every((n: any) => processHandler.isNodeComplete(n))
			  if (s.name === '招标采购') { // 特殊节点
				isNodeComplete = s.nodes.every((n: any) => n.status === 1)
			  } else if (s.name === '工程施工') { // 特殊节点
				isNodeComplete = item.status === 3
			  } else { // 正常节点 & 手动设置过stage 则前面的正常节点都算完成
				if (item.sourceStage !== 0 && (Number(s.seq) < Number(item.sourceStage))) {
				  isNodeComplete = true
				}
			  }
			  const findStage = stages.find((stage: any) => stage.seq === s.seq)
			  if (findStage && isNodeComplete) {
				findStage.count += 1
			  }
			})
		})
		
		stagesStatic.value = stages
		staticNum.count = res.data.length
		staticNum.pending = statusObj[1]
		staticNum.inProgress = statusObj[2]
		staticNum.completed = statusObj[3]
		
		
	  } catch (error) {
	    console.error('获取项目失败', error);
	  }
	};
	
</script>

<style lang="scss" scoped>
	page{
		width: 100%;
		height: 100%;
		.home-page{
			width: 100%;
			height: 100%;
			padding: 20rpx 40rpx;
			overflow: auto;
		}
		.logo-view{
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 20rpx;
			image{
				width: 180rpx;
				height: 180rpx;
				margin-right: 20rpx;
			}
			text{
				font-size: 48rpx;
				font-weight: bold;
			}
		}
		.static-item:nth-child(1){
			background-color: #0e398a;
		}
		.static-item:nth-child(2){
			background-color: #f1a532;
		}
		.static-item:nth-child(3){
			background-color: #3c9cff;
		}
		.static-item:nth-child(4){
			background-color: #5ac725;
		}
		.static-list{
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
		}
		.static-item{
			display: flex;
			flex-direction: column;
			align-items:  center;
			justify-content: space-between;
			width: 48%;
			height: 160rpx;
			padding: 20rpx 40rpx;
			border-radius: 20rpx;
			font-size: 36rpx;
			color: white;
			font-weight: bold;
			margin-bottom: 20rpx;
		}
		.stage-list{
			margin-top: 20rpx;
		}
		.stage-item{
			margin-bottom: 20rpx;
			:deep(.uv-line-progress__text) {
				font-size: 30rpx;
			}
			text{
				display: block;
				color: #333;
				margin-bottom: 10rpx;
			}
		}
		.menus-list{
			display: flex;
			flex-wrap: wrap;
			margin-top: 30rpx;
		}
		.gray-border-right{
			border-right: 1px solid #eee;
		}
		.menus-item{
			display: flex;
			flex-direction: column;
			align-items: center;
			flex: 1;
			background-color: white;
			image{
				width: 100rpx;
				height: 100rpx;
				margin-bottom: 10rpx;
			}
		}
	}
</style>