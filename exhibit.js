import * as T from './vendor/three.module.js';
import {updatePerformance} from './performance.js?v=1.6';

const EXHIBITS={
 charge:['公诉机关起诉书','教学节选 · 案件事实有待审理'],
 video:['现场影像','东教学楼门外 · 教学重建'],
 injury:['司法鉴定意见书','教学编号 F-02','送检材料｜急诊病历、面部 CT、法医检查记录','鉴定意见｜损伤程度为轻伤二级'],
 witness:['证人证言','陈哲｜现场目击证人','结合证人陈述与其他证据查证'],
 mitigation:['到案经过与相关材料','接报警和到案记录','赔偿履行情况与被害人意见（如有）']
};

function replayPose(progress,route){
 if(progress>=4)return {stage:'after',time:5,route};
 if(progress<.85)return {stage:'argument',time:0,route};
 if(progress<1.75)return {stage:'push',time:(progress-.85)/.9*3.2,route};
 if(progress<3)return {stage:'separate',time:(progress-1.75)/1.25*4,route};
 return {stage:'chase',time:(progress-3)*3.55,route};
}

export function createCourtExhibit(group,renderer,scene,outside,box){
 const surface=document.createElement('canvas');
 surface.width=960;surface.height=540;
 const pen=surface.getContext('2d');
 const texture=new T.CanvasTexture(surface);
 texture.colorSpace=T.SRGBColorSpace;
 const bezel=new T.MeshStandardMaterial({color:0x21282a,roughness:.75});
 box(group,5.45,3.65,-5.18,3.5,2.03,.11,bezel);
 const display=new T.Mesh(new T.PlaneGeometry(3.37,1.89),new T.MeshBasicMaterial({map:texture,toneMapped:false}));
 display.position.set(5.45,3.65,-5.116);
 group.add(display);
 const camera=new T.PerspectiveCamera(43,960/540,.1,46);
 camera.position.set(4.35,6.1,8.15);
 camera.lookAt(.69,.75,-1.02);
 let chapter='',route='',seconds=0,lastDraw=-1,manual=null,activated=false,currentPaper=false;
 function drawHeader(title,subtitle){
  pen.fillStyle='#142323';pen.fillRect(0,0,960,540);
  pen.fillStyle='#cbdbc9';pen.font='27px Microsoft YaHei';pen.fillText('明川区人民法院 · 庭内示证',48,69);
  pen.fillStyle='#6b837a';pen.fillRect(48,99,864,2);
  pen.fillStyle='#fff1cf';pen.font='bold 60px Microsoft YaHei';pen.fillText(title,48,205);
  pen.fillStyle='#e0e8df';pen.font='29px Microsoft YaHei';pen.fillText(subtitle,49,277,860);
 }
 function setScene(next){
  if(chapter!==next.chapter||route!==next.route){
   chapter=next.chapter;route=next.route;
   seconds=0;lastDraw=-1;manual=null;activated=false;
   showChapter();
  }
  if(chapter==='video'&&next.exhibitReady)activated=true;
 }
 function showChapter(){
  const rows=EXHIBITS[chapter]||['证据展示屏','等待出示材料'];
  drawHeader(rows[0],rows[1]);
  for(let i=2;i<rows.length;i++)pen.fillText(rows[i],49,350+(i-2)*51,860);
  currentPaper=false;
  texture.needsUpdate=true;
 }
 function selectReplay(input){
  if(input?.canvas!==manual?.canvas)lastDraw=-1;
  manual=input;
 }
 function showPaper(paper){
  if(!paper){
   if(currentPaper)showChapter();
   lastDraw=-1;
   return;
  }
  currentPaper=true;
  pen.fillStyle='#fff9e8';pen.fillRect(0,0,960,540);
  pen.fillStyle='#695f4b';pen.font='23px Microsoft YaHei';pen.fillText(paper.notice,48,58,860);
  pen.fillStyle='#26261e';pen.font='bold 47px Microsoft YaHei';pen.fillText(paper.title,48,133,864);
  pen.font='30px Microsoft YaHei';
  let y=209;
  for(const paragraph of paper.paragraphs){
   let line='';
   for(const char of paragraph){
    if(pen.measureText(line+char).width>862){pen.fillText(line,49,y);line=char;y+=45;}
    else line+=char;
    if(y>480)break;
   }
   if(y>480)break;
   if(line)pen.fillText(line,49,y);
   y+=59;
  }
  pen.fillStyle='#6c5b3c';pen.font='22px Microsoft YaHei';pen.fillText('第 '+paper.page+' 页 · 庭内展示',49,508);
  texture.needsUpdate=true;
 }
 function drawReplay(progress,version,now){
  const missing=version==='doubt'&&progress>=2&&progress<4;
  if(missing){
   drawHeader('关键时段影像缺失','教学重建保留缺口');
   return;
  }
  const wasCourt=group.visible,wasOutside=outside.visible;
  try {
   group.visible=false;outside.visible=true;
   updatePerformance(0,now,'outside',true,replayPose(progress,version));
   renderer.render(scene,camera);
   const source=renderer.domElement;
   const scale=Math.min(source.width/960,source.height/540);
   const w=960*scale,h=540*scale;
   pen.drawImage(source,(source.width-w)/2,(source.height-h)/2,w,h,0,0,960,540);
   pen.fillStyle='#142323dd';pen.fillRect(18,17,244,43);
   pen.fillStyle='#f3f4e3';pen.font='22px Microsoft YaHei';pen.fillText('东教学楼 · 教学重建',31,46);
  } finally {outside.visible=wasOutside;group.visible=wasCourt;}
 }
 function frame(delta,now){
  if(currentPaper||(!manual&&!(group.visible&&chapter==='video'&&activated)))return;
  if(!manual)seconds=Math.min(12,seconds+delta);
  const progress=manual?manual.progress:seconds/3;
  const step=Math.floor(progress*48);
  if(lastDraw===step)return;
  lastDraw=step;
  // A replay opened later from the case file can temporarily use a different visible room.
  const hidden=scene.children.filter(child=>child.isGroup&&child.visible&&child!==group&&child!==outside);
  for(const child of hidden)child.visible=false;
  try {drawReplay(progress,manual?.route??route,now);}
  finally {for(const child of hidden)child.visible=true;}
  texture.needsUpdate=true;
  const modal=manual?.canvas;
  if(modal?.isConnected)modal.getContext('2d').drawImage(surface,0,0);
 }
 setScene({chapter:'home'});
 return {setScene,selectReplay,showPaper,frame};
}
