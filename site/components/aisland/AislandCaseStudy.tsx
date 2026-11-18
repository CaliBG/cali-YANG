"use client";

import { useLanguage } from "@/lib/language";
import IslandScene, { media, website } from "./IslandScene";
import c from "../vanod/vanod.module.css";
import s from "./case-study.module.css";

const copy = {
  zh: {
    headline: "看一眼任务，接着读下去。",
    introduction: "AISLAND 是一个停在屏幕顶部的 Agent 工作台。在原来的窗口里，你就能知道哪个会话需要回应，也能给支持续发的会话安排下一步。",
    visit: "访问 AISLAND 官网",
    facts: [["年份", "2026"], ["设计范围", "产品 · 交互 · 视觉 · 开发"], ["桌面", "macOS · Windows"], ["移动端", "iOS · Android"]],
    pain: "用户痛点",
    painTitle: "任务已经完成，注意力还得绕一圈。",
    painBody: "读到文章中段，桌面弹出一条完成通知。下一步只需告诉 Agent「把修改后的段落列出来」。可要发出这句话，得先离开文章，找回正确的应用，再从几个相似的对话里认出刚才那一个。指令发出后，还得重新找到读到的句子。",
    painDetail: "同时开着几个 Agent 时，应用图标只能告诉你软件在运行。真正影响下一步的，是哪条会话完成了、它最后说了什么，以及它是否等你确认。",
    discovery: "发现过程",
    discoveryTitle: "把一次续发从头走到尾。",
    discoveryIntro: "原型的目标很具体：文章保持打开，从岛上给刚结束的会话补一句话。试用反馈把问题定位到了三个环节。",
    findings: [
      ["辨认会话", "列表里接连出现相同的 Codex 图标和名字，很难对应到熟悉的对话。我把同一 Agent 的会话归到一个图标下，分支优先显示用户取的名字和最近回复。"],
      ["开始输入", "「已结束」旁的气泡可以展开，点击后却一度无法打字。我把验收做到光标这一层：点进气泡，从键盘输入，再移开鼠标检查草稿。"],
      ["确认送达", "试用时确认了文字已经填进 WorkBuddy 的正确输入框。任务有没有真正开始，则需要单独核对。这个差别促使我把排队、发送失败、接收结果待确认分别显示。"],
    ],
    solution: "设计解法",
    solutionTitle: "把下一步放在会话旁边。",
    solutionBody: "鼠标移到屏幕顶部，岛从 MacBook 刘海两侧展开；Windows 使用屏幕上缘中央。先看 Agent 的分支，读到最后一条回复，再悬停右端的状态块，就能在原地输入。读完或发出指令后，移开鼠标即可回到文章。",
    solutionNote: "很久不用的分支可以单独从岛上隐藏。即使全部隐藏，也能从「恢复会话」按 Agent 把指定对话找回来。历史记录仍在原会话里。",
    art: "美术与动效",
    artTitle: "让流动的位置说明谁在工作。",
    artBody: "黑色面板和物理刘海连成一块。蓝色光带只沿运行中的分支向右移动，结束的分支回到静止灰色。扫一眼先看运动，再读标题、状态和回复；相同的信息也能从状态文字读到。",
    markTitle: "一刀切出的字标",
    markBody: "让 A 的左斜边与 I 的右边平行，并让右边的延长线落到 A 的右下角。空间充足时显示完整字标，收起时只留下前两笔的组合。",
    glassTitle: "把光留在文字后面",
    glassBody: "桌面主页使用黑底与磨砂模块。右上角的灰白光束随指针轻微转动，正文保持实色，审批弹窗使用更厚的底色。开启「减少动态效果」后，光束静止。",
    screenAlt: "AISLAND 桌面偏好设置实机界面：灰白光束从右上角穿过深色面板",
    tech: "技术实现",
    techTitle: "一条任务怎样找到原会话？",
    techBody: "桌面应用把接收事件、呈现状态和送出指令分开处理。一次后续任务经过以下三步，每一步都保留会话身份。",
    steps: [
      ["接收真实事件", "Agent 的接入程序通过本机 HTTP 接口上报开始、工具调用、结束或请求确认等事件。接口监听 127.0.0.1，使用本机令牌校验请求。"],
      ["按会话计算布局", "会话 ID 关联事件与历史记录，Agent 身份决定它属于哪组。最近活动的任务分支高 88 像素，工作中但 5 分钟没有更新时缩到 60，结束后为 52。SVG 曲线按各行高度接回图标。"],
      ["串行送出下一条", "Codex、Claude Code 和 WorkBuddy 有各自的续发路径。会话正忙时先保留一条后续任务；发送前写入本地记录。接收状态不确定时提示核对原对话，避免一次点击产生两条指令。"],
    ],
    syncTitle: "离开电脑以后",
    sync: "用户单独启用手机同步并完成配对后，桌面端用配对密钥和 AES-GCM 加密状态，再交给中继转发。手机端在自己的界面里显示同一台电脑上各 Agent 的工作进度。",
    mobileAlt: "AISLAND 移动端中的已完成任务和进行中任务",
  },
  en: {
    headline: "Check the task. Keep your place.",
    introduction: "AISLAND is an agent workspace at the top of the screen. From the window you’re already using, see which conversation needs a reply and send a follow-up to a supported agent.",
    visit: "Visit the AISLAND website",
    facts: [["Year", "2026"], ["Scope", "Product · Interaction · Visual design · Development"], ["Desktop", "macOS · Windows"], ["Mobile", "iOS · Android"]],
    pain: "The problem",
    painTitle: "The task is finished. You still have to find your way back.",
    painBody: "Halfway through an article, a notification says an agent has finished. All you want to say is “List the paragraphs you changed.” To send that sentence, you leave the article, find the app and pick the right conversation from several that look alike. Then you have to find the sentence you were reading.",
    painDetail: "With several agents open, an app icon tells you little about your next move. You need the conversation title, its last reply and whether it needs your approval.",
    discovery: "Discovery",
    discoveryTitle: "I followed a second instruction all the way to its destination.",
    discoveryIntro: "The prototype had one concrete goal: send another instruction to a finished conversation while keeping an article open. Feedback on successive builds pinpointed three parts of that interaction.",
    findings: [
      ["Recognizing the thread", "Several rows shared the Codex name and icon. I grouped conversations under one agent and gave each branch its own title, using the user’s name for the conversation wherever available, alongside the latest reply."],
      ["Getting a cursor", "The bubble next to a finished task opened, yet initially it could not accept typing. I began checking the full interaction: click into the field, type, then move the pointer away and check the draft."],
      ["Checking delivery", "A test confirmed the text reached the correct WorkBuddy input field. Whether the agent actually started the task was a separate question. The interface now distinguishes a queued task, a failed send and a delivery that still needs confirmation."],
    ],
    solution: "Interaction design",
    solutionTitle: "Give each conversation its own next move.",
    solutionBody: "Move the pointer to the top of the screen. On a MacBook the island opens around the notch; on Windows it opens at the top center. Follow an agent’s branch, read its last reply and hover over the status at the right to enter a follow-up. Move away to return to the article.",
    solutionNote: "Old branches can be hidden individually. Even with an empty island, Restore conversation lets you bring back a particular thread by agent. Its history stays with the original conversation.",
    art: "Visual design & motion",
    artTitle: "Movement tells you where the work is.",
    artBody: "The black panel meets the physical notch. A blue band travels along a running branch. Finished branches settle into gray. Motion catches the eye first, followed by title, status and reply. A written status also identifies every state.",
    markTitle: "A cut through the wordmark",
    markBody: "The left edge of A runs parallel to the right edge of I. Extend that line and it meets the bottom-right corner of A. The full name fits the expanded header; the first two forms carry the identity at its smallest size.",
    glassTitle: "Light behind the type",
    glassBody: "The desktop workspace layers frosted panels over black. Gray and white rays respond gently to the pointer from the top right. Text stays solid and approval dialogs have a denser backing. Reduce Motion holds the rays still.",
    screenAlt: "AISLAND desktop preferences with neutral rays running behind the dark panels",
    tech: "Implementation",
    techTitle: "How does an instruction reach its original conversation?",
    techBody: "The desktop app handles incoming events, layout and outgoing instructions separately. The conversation’s identity connects them throughout.",
    steps: [
      ["Receive the event", "An adapter reports task starts, tool calls, completions and approval requests to a local HTTP endpoint. It listens on 127.0.0.1 and authenticates requests with a local token."],
      ["Lay out the conversation", "A session ID joins events to history; the agent identity chooses the group. A recently active task gets an 88-pixel branch. After five quiet minutes it narrows to 60 pixels, and a finished task gets 52. SVG curves connect those rows back to the icon."],
      ["Deliver the follow-up", "Codex, Claude Code and WorkBuddy have distinct continuation paths. A busy conversation can hold one queued follow-up. An outgoing attempt is written to disk before dispatch. When receipt is uncertain, the app asks the user to check the conversation before sending again."],
    ],
    syncTitle: "Away from the desk",
    sync: "After the user enables mobile sync and pairs a phone, the desktop encrypts the status with the pairing key and AES-GCM before relaying it. The phone displays progress from the agents on the paired computer.",
    mobileAlt: "Completed and running tasks in the AISLAND mobile companion",
  },
};

