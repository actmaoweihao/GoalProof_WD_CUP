# 测试计划

本项目测试分为合约测试、前端测试和人工浏览器检查三层。

## 自动化测试

合约测试覆盖 64 个场景：

- 角色权限
- 比赛创建和取消
- commit 提交限制
- AI 理由哈希提交和零哈希拒绝
- 预言机提交赛果
- reveal 验证
- 计分规则
- 暂停/恢复
- TypeScript 与 Solidity commitment 向量一致性
- Alice/Bob 端到端流程

前端测试覆盖 24 个场景：

- commitment 编码
- AI 理由规范化、reasonHash、标签分析和赛后复盘
- salt 生成和本地存储
- 恢复文件导入/导出校验
- 比赛阶段判断
- 错误提示
- 排行榜聚合和排序
- 钱包连接提示
- App 启动 smoke test

完整质量检查：

```powershell
pnpm check
```

该命令会依次执行：

1. 合约编译
2. 根目录 TypeScript 类型检查
3. 合约测试
4. 前端类型检查
5. 前端 lint
6. 前端测试
7. 前端生产构建

覆盖率：

```powershell
pnpm contracts:coverage
```

gas 报告：

```powershell
pnpm contracts:gas
```

## 人工检查清单

- [ ] 启动本地链、部署合约、注入演示数据。
- [ ] MetaMask 连接 Hardhat Local。
- [ ] 普通钱包能看到比赛列表和详情。
- [ ] 管理员钱包能创建未来比赛。
- [ ] 没权限的钱包不能创建比赛。
- [ ] 用户能在 commit 阶段提交预测。
- [ ] commit 交易里只出现 commitment 和 reasonHash，不出现明文比分或明文理由。
- [ ] AI 理由卡片能显示标签、风险等级和赛后复盘。
- [ ] salt 恢复文件能导出。
- [ ] 推进时间后，预言机能提交赛果。
- [ ] 用户能 reveal，且 exact score 得 5 分。
- [ ] 猜中胜平负但比分不完全一致得 3 分。
- [ ] 排行榜能根据事件更新。
- [ ] 本地链重启后，前端能提示合约不存在，需要重新部署。
- [ ] 管理页时间默认值显示为本地未来时间。
- [ ] 写交易不会再出现 Hardhat gas cap 超限错误。

## 课堂演示前建议

演示前先运行：

```powershell
pnpm check
```

如果时间有限，至少运行：

```powershell
pnpm contracts:test
pnpm frontend:test
```
