import { Link } from "react-router-dom";
import { FlowGuide } from "../components/FlowGuide";
import { MatchCard } from "../components/MatchCard";

export function HomePage() {
  const comparison = [
    {
      name: "公开预测",
      limitation: "答案提前泄露，容易被抄袭或影响他人判断。",
      improvement: "先上链哈希，赛后再公开。"
    },
    {
      name: "中心化平台",
      limitation: "用户必须相信平台不会改时间戳或改内容。",
      improvement: "承诺时间由区块链记录。"
    },
    {
      name: "普通 AI 预测",
      limitation: "理由写得漂亮，但难证明不是赛后补写。",
      improvement: "理由哈希 reasonHash 赛前上链。"
    },
    {
      name: "押金/投注机制",
      limitation: "激励强，但容易引入资金、赔率和合规风险。",
      improvement: "只做非金融声誉分。"
    }
  ];

  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">AI ERA · VERIFIABLE PREDICTION REPUTATION</div>
          <h1>
            让预测不能
            <br />
            <em>事后改口。</em>
          </h1>
          <p>
            GoalProof 把“赛前预测、理由和赛后验证”变成可验证声誉：AI
            帮助质询和复盘，区块链证明预测确实在事件发生前存在。
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/matches">
              开始预测
            </Link>
            <a className="button button-ghost" href="#method">
              了解方法
            </a>
          </div>
        </div>
        <div className="proof-orbit" aria-label="Commit reveal proof visualization">
          <div className="orbit-ring" />
          <div className="proof-core">
            <span>0x</span>
            <strong>PROOF</strong>
            <small>BLOCK #31337</small>
          </div>
          <span className="orbit-label label-a">COMMIT</span>
          <span className="orbit-label label-b">REVEAL</span>
          <span className="orbit-label label-c">SCORE</span>
        </div>
      </section>
      <section className="thesis-strip">
        <article>
          <span>WHY</span>
          <strong>预测越来越便宜，可信预测越来越稀缺。</strong>
          <p>AI、KOL、专家都能快速生成判断，但删帖、改口、赛后补理由很难被追责。</p>
        </article>
        <article>
          <span>HOW</span>
          <strong>隐藏答案，公开证据。</strong>
          <p>Commit 阶段只上链 commitment 和 reasonHash；Reveal 后合约验证并自动计分。</p>
        </article>
        <article>
          <span>SO WHAT</span>
          <strong>不是押注，是声誉。</strong>
          <p>系统不接收 ETH、不发币、不设奖池，只沉淀可验证的预测履历。</p>
        </article>
      </section>
      <FlowGuide
        eyebrow="DEMO ROUTE"
        title="第一次使用，按这 5 步走就不会迷路"
        steps={[
          {
            title: "管理员准备比赛",
            description: "本地链启动后，在管理页创建演示比赛或提交赛果。",
            to: "/admin"
          },
          {
            title: "普通用户选比赛",
            description: "去比赛页，选择仍在 Commit 阶段的比赛。",
            to: "/matches"
          },
          {
            title: "提交预测",
            description: "输入比分和理由，钱包确认后链上只保存哈希。"
          },
          {
            title: "等待赛果",
            description: "比赛开赛后，由预言机在管理页提交最终比分。",
            to: "/admin"
          },
          {
            title: "公开并拿证明",
            description: "Reveal 成功后查看得分、排行榜和 Proof Passport。"
          }
        ]}
      />
      <section className="method" id="method">
        <div className="section-heading">
          <div>
            <div className="eyebrow">HOW IT WORKS</div>
            <h2>三步，把判断变成证据</h2>
          </div>
          <Link className="text-link" to="/matches">
            查看所有比赛 →
          </Link>
        </div>
        <div className="steps">
          <article>
            <span>01</span>
            <h3>承诺 Commit</h3>
            <p>浏览器生成 salt，把比分和预测理由分别编码为链上哈希。</p>
          </article>
          <article>
            <span>02</span>
            <h3>质询 Challenge</h3>
            <p>本地 AI 给出标签、风险和反方观点，让预测赛后可复盘。</p>
          </article>
          <article>
            <span>03</span>
            <h3>公开 Reveal</h3>
            <p>赛果发布后公开比分和 salt，合约验证、计分并生成证明卡。</p>
          </article>
        </div>
      </section>
      <section className="comparison-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">PRIOR LIMITATIONS</div>
            <h2>前人方案解决了一部分问题，但没有解决“赛前可验证判断”</h2>
          </div>
        </div>
        <div className="comparison-grid">
          {comparison.map((item) => (
            <article key={item.name}>
              <span>{item.name}</span>
              <p>{item.limitation}</p>
              <strong>{item.improvement}</strong>
            </article>
          ))}
        </div>
      </section>
      <section>
        <div className="section-heading">
          <div>
            <div className="eyebrow">FEATURED FIXTURE</div>
            <h2>当前演示场</h2>
          </div>
        </div>
        <div className="featured-grid">
          <MatchCard matchId={1n} />
          <div className="chain-note">
            <span>链上承诺</span>
            <strong>只有哈希，没有答案，也没有明文理由。</strong>
            <p>别人能看到你在截止前留下了证据，却无法从交易里还原比分或预测逻辑。</p>
            <code>commitment + reasonHash</code>
          </div>
        </div>
      </section>
    </>
  );
}
