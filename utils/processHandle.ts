import { diffDaysHandle } from "./tool";

// 1. 定义各流程处理类，统一接口
class BaseProcessHandler {
	procedureConfig : any;
	procedureStages : any[] = [];
	procedureNodes : any[] = [];
	errorColor = "#ff4d4f";
	warningColor = "#faad14";
	normalColor = "#fff";
	tableDataSortHandler(
		tableData : []
	) {
		// 对每个流程的阶段进行排序
		// 并将每个阶段的节点进行排序
		
		tableData.forEach((item : any, index : number) => {
			item.stages.sort((a, b) => a.seq - b.seq);
			item.stages.forEach((s) => {
				s.nodes.sort((a : any, b : any) => a.seq - b.seq);
			});
		});
	}
	getProcedureStages() {
		return this.procedureStages;
	}
	getProcedureNodes() {
		return this.procedureNodes;
	}
	getNodeConfig(name : string) {
		let node = {
			plannedDays: 0,
		};

		this.procedureStages.forEach((s : any) => {
			s.nodes.forEach((n : any) => {
				if (n.name === name) {
					node = n;
				}
			});
		});
		return node;
	}

	getProjectNodeConfig(stages : any[], name : string) {
		let node = {
			name: "",
			status: 0,
			plannedStart: "",
			plannedEnd: "",
			actualStart: "",
			actualEnd: "",
		};

		stages.forEach((s : any) => {
			s.nodes.forEach((n : any) => {
				if (n.name === name) {
					node = n;
				}
			});
		});
		return node;
	}

	setProcedureConfig(procedure : any) {
		this.procedureConfig = procedure;
		this.procedureStages = procedure.config.stages || [];
		this.procedureNodes = [];
		this.procedureStages.forEach((s : any) => {
			s.nodes.forEach((n : any) => {
				this.procedureNodes.push({
					...n,
					parent: {
						name: s.stageName,
						seq: s.seq,
					},
				});
			});
		});
	}

	userDataHandle(users : string[], userList : any[]) {
		const filterUser = users
			.map((name : string) => {
				const user : | undefined = userList.find(
					(u : any) => u.username === name
				);
				return user ? user : undefined;
			})
			.filter((u) => u);

		const userObj : any = {};
		filterUser.forEach((u : any) => {
			const orgName = u.org.name as string;
			if (userObj[orgName]) {
				userObj[orgName].push(u.name);
			} else {
				userObj[orgName] = [u.name];
			}
		});
		return userObj;
	}
}

class ProcessAHandler extends BaseProcessHandler {
	startTimeNodeKeys : string[] = [];
	endTimeNodeKeys : string[] = [];
	customTimeNodeKeys : string[] = [];
	statusNodeKeys : string[] = [];
	constructor() {
		super();
	}
	// 初始化配置
	setNodeType() {
		this.startTimeNodeKeys = this.procedureNodes
			.filter((n) => n.plannedDays.toString().indexOf("开始") !== -1)
			.map((n) => n.name);
		this.customTimeNodeKeys = ["开工日期", "竣工日期", "项目工期"];
		this.statusNodeKeys = ["分包招标是否完成", "物资招标是否完成"];
		this.endTimeNodeKeys = this.procedureNodes
			.filter(
				(n) =>
					n.plannedDays.toString().indexOf("开始") === -1 &&
					!this.customTimeNodeKeys.find((item) => item === n.name) &&
					!this.statusNodeKeys.find((item) => item === n.name)
			)
			.map((n) => n.name);
	}
	calcNodeTime(record : any, node : any) {
		console.log(record)
		if (
			this.startTimeNodeKeys.find((k) => k === node.name) ||
			this.endTimeNodeKeys.find((k) => k === node.name)
		) {
			return this.calcTimeDiff(record, node);
		} else if (this.customTimeNodeKeys.find((k) => k === node.name)) {
			return this.calcCustomTimeDiff(record, node);
		} else if (this.statusNodeKeys.find((k) => k === node.name)) {
			return this.calcStatusDiff(record, node);
		}
	}
	calcTimeDiff(record : any, node : any) {
		const currentNode = this.getProjectNodeConfig(record.stages, node.name);
		return { diffDays: diffDaysHandle(currentNode.plannedEnd, currentNode.actualEnd) };
	}
	calcStatusDiff(record : any, node : any) {
		const currentNode = this.getProjectNodeConfig(record.stages, node.name);
		let calcDiffData: any = {
			diffDays: ''
		};
		if (currentNode.status === 1) {
			calcDiffData.diffDays = "已完成";
		} else {
			const connectNode = this.getProjectNodeConfig(
				record.stages,
				"甲方合同签订时间"
			);
			if (connectNode.actualEnd) {
				calcDiffData.diffDays = diffDaysHandle(connectNode.actualEnd, new Date());
			} else {
				calcDiffData.diffDays = "";
			}
		}
		return calcDiffData;
	}
	calcCustomTimeDiff(record : any, node : any) {
		const currentNode = this.getProjectNodeConfig(record.stages, node.name);
		let diffTimeData: any = {
			customPlannedEnd: '',
			customActualEnd: '',
			customDiffDays: ''
		};

		if (node.name === "开工日期") {
			diffTimeData.customPlannedEnd = currentNode.plannedStart
			diffTimeData.customActualEnd = currentNode.actualStart
			if (record.status === 1 && !record.shelve) {
				diffTimeData.customDiffDays = diffDaysHandle(
					currentNode.plannedStart,
					currentNode.actualStart || new Date()
				);
			} else {
				diffTimeData.customDiffDays = diffDaysHandle(
					currentNode.plannedStart,
					currentNode.actualStart
				);
			}
		} else if (node.name === "竣工日期") {
			diffTimeData.customPlannedEnd = currentNode.plannedEnd
			diffTimeData.customActualEnd = currentNode.actualEnd
			diffTimeData.customDiffDays = this.calcTimeDiff(record, node).diffDays;
		} else {
			diffTimeData.customPlannedEnd =
				currentNode.plannedEnd && currentNode.plannedStart
					? Math.abs(
						Number(
							diffDaysHandle(
								currentNode.plannedEnd,
								currentNode.plannedStart
							)
						)
					)
					: "";
			
			if (record.shelve) {
				diffTimeData.customActualEnd = "";
			} else {
				if (record.status === 2) {
					diffTimeData.customActualEnd =
						Math.abs(
							Number(diffDaysHandle(new Date(), currentNode.actualStart))
						) + 1;
				} else {
					diffTimeData.customActualEnd =
						currentNode.actualEnd && currentNode.actualStart
							? Math.abs(
								Number(
									diffDaysHandle(
										currentNode.actualEnd,
										currentNode.actualStart
									)
								)
							)
							: "";
				}
			}
			
			if (record.shelve) {
				diffTimeData.customDiffDays = "";
			} else {
						const start = Math.abs(
							Number(
								diffDaysHandle(currentNode.plannedEnd, currentNode.plannedStart)
							)
						);
						let end = 0;
						if (record.status === 1) {
							// end = Math.abs(
							//   Number(diffDaysHandle(new Date(), currentNode.plannedStart))
							// );
							// val = end;
						} else if (record.status === 2) {
							diffTimeData.customDiffDays = -(
								start -
								(Math.abs(
									Number(diffDaysHandle(new Date(), currentNode.actualStart))
								) +
									1)
							);
						} else {
							end = Math.abs(
								Number(
									diffDaysHandle(currentNode.actualEnd, currentNode.actualStart)
								)
							);
							diffTimeData.customDiffDays = end - start;
						}
					}

		}

		return diffTimeData;
	}

