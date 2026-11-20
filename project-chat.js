export const PROJECT_MESSAGES=[
 {name:'林予安',text:'@周启明，你人呢？？宿舍也找不到人，电话也不接，明天就比赛了，你这部分做的这么差，明天怎么办？？',time:'18:36'},
 {name:'周启明',text:'我跟女朋友在一起，晚点再说。你先合不就行了？',time:'18:37',voice:true},
 {name:'林予安',text:'你开什么玩笑？你那部分完全是错的，根本没有办法用。你抓紧来教学楼！！',time:'18:38'}
];
const history=[
 {name:'陈哲',text:'明早九点答辩，大家今晚把自己的部分再核一遍。',time:'17:50'},
 {name:'周启明',text:'我那部分已经传群文件了。',time:'17:52'},
 {name:'林予安',text:'收到，我来合稿，今晚八点半前发最终版。',time:'17:53'}
];
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function renderProjectChat(count=3){
 const messages=[...history,...PROJECT_MESSAGES.slice(0,count)];
 return `<section class="project-phone" aria-label="微信项目组群聊">
 <div class="project-status"><time>${messages.at(-1).time}</time><span>▮▮▮ ▰</span></div>
 <div class="project-header"><span>‹</span><strong>项目组（6）</strong><span>···</span></div>
 <ol class="project-thread">${messages.map(m=>`<li class="${m.name==='林予安'?'project-mine':''}"><time>${m.time}</time><div class="project-entry"><span class="project-avatar avatar-${m.name==='林予安'?'lin':m.name==='周启明'?'zhou':'chen'}" role="img" aria-label="${m.name}的头像"><i></i></span><div class="project-message"><span class="project-sender">${m.name}</span>${m.voice?'<div class="project-voice">◖ 语音消息 · 转文字</div>':''}<p>${escape(m.text)}</p></div></div></li>`).join('')}</ol>
 <div class="project-input" aria-hidden="true">◉ <span></span> ☺ ⊕</div></section>`;
}
