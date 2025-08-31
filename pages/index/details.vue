<template>
	<view class="page">
		<!-- 项目基本信息 -->
		<view class="header-card">
			<text class="title">{{ projectInfo.name }}</text>
			<uv-tags class="tag" :text="projectInfo.statusLabel" plain size="mini"
				:type="projectInfo.status === 1 ? 'warning' : projectInfo.staus === 2 ? 'primary' : 'success'"></uv-tags>
			<block v-if="projectInfo.shelve === 1">
				<uv-tags class="tag" text="搁置" size="mini" plain type="warning"></uv-tags>
			</block>
			<view class="row">
				<text>负责人：{{ projectInfo.userName || '--' }}</text>
				<text>编号：{{ projectInfo.projCode }}</text>
			</view>
			<view class="row">
				<text>年份：{{ projectInfo.year }}</text>
				<text>类型：{{ projectInfo.typeLabel }}</text>
			</view>
			<view class="row">
				<text>业务类型：{{ projectInfo.businessTypeLabel }}</text>
				<text>分公司：{{ projectInfo.companyLabel }}</text>
			</view>
			<view class="row">
				<text>阶段：{{ projectInfo.stageLabel }}</text>
				<view style="display: flex;">金额：<uv-text mode="price" color="#666" :text="projectInfo.amount"
						size="24rpx"></uv-text></view>
			</view>
		</view>

		<!-- 项目当前节点时间轴 -->
		<view v-if="projectInfo.status != 3" class="card">
			<view class="card-title">
				<text>当前节点</text>
				<block v-if="projectInfo.status != 3 && projectInfo.delay">
					<uv-tags class="tag" text="延期" size="mini"
						:type="projectInfo.delay === 1 ? 'warning' : 'error'"></uv-tags>
				</block>
			</view>
			<block v-for="(parent, i) in stages" :key="i">
				<view v-if="parent.seq === projectInfo.stage" class="timeline-item">
					<!-- 父节点 -->
					<view class="dot dot-1"></view>
					<view class="content">
						<view class="title">{{ parent.name }} <text class="status">[进行中]</text></view>
						<view class="info">
							<text>负责人：</text>
							{{ parent.participants.length ? parent.participants.join('、') : '--' }}
						</view>

						<!-- 子节点 -->
						<view v-if="parent.nodes && parent.nodes.length" class="child-nodes">
							<view v-for="(child, j) in parent.nodes" :key="j" class="timeline-child">
								<view class="dot-child" :class="'dot-' + child.status"></view>
								<view class="content">
									<view class="title">{{ child.name }} <text
											class="status">[{{ child.statusLabel }}]</text>
									</view>
									<view class="info">要求时间：{{ child.plannedDays || '--' }}</view>

									<block v-if="parent.name !== '招标采购'">
										<block
											v-if="child.name === '开工日期' || child.name === '竣工日期' || child.name === '项目工期'">
											<view class="info">计划时间：{{ child.customPlannedEndFormat || '--' }}</view>
											<view class="info">实际时间：{{ child.customActualEndFormat || '--' }}</view>
											<view class="info">
												<text>偏差分析：</text>
												<uv-text v-if="child.diffDays"
													:type="child.diffDays  < 100 ? 'warning' : 'error'" size="24rpx"
													:text="child.diffDays"></uv-text>

												<text v-else>{{ child.diffDays || '--' }}</text>
											</view>
										</block>
										<block v-else>
											<view class="info">计划时间：{{ child.plannedEndFormat || '--' }}</view>
											<view class="info">实际时间：{{ child.actualEndFormat || '--' }}</view>
											<view class="info">
												<text>偏差分析：</text>
												<uv-text v-if="child.diffDays"
													:type="child.diffDays  < 100 ? 'warning' : 'error'" size="24rpx"
													:text="child.diffDays"></uv-text>

												<text v-else>{{ child.diffDays || '--' }}</text>
											</view>
										</block>

									</block>

								</view>
							</view>
						</view>

					</view>
				</view>
			</block>

		</view>
		<!-- 项目节点时间轴 -->
		<view class="card">
			<text class="card-title">项目节点</text>
			<view v-for="(parent, i) in stages" :key="i" class="timeline-item">
				<!-- 父节点 -->
				<view class="dot" :class="'dot-' + parent.status"></view>
				<view class="content">
					<view class="title">{{ parent.name }} <text class="status">[{{ parent.statusLabel }}]</text></view>
					<view class="info">
						<text>负责人：</text>
						{{ parent.participants.length ? parent.participants.join('、') : '--' }}
					</view>


					<!-- 子节点 -->
					<view v-if="parent.nodes && parent.nodes.length" class="child-nodes">
						<view v-for="(child, j) in parent.nodes" :key="j" class="timeline-child">
							<view class="dot-child" :class="'dot-' + child.status"></view>
							<view class="content">
								<view class="title">{{ child.name }} <text
										class="status">[{{ child.statusLabel }}]</text>
								</view>
								<view class="info">要求时间：{{ child.plannedDays || '--' }}</view>

								<block v-if="parent.name !== '招标采购'">
									<block
										v-if="child.name === '开工日期' || child.name === '竣工日期' || child.name === '项目工期'">
										<view class="info">计划时间：{{ child.customPlannedEndFormat || '--' }}</view>
										<view class="info">实际时间：{{ child.customActualEndFormat || '--' }}</view>
										<view class="info">
											<text>偏差分析：</text>
											<uv-text v-if="child.diffDays"
												:type="child.diffDays  < 100 ? 'warning' : 'error'" size="24rpx"
												:text="child.diffDays"></uv-text>

											<text v-else>{{ child.diffDays || '--' }}</text>
										</view>
									</block>
									<block v-else>
										<view class="info">计划时间：{{ child.plannedEndFormat || '--' }}</view>
										<view class="info">实际时间：{{ child.actualEndFormat || '--' }}</view>
										<view class="info">
											<text>偏差分析：</text>
											<uv-text v-if="child.diffDays"
												:type="child.diffDays  < 100 ? 'warning' : 'error'" size="24rpx"
												:text="child.diffDays"></uv-text>

											<text v-else>{{ child.diffDays || '--' }}</text>
										</view>
									</block>

								</block>

							</view>
						</view>
					</view>

				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from 'vue'
	import request from '@/utils/request';
	import { onLoad, onReady } from "@dcloudio/uni-app";
	import { stageStatusDict } from '@/common/dict';
	import { formatDate, getDictLabel } from '../../utils/tool';
	import ProcessHandlerFactory from '../../utils/processHandle';

	const processHandler = ProcessHandlerFactory.create("A");

	// 项目信息
	const projectInfo = ref<any>(null)

	// 节点信息
	const stages = ref([])
	const userList = ref([])

	// 页面加载
	onLoad(async () => {
		projectInfo.value = uni.getStorageSync('details')

		await getUserList()
		getProcedureList(projectInfo.value.stages)
	})

	// 页面显示
	onReady(() => {
		uni.setNavigationBarTitle({
			title: projectInfo.value?.name || '项目详情'
		})
	})
	const getProcedureList = async (projectStages : any[]) => {
		console.log(2)
		try {
			const res : any = await request({
				url: '/project/procedures',
				method: 'GET',
			});

			const stagesConfig = res.data[0].config.stages
			processHandler.setProcedureConfig(res.data[0]);
			processHandler.setNodeType();

			projectStages.forEach((s : any) => {
				const findStageConfig = stagesConfig.find((sc : any) => sc.seq === s.seq)

				let participants = []
				s.nodes.forEach((n : any) => {
					const findNodeConfig = findStageConfig.nodes.find((nc : any) => nc.seq === n.seq)
					n.plannedDays = findNodeConfig.plannedDays
					participants = participants.concat(findNodeConfig.participants)
					n.status = processHandler.calcNodeStatus(n)
					n.statusLabel = getDictLabel(stageStatusDict, n.status)
					const calcTime = processHandler.calcNodeTime(projectInfo.value, n)
					for (const i in calcTime) {
						n[i] = calcTime[i]
					}
					n.plannedEndFormat = formatDate(n.plannedEnd)
					n.actualEndFormat = formatDate(n.actualEnd)
					n.customPlannedEndFormat = formatDate(n.customPlannedEnd)
					n.customActualEndFormat = formatDate(n.customActualEnd)
				})

				s.participants = userHandle(participants)
				s.status = processHandler.calcStageStatus(s)
				s.statusLabel = getDictLabel(stageStatusDict, s.status)
			})

			stages.value = projectStages
		} catch (error) {
			console.error('获取流程失败', error);
		}
	};

	// 用户
	const getUserList = async () => {
		try {
			const res : any = await request({
				url: '/user/list',
				method: 'GET',
			});
			userList.value = res.data
			console.log(1)
		} catch (error) {
			console.error('获取用户失败', error);
		}
	};

	const userHandle = (users : string[]) => {
		const userObj = processHandler.userDataHandle(users, userList.value);
		const participants = []
		for (const i in userObj) {
			participants.push(i + '（' + userObj[i].join("、") + '）')
		}
		return participants
	};
