# GoalProof 项目报告写作框架

> 用途：供团队成员并行起草，最后由一名主编统一论证、术语和篇幅。
>
> 篇幅目标：正文纯文字控制在 **5 页以内**。参考范例采用“封面 + 5 页连续正文 + 图表附录”的方式；GoalProof 也建议采用同一策略，把流程图、架构图、界面截图、测试表和 Gas 表集中放在正文之后。

## 1. 先统一整篇报告要回答的一个问题

### 1.1 一句话项目定义

**GoalProof is a non-financial, smart-contract-based reputation system that uses commit–reveal to prove that a prediction and its supporting reason existed before an event, without disclosing them before the reveal stage.**

中文理解：GoalProof 不是投注平台，而是一个可验证预测声誉系统。它先隐藏预测内容并把承诺写入链上，待比赛结果出现后再公开并由合约验证和计分。

### 1.2 Motivation（必须在第一页说明白）

建议按以下因果链写，不要从“区块链很热门”起笔：

1. AI、社交媒体和内容平台降低了生成预测与分析的成本。
2. 但预测失败后可以删帖、改口，成功后又可以事后补写理由，导致“预测很多、可信声誉很少”。
3. 中心化平台可以保存时间戳，但用户必须相信平台没有修改内容或时间。
4. 公开预测又会提前泄露答案，带来跟随、抄袭或影响他人判断的问题。
5. 因而需要一种机制：**赛前可承诺但不泄露，赛后可公开并由任何人验证，最终形成可审计的历史声誉。**

### 1.3 Key issue（全文主轴）

建议把核心问题直接写成研究问题：

> **How can a system preserve the confidentiality of a prediction before an event while making its prior existence, ownership, and later disclosure publicly verifiable without relying on a mutable platform database?**

这个核心矛盾是：**pre-event confidentiality 与 post-event verifiability 如何同时成立。**

随后将其拆成三个工程问题：

- **Binding and hiding:** 承诺必须绑定具体用户、比赛、链和合约，同时在 reveal 前隐藏比分与理由。
- **Lifecycle and trust:** 谁能创建比赛和提交赛果，commit/reveal 截止时间如何强制执行，赛果来源是否可信。
- **Usability and recoverability:** 用户如何保存 salt，如何恢复 reveal 数据，如何在不做高 Gas 链上排序的情况下展示排行榜和凭证。

### 1.4 全文核心结论

报告需要反复服务于这句话：

> GoalProof does not make a prediction true; it makes the timing, ownership, and integrity of the prediction auditable.

也就是说，区块链证明的是“某个地址在某个时间前已经承诺了与后来公开内容一致的数据”，不是证明预测本身正确，也不是证明预言机提交的现实结果一定真实。

---

## 2. 参考范例后建议采用的正文结构

参考报告的有效叙事顺序是：现实问题 → 业务流程 → 技术实现 → 演示 → 结论，图片统一后置。GoalProof 沿用这个顺序，但应增加明确的 key issue、评估证据和局限性。

参考范例的 5 页正文约为 1,800 个英文词。GoalProof 建议将英文正文控制在 **1,800–2,100 words**；最终仍以课程模板中的实际分页为准，不能只依赖字数估计。

### Title

可选标题：

**GoalProof: A Commit–Reveal Protocol for Verifiable Prediction Reputation in the AI Era**

标题中避免使用 betting、gambling 或 prediction market，因为项目没有资金、赔率或奖池。

### Abstract（100–120 words，约 0.25 页）

只写四件事：

1. 背景：AI 时代预测易生成、难追责；
2. 问题：赛前隐私和赛后可验证性冲突；
3. 方法：链上 commitment/reasonHash、赛后 reveal、自动计分、Proof Passport；
4. 结果与边界：完成本地端到端流程和自动化测试，但 MVP 依赖授权预言机且用户必须保存 salt。

不要在摘要中堆技术栈，也不要把本地规则分析器描述成外部大模型。

### 1. Introduction（330–380 words，约 0.9 页）

#### 1.1 Motivation and problem

- 用“可修改的赛后叙事”说明现实痛点；
- 解释中心化时间戳的信任问题；
- 解释为什么直接公开预测也不是答案；
- 明确 GoalProof 的非金融边界。

#### 1.2 Key issue and why blockchain

必须回答“为什么非要用区块链”：

