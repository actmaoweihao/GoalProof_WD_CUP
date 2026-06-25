# 课堂演示脚本

这个脚本适合 3–5 分钟课堂展示或录屏。建议演示前先完整跑一遍，避免 MetaMask 网络、账号权限或本地链状态临时出问题。

## 演示前准备

开三个终端。

终端 1：

```powershell
pnpm node
```

终端 2：

```powershell
pnpm setup:localhost
```

终端 3：

```powershell
pnpm frontend:dev
```

打开：

```text
http://127.0.0.1:5173/
```

MetaMask 使用 Hardhat Local：

- RPC: `http://127.0.0.1:8545`
- Chain ID: `31337`

建议准备三个钱包：

- 管理员/预言机：Hardhat Account #0，或已通过 `pnpm grant:localhost` 授权的钱包。
- Alice：普通预测用户。
- Bob：普通预测用户。

如果使用自己的钱包地址，需要先授权和转本地测试 ETH：

```powershell
$env:TARGET_ADDRESS='你的钱包地址'; pnpm grant:localhost; Remove-Item Env:\TARGET_ADDRESS
```

## 演示流程

1. 项目动机，约 20 秒

   说明普通公开预测会提前暴露答案，中心化私密预测又要相信服务器不会改记录。GoalProof 用链上 commitment 证明“预测在开赛前已经存在”。

2. 管理员创建比赛，约 30 秒

   打开管理页，展示角色状态为 `✓`，创建一场未来开赛的比赛。

3. Alice 提交预测，约 40 秒

   切换到 Alice 钱包，进入比赛详情页，预测 `2:0` 并提交。强调链上只保存 `bytes32` 哈希，比分和 salt 不公开。

4. Bob 提交预测，约 30 秒

   切换到 Bob 钱包，预测 `3:1` 并提交。展示两个人的 commitment 是不同的不可读哈希。

5. 推进本地链时间，约 10 秒

   在终端运行：

   ```powershell
   pnpm time:localhost
   ```

6. 预言机提交赛果，约 30 秒

   切回管理员/预言机钱包，在管理页提交真实赛果 `2:0`。说明这是 MVP 的可信预言机假设，生产环境可替换为更去中心化的数据源。

7. Alice 和 Bob Reveal，约 60 秒

   Alice reveal 后得 5 分；Bob reveal 后得 3 分。说明 exact score 和正确胜平负的计分差异。

8. 展示排行榜和个人页，约 30 秒

   排行榜由链上事件聚合，不是中心化数据库排序。

9. 收尾，约 20 秒

   强调项目没有投注、代币、奖池，重点是 commit–reveal、权限控制、链上不可篡改记录和自动化测试。

## 可截图素材

- 首页三步流程。
- 比赛列表。
- Commit 前后的交易状态。
- 管理页角色 `✓`。
- 预言机提交赛果。
- Reveal 后的得分。
- 排行榜。
- `pnpm check` 通过结果。
- `docs/gas-report.json`。

## 命令行备用演示

如果浏览器或 MetaMask 临时出问题，可以用命令行演示完整逻辑：

```powershell
pnpm demo:localhost
```

它会自动执行 commit、推进时间、提交赛果、reveal 和断言计分。