	isNodeComplete(node : any) {
		return (
			node.plannedStart && node.plannedEnd && node.actualStart && node.actualEnd
		);
	}
	calcStageStatus(stage : any) {
		if (stage.nodes.every((n : any) => n.status === 2)) {
			return 2
		}
		if (stage.nodes.every((n : any) => n.status === 0)) {
			return 0
		}
		return 1
	}
	calcNodeStatus(node : any) {
		if (node.name === '开工日期' || node.name === '竣工日期' || node.name === '项目工期') {
			if (this.isNodeComplete(node)) {
				return 2
			}
			if (node.actualStart && !node.actualEnd) {
				return 1
			}
			return 0
		}

		if (node.name === '分包招标是否完成' || node.name === '物资招标是否完成') {
			if (node.status === 1) {
				return 2
			}
			return 0
		}

		if (this.isNodeComplete(node)) {
			return 2
		}
		if (!node.actualStart && !node.actualEnd) {
			return 0
		}
		return 1
	}

	calcProjectStage(record : any) {
		let lastIndex = -1;
		if (record.stage !== 0) { // 有设置过项目阶段
			lastIndex = record.stage - 1;
		} else {
			for (let i = record.stages.length - 1; i >= 0; i--) {
				const s : any = record.stages[i]
				if (s.nodes.every((n : any) => this.isNodeComplete(n))) {
					lastIndex = i;
					break;  // 找到后跳出循环
				}
			}
			lastIndex =
				lastIndex === record.stages.length - 1 ? lastIndex : lastIndex + 1;
		}

		return record.stages[lastIndex];
	}
	calcProcedureDelay(record : any) {
		let delay = 0
		const nowStage = record.stages.find((s : any) => s.seq === record.stage)
		if (nowStage) {
			nowStage.nodes.forEach((n : any) => {
				if (!n.actualEnd && n.actualStart) {
					const planTimestamp = new Date(n.plannedEnd).getTime() - new Date(n.plannedStart).getTime()
					const nowTimestamp = new Date().getTime() - new Date(n.actualStart).getTime()
					const diffDays = Math.ceil((nowTimestamp - planTimestamp) / (1000 * 60 * 60 * 24));
					if (diffDays > 0 && diffDays < 100) {
						delay = 1
					} else if (diffDays >= 100) {
						delay = 2
					}
				}
			})
		}
		return delay
	}

}

// 2. 工厂类，根据流程类型创建对应实例
class ProcessHandlerFactory {
	static create(type : string) {
		switch (type) {
			case "A":
				return new ProcessAHandler();
			default:
				throw new Error("Unsupported process type");
		}
	}
}

export default ProcessHandlerFactory;