- 普通数据库能完成业务流程，但平台管理员可以修改数据库，验证者仍需信任平台；
- 区块链提供公开可验证、不可由单一平台事后修改的承诺记录；
- commit–reveal 让链上先记录哈希、后公开原像，从而兼顾隐藏与验证；
- 智能合约统一执行截止时间、一次提交、一次赛果和原子化计分规则。

#### 1.3 Contributions

建议只列三项，防止夸大：

1. A domain-separated commit–reveal protocol binding a prediction to its chain, contract, wallet, and match.
2. An on-chain lifecycle that enforces deadlines, role-based result submission, verification, and atomic scoring without handling funds.
3. A usable DApp layer with local reason analysis, salt recovery, event-derived reputation views, and a post-reveal Proof Passport.

### 2. System Scenario and Requirements（220–280 words，约 0.65 页）

#### 2.1 Actors and user flow

只保留四类角色：

- User：提交 commitment，结果出现后 reveal；
- Match manager：创建或取消比赛；
- Oracle：提交不可修改的最终赛果；
- Contract：验证阶段、承诺、赛果和计分。

用一段文字走完用户流程：连接钱包 → 选择比赛 → 输入比分与理由 → 浏览器生成 salt 和哈希 → 链上 commit → oracle 提交赛果 → 用户 reveal → 合约验证并计分 → 前端生成 Proof Passport。

#### 2.2 Design requirements

将需求写成可验证的约束，而不是功能清单：

- R1 Confidentiality before reveal；
- R2 Binding to user, match and deployment domain；
- R3 Immutable deadlines and single-use actions；
- R4 Verifiable scoring and public audit trail；
- R5 No custody of funds and minimal on-chain computation；
- R6 Recoverable local secret handling for classroom usability。

### 3. Design and Technical Implementation（650–750 words，约 1.8 页）

这是正文最长部分，应围绕 key issue 展开，而不是逐页介绍前端。

#### 3.1 Trust boundary and architecture

- GoalProof 是无传统后端的 local-first DApp；
- 合约是唯一可信状态机；
- 公共状态与事件在链上，salt 和明文理由保存在用户浏览器；
- 前端通过 wagmi/viem 发起读写，排行榜由事件聚合；
- 授权 oracle 是明确的 MVP 信任假设。

#### 3.2 Commit–reveal construction

报告中给出 commitment 公式，并逐项解释：

```text
commitment = keccak256(abi.encode(
  chainId,
  contractAddress,
  walletAddress,
  matchId,
  predictedHomeScore,
  predictedAwayScore,
  salt
))
```

解释重点：

- salt 防止他人通过枚举少量可能比分反推出预测；
- walletAddress 和 matchId 防止跨用户、跨比赛复制；
- chainId 和 contractAddress 提供 domain separation，防止跨链或跨部署重放；
- `abi.encode` 的字段顺序和类型必须在前端与 Solidity 中完全一致；
- reveal 时合约重算 commitment，只有匹配才接受。

理由证明单独说明：

```text
reasonHash = keccak256(abi.encode(
  chainId,
  contractAddress,
  walletAddress,
  matchId,
  normalizedReason
))
```

需要准确表述：reasonHash 证明“后来提供的规范化理由与赛前承诺一致”，但不会证明理由正确、原创或由某个 AI 生成。

#### 3.3 Lifecycle, access control and scoring

- 比赛状态由 commit deadline、kickoff、result submission 和 reveal deadline 共同决定；
- `MATCH_MANAGER_ROLE`、`ORACLE_ROLE`、`PAUSER_ROLE` 分离权限；
- 每个地址每场比赛只能 commit/reveal 一次；
- oracle 只能提交一次赛果；
- reveal 验证与计分在同一交易原子完成；
- 精确比分 5 分、胜平负正确 3 分、错误 0 分。

这里要解释设计理由：原子化计分避免“验证成功但未领分”的中间状态；排行榜使用事件聚合，避免合约枚举和排序所有用户造成高 Gas。

#### 3.4 Local usability layer

- salt 和恢复记录在签名请求前写入本地，以降低签名成功但本地数据丢失的风险；
- 恢复 JSON 可以导入/导出，但 reveal 前属于敏感数据；
- 本地 reason analyzer 只做可解释的标签、风险提示、反方质询和赛后复盘，不调用外部模型 API；
- Proof Passport 汇总链上 commitment、reasonHash、reveal、得分与本地理由；它是展示层，不是新的可信数据库或链上 NFT。

