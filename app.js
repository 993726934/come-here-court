import {VERSION,ROUTES,LIFE,LIFE_SENDERS,LIFE_MESSAGES,buildStory} from './story.js?v=1.5';
import {TITLES,material,videoFacts,LEGAL} from './materials.js?v=1.5';
import {unlock,configureAudio,speak,stopVoice,preload,effect,suspend} from './audio.js?v=1.5';
const $=s=>document.querySelector(s),QA=location.hostname==='127.0.0.1'&&new URLSearchParams(location.search).has('qa'),KEY='come-here-court-v1'+(QA?'-qa':''),PREF='come-here-court-prefs'+(QA?'-qa':'');
let state=fresh(),prefs={voice:true,effects:true,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches},story,active=false,token=0,toastTimer,videoFrame,returnFocus;
function fresh(route='main'){return {schema:5,route,life:'project',chapter:0,line:0,docs:[],log:[],corrected:false,recordConfirmed:false,appeal:false,completed:false,titleShown:false};}
try{const p=JSON.parse(localStorage.getItem(PREF));if(p&&typeof p==='object')for(const k of['voice','effects','reduced'])if(typeof p[k]==='boolean')prefs[k]=p[k];}catch{}
let saved;try{const s=JSON.parse(localStorage.getItem(KEY));if(s?.schema===2&&s.chapter===0&&s.line>0)s.line+=2;if(s?.schema===2)s.schema=3;if(s?.schema===3&&s.chapter===1&&s.line>=6)s.line++;if(s?.schema===3)s.schema=4;if(s?.schema===4&&s.chapter===1)s.line+=3;if(s?.schema===4)s.schema=5;if(s?.schema===5&&Object.hasOwn(ROUTES,s.route)&&Object.hasOwn(LIFE,s.life)&&Number.isInteger(s.chapter)&&Number.isInteger(s.line)&&Array.isArray(s.docs)&&Array.isArray(s.log)){const a=buildStory(s.route,s.life,s.appeal);if(a[s.chapter]?.lines[s.line])saved={...fresh(),...s,docs:s.docs.filter(x=>Object.hasOwn(TITLES,x))};}}catch{}
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
function view(){const c=story[state.chapter],l=c.lines[state.line];document.body.classList.toggle('conflict-scene',c.id==='conflict');dispatchEvent(new CustomEvent('court-scene',{detail:{world:c.world,who:l.who,place:c.place,text:l.text,chapter:c.id,route:state.route,argument:l.argument,exhibitReady:c.id==='video'&&state.line>=1,call:l.call,callConnected:!!l.call&&state.connectedCall===l.call}}));}
function start(route='main',resume=false){closeSheet();unlock();state=resume&&saved?structuredClone(saved):fresh(route);rebuild();active=true;$('#home').hidden=true;$('#game').hidden=false;document.body.classList.add('playing');render();}
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
 record:['庭后核对','查看庭审笔录'],
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
function render(){stopVoice();const generation=++token;rebuild();const c=story[state.chapter],l=c.lines[state.line];for(const d of c.docs)if(!state.docs.includes(d))state.docs.push(d);if(c.id==='finish'){state.completed=true;try{localStorage.setItem('court-unlocked','yes')}catch{}}save();$('#chapter').textContent=c.title;$('#location').textContent=c.place;$('#moment').textContent=c.time;$('#speaker').textContent=l.who;renderHearing(c,l);$('#line-count').textContent=`${String(state.line+1).padStart(2,'0')} / ${String(c.lines.length).padStart(2,'0')}`;$('#line').textContent='';$('#line-note').hidden=true;$('#actions').replaceChildren();$('#back').disabled=state.chapter===0&&state.line===0;$('#note-count').textContent=state.docs.length;$('#dialogue').scrollTop=0;
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
 document.body.classList.toggle('chat-beat',chatBeat);
 $('#hotspots').replaceChildren(...c.docs.slice(0,3).map(d=>{
  if(d!=='chat')return actionButton('＋ '+TITLES[d],()=>openMaterial(d));
  const button=actionButton('查看项目组群聊',()=>openMaterial(d));
  button.className='chat-preview';button.setAttribute('aria-label','查看项目组群聊');
  button.innerHTML='<span class="chat-preview-icon" aria-hidden="true">•••</span><span><strong>项目组</strong><small>群聊消息</small></span>';
  return button;
 }));
 const message=$('#scene-message');
 const notification=l.unread;
 message.hidden=!chatBeat&&!notification;
 message.classList.toggle('unread',!!notification);
 if(chatBeat||notification){
  const sender=LIFE_SENDERS[state.life];
  message.querySelector('div').textContent=notification?sender+' · 新消息':'项目组 · '+l.chat;
  message.querySelector('p').textContent=notification?(state.readLastMessage?LIFE_MESSAGES[state.life]:'1 条未读消息'):l.text;
 }
 if(notification||chatBeat)$('#replay').disabled=true;
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
 speak(l,()=>{if(generation!==token||!active)return;$('#line').textContent=notification?'屏幕上的消息停在那里。':l.text;$('#line').classList.toggle('narrator',/旁白|内心/.test(l.who));const note=$('#line-note');note.hidden=!l.readingExcerpt;note.textContent=l.readingExcerpt?'教学节选 · 为控制体验时长，此处仅播放起诉书的指控摘要。可在案卷查阅教学副本。':'';const a=$('#actions');if(l.doc)a.append(actionButton('查看'+TITLES[l.doc],()=>openMaterial(l.doc)));if(l.choices){for(const [label,kind,value] of l.choices)a.append(actionButton(label,()=>choose(kind,value),l.choices.length===1));}else{const b=actionButton(connected?'结束通话 →':l.title?'那一拳之后 →':l.leaving?'下楼核对文件 →':l.leavingOffice?'结束会谈，继续 →':'继续 →',next,true);b.classList.add('next');if(c.id==='conflict'&&/周启明推了|甩开|后退中反击/.test(l.text)){b.disabled=true;b.textContent='场景演绎中…';setTimeout(()=>{if(generation===token){b.disabled=false;b.textContent='继续 →';}},3600);}a.append(b);}}, {silent:chatBeat||notification});
}
function next(){unlock();const c=story[state.chapter],l=c.lines[state.line];if(l.unread&&!state.readLastMessage)return;if(l.title&&!state.titleShown){stopVoice();state.titleShown=true;save();$('#chapter-card').hidden=false;effect('title');$('#close-title').focus();return;}if(l.call&&state.connectedCall!==l.call)return;delete state.connectedCall;if(state.line<c.lines.length-1)state.line++;else if(state.chapter<story.length-1){state.chapter++;state.line=0;}render();}
function remember(kind,value){state.log.push({chapter:story[state.chapter].id,kind,value});if(state.log.length>150)state.log.shift();}
function choose(kind,value){unlock();remember(kind,value);if(kind==='life'){state.life=value;toast('今晚的约定：'+LIFE[value]);next();}else if(kind==='info'){if(value==='recusal')openSheet('了解回避','<p>有关人员与案件存在法定利害关系等情形，可能影响公正处理时，可以依法提出申请并说明具体理由。</p><p>本案没有预设法定回避事由。了解权利不影响裁判。</p>',[{label:'已了解，本案不申请回避',fn:()=>{closeSheet();next();}}]);else openSheet('重新鉴定申请','<p>需要说明针对鉴定的具体问题和理由，由法庭依法审查。本案未设可推翻鉴定的技术瑕疵，不能只因为不满意结论就自动获得重新鉴定。</p>',[{label:'了解后继续',fn:()=>{closeSheet();next();}}]);}else if(kind==='recusal'||kind==='injury'){next();}else if(kind==='evidence'){state.evidenceOpinion=value;if(value==='replay')openMaterial('video',()=>next());else{toast(value==='scope'?'已记录：请求审查影像的证明范围。':'已记录：对可见画面无异议，仍综合全案审查。');next();}}else if(kind==='witness'){openSheet(value==='position'?'陈哲的观察位置':'法庭提示',value==='position'?'<p>陈哲：“我站在双方之间偏东侧。能直接看到的，我已经说明；听不清、被遮挡的部分，我不能确定。”</p>':'<p>审判长：“请围绕案件事实发问。”</p><p>陈哲：“我们是室友，但我只能如实说明看到的事。”</p>',[{label:'回到庭审',fn:()=>{closeSheet();next();}}]);}else if(kind==='statement'){toast('你的陈述重点已记录。裁判不会按措辞评分。');next();}else if(kind==='record'){openRecord(true);}else if(kind==='ending'){state.appeal=value==='appeal';next();}else if(kind==='finish'){if(value==='review')review();if(value==='routes')routeMenu();if(value==='download')download();}save();}
function openSheet(title,html,buttons=[]){stopReplay();stopVoice();returnFocus=document.activeElement;$('#sheet-title').textContent=title;$('#sheet-body').innerHTML=html;for(const b of buttons)$('#sheet-body').append(actionButton(b.label,b.fn,b.primary));if(!$('#sheet').open)$('#sheet').showModal();}
function stopReplay(){cancelAnimationFrame(videoFrame);dispatchEvent(new CustomEvent('court-replay',{detail:null}));dispatchEvent(new CustomEvent('court-paper',{detail:null}));}
function closeSheet(){stopReplay();videoFrame=undefined;if($('#sheet').open)$('#sheet').close();returnFocus?.focus?.();if(active&&!$('#line').textContent)render();}
function openMaterial(key,after){effect('paper');if(!state.docs.includes(key)&&active){state.docs.push(key);save();$('#note-count').textContent=state.docs.length;}if(key==='record'){openRecord(false);return;}openSheet(TITLES[key],material(key,state),after?[{label:'意见已记录，继续庭审',fn:()=>{closeSheet();after();},primary:true}]:[]);if(key==='video')setupVideo();if(key==='indictment'||key==='injury')setupFiling();}
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
function openRecord(advance){const specific=state.evidenceOpinion==='confirm'?'被告人对本次展示的可见影像画面无异议，其他证据的意见按各组分别记录。':'被告人的具体意见，以及请求结合完整经过、证明范围与全案证据审查的意见。';openSheet('请核对庭审笔录',`<p class="caption">教学节选 · 核对与刚才实际发言是否一致</p><div class="record ${state.corrected?'correct':''}" id="record-text">${state.corrected?specific:'被告人表示：对全部证据均无异议。'}</div><p>请把“全部证据”与各组证据中的具体发言逐项比较，避免把局部意见概括为全部。发现遗漏可以请求核对、更正。</p><button id="correct-record">请求核对并补充遗漏</button><p>确认前请再次阅读。可以在下面签写，也可以说明暂不签名的理由。</p><canvas id="signature" aria-label="教学签写区域"></canvas><button id="clear-signature">清空笔迹</button><p class="caption">笔迹仅存在当前页面，不上传、不存档，不构成真实签名。</p><div id="record-buttons"></div>`);
 $('#correct-record').onclick=()=>{state.corrected=true;save();$('#record-text').textContent='经核对补充：'+specific;$('#record-text').classList.add('correct');toast('已核对相应记录并补充遗漏。');effect('paper');};
 const canvas=$('#signature'),ctx=canvas.getContext('2d');canvas.width=900;canvas.height=220;ctx.strokeStyle='#42372e';ctx.lineWidth=3;ctx.lineCap='round';let drawing=false;function point(e){const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)/r.width*canvas.width,(e.clientY-r.top)/r.height*canvas.height];}canvas.onpointerdown=e=>{drawing=true;canvas.setPointerCapture(e.pointerId);ctx.beginPath();ctx.moveTo(...point(e));};canvas.onpointermove=e=>{if(drawing){ctx.lineTo(...point(e));ctx.stroke();}};canvas.onpointerup=()=>drawing=false;canvas.onpointercancel=()=>drawing=false;$('#clear-signature').onclick=()=>ctx.clearRect(0,0,canvas.width,canvas.height);
 $('#record-buttons').append(actionButton('确认已阅读',()=>{state.recordConfirmed=true;remember('record',state.corrected?'corrected':'uncorrected');save();closeSheet();if(!state.corrected)toast('已记录确认。复盘会提醒再次核对遗漏；不影响预设裁判。');if(advance)next();},true),actionButton('暂不签名，说明记录仍有疑问',()=>{remember('record','unsigned');save();openSheet('暂不签名的说明','<p>已记录：对笔录是否完整仍有疑问，请求继续核实。暂不签名的情况及说明应依法记录。</p><p>该选择不自动改变案件裁判结果。</p>',[{label:'继续',fn:()=>{closeSheet();if(advance)next();}}]);}));}
