import { Link } from "react-router-dom";
import { MatchCard } from "../components/MatchCard";

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">WORLD CUP · ON-CHAIN REPUTATION</div>
          <h1>
            先证明你猜过，
            <br />
            <em>再公开你猜对。</em>
          </h1>
          <p>
            GoalProof 用 commit–reveal
            证明预测存在于开赛之前：不泄露答案，也不依赖中心化组织者保存记录。
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
      <section className="method" id="method">
        <div className="section-heading">
          <div>
            <div className="eyebrow">HOW IT WORKS</div>
            <h2>三步，留下不可篡改的判断</h2>
          </div>
          <Link className="text-link" to="/matches">
            查看所有比赛 →
          </Link>
        </div>
        <div className="steps">
          <article>
            <span>01</span>
            <h3>承诺 Commit</h3>
            <p>浏览器生成随机 salt，把比分编码为哈希后写入区块。</p>
          </article>
          <article>
            <span>02</span>
            <h3>赛果 Result</h3>
            <p>获授权的预言机在开赛后提交不可修改的最终比分。</p>
          </article>
          <article>
            <span>03</span>
            <h3>公开 Reveal</h3>
            <p>原比分与 salt 重现哈希，合约立即验证并自动计分。</p>
          </article>
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
            <strong>只有哈希，没有答案。</strong>
            <p>别人能看到你在截止前留下了证据，却无法从交易里还原比分。</p>
            <code>keccak256(abi.encode(...))</code>
          </div>
        </div>
      </section>
    </>
  );
}