### 4. Evaluation and Demonstration（250–300 words，约 0.7 页）

不要只写“系统成功运行”。建议分成三类证据：

#### 4.1 End-to-end scenario

用 Alice/Bob 场景说明：两人提交不同预测，oracle 提交真实赛果，Alice 精确命中得 5 分，Bob 只命中胜平负得 3 分，随后显示 Passport、排行榜和个人历史。

#### 4.2 Correctness and security tests

正文只总结测试覆盖的风险类别，具体数字和截图放表格：

- 权限与时间边界；
- 重复 commit/reveal、错误 salt、复制 reveal；
- 赛果不可重复提交与取消比赛；
- TypeScript/Solidity commitment 向量一致性；
- 前端恢复文件、阶段判断、排行榜与错误提示；
- 编译、类型检查、lint、测试和生产构建。

#### 4.3 Cost observations

可以引用本地测量，但必须注明不是主网价格预测：

- `createMatch`: 121,025 gas
- `commitPredictionWithReason`: 99,867 gas
- `submitResult`: 36,638 gas
- `revealPrediction`: 112,877 gas

分析重点不是“gas 很低”，而是哪些状态写入导致成本，以及为何把排行榜排序、明文理由和 AI 分析留在链下。

### 5. Discussion and Limitations（180–220 words，约 0.5 页）

这一节能显著提高报告可信度，至少写清：

1. **Oracle trust:** 链上记录无法保证现实赛果本身正确；当前由授权 oracle 提交，去中心化 oracle 是未来工作。
2. **Salt availability:** 用户丢失 salt 就无法 reveal；恢复 JSON 改善可用性，但没有消除设备丢失和浏览器泄露风险。
3. **Metadata leakage:** commitment 仍会公开钱包地址、提交时间和参与某场比赛的事实。
4. **Local-only deployment:** 当前证据来自 Hardhat 本地网络，尚未完成公开测试网部署或生产审计。
5. **AI scope:** 本地分析层是可解释的规则型辅助，不验证理由真实性，也不是模型性能研究。

Future work 可简短写：去中心化赛果源、多设备加密恢复、隐私增强方案（如零知识证明）、公开测试网部署和第三方安全审计。

### 6. Conclusion（100–120 words，约 0.3 页）

结论只回收三件事：

- motivation：预测声誉缺少可验证的赛前证据；
- key issue：赛前隐藏与赛后验证的冲突；
- answer：domain-separated commit–reveal + 合约状态机 + 可恢复的前端体验。

最后一句建议保持克制：GoalProof 展示了一种可推广到预测、承诺和时间敏感声明的机制，但生产使用仍需要更可靠的 oracle、密钥恢复和安全审计。

---

## 3. 图表与附录安排（不占纯文字 5 页）

建议图表按正文第一次引用的顺序编号：

1. **Figure 1 — Motivation and trust gap:** 中心化平台、公开预测、GoalProof 三种方式的差异。
2. **Figure 2 — End-to-end user flow:** Commit → Result → Reveal → Score → Passport。
3. **Figure 3 — System architecture and trust boundary:** Wallet / React frontend / local storage / GoalProof contract / oracle。
4. **Figure 4 — Commit–reveal sequence or state machine:** 包含截止时间与失败分支。
5. **Table 1 — Requirement-to-design mapping:** R1–R6 对应机制和验证证据。
6. **Table 2 — Test summary:** 合约、前端、集成测试及覆盖场景。
7. **Table 3 — Gas snapshot:** 四个关键写操作和测试环境。
8. **Figures 5–8 — UI evidence:** Commit、Reveal、Proof Passport、Leaderboard/Admin。

正文必须解释图表“证明了什么”，不要逐项重复图中文字。

---

## 4. 团队分工建议

### 成员 A：Introduction 主笔

- 交付：Abstract + Section 1；
- 核心任务：写清 motivation、key issue、为什么普通数据库不够；
- 输入：README 的“为什么做”“前人方案的局限”；
- 字数：430–500 words。

### 成员 B：System flow 与图表负责人

