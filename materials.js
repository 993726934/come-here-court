import {INCIDENTS,ROUTES} from './story.js';
const row=(a,b)=>`<div class="doc-row"><strong>${a}</strong><span>${b}</span></div>`;
const doc=(title,body)=>`<div class="document"><div class="stamp">虚构教学材料 · 非真实法律文书</div><h3>${title}</h3>${body}</div>`;
export const TITLES={chat:'项目群聊天记录',indictment:'起诉书副本',rights:'诉讼权利',rules:'法庭规则',issues:'三个待查明的问题',video:'现场影像与时间线',injury:'伤情鉴定意见',witness:'证人证言',aftermath:'到案与事后材料',record:'庭审笔录',judgment:'判决书与权利'};
export function material(key,state){const main=state.route==='main',def=state.route==='defense';
switch(key){
case'chat':{
 const messages=[
   ['17:12','周启明','谁改了最后一版文件？'],
   ['17:13','林予安','我只改了展示页面，原文件还在。'],
   ['17:14','周启明','出了问题就装没看见，你一直都是这样。'],
   ['17:16','林予安','备份都在。下课以后，我们当面核对。']
 ];
 return `<section class="chat-phone" aria-label="项目群消息节选">
  <div class="chat-status"><span>17:16</span><span aria-hidden="true">▮▮▮ ▰</span></div>
  <div class="chat-header"><strong>项目组</strong><span>群聊</span></div>
  <ol class="chat-thread">${messages.map(([time,name,message],index)=>`
   <li class="chat-entry ${name==='林予安'?'chat-mine':''}" style="--chat-delay:${index*95}ms">
    <time>${time}</time>
    <div class="chat-message"><span class="chat-avatar" aria-hidden="true">${name[0]}</span>
     <div><span class="chat-name">${name}</span><p>${message}</p></div>
    </div>
   </li>`).join('')}</ol>
  <div class="chat-footer">虚构群聊 · 消息节选</div>
 </section>`;
}
case'indictment':return `<div class="filing">
 <button class="filing-envelope" type="button"><span>明川区人民法院</span><strong>诉讼文书</strong><span>取出起诉书副本 ↗</span></button>
 <div class="filing-stack" hidden>
  <article class="filing-page" data-page="1">
   <small>虚构教学副本</small><header>明川区人民检察院</header><h3>起 诉 书</h3>
   <p>被告人林予安，20岁，在校大学生。</p>
   <p>本案由公安机关侦查终结，以林予安涉嫌故意伤害罪移送本院审查起诉。</p>
   <p>本院指控：${main?'双方被劝开后，林予安追上周启明，击打其面部，造成轻伤二级损害后果。':'林予安在与周启明发生冲突时实施击打，造成轻伤二级损害后果。'}</p>
   <small>第 1 页 / 共 2 页</small>
  </article>
  <article class="filing-page" data-page="2" hidden>
   <small>虚构教学副本</small><h3>起诉书（续）</h3>
   <p>公诉机关提交的材料包括监控录像、证人证言和伤情鉴定意见等，具体内容以庭上出示的材料为准。</p>
   <p>本院认为，应当以故意伤害罪追究林予安的刑事责任，依法提起公诉，请依法审判。</p>
   <p>此致<br>明川区人民法院</p>
   <small>第 2 页 / 共 2 页</small>
  </article>
  <nav class="filing-controls" aria-label="文书翻页"><button type="button" data-target="1" disabled>上一页</button><button type="button" data-target="2">下一页</button></nav>
  <p class="caption">这份文书记录公诉机关的指控。案件事实有待法院审理。本案在开庭至少十日前送达副本，开庭传票另行依法送达。</p>
 </div>
</div>`;
case'rights':return '<p>你可以委托辩护人、依法申请回避、对证据发表意见、提出有关申请、进行辩护及最后陈述，并依法行使上诉等权利。</p>'+row('申请回避','需说明具体法定事由。了解权利或提出申请，不产生“法官好感度”变化。')+row('提出异议','说明针对哪项事实、证据或程序，有什么具体理由。')+row('证据申请','可依法申请新的证人、调取证据、重新鉴定等，由法庭依法审查。')+row('最后陈述','不会按道歉措辞评分；提出可能影响裁判的新事实、新证据时须依法核实。');
case'rules':return '<p>请服从法庭指挥，按规定发言。旁听人员不得随意发言、鼓掌、喧哗；未经允许不得录音、录像。</p><p>证人按安排等候、出庭，不在作证前旁听本案审理。玩家可以通过角色提出意见，不能直接操纵证人陈述。</p><p class="caption">本作对白为教学节选，实际庭审依适用程序与法庭安排进行。</p>';
case'issues':return row('行为经过','现场影像、双方陈述、证人证言：谁做了什么，危险是否仍在持续？')+row('损伤与因果','病历、鉴定意见、现场经过：伤情如何，与被指控行为有什么联系？')+row('法律评价','结合全案判断是否成立犯罪；构成犯罪时再依法评价量刑情节。')+'<p class="record">事实由案件版本确定。点击选项只影响你如何查看、表达和提出请求。</p>';
case'video':return `<div class="exhibit-monitor">
 <div class="exhibit-monitor-label"><b>教学重建</b><span id="video-time"></span></div>
 <canvas id="reconstruction" width="960" height="540" aria-label="教学楼外三维现场回放"></canvas>
 <p class="exhibit-missing" id="reconstruction-unavailable" hidden>三维回放不可用。下方仍可查看时间线。</p>
 </div>
 <div class="play-controls"><button id="video-play">播放</button><button id="video-restart">从头播放</button><input id="video-slider" aria-label="影像时间线" type="range" min="0" max="4" step="0.01" value="0"></div>
 <p class="record" id="video-caption"></p>
 <p class="caption">画面为虚构案件的教学重建。庭上另行核对影像来源、提取情况和证明范围。</p>`;
case'injury':return `<div class="filing">
 <button class="filing-envelope" type="button"><span>法医临床鉴定</span><strong>伤情鉴定意见书</strong><span>打开文书 ↗</span></button>
 <div class="filing-stack" hidden>
  <article class="filing-page appraisal-page" data-page="1">
   <small>虚构教学样本 · 教学编号 F-02</small>
   <header>明川市法医临床鉴定中心（虚构）</header><h3>司法鉴定意见书</h3>
   <h4>一、基本情况</h4>
   <p>委托单位：明川区公安机关。被鉴定人：周启明。委托事项：评定本次面部损伤程度。</p>
   <h4>二、检案摘要与送检材料</h4>
   <p>据送检材料记载，被鉴定人在校园冲突后因面部不适就诊。送检材料包括急诊病历、面部 CT 影像及报告、法医临床检查记录。</p>
   <h4>三、检验过程</h4>
   <p>核对送检资料，查阅急诊病历并复核面部 CT。影像显示左侧眶下壁骨折；检查记录记载左眶周肿胀。</p>
   <small>第 1 页 / 共 2 页</small>
  </article>
  <article class="filing-page appraisal-page" data-page="2" hidden>
   <small>虚构教学样本 · 教学编号 F-02</small>
   <h4>四、分析说明</h4>
   <p>影像所见为左侧眶下壁骨折，符合《人体损伤程度鉴定标准》第 5.2.4 f 项所列眶壁骨折情形。</p>
   <h4>五、鉴定意见</h4>
   <p><strong>周启明本次损伤程度评定为轻伤二级。</strong></p>
   <p class="appraisal-end">鉴定机构：明川市法医临床鉴定中心（虚构）<br>鉴定人签名及机构盖章栏：教学样本省略</p>
   <small>第 2 页 / 共 2 页</small>
  </article>
  <nav class="filing-controls" aria-label="文书翻页"><button type="button" data-target="1" disabled>上一页</button><button type="button" data-target="2">下一页</button></nav>
  <p class="caption">鉴定意见回答损伤程度。致伤过程和行为性质由法庭结合全案判断。</p>
 </div>
 </div>`;
case'witness':return doc('陈哲 · 出庭证言节选',row('身份关系','林予安室友，参与劝架。')+row('直接看到',main?'周启明先推打；双方分开后，林予安从旁边追上击打。':def?'周启明仍在追打，林予安后退反击，随后停手。':'双方有身体接触，但关键动作被遮挡，无法确认全部过程。')+row('没有听清','不能听清双方每一句话。')+row('核实重点','观察位置、视线、亲历范围及与其他证据的印证情况。'));
case'aftermath':return doc('到案与事后材料',row('报警记录','林予安报警并留在现场等待，说明自己了解的经过。')+row('主线评价',main?'经核实符合自首条件，依法评价。并非仅拨打电话就当然成立。':'到案情况不能代替对犯罪事实的证明。')+row('赔偿与意见',main?'双方自愿达成民事赔偿协议并履行；周启明书面请求从轻处理，法庭核实自愿性。':'本版本未预设认罪、赔偿和谅解，民事争议不在本篇作出结论。'));
case'judgment':return doc('刑事判决书 · 教学节选',row('案件版本',ROUTES[state.route])+row('审理认定',main?'侵害已结束后追上击打，致轻伤。被害人先行推打的过错也予以确认。':def?'反击为制止正在进行的不法侵害，未超过必要限度。':'关键过程证据存在缺失与冲突，其他证据不能弥补，不能排除合理怀疑。')+row('裁判主文',main?'林予安犯故意伤害罪，判处有期徒刑八个月，缓刑一年。':def?'林予安无罪。行为属于正当防卫。':'林予安无罪。证据不足、指控的犯罪不能成立。')+row('裁判理由',main?'综合行为、后果及自首、被害人过错、赔偿、被害人意见，并依法评价缓刑条件。':def?'结合当时处境、持续侵害与停止时机，依法认定防卫。':'定罪需达到法定证明标准；不能由被告人承担证明自己无罪的责任。')+row('上诉权利','不服一审判决，上诉期限十日，从接到判决书的第二日起计算。可通过原审法院或直接向上一级法院提出。'))+'<p class="record">'+(main?'八个月、缓刑一年仅为本案虚构教学裁判设定，不是同类案件统一结果。缓刑是有罪判决，生效后依法接受社区矫正。':'无罪理由须分别理解，不能将正当防卫与证据不足混写为同一个事实结论。')+'</p>';
default:return '';
}}
export function videoFacts(route){return route==='main'?INCIDENTS:route==='defense'?[INCIDENTS[0],INCIDENTS[1],['18:42:25','陈哲劝阻，对方绕过继续追打。'],['18:42:34','林予安后退，抬手反击制止侵害。'],['18:42:39','危险解除，林予安立即停手。']]:[INCIDENTS[0],INCIDENTS[1],['18:42:25','关键时段影像开始缺失。'],['18:42:34','关键动作无法从影像确认。'],['18:42:39','后段可见周启明倒地，但不能据此补齐缺失过程。']];}
export const LEGAL='<p>本作根据已讨论的虚构剧本制作。适用中国大陆刑事诉讼场景，采用一审普通程序。人物、机构名称和文书均为虚构教学设定。</p><p><a href="https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/bgt/art/2025/art_48b3b0c3f954448e996602a71fc6f878.html" target="_blank" rel="noopener">《中华人民共和国刑事诉讼法》</a>：第12、55、187、190—200、202、207、227、230条等，分别涉及定罪原则、证据标准、庭前准备、庭审、宣判、笔录与上诉。</p><p><a href="https://fgk.chinatax.gov.cn/zcfgk/c100009/c5212248/content.html" target="_blank" rel="noopener">《中华人民共和国刑法》</a>：第20、67、72、73、76、234条等，涉及防卫、自首、缓刑与故意伤害。</p><p><a href="https://www.court.gov.cn/zixun/xiangqing/251801.html" target="_blank" rel="noopener">两高一部正当防卫指导意见</a>：结合行为人当时处境审查，不以谁先动手、伤情大小或固定秒数单独决定。</p><p>程序文字为教学节选，核对基于本次对话所查官方文本。正式面向学生开放前应结合适用规范，由法律实务人员审阅。没有自动开除学籍、就业一律受限或家属连带受罚的预设。</p><p>本站仅在本机保存进度、选项与设置，不采集真实姓名、学号或证件。签写笔迹只留在当前页面，不上传。平台访问与登录日志由平台处理。配音为本机普通话语音引擎合成，非真人表演。</p>';
