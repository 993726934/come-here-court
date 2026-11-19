import * as THREE from 'three';
import {createCourtExhibit} from './exhibit.js';
let courtExhibit;
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
import {human,actors,selectPerformance,setSpeech,updatePerformance} from './performance.js?v=1.7';
import {createSurfaces,enrich,updateEnvironment} from './surfaces.js?v=1.7';
const canvas=document.querySelector('#scene');
const palettes={wood:0x704b36,dark:0x302925,cream:0xc4b69c,wall:0xa89980,red:0x633b32,metal:0x292b29};
let renderer,scene,camera,current='court',offset=0,pitch=0,reduced=false,last=0,anim=0;
const groups={},target=new THREE.Vector3(0,1.8,-3),pos=new THREE.Vector3(9,4.8,13),look=new THREE.Vector3();
const mats={};for(const [k,c]of Object.entries(palettes))mats[k]=new THREE.MeshStandardMaterial({color:c,roughness:.82});
const surfaces=createSurfaces();mats.wood=surfaces.wood;mats.wall=surfaces.wall;mats.red=surfaces.fabric;
const geometryCache=new Map();
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.8});
function box(g,x,y,z,w,h,d,m=mats.wood){const o=new THREE.Mesh((()=>{const k=[w,h,d].join(',');if(!geometryCache.has(k))geometryCache.set(k,Math.min(w,h,d)>.06?new RoundedBoxGeometry(w,h,d,2,Math.min(.014,w*.08,h*.08,d*.08)):new THREE.BoxGeometry(w,h,d));return geometryCache.get(k)})(),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
function cylinder(g,x,y,z,r,h,m){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),m);o.position.set(x,y,z);o.castShadow=true;g.add(o);return o;}
function text(g,t,x,y,z,w,h,bg='#e4d9c3',fg='#3b332b',font='54px Microsoft YaHei'){const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=font;ctx.fillText(t,512,128);const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx}));o.position.set(x,y,z);g.add(o);return o;}
function chair(g,x,z,rot=0){const c=new THREE.Group();c.position.set(x,0,z);c.rotation.y=rot;g.add(c);box(c,0,.49,0,.64,.1,.62);box(c,0,.94,-.27,.64,.85,.09);for(const dx of[-.25,.25])for(const dz of[-.23,.23])box(c,dx,.23,dz,.07,.46,.07);box(c,0,.56,0,.56,.05,.54,mats.red);return c;}
function person(g,x,z,options={}){return human(g,x,z,options);}
function nameplate(g,label,x,y,z,width=1.2){
 box(g,x,y,z-.03,width+.05,.27,.08,mats.wood);
 return text(g,label,x,y,z+.016,width,.24,'#26342f','#fff8e7','bold 176px Microsoft YaHei');
}
function desk(g,x,z,w=2){box(g,x,.8,z,w,.1,.85);box(g,x,.4,z-.15,w-.08,.8,.14);for(const dx of[-w/2+.08,w/2-.08])box(g,x+dx,.4,z,.1,.8,.75);}
function paper(g,x,z){box(g,x,.86,z,.32,.012,.42,mat(0xece3ce));for(let i=0;i<4;i++)box(g,x,.868,z-.1+i*.045,.22,.002,.004,mat(0x8a7c68));}
function mug(g,x,z){cylinder(g,x,.94,z,.055,.16,mat(0xd1c3ac));}
function laptop(g,x,z){box(g,x,.87,z,.4,.025,.29,mats.metal);const lid=box(g,x,1.02,z-.12,.4,.29,.025,mats.metal);lid.rotation.x=-.13;text(g,'案卷',x,1.02,z-.1,.34,.18,'#3c4c4b','#b9bca7');}
function base(id){const g=new THREE.Group();groups[id]=g;g.name=id;g.visible=false;scene.add(g);box(g,0,-.15,0,22,.3,25,mat(0x7d7465));return g;}
function windows(g){for(let z=-7;z<=5;z+=4){box(g,-7.9,3,z,.12,4,2.7,mat(0xd7cbb0));box(g,-7.7,3,z,.08,4,.06);box(g,-7.7,3,z,.08,.06,2.7);box(g,-7.7,1.1,z,.3,.1,3);}}
function room(g){box(g,0,3,-8,16,6,.3,mats.wall);box(g,-8,3,0,.3,6,16,mats.wall);box(g,8,3,0,.3,6,16,mats.wall);windows(g);for(let i=-7;i<=7;i+=.45)box(g,i,2.8,-7.78,.12,5.6,.1,mats.wood);}
function court(){const g=base('court');room(g);box(g,0,.13,-5.5,12,.26,4.5);box(g,0,.44,-6,10.7,.35,3);box(g,0,.94,-5.3,9.5,1.1,.85);box(g,0,1.53,-5.3,9.7,.12,1.05);for(let i=-4;i<=4;i++)box(g,i,.97,-4.85,.025,.91,.03,mat(0xa0784d));
 text(g,'明 川 区 人 民 法 院',0,3.5,-7.55,5.7,.65,'#a89980','#42382e');text(g,'虚构教学场景',0,2.85,-7.54,2,.28,'#a89980','#655744');
 for(const x of[-3,0,3]){const c=chair(g,x,-6.2);c.position.y=.62;const p=person(g,x,-6.2,{sit:true,color:0x181a1c,attire:'judge'});p.position.y=.62;nameplate(g,x===0?'审判长':'审判员',x,1.73,-4.72,1.36);}
 for(const x of[-3.3,3.3]){desk(g,x,-1.4,2.7);chair(g,x,-2.25);person(g,x,-2.25,{sit:true,color:x<0?0x29384d:0x1e1e20,attire:x<0?'prosecutor':'lawyer'});paper(g,x+.5,-1.4);mug(g,x-.6,-1.4);nameplate(g,x<0?'公诉人':'辩护人',x,.99,-.93);}
 desk(g,0,-3.6,1.7);chair(g,0,-4.3);person(g,0,-4.3,{sit:true,color:0x394048});laptop(g,0,-3.6);nameplate(g,'书记员',0,.99,-3.12,1.15);
 desk(g,0,3.5,1.6);paper(g,0,3.5);nameplate(g,'被告人',0,.99,3.94,1.13);const facingBench=nameplate(g,'被告人',0,.99,3.06,1.13);facingBench.rotation.y=Math.PI;chair(g,0,4.2,Math.PI); // player position, no duplicated avatar
 desk(g,5,1.4,1.5);chair(g,5,.7);person(g,5,.7,{sit:true,color:0x6c6452});nameplate(g,'被害人',5,.99,1.88,1.18);
 for(const side of[-1,1]){
  box(g,side*4,.84,6.1,6,.1,.12);
  for(let x=1;x<=7;x+=.5)box(g,side*x,.42,6.1,.06,.84,.06);
  for(let z=7.4;z<=10.5;z+=1.5){
   for(let x=1.7;x<=6.2;x+=1.5)chair(g,side*x,z,Math.PI);
  }
 }
 box(g,0,.015,6.1,1.82,.01,7.4,mats.red);
 text(g,'旁听区',5.5,.95,6.2,1.1,.19,'#503d2b','#f2eada','bold 116px Microsoft YaHei');
 for(const x of[-3,0,3]){
  box(g,x,1.606,-5.15,.34,.015,.26,mat(0xe8dfcc));
  const mic=box(g,x+.28,1.74,-5.21,.021,.26,.023,mats.metal);mic.rotation.x=-.27;
 }
 person(g,-3.2,8.9,{sit:true,rot:Math.PI,color:0x6b4c43});person(g,4.7,8.9,{sit:true,rot:Math.PI,color:0x544e43});
 const mic=box(g,0,1.04,3.25,.025,.3,.025,mats.metal);mic.rotation.x=-.3;cylinder(g,0,.87,3.25,.07,.03,mats.metal);
 const clock=new THREE.Mesh(new THREE.CircleGeometry(.32,32),mat(0xe5d9c2));clock.position.set(6,4,-7.5);g.add(clock);box(g,6,4.09,-7.45,.025,.2,.02,mats.dark);box(g,5.91,4,-7.44,.2,.025,.02,mats.dark);
}
function campus(){const g=base('campus');box(g,0,2.7,-6,14,5.4,.25,mats.wall);box(g,-8,2.7,0,.2,5.4,12,mats.wall);windows(g);box(g,0,2.8,-5.8,5.6,2.8,.08,mat(0xc7c8b6));for(let z=-2;z<=3;z+=2.5)for(const x of[-2.2,2.2]){desk(g,x,z,2.9);chair(g,x,z+1,Math.PI);paper(g,x+.6,z);laptop(g,x-.5,z);}person(g,-.7,-4.05,{rot:.95,color:0x657568});person(g,.7,-3.85,{rot:-1.1,color:0x6d6355});}
function outside(){const g=base('outside');box(g,0,2.8,-5,16,5.6,.4,mat(0x928a78));for(let x=-5;x<=5;x+=2.5){box(g,x,2.5,-4.75,1.8,3.5,.07,mat(0x5b6965));box(g,x,2.5,-4.67,.04,3.5,.02,mats.cream);}for(let i=0;i<3;i++)box(g,0,.08+i*.12,-3.1-i*.45,9,.16+i*.24,.5,mat(0xb9ac95));text(g,'东 教 学 楼',0,4.8,-4.6,3,.5,'#928a78','#e4d6bc');person(g,-.7,0,{color:0x6d6355});person(g,.7,-.4,{rot:.4,color:0x3e4e55});person(g,2,0,{rot:-1,color:0x536651});for(const x of[-6,6]){cylinder(g,x,1.8,1,.045,3.6,mats.metal);box(g,x,3.6,1,.5,.13,.5,mat(0xe8d5ac));const light=new THREE.PointLight(0xffd397,12,8);light.position.set(x,3.4,1);g.add(light);}}
function lawyer(){const g=base('lawyer');box(g,0,2.5,-5,13,5,.2,mats.wall);box(g,-6,2.5,0,.2,5,10,mats.wall);for(let x=-4;x<=4;x+=1){box(g,x,2,-4.8,.9,3.8,.4);for(let y=.6;y<3.8;y+=.6){box(g,x,y,-4.5,.85,.035,.5,mats.dark);for(let j=0;j<5;j++)box(g,x-.3+j*.14,y+.2,-4.45,.1,.36,.28,mat([0x837a65,0x555a55,0x6d493c][j%3]));}}desk(g,0,0,4);chair(g,0,-1);person(g,0,-1,{sit:true,color:0x303b44});chair(g,0,1,Math.PI);laptop(g,-1,0);paper(g,.3,0);paper(g,1,0);mug(g,-.5,0);text(g,'事实 · 证据 · 意见',0,4.4,-4.7,3.2,.35,'#a89980','#433c33');}
function corridor(){const g=base('corridor');box(g,0,2.7,-7,12,5.4,.3,mats.wall);box(g,-6,2.7,0,.3,5.4,16,mats.wall);box(g,6,2.7,0,.3,5.4,16,mats.wall);box(g,0,1.8,-6.8,2.4,3.6,.2);box(g,0,1.8,-6.64,.035,3.6,.02,mats.dark);text(g,'第一审判庭',0,4.1,-6.6,3.15,.64,'#173831','#fff7e8','bold 150px Microsoft YaHei');text(g,'候审区',3.75,2.5,-6.67,1.7,.37,'#e9e1cd','#24342d','bold 118px Microsoft YaHei');
 box(g,0,1.85,-6.55,2.55,.07,.09,mats.dark);for(const x of[-.12,.12])box(g,x,1.65,-6.48,.05,.32,.09,mats.metal);
 for(const x of[2.5,3.35,4.2])chair(g,x,-4.95);
 person(g,2.5,-4.95,{sit:true,color:0x706458});person(g,4.2,-4.95,{sit:true,color:0x73574b});
 desk(g,-3.25,-3.72,2.65);
 box(g,-3.25,1.16,-3.72,2.68,.06,.89,mats.wood);
 text(g,'文书送达',-3.25,1.03,-3.25,1.9,.27,'#173831','#fff7e8','bold 120px Microsoft YaHei');
 paper(g,-3.04,-3.28);laptop(g,-3.98,-3.63);
 box(g,-2.88,.875,-3.57,.32,.028,.23,new THREE.MeshStandardMaterial({color:0xab8758,roughness:.88}));
 chair(g,-3.5,-4.55);
 const clerk=person(g,-3.5,-4.55,{sit:true,color:0x46504f});clerk.position.y=.15;
 text(g,'诉讼服务 · 文书领取',-3.45,2.66,-6.63,3.35,.46,'#173831','#fff7e8','bold 108px Microsoft YaHei');
 text(g,'审判区  →',-3.65,1.93,-6.61,1.9,.38,'#e9e1cd','#24342d','bold 105px Microsoft YaHei');
 for(const x of[-5.6,5.6])box(g,x,.58,-6.51,.52,1.14,.41,mats.wood);
 }