- 交付：Section 2 + Figures 1–2 + Table 1；
- 核心任务：从真实用户流程提炼角色、需求和状态，不展开代码文件；
- 输入：README、`docs/DEMO_SCRIPT.md`、`docs/ARCHITECTURE.md`；
- 字数：220–280 words。

### 成员 C：Smart contract 主笔

- 交付：Sections 3.1–3.3 + Figures 3–4；
- 核心任务：commitment/reasonHash、domain separation、权限、时间、计分和事件；
- 输入：`contracts/GoalProof.sol`、`DECISIONS.md`、合约测试；
- 字数：450–520 words。

### 成员 D：Frontend / AI / Passport 主笔

- 交付：Section 3.4 + UI figures；
- 核心任务：链上/链下边界、salt 恢复、本地 reason analyzer、Proof Passport；
- 输入：`frontend/src/lib/commitment.ts`、`aiReason.ts`、`saltStorage.ts`、`ProofPassport.tsx`；
- 字数：200–230 words。

### 成员 E：Evaluation、limitations 与终稿主编

- 交付：Sections 4–6 + Tables 2–3；
- 核心任务：整理测试与 Gas 证据，主动披露 oracle、salt 和部署局限，最后统一全文；
- 输入：`docs/TEST_PLAN.md`、`docs/SECURITY.md`、`docs/gas-report.json`、`DECISIONS.md`；
- 字数：530–640 words。

如果团队只有 4 人，可由成员 B 合并 D 的任务；如果超过 5 人，可单独设一名引用与排版负责人。

---

## 5. 合稿规则

1. 每节第一句说明本节要回答的问题，最后一句说明它如何回应 key issue。
2. 全文统一使用 `commitment`、`reasonHash`、`salt`、`commit–reveal`、`oracle`、`Proof Passport`。
3. 同一个流程只完整解释一次；其他章节用交叉引用，不重复介绍。
4. 所有“安全、低成本、高效、去中心化”等形容词必须有机制、测试或数据支持。
5. 区分 implemented、tested、future work，不能把 Sepolia-ready 写成已公开部署。
6. 图表标题写结论性信息，正文引用每一张图和表。
7. Abstract 最后写；Introduction 在技术与评估完成后再回改。
8. 最终主编检查每段是否服务于“赛前隐藏、赛后可验证”这条主线。

---

## 6. 必须避免的表述

- 不要写“GoalProof ensures the real-world result is true”；oracle 仍是信任假设。
- 不要写“predictions are encrypted on-chain”；当前是 salted hash commitment，不是加密存储。
- 不要写“AI model generates the prediction”；当前是本地可解释的 reason analyzer。
- 不要写“all prediction reasons are stored on-chain”；链上只有 reasonHash。
- 不要写“Proof Passport is an NFT/on-chain certificate”；它是前端生成的展示凭证。
- 不要写“fully decentralized”；管理员和授权 oracle 仍有明确权限。
- 不要写“deployed on Ethereum/Sepolia”；除非后续真的部署并给出地址与交易证据。
- 不要引入投注、代币、奖池或真实资金的叙事。

---

## 7. 引用与证据清单

正式写作时至少为以下论断补来源：

- blockchain immutability / public verifiability；
- commit–reveal 的 hiding/binding 原理及其局限；
- Ethereum `keccak256`、ABI encoding 和智能合约执行环境；
- role-based access control；
- blockchain oracle problem；
- 如使用“AI 时代信息可信度下降”等宏观判断，也应提供可靠资料，或改写为本项目的设计动机而非无证据的事实断言。

优先使用课程材料、Ethereum/Solidity/OpenZeppelin 官方文档和同行评审论文。参考文献格式由一名成员统一，避免每人各用一种格式。

---

## 8. 提交前一分钟检查

- [ ] 第一页是否在 2–3 段内写清 motivation？
- [ ] 是否有一句明确的 key issue / research question？
- [ ] 是否回答为什么使用区块链而不是普通数据库？
- [ ] 技术部分是否解释 commitment 每个字段的作用？
- [ ] 是否区分链上事实、链下本地数据和 oracle 信任？
- [ ] 是否有端到端结果、测试与 Gas 三类证据？
- [ ] 是否主动写出 oracle、salt、metadata 和本地部署局限？
- [ ] 是否没有夸大 AI、去中心化和部署状态？
- [ ] 正文文字是否不超过 5 页？
- [ ] 所有图表是否在正文中被引用，且移到图表附录？