function notebook(){openSheet('我的案卷',`<p class="caption">${active?ROUTES[state.route]:'故事尚未开始'} · 随剧情归入案卷</p><div id="doc-list"></div>`);const list=$('#doc-list');if(!state.docs.length)list.innerHTML='<p>走进故事后，聊天记录、起诉书、证据与判决会依次出现。</p>';for(const key of state.docs)list.append(actionButton(TITLES[key],()=>openMaterial(key)));}
function settings(){openSheet('体验设置',`<p class="caption">版本 ${VERSION} · 自动保存在本机</p>${[['voice','普通话对白配音'],['effects','翻页与转场音效'],['reduced','减少镜头动效']].map(([k,v])=>`<div class="settings-row"><label for="pref-${k}">${v}</label><input type="checkbox" id="pref-${k}" ${prefs[k]?'checked':''}></div>`).join('')}<p class="caption">旁白使用本机合成并按场景调整语速和语气。切到后台时暂停当前声音。</p><div id="menu-actions"></div>`);for(const k of['voice','effects','reduced'])$('#pref-'+k).onchange=e=>{prefs[k]=e.target.checked;unlock();applyPrefs();};const a=$('#menu-actions');a.append(actionButton('程序依据与创作说明',()=>openSheet('程序依据与创作说明',LEGAL)),actionButton('暂停，返回封面',pause),actionButton('导出本机记录',download),actionButton('重新开始 / 平行版本',routeMenu),actionButton('清除本机体验数据',clearMenu));}
function pause(){stopVoice();token++;active=false;closeSheet();$('#game').hidden=true;$('#home').hidden=false;document.body.classList.remove('playing','dialogue-hidden');dispatchEvent(new CustomEvent('court-scene',{detail:{world:'court',home:true}}));}
function routeMenu(){let unlocked=state.completed;try{unlocked||=localStorage.getItem('court-unlocked')==='yes';}catch{}openSheet('选择案件事实版本','<p>重玩会替换本机当前进度，可先导出记录。各版本有不同事实、证据和裁判理由，表达选项不会改写历史。</p><div id="routes"></div>');for(const [key,name]of Object.entries(ROUTES)){const b=actionButton((key==='main'?'主线 · ':'平行事实 · ')+name,()=>start(key));b.disabled=key!=='main'&&!unlocked;$('#routes').append(b);}if(!unlocked)$('#routes').insertAdjacentHTML('beforeend','<p class="caption">完成主线后解锁两条平行事实版本。</p>');}
function clearMenu(){openSheet('清除本机数据','<p>清除本作进度、设置与平行版本解锁记录。不会清除公安机关篇的数据。</p>',[{label:'确认清除',fn:()=>{for(const k of[KEY,PREF,'court-unlocked'])try{localStorage.removeItem(k)}catch{}state=fresh();saved=null;prefs={voice:true,effects:true,reduced:false};applyPrefs();pause();$('#resume').hidden=true;toast('本机体验数据已清除。');}},{label:'保留数据',fn:closeSheet}]);}
function review(){openSheet('本案复盘',`<p class="tag">${ROUTES[state.route]}</p>${material('judgment',state)}<div class="doc-row"><strong>校园约定</strong><span>${LIFE[state.life]}</span></div><div class="doc-row"><strong>笔录核对</strong><span>${state.corrected?'发现遗漏，提出更正。':'尚未补充遗漏；可回看笔录核对的重要性。'}</span></div><div class="doc-row"><strong>程序状态</strong><span>${state.appeal?'依法上诉，等待二审，未预设一审判决生效。':'本结尾设定无上诉、抗诉，一审判决依法生效。'}</span></div><p>没有好感度或胜负分数。核心证据始终进入庭审，合理行使权利不会直接加重刑罚。</p>`,[{label:'体验平行事实版本',fn:routeMenu},{label:'导出体验记录',fn:download}]);}
function download(){const data={game:'过来一下·法庭篇',version:VERSION,exportedAt:new Date().toISOString(),note:'虚构教学体验记录，非法律文书，不含笔迹。',...state};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='法庭篇-体验记录.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('体验记录已导出。');}
$('#start').onclick=()=>saved?routeMenu():start();$('#resume').onclick=()=>start(saved?.route,true);$('#menu').onclick=settings;$('#notebook').onclick=notebook;$('#home-law').onclick=()=>openSheet('程序依据与创作说明',LEGAL);$('#close-sheet').onclick=closeSheet;$('#sheet').addEventListener('close',stopReplay);$('#sheet').addEventListener('cancel',stopReplay);$('#reset-view').onclick=()=>dispatchEvent(new Event('court-reset'));$('#hide-dialogue').onclick=()=>{document.body.classList.toggle('dialogue-hidden');$('#hide-dialogue').textContent=document.body.classList.contains('dialogue-hidden')?'展开对白':'收起对白';};$('#replay').onclick=()=>{unlock();if(active){const line=story[state.chapter].lines[state.line];if(!line.unread&&!line.chat&&(!line.call||state.connectedCall===line.call))speak(line,()=>{});}};$('#back').onclick=()=>{delete state.connectedCall;if(state.line>0)state.line--;else if(state.chapter>0){state.chapter--;state.line=story[state.chapter].lines.length-1;}render();};$('#close-title').onclick=()=>{$('#chapter-card').hidden=true;next();};document.addEventListener('visibilitychange',()=>{if(document.hidden){token++;suspend();}else if(active&&!$('#sheet').open&&$('#chapter-card').hidden){render();}});
document.addEventListener('keydown',e=>{if(e.code==='Space'&&active&&!$('#sheet').open&&$('#chapter-card').hidden&&e.target===document.body){const l=story[state.chapter].lines[state.line];if(!l.choices&&!$('#actions .next')?.disabled){e.preventDefault();next();}}});