function library(){
 const g=base('library');
 box(g,0,2.5,-5,13,5,.23,mats.wall);
 box(g,-6,2.5,0,.23,5,10,mats.wall);
 text(g,'明川大学图书馆',0,3.2,-4.84,4.2,.57,'#35483a','#f7efdb','bold 132px Microsoft YaHei');
 for(const x of[-3.8,-2.25,2.25,3.8]){
  box(g,x,1.25,-4.52,1.16,2.5,.42,mats.wood);
  for(let row=0;row<4;row++){
   const shelf=.38+row*.52;
   box(g,x,shelf,-4.21,1.12,.06,.36,mats.wood);
   for(let book=0;book<7;book++)box(g,x-.44+book*.14,shelf+.19,-4.11,.09,.31+(book%3)*.04,.13,mat([0x546d79,0xb18e64,0x7b4e4a,0x777356][book%4]));
  }
 }
 desk(g,0,-1.55,2.55);paper(g,.7,-1.47);
 box(g,.45,.88,-1.23,.34,.045,.23,mat(0x7b5240));
 nameplate(g,'还书台',-.4,1.01,-1.06);
 chair(g,-.45,-2.37);
 person(g,-.45,-2.37,{sit:true,color:0x586c58});
}
function radio(){
 const g=base('radio');
 const foam=mat(0x464e51);
 box(g,0,2.5,-4,12,5,.25,mats.wall);
 box(g,-5.8,2.5,0,.2,5,10,mats.wall);
 for(let x=-4.6;x<4.8;x+=.69)for(let y=1.05;y<3.65;y+=.7)box(g,x,y,-3.81,.64,.64,.12,foam);
 text(g,'校园广播站',0,4.05,-3.79,3.1,.46,'#303c42','#f5e8d1','bold 132px Microsoft YaHei');
 text(g,'● 录音中',2.1,2.8,-3.64,1.5,.35,'#602e29','#ffd8c7','bold 124px Microsoft YaHei');
 desk(g,0,-.85,3.2);chair(g,0,-1.7);paper(g,-.56,-.72);laptop(g,.78,-.94);
 person(g,0,-1.7,{sit:true,color:0x6e5b4d});
 cylinder(g,.12,1.04,-1.08,.021,.32,mats.metal);
 const mic=box(g,.12,1.21,-1.08,.06,.105,.06,mats.dark);mic.rotation.x=.28;
}
function cinema(){
 const g=base('cinema');
 box(g,0,.01,0,22,.02,25,mat(0x495a4e));
 const stand=mat(0x343c3f);
 for(const side of[-1,1])box(g,side*3.36,1.95,-6.23,.095,3.9,.16,stand);
 box(g,0,2.18,-6.2,6.5,3.05,.08,stand);
 text(g,'电影社 · 露天放映',0,2.18,-6.13,6.3,2.86,'#d4d2b8','#423f38','bold 110px Microsoft YaHei');
 for(let row=0;row<3;row++)for(let i=-3;i<=3;i++){
  if(i!==0)chair(g,i*.85,-2.45+row*1.12,Math.PI);
 }
 desk(g,3.9,.7,1.15);box(g,3.9,.96,.7,.55,.23,.42,stand);
 person(g,2.9,-3.01,{rot:-.52,color:0x805944});
}
function setView(detail={}){courtExhibit?.setScene(detail);const id=groups[detail.world]?detail.world:'court';current=id;selectPerformance(detail);for(const [key,g]of Object.entries(groups))g.visible=key===id;offset=0;pitch=0;
 const views={court:[[0,2.5,9],[0,1.9,-3]],campus:[[4.2,2.9,5.8],[0,2.55,-5.5]],outside:[[3.4,2.1,5.8],[.5,.65,0]],lawyer:[[3,2.5,4],[0,1,-1]],corridor:[[1.65,2.28,3.8],[-.52,2.15,-5.5]],library:[[3.9,2.4,4.7],[-.25,1.49,-2.5]],radio:[[2.05,1.75,2.5],[0,1.47,-1.54]],cinema:[[4.3,2.7,6.4],[.55,1.6,-4.25]]};
 let [p,t]=views[id];if(detail.home){p=[9,4.8,13];t=[0,1.8,-3];}else if(id==='campus'&&detail.who==='同学'){p=[.6,1.72,-1.08];t=[-.58,1.3,-4.03];}else if(id==='campus'&&(detail.who==='你 · 林予安'||detail.reaction)){p=[-1.15,1.74,-1.05];t=[.65,1.3,-3.85];}else if(id==='court'){if(detail.who==='赵检察官'){p=[-2.12,1.64,.05];t=[-3.3,1.36,-2.25];}if(detail.who==='许律师'){p=[2.14,1.64,.05];t=[3.3,1.36,-2.25];}if(detail.who==='沈审判长'){p=[1.1,2.43,-2.65];t=[0,2,-6.18];}if(detail.who==='陈哲'){p=[-3.2,1.85,4.6];t=[-5,1.12,1.05];}if(detail.who==='书记员'&&detail.chapter==='record'){p=[2.8,2.32,.55];t=[0,1.27,-3.85];}if(detail.who==='你 · 林予安'){p=[3,2.1,3];t=[0,1.1,4.2];}if(detail.who==='周启明'){p=[3,1.85,3.3];t=[5,1.2,.7];}}
 if(id==='court'&&detail.exhibitReady&&['旁白','沈审判长'].includes(detail.who)){p=[2.3,2.7,7.9];t=[1.05,2.15,-4.8];}
 if(id==='outside'&&detail.argument){
  p=[detail.who==='周启明'?-.95:1.05,1.6,2.85];
  t=[0,1.37,detail.route==='main'?-2.65:0];
 }
 pos.set(...p);target.set(...t);if(reduced||detail.immediate){camera.position.copy(pos);look.copy(target);camera.lookAt(look);}document.querySelector('#world').dataset.fallback=detail.place||'刑事审判庭';}
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.96;scene=new THREE.Scene();scene.background=new THREE.Color(0x9ba9ae);scene.fog=new THREE.Fog(0x827566,20,50);camera=new THREE.PerspectiveCamera(47,innerWidth/innerHeight,.1,70);scene.add(new THREE.HemisphereLight(0xe7eff4,0x585247,1.65));const sun=new THREE.DirectionalLight(0xffe6c5,2.6);sun.position.set(-7,10,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-15;sun.shadow.camera.right=15;sun.shadow.camera.top=15;sun.shadow.camera.bottom=-15;sun.shadow.normalBias=.04;scene.add(sun);scene.add(new THREE.AmbientLight(0xd5dde1,.4));court();campus();outside();lawyer();corridor();library();radio();cinema();
desk(groups.court,-5,1.4,1.35);chair(groups.court,-5,.7);person(groups.court,-5,.7,{sit:true,color:0x555f51});nameplate(groups.court,'证人',-5,.99,1.88,1.12);
person(groups.court,0,4.2,{sit:true,rot:Math.PI,color:0x6d6355});
person(groups.court,6.75,5.45,{rot:-.52,color:0x27374b,attire:'officer'});
const roleMap={court:['审判员','沈审判长','审判员','赵检察官','许律师','书记员','周启明','旁听人员','母亲','陈哲','你 · 林予安','值庭法警'],campus:['同学','你 · 林予安'],outside:['你 · 林予安','周启明','陈哲'],lawyer:['许律师'],corridor:['周启明','母亲','工作人员'],library:['同学'],radio:['广播站搭档'],cinema:['电影社同学']};
for(const [id,g]of Object.entries(groups)){actors.filter(r=>r.scene===g).forEach((r,i)=>{r.role=roleMap[id]?.[i]||'旁听人员';r.baseY=r.root.position.y;});}enrich(groups,box,text,surfaces);courtExhibit=createCourtExhibit(groups.court,renderer,scene,groups.outside,box);setView({home:true,immediate:true});
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}resize();addEventListener('resize',resize);
let dragging=false,sx=0,sy=0;canvas.addEventListener('pointerdown',e=>{dragging=true;sx=e.clientX;sy=e.clientY;canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!dragging)return;offset=THREE.MathUtils.clamp(offset+(e.clientX-sx)*.004,-.65,.65);pitch=THREE.MathUtils.clamp(pitch+(e.clientY-sy)*.003,-.35,.35);sx=e.clientX;sy=e.clientY;});canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);
function frame(t){anim=requestAnimationFrame(frame);if(document.hidden)return;const dt=Math.min((t-last)/1000,.08);last=t;camera.position.lerp(pos,reduced?1:Math.min(1,dt*4));look.lerp(target,reduced?1:Math.min(1,dt*4));const direction=look.clone().sub(camera.position);direction.applyAxisAngle(new THREE.Vector3(0,1,0),offset);direction.y+=pitch*4;camera.lookAt(camera.position.clone().add(direction));courtExhibit.frame(dt,t/1000);updatePerformance(dt,t/1000,current,reduced);updateEnvironment(t/1000,reduced);if(!reduced){camera.position.x+=Math.sin(t*.00017)*.002;camera.position.y+=Math.sin(t*.00031)*.001;}renderer.render(scene,camera);}requestAnimationFrame(frame);
addEventListener('court-voice',e=>setSpeech(e.detail));
addEventListener('court-replay',e=>courtExhibit.selectReplay(e.detail));
addEventListener('court-paper',e=>courtExhibit.showPaper(e.detail));
addEventListener('court-scene',e=>setView(e.detail));addEventListener('court-reset',()=>{offset=0;pitch=0});addEventListener('court-reduced',e=>reduced=e.detail);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(anim);document.body.classList.add('fallback')});window.courtWorldReady=true;dispatchEvent(new Event('court-world-ready'));
}catch(error){document.body.classList.add('fallback');document.querySelector('#world').dataset.fallback='法庭篇';console.warn('三维场景不可用，保留完整文字互动。',error.message);}
