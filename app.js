import {renderProjectChat} from './project-chat.js?v=1.8';
import {VERSION,ROUTES,LIFE,LIFE_SENDERS,LIFE_MESSAGES,buildStory} from './story.js?v=1.8';
import {TITLES,material,videoFacts,LEGAL} from './materials.js?v=1.8';
import {unlock,configureAudio,speak,stopVoice,preload,effect,suspend} from './audio.js?v=1.8';
const $=s=>document.querySelector(s),QA=location.hostname==='127.0.0.1'&&new URLSearchParams(location.search).has('qa'),KEY='come-here-court-v1'+(QA?'-qa':''),PREF='come-here-court-prefs'+(QA?'-qa':'');
let state=fresh(),prefs={voice:true,effects:true,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches},story,active=false,token=0,toastTimer,videoFrame,returnFocus;
function fresh(route='main'){return {schema:8,route,life:'project',chapter:0,line:0,docs:[],log:[],corrected:false,recordConfirmed:false,appeal:false,completed:false,titleShown:false};}
try{const p=JSON.parse(localStorage.getItem(PREF));if(p&&typeof p==='object')for(const k of['voice','effects','reduced'])if(typeof p[k]==='boolean')prefs[k]=p[k];}catch{}
let saved;try{const s=JSON.parse(localStorage.getItem(KEY));if(s?.schema===2&&s.chapter===0&&s.line>0)s.line+=2;if(s?.schema===2)s.schema=3;if(s?.schema===3&&s.chapter===1&&s.line>=6)s.line++;if(s?.schema===3)s.schema=4;if(s?.schema===4&&s.chapter===1)s.line+=3;if(s?.schema===4)s.schema=5;if(s?.schema===5){if(s.chapter===1&&s.line>=3)s.line+=2;if(s.chapter===7||s.chapter===8)s.line++;s.schema=6;}if(s?.schema===6){if(s.route==='main'&&s.chapter<=1)s.line=0;s.schema=7;}if(s?.schema===7){if(s.chapter===4&&s.line>=1)s.line++;s.schema=8;}if(s?.schema===8&&Object.hasOwn(ROUTES,s.route)&&Object.hasOwn(LIFE,s.life)&&Number.isInteger(s.chapter)&&Number.isInteger(s.line)&&Array.isArray(s.docs)&&Array.isArray(s.log)){const a=buildStory(s.route,s.life,s.appeal);if(a[s.chapter]?.lines[s.line])saved={...fresh(),...s,docs:s.docs.filter(x=>Object.hasOwn(TITLES,x))};}}catch{}
$('#resume').hidden=!saved;
function applyPrefs(){configureAudio(prefs.voice,prefs.effects);document.body.classList.toggle('reduced',prefs.reduced);dispatchEvent(new CustomEvent('court-reduced',{detail:prefs.reduced}));try{localStorage.setItem(PREF,JSON.stringify(prefs));}catch{}}
applyPrefs();addEventListener('court-world-ready',()=>{applyPrefs();if(active)view();});
function save(){
 const status=$('#save-state');
 try{
  localStorage.setItem(KEY,JSON.stringify(state));
  saved=structuredClone(state);
  $('#resume').hidden=false;
  status.hidden=true;
  status.textContent='';
 }catch{
  status.hidden=false;
  status.textContent='存储不可用 · 请导出记录';
 }
}
function toast(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3600);}
function rebuild(){story=buildStory(state.route,state.life,state.appeal);}
const CALLS={
 ambulance:{number:'120',recipient:'医疗急救',receiver:'急诊 · 120 急救调度席',label:'拨打 120',prompt:'你拿出手机，准备向急救中心说明位置和伤情。'},
 police:{number:'110',recipient:'报警服务台',receiver:'公安 · 110 接警席',label:'拨打 110',prompt:'你切到拨号界面，准备向接警员说明刚才发生的事。'}
};
let callStartedAt=0;
function updateCallClock(){
 if(!callStartedAt)return;
 const seconds=Math.floor((Date.now()-callStartedAt)/1000);
 const format=n=>String(n).padStart(2,'0');
 $('.call-clock').textContent=format(Math.floor(seconds/60))+':'+format(seconds%60);
}
setInterval(updateCallClock,1000);
function dial(call){
 unlock();
 remember('call',call);
 state.connectedCall=call;
 callStartedAt=Date.now();
 render();
}
function view(){const c=story[state.chapter],l=c.lines[state.line];document.body.classList.toggle('conflict-scene',c.id==='conflict');dispatchEvent(new CustomEvent('court-scene',{detail:{world:c.world,who:l.who,place:c.place,text:l.text,chapter:c.id,route:state.route,gavel:l.gavel,argument:l.argument,combat:l.combat,pointing:l.pointing,reaction:l.chat==='周启明',exhibitReady:c.id==='video'&&state.line>=1,call:l.call,callConnected:!!l.call&&state.connectedCall===l.call}}));}
function start(route='main',resume=false){closeSheet();autoPaused=false;unlock();state=resume&&saved?structuredClone(saved):fresh(route);rebuild();active=true;$('#home').hidden=true;$('#game').hidden=false;document.body.classList.add('playing');render();}
function actionButton(label,fn,primary=false){const b=document.createElement('button');b.textContent=label;if(primary)b.className='primary';b.onclick=fn;return b;}
const HEARING_PHASES={
 opening:['宣布开庭','核对身份、告知权利'],
 charge:['法庭调查','宣读起诉书、被告人陈述'],
 video:['法庭调查','出示监控录像、质证'],
 injury:['法庭调查','伤情鉴定、质证'],
 witness:['法庭调查','证人作证'],
 mitigation:['法庭调查','到案经过与其他材料'],
 debate:['法庭辩论','控辩双方发表意见'],
 statement:['最后陈述','被告人作最后陈述'],
 record:['庭审笔录','当日核对'],
 verdict:['公开宣判','宣布裁判结果']
};
const SEAT_ROLES={'沈审判长':'审判长','赵检察官':'公诉人','许律师':'辩护人'};
function renderHearing(chapter,line){
 const badge=$('#hearing-phase');
 const phase=HEARING_PHASES[chapter.id];
 badge.hidden=!phase;
 if(phase&&badge.dataset.chapter!==chapter.id){
  const title=document.createElement('strong'),detail=document.createElement('small');
  title.textContent=phase[0];detail.textContent=phase[1];
  badge.replaceChildren(title,detail);
  badge.classList.remove('phase-change');
  void badge.offsetWidth;
  badge.classList.add('phase-change');
 }
 badge.dataset.chapter=chapter.id;
 const role=chapter.world==='court'&&SEAT_ROLES[line.who];
 if(role&&line.who==='沈审判长')return;
 if(role){
  const label=document.createElement('span');
  label.id='speaker-role';label.textContent=role;$('#speaker').append(label);
 }
}
let sceneTimer;
let entryPending=false;
let autoPaused=false;
const plotTerms=/(明早九点|明天就是比赛答辩日|今晚要合稿|答辩文稿|18:35|20:30|21:00|21:05|轻伤二级|有期徒刑八个月|缓刑一年|林予安无罪|上诉期限为十日)/g;
function showPlotText(node,text){
 node.replaceChildren(...text.split(plotTerms).map((part,i)=>{
  if(i%2===0)return document.createTextNode(part);
  const mark=document.createElement('mark');
  mark.textContent=part;
  return mark;
 }));
}
function render(){entryPending=false;clearTimeout(sceneTimer);stopVoice();const generation=++token;rebuild();const c=story[state.chapter],l=c.lines[state.line];for(const d of c.docs)if(!state.docs.includes(d))state.docs.push(d);if(c.id==='finish'){state.completed=true;try{localStorage.setItem('court-unlocked','yes')}catch{}}save();$('#chapter').textContent=c.title;$('#location').textContent=c.place;$('#moment').textContent=state.route==='main'&&l.unread?'案发当天 21:05 · 救护车离开后，留在现场等候处理':c.time;$('#speaker').textContent=l.who;
 if(c.world==='court'){
  const role={陈哲:'证人',周启明:'被害人',书记员:'书记员','你 · 林予安':'被告人'}[l.who];
  if(role&&role!==l.who){
   const badge=document.createElement('small');
   badge.className='speaker-role';
   badge.textContent=role;
   $('#speaker').append(badge);
  }
 }
 renderHearing(c,l);$('#line-count').textContent=`${String(state.line+1).padStart(2,'0')} / ${String(c.lines.length).padStart(2,'0')}`;$('#line').textContent='';$('#line-note').hidden=true;$('#actions').replaceChildren();$('#back').disabled=state.chapter===0&&state.line===0;$('#note-count').textContent=state.docs.length;$('#dialogue').scrollTop=0;
 const all=story.reduce((n,c)=>n+c.lines.length,0),done=story.slice(0,state.chapter).reduce((n,c)=>n+c.lines.length,0)+state.line+1;$('#progress-fill').style.width=done/all*100+'%';
 const call=CALLS[l.call];
 const connected=!!call&&state.connectedCall===l.call;
 const phone=$('#call-screen');
 phone.hidden=!call;
 document.body.classList.toggle('call-connected',connected);
 $('#replay').disabled=!!call&&!connected;
 if(!connected)callStartedAt=0;
 if(call){
  phone.dataset.call=l.call;
  phone.querySelector('.call-number').textContent=call.number;
  phone.querySelector('.call-recipient').textContent=call.recipient;
  phone.querySelector('.call-status').textContent=connected?'通话中':'准备拨号';
  phone.querySelector('.call-keypad').hidden=connected;
  phone.querySelector('.call-receiver').hidden=!connected;
  phone.querySelector('.call-receiver-caption').textContent=call.receiver+' · 接听端';
  phone.querySelector('.call-clock').hidden=!connected;
  if(connected){
   callStartedAt ||= Date.now();
   updateCallClock();
   $('#speaker').textContent=l.who+' · 电话中';
  }
 }
 const chatBeat=!!l.chat;
 if(l.voiceMessage)effect('message');
 document.body.classList.toggle('chat-beat',chatBeat);
 $('#chat-controls').hidden=!chatBeat;$('#chat-next').textContent=l.leaving?'带电脑下楼 →':'继续 →';
 const auto=c.id==='conflict'&&!l.call&&!l.unread;
 if(!auto)autoPaused=false;
 document.body.classList.toggle('auto-beat',auto);
 $('#hotspots').replaceChildren(...c.docs.slice(0,3).map(d=>{
  if(d!=='chat')return actionButton('＋ '+TITLES[d],()=>openMaterial(d));
  const button=actionButton('查看项目组群聊',()=>openMaterial(d));
  button.className='chat-preview';button.setAttribute('aria-label','查看项目组群聊');
  button.innerHTML='<span class="chat-preview-icon" aria-hidden="true">•••</span><span><strong>项目组</strong><small>群聊消息</small></span>';
  return button;
 }));
 const message=$('#scene-message');
 message.replaceChildren(document.createElement('div'),document.createElement('p'));
 const notification=l.unread;
 message.hidden=!chatBeat&&!notification;
 message.classList.toggle('unread',!!notification);
 if(chatBeat||notification){
  const sender=LIFE_SENDERS[state.life];
  message.querySelector('div').textContent=notification?sender+' · 新消息':'微信 · 项目组 · '+l.chat;
  message.classList.toggle('tense',l.chat==='周启明');
  showPlotText(message.querySelector('p'),notification?(state.readLastMessage?LIFE_MESSAGES[state.life]:'1 条未读消息'):l.text);
 }
 if(notification||chatBeat)$('#replay').disabled=true;
 if(chatBeat&&state.route==='main'){message.innerHTML=renderProjectChat(c.lines.slice(0,state.line+1).filter(x=>x.chat).length);const thread=message.querySelector('.project-thread');thread.scrollTop=thread.scrollHeight;}
 view();preload([...c.lines.slice(state.line,state.line+4),...(story[state.chapter+1]?.lines||[]).slice(0,2)]);
 if(notification&&!state.readLastMessage){
  $('#line').textContent='通话结束。手机屏幕又亮了一下。';
  $('#line').classList.add('narrator');
  $('#actions').append(actionButton('查看未读消息',()=>{state.readLastMessage=true;render();},true));
  return;
 }
 if(call&&!connected){
  $('#speaker').textContent='你 · 林予安';
  $('#line').textContent=call.prompt;
  $('#line').classList.add('narrator');
  $('#actions').append(actionButton(call.label,()=>dial(l.call),true));
  return;
 }
 if(l.gavel){effect('gavel');dispatchEvent(new CustomEvent('court-scene',{detail:{world:'court',who:'沈审判长',chapter:'opening',gavel:true,route:state.route}}));}
 speak(l,duration=>{
  if(generation!==token||!active)return;
  if(chatBeat)return;
  showPlotText($('#line'),notification?'屏幕上的消息停在那里。':l.text);
  if(l.gavel){sceneTimer=setTimeout(()=>{if(generation===token)next();},1100);return;}
  if(auto){
   const control=actionButton(autoPaused?'继续播放':'暂停连播',()=>{autoPaused=!autoPaused;render();},true);
   $('#actions').append(control);
   control.classList.add('auto-control');
   if(!autoPaused&&!document.hidden&&!$('#sheet').open){
    const reading=Math.max(2000,l.text.length*185);
    const motion=l.combat==='laptop'?4300:/周启明推了|甩开|后退中反击|混乱中/.test(l.text)?3900:0;
    sceneTimer=setTimeout(()=>{if(generation===token&&!document.hidden&&!$('#sheet').open)next();},Math.max(motion,duration?duration+220:reading));
   }
   return;
  }$('#line').classList.toggle('narrator',/旁白|内心/.test(l.who));const note=$('#line-note');note.hidden=!l.readingExcerpt;note.textContent=l.readingExcerpt?'教学节选 · 为控制体验时长，此处仅播放起诉书的指控摘要。可在案卷查阅教学副本。':'';const a=$('#actions');if(l.doc)a.append(actionButton('查看'+TITLES[l.doc],()=>openMaterial(l.doc)));if(l.choices){for(const [label,kind,value] of l.choices)a.append(actionButton(label,()=>choose(kind,value),l.choices.length===1));}else{const b=actionButton(connected?'结束通话 →':l.title?'那一次失控之后 →':l.leaving?'下楼核对文件 →':l.leavingOffice?'结束会谈，继续 →':'继续 →',next,true);b.classList.add('next');if(c.id==='conflict'&&/周启明推了|甩开|后退中反击/.test(l.text)){b.disabled=true;b.textContent='场景演绎中…';setTimeout(()=>{if(generation===token){b.disabled=false;b.textContent='继续 →';}},3600);}a.append(b);}}, {silent:l.gavel||(chatBeat&&!l.voiceMessage)||notification||(auto&&autoPaused)});
}
function next(){if(entryPending)return;unlock();const c=story[state.chapter],l=c.lines[state.line];if(l.unread&&!state.readLastMessage)return;if(l.title&&!state.titleShown){stopVoice();state.titleShown=true;save();$('#chapter-card').hidden=false;effect('title');$('#close-title').focus();return;}if(l.call&&state.connectedCall!==l.call)return;delete state.connectedCall;if(c.id==='lawyer'&&state.line===c.lines.length-1){entryPending=true;stopVoice();effect('door');dispatchEvent(new CustomEvent('court-scene',{detail:{world:'corridor',doorOpening:true,route:state.route}}));$('#actions').replaceChildren();$('#line').textContent='审判庭的门打开了。';sceneTimer=setTimeout(()=>{entryPending=false;state.chapter++;state.line=0;render();},1900);return;}if(state.line<c.lines.length-1)state.line++;else if(state.chapter<story.length-1){state.chapter++;state.line=0;}render();}
function remember(kind,value){state.log.push({chapter:story[state.chapter].id,kind,value});if(state.log.length>150)state.log.shift();}
function choose(kind,value){unlock();remember(kind,value);if(kind==='life'){state.life=value;toast('今晚的约定：'+LIFE[value]);next();}else if(kind==='info'){if(value==='recusal')openSheet('了解回避','<p>有关人员与案件存在法定利害关系等情形，可能影响公正处理时，可以依法提出申请并说明具体理由。</p><p>本案没有预设法定回避事由。了解权利不影响裁判。</p>',[{label:'已了解，本案不申请回避',fn:()=>{closeSheet();next();}}]);else openSheet('重新鉴定申请','<p>需要说明针对鉴定的具体问题和理由，由法庭依法审查。本案未设可推翻鉴定的技术瑕疵，不能只因为不满意结论就自动获得重新鉴定。</p>',[{label:'了解后继续',fn:()=>{closeSheet();next();}}]);}else if(kind==='recusal'||kind==='injury'){next();}else if(kind==='evidence'){state.evidenceOpinion=value;if(value==='replay')openMaterial('video',()=>next());else{toast(value==='scope'?'已记录：请求审查影像的证明范围。':'已记录：对可见画面无异议，仍综合全案审查。');next();}}else if(kind==='witness'){openSheet(value==='position'?'陈哲的观察位置':'法庭提示',value==='position'?'<p>陈哲：“我站在双方之间偏东侧。能直接看到的，我已经说明；听不清、被遮挡的部分，我不能确定。”</p>':'<p>审判长：“请围绕案件事实发问。”</p><p>陈哲：“我们是室友，但我只能如实说明看到的事。”</p>',[{label:'回到庭审',fn:()=>{closeSheet();next();}}]);}else if(kind==='statement'){toast('你的陈述重点已记录。裁判不会按措辞评分。');next();}else if(kind==='record'){openRecord(true);}else if(kind==='ending'){state.appeal=value==='appeal';next();}else if(kind==='finish'){if(value==='review')review();if(value==='routes')routeMenu();if(value==='download')download();}save();}
function openSheet(title,html,buttons=[]){clearTimeout(sceneTimer);if(document.body.classList.contains('auto-beat'))autoPaused=true;stopReplay();stopVoice();returnFocus=document.activeElement;$('#sheet-title').textContent=title;$('#sheet-body').innerHTML=html;for(const b of buttons)$('#sheet-body').append(actionButton(b.label,b.fn,b.primary));if(!$('#sheet').open)$('#sheet').showModal();$('#sheet').scrollTop=0;}
function stopReplay(){cancelAnimationFrame(videoFrame);dispatchEvent(new CustomEvent('court-replay',{detail:null}));dispatchEvent(new CustomEvent('court-paper',{detail:null}));}
function closeSheet(){stopReplay();videoFrame=undefined;if($('#sheet').open)$('#sheet').close();returnFocus?.focus?.();if(active&&(!$('#line').textContent||document.body.classList.contains('auto-beat')||entryPending))render();}
function openMaterial(key,after){effect('paper');if(!state.docs.includes(key)&&active){state.docs.push(key);save();$('#note-count').textContent=state.docs.length;}if(key==='record'){openRecord(active&&story[state.chapter].id==='record'&&state.line===1);return;}openSheet(TITLES[key],material(key,state),after?[{label:'意见已记录，继续庭审',fn:()=>{closeSheet();after();},primary:true}]:[]);if(key==='video')setupVideo();if(key==='indictment'||key==='injury')setupFiling();}
function setupFiling(){
 const envelope=$('.filing-envelope'), stack=$('.filing-stack');
 const controls=[...stack.querySelectorAll('[data-target]')];
 function showPage(page){
  for(const sheet of stack.querySelectorAll('[data-page]'))sheet.hidden=sheet.dataset.page!==page;
  for(const button of controls)button.disabled=button.dataset.target===page;
  const current=stack.querySelector('[data-page="'+page+'"]');
  current.tabIndex=-1;
  current.focus();
  if(active&&story[state.chapter].world==='court'){
   const title=current.querySelector('h3')?.textContent||$('#sheet-title').textContent;
   const paragraphs=[...current.querySelectorAll('p')].map(p=>p.textContent);
   dispatchEvent(new CustomEvent('court-paper',{detail:{title,page,paragraphs,notice:'虚构教学文书'}}));
  }
 }
 envelope.onclick=()=>{effect('paper');envelope.hidden=true;stack.hidden=false;showPage('1');};
 for(const button of controls)button.onclick=()=>{effect('paper');showPage(button.dataset.target);};
}
function setupVideo(){
 let progress=0,playing=false,previous=performance.now();
 const facts=videoFacts(state.route),canvas=$('#reconstruction'),slider=$('#video-slider');
 const play=$('#video-play');
 function draw(){
  const index=Math.min(4,Math.floor(progress+.001));
  $('#video-time').textContent=facts[index][0];
  $('#video-caption').textContent=facts[index][1];
  slider.value=progress;
  const available=!!window.courtWorldReady;
  canvas.hidden=!available;
  $('#reconstruction-unavailable').hidden=available;
  if(available)dispatchEvent(new CustomEvent('court-replay',{detail:{progress,route:state.route,canvas}}));
 }
 function sync(now){
  if(!$('#sheet').open||!canvas.isConnected)return;
  if(playing&&!document.hidden){
   progress=Math.min(4,progress+Math.min(now-previous,90)/3000);
   draw();
   if(progress>=4){playing=false;play.textContent='重播';}
  }
  previous=now;
  videoFrame=requestAnimationFrame(sync);
 }
 play.onclick=()=>{if(progress>=4)progress=0;playing=!playing;play.textContent=playing?'暂停':'播放';draw();};
 $('#video-restart').onclick=()=>{progress=0;playing=true;play.textContent='暂停';draw();};
 slider.oninput=()=>{progress=Number(slider.value);playing=false;play.textContent='播放';draw();};
 draw();videoFrame=requestAnimationFrame(sync);
}
function openRecord(advance){
 const hearing=(id,index)=>story.find(c=>c.id===id).lines[index].text;
 const specific=state.evidenceOpinion==='confirm'
  ?'被告人对本次展示的可见影像无异议。该意见仅针对本组影像。'
  :'被告人请求结合完整经过及影像能证明的范围审查该组证据。';
 const pages=[
  ['开庭与法庭调查',`<p>地点：明川区人民法院刑事审判庭<br>审判长：沈审判长　记录：书记员<br>公诉人：赵检察官　辩护人：许律师<br>被告人：林予安　被害人：周启明</p>
   <p><strong>开庭</strong>　宣布开庭和出庭人员，告知诉讼权利，询问回避申请。</p>
   <p><strong>公诉人</strong>　${hearing('charge',1)}</p><p><strong>被告人</strong>　${hearing('charge',3)}</p>
   <p><strong>出示现场影像</strong>　${hearing('video',2)}</p><p class="record ${state.corrected?'correct':''}" data-record-text></p>`],
  ['伤情鉴定与证人证言',`<p><strong>公诉人</strong>　${hearing('injury',1)}</p>
   <p><strong>审判长</strong>　通知陈哲到庭，核实身份及与当事人的关系，告知作证义务。</p>
   <p><strong>公诉人</strong>　${hearing('witness',1)}</p><p><strong>证人陈哲</strong>　${hearing('witness',2)}</p>
   <p><strong>被害人周启明</strong>　${hearing('mitigation',2)}</p>`],
  ['法庭辩论、最后陈述与休庭',`<p><strong>公诉人</strong>　${hearing('debate',1)}</p><p><strong>辩护人</strong>　${hearing('debate',2)}</p>
   <p><strong>被告人最后陈述</strong>　${hearing('statement',2)}</p>
   <p><strong>审判长</strong>　${hearing('statement',3)}</p>
   <p class="paper-signoff">制作：书记员　审阅：审判长<br>当事人核对签名：见下方签写区</p>`]
 ];
 const readOnly=!advance&&state.recordConfirmed;
 openSheet('庭审笔录',`<p class="caption">虚构教学样本 · ${readOnly?'案卷回看':'逐页核对后进入签写页'}</p>
  <article class="court-paper"><div class="paper-heading">明川区人民法院<h3>庭审笔录</h3><div>（教学案）明刑初字第02号</div></div><section id="record-page"></section></article>
  <div class="record-paging"><button id="record-prev">上一页</button><span id="record-page-count" role="status"></span><button id="record-next">确认本页，继续</button></div>
  <section id="record-signing" hidden><p>三页核对完毕。确认记录无误后，请在下方签名。仍有遗漏或差错，可以返回相关页面请求补正。</p>
  <canvas id="signature" aria-label="教学签写区域"></canvas>
  <div><button id="clear-signature">清空笔迹</button><button id="keyboard-sign">键盘签写</button></div>
  <div id="typed-signature" hidden><label for="signature-name">输入角色姓名（林予安）</label> <input id="signature-name" autocomplete="off" maxlength="3"></div>
  <p class="caption">仅供教学签写，笔迹只保留在当前页面。</p><div id="record-buttons"></div></section>`);
 let page=0;
 let signed=false;
 const sign=actionButton('提交签名',()=>{
  if(!signed&&$('#signature-name').value.trim()!=='林予安')return;
  state.recordConfirmed=true;
  remember('record',state.corrected?'corrected':'uncorrected');
  save();closeSheet();
  if(advance)next();
 },true);
 sign.disabled=true;
 $('#record-buttons').append(sign,actionButton('仍有疑问，暂不签名',()=>{
  state.recordConfirmed=true;
  remember('record','unsigned');
  save();closeSheet();
  if(advance)next();
 }));
 function drawPage(){
  const signing=page===pages.length;
  const target=$('#record-page');
  target.parentElement.hidden=signing;
  $('#record-signing').hidden=!signing;
  $('#record-page-count').textContent=signing?'签写页':`第 ${page+1} 页 / 共 ${pages.length} 页`;
  $('#record-prev').disabled=page===0;
  $('#record-next').hidden=signing||(readOnly&&page===pages.length-1);
  $('#record-next').textContent=readOnly?'下一页':page===pages.length-1?'核对完毕，进入签写':'确认本页，继续';
  if(!signing){
   target.innerHTML=`<h4>${pages[page][0]}</h4>${pages[page][1]}`;
   const summary=target.querySelector('[data-record-text]');
   if(summary){
    summary.textContent=state.corrected?'经核对补正：'+specific:'被告人表示：对全部证据均无异议。';
    summary.classList.toggle('correct',state.corrected);
    if(!state.corrected&&!readOnly)target.append(actionButton('请求核对并补正这项记录',()=>{
     state.corrected=true;save();effect('paper');drawPage();
    }));
   }
  }
  $('#sheet').scrollTop=0;
 }
 $('#record-prev').onclick=()=>{page--;drawPage();};
 $('#record-next').onclick=()=>{page++;drawPage();};
 const canvas=$('#signature'),ctx=canvas.getContext('2d');
 canvas.width=900;canvas.height=220;
 ctx.strokeStyle='#42372e';ctx.lineWidth=3;ctx.lineCap='round';
 let pointer=null;
 function point(e){const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height];}
 function updateSign(){sign.disabled=!signed&&$('#signature-name').value.trim()!=='林予安';}
 canvas.onpointerdown=e=>{if(pointer!==null||e.button!==0)return;pointer=e.pointerId;canvas.setPointerCapture(pointer);ctx.beginPath();ctx.moveTo(...point(e));};
 canvas.onpointermove=e=>{if(e.pointerId!==pointer)return;ctx.lineTo(...point(e));ctx.stroke();signed=true;updateSign();};
 canvas.onlostpointercapture=()=>{pointer=null;};
 $('#clear-signature').onclick=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);$('#signature-name').value='';signed=false;updateSign();};
 $('#keyboard-sign').onclick=()=>{$('#typed-signature').hidden=false;$('#signature-name').focus();};
 $('#signature-name').oninput=updateSign;
 drawPage();
}
function notebook(){openSheet('我的案卷',`<p class="caption">${active?ROUTES[state.route]:'故事尚未开始'} · 随剧情归入案卷</p><div id="doc-list"></div>`);const list=$('#doc-list');if(!state.docs.length)list.innerHTML='<p>走进故事后，聊天记录、起诉书、证据与判决会依次出现。</p>';for(const key of state.docs)list.append(actionButton(TITLES[key],()=>openMaterial(key)));}
function settings(){openSheet('体验设置',`<p class="caption">版本 ${VERSION} · 自动保存在本机</p>${[['voice','普通话对白配音'],['effects','翻页与转场音效'],['reduced','减少镜头动效']].map(([k,v])=>`<div class="settings-row"><label for="pref-${k}">${v}</label><input type="checkbox" id="pref-${k}" ${prefs[k]?'checked':''}></div>`).join('')}<p class="caption">旁白使用本机合成并按场景调整语速和语气。切到后台时暂停当前声音。</p><div id="menu-actions"></div>`);for(const k of['voice','effects','reduced'])$('#pref-'+k).onchange=e=>{prefs[k]=e.target.checked;unlock();applyPrefs();};const a=$('#menu-actions');a.append(actionButton('程序依据与创作说明',()=>openSheet('程序依据与创作说明',LEGAL)),actionButton('暂停，返回封面',pause),actionButton('导出本机记录',download),actionButton('重新开始 / 平行版本',routeMenu),actionButton('清除本机体验数据',clearMenu));}
function pause(){clearTimeout(sceneTimer);autoPaused=false;stopVoice();token++;active=false;closeSheet();$('#game').hidden=true;$('#home').hidden=false;document.body.classList.remove('playing','dialogue-hidden');dispatchEvent(new CustomEvent('court-scene',{detail:{world:'court',home:true}}));}
function routeMenu(){let unlocked=state.completed;try{unlocked||=localStorage.getItem('court-unlocked')==='yes';}catch{}openSheet('选择案件事实版本','<p>重玩会替换本机当前进度，可先导出记录。各版本有不同事实、证据和裁判理由，表达选项不会改写历史。</p><div id="routes"></div>');for(const [key,name]of Object.entries(ROUTES)){const b=actionButton((key==='main'?'主线 · ':'平行事实 · ')+name,()=>start(key));b.disabled=key!=='main'&&!unlocked;$('#routes').append(b);}if(!unlocked)$('#routes').insertAdjacentHTML('beforeend','<p class="caption">完成主线后解锁两条平行事实版本。</p>');}
function clearMenu(){openSheet('清除本机数据','<p>清除本作进度、设置与平行版本解锁记录。不会清除公安机关篇的数据。</p>',[{label:'确认清除',fn:()=>{for(const k of[KEY,PREF,'court-unlocked'])try{localStorage.removeItem(k)}catch{}state=fresh();saved=null;prefs={voice:true,effects:true,reduced:false};applyPrefs();pause();$('#resume').hidden=true;toast('本机体验数据已清除。');}},{label:'保留数据',fn:closeSheet}]);}
function review(){openSheet('本案复盘',`<p class="tag">${ROUTES[state.route]}</p>${material('judgment',state)}<div class="doc-row"><strong>校园约定</strong><span>${LIFE[state.life]}</span></div><div class="doc-row"><strong>笔录核对</strong><span>${state.corrected?'发现遗漏，提出更正。':'尚未补充遗漏；可回看笔录核对的重要性。'}</span></div><div class="doc-row"><strong>程序状态</strong><span>${state.appeal?'依法上诉，等待二审，未预设一审判决生效。':'本结尾设定无上诉、抗诉，一审判决依法生效。'}</span></div><p>没有好感度或胜负分数。核心证据始终进入庭审，合理行使权利不会直接加重刑罚。</p>`,[{label:'体验平行事实版本',fn:routeMenu},{label:'导出体验记录',fn:download}]);}
function download(){const data={game:'过来一下·法庭篇',version:VERSION,exportedAt:new Date().toISOString(),note:'虚构教学体验记录，非法律文书，不含笔迹。',...state};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='法庭篇-体验记录.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('体验记录已导出。');}
$('#start').onclick=()=>saved?routeMenu():start();$('#resume').onclick=()=>start(saved?.route,true);$('#menu').onclick=settings;$('#notebook').onclick=notebook;$('#home-law').onclick=()=>openSheet('程序依据',LEGAL);$('#close-sheet').onclick=closeSheet;$('#sheet').addEventListener('close',stopReplay);$('#sheet').addEventListener('cancel',stopReplay);$('#reset-view').onclick=()=>dispatchEvent(new Event('court-reset'));$('#hide-dialogue').onclick=()=>{document.body.classList.toggle('dialogue-hidden');$('#hide-dialogue').textContent=document.body.classList.contains('dialogue-hidden')?'展开对白':'收起对白';};$('#replay').onclick=()=>{unlock();if(active){const line=story[state.chapter].lines[state.line];if(!line.unread&&!line.chat&&(!line.call||state.connectedCall===line.call))speak(line,()=>{});}};$('#chat-next').onclick=next;$('#restart').onclick=routeMenu;$('#chat-back').onclick=$('#back').onclick=()=>{delete state.connectedCall;if(state.line>0)state.line--;else if(state.chapter>0){state.chapter--;state.line=story[state.chapter].lines.length-1;}render();};$('#close-title').onclick=()=>{$('#chapter-card').hidden=true;next();};document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(sceneTimer);token++;suspend();}else if(active&&!$('#sheet').open&&$('#chapter-card').hidden){render();}});
document.addEventListener('keydown',e=>{if(e.code==='Space'&&active&&!$('#sheet').open&&$('#chapter-card').hidden&&e.target===document.body){const l=story[state.chapter].lines[state.line];if(!l.choices&&!document.body.classList.contains('auto-beat')&&!$('#actions .next')?.disabled){e.preventDefault();next();}}});