</script>

<style lang="scss" scoped>
	page {
		width: 100%;
		height: 100%;

	}

	.page {
		padding: 20rpx;
		background: #f5f5f5;
	}

	.header-card {
		background: #fff;
		padding: 30rpx;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
		text-align: center;

		.title {
			font-size: 36rpx;
			font-weight: bold;
		}

		.tag {
			display: inline-block;
			margin-left: 10rpx;
			margin-bottom: 10rpx;
		}
	}

	.row {
		display: flex;
		justify-content: space-between;
		margin-top: 10rpx;
		font-size: 24rpx;
		color: #666;
	}

	.card {
		background: #fff;
		padding: 20rpx;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.card-title {
		display: flex;
		margin-bottom: 20rpx;

		.tag {
			margin-left: 20rpx;
		}
	}

	.timeline-item {
		display: flex;
		margin-bottom: 20rpx;
	}

	.dot {
		width: 20rpx;
		height: 20rpx;
		border-radius: 50%;
		margin-right: 20rpx;
		margin-top: 10rpx;
	}

	.dot-2 {
		background: green;
	}

	.dot-1 {
		background: orange;
	}

	.dot-0 {
		background: gray;
	}

	.child-nodes {
		margin-left: 40rpx;
		/* 子节点缩进 */
	}

	.timeline-child {
		display: flex;
		margin-bottom: 10rpx;
	}

	.dot-child {
		width: 14rpx;
		height: 14rpx;
		border-radius: 50%;
		margin-right: 16rpx;
		margin-top: 12rpx;
	}

	.content .title {
		font-weight: bold;
		font-size: 28rpx;
	}

	.content .status {
		font-size: 24rpx;
		margin-left: 10rpx;
		color: #666;
	}

	.info {
		display: flex;
		font-size: 24rpx;
		color: #888;
		margin-top: 6rpx;
	}
</style>