export default function AislandCaseStudy() {
  const text = copy[useLanguage().lang === "zh" ? "zh" : "en"];
  const chapters = [
    ["problem", text.pain], ["discovery", text.discovery], ["interaction", text.solution],
    ["visuals", text.art], ["implementation", text.tech],
  ];
  return <div className={c.caseStudy}>
    <header>
      <h1 className={s.wordmark}><img src={media("wordmark.svg")} width="470" height="98" alt="AISLAND"/></h1>
      <div className={c.heroIntroduction}>
        <p className={c.lede}>{text.headline}</p>
        <div className={c.heroDescription}><p>{text.introduction}</p>
          <div className={c.links}><a href={website} target="_blank" rel="noopener noreferrer">{text.visit} <span aria-hidden="true">↗</span></a></div>
        </div>
      </div>
    </header>
    <dl className={c.facts}>{text.facts.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
    <nav className={c.chapterNav} aria-label={text.headline}>{chapters.map(([id, label]) => <a key={id} href={"#"+id}>{label}</a>)}</nav>

    <section className={s.split} id="problem">
      <div className={s.heading}><p>{text.pain}</p><h2>{text.painTitle}</h2></div>
      <div className={s.prose}><p>{text.painBody}</p><p>{text.painDetail}</p></div>
    </section>

    <section className={s.section} id="discovery">
      <div className={s.heading}><p>{text.discovery}</p><h2>{text.discoveryTitle}</h2></div>
      <p className={s.intro}>{text.discoveryIntro}</p>
      <dl className={s.observations}>{text.findings.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </section>

    <section className={s.section} id="interaction">
      <div className={s.heading}><p>{text.solution}</p><h2>{text.solutionTitle}</h2></div>
      <p className={s.intro}>{text.solutionBody}</p><IslandScene/>
      <p className={s.caption}>{text.solutionNote}</p>
    </section>

    <section className={s.section} id="visuals">
      <div className={s.heading}><p>{text.art}</p><h2>{text.artTitle}</h2></div>
      <div className={s.artGrid}>
        <div className={s.artCopy}><p>{text.artBody}</p><h3>{text.markTitle}</h3><p>{text.markBody}</p></div>
        <figure className={s.markStudy}><img src={media("wordmark.svg")} width="1200" height="250" alt="AISLAND"/><img src={media("island-collapsed.png")} width="492" height="66" loading="lazy" alt={text.solution}/></figure>
      </div>
      <div className={s.glass}><img src={media("desktop-appearance.webp")} width="1320" height="936" loading="lazy" alt={text.screenAlt}/>
        <div><h3>{text.glassTitle}</h3><p>{text.glassBody}</p></div>
      </div>
    </section>

    <section className={s.section} id="implementation">
      <div className={s.heading}><p>{text.tech}</p><h2>{text.techTitle}</h2></div>
      <p className={s.intro}>{text.techBody}</p>
      <ol className={s.pipeline}>{text.steps.map(([title, body]) => <li key={title}><h3>{title}</h3><p>{body}</p></li>)}</ol>
      <div className={s.sync}><img src={media("mobile-companion-small.png")} width="402" height="874" loading="lazy" alt={text.mobileAlt}/>
        <div><h3>{text.syncTitle}</h3><p>{text.sync}</p><div className={c.links}><a href={website} target="_blank" rel="noopener noreferrer">{text.visit} <span aria-hidden="true">↗</span></a></div></div>
      </div>
    </section>
  </div>;
}
