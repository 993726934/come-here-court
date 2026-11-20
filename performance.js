import * as T from './vendor/three.module.js';
export const actors=[];
const skinColors=[0xb78a70,0xc3977e,0xad816a,0xc6a087];
function ellipsoid(g,material,x,y,z,sx,sy,sz){const o=new T.Mesh(new T.SphereGeometry(1,24,16),material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
function segment(g,length,radius,material){const o=new T.Mesh(new T.CylinderGeometry(radius,radius*.83,length,16),material);o.position.y=-length/2;o.castShadow=true;g.add(o);return o;}
function joint(g,x,y,z){const p=new T.Group();p.position.set(x,y,z);g.add(p);return p;}
function courtAttire(body,arms,attire,cloth,white){
 const textile=color=>new T.MeshStandardMaterial({color,roughness:.96,side:T.DoubleSide});
 const front=(material,x,y,w,h,z=.124)=>{
  const panel=new T.Mesh(new T.PlaneGeometry(w,h),material);
  panel.position.set(x,y,z);body.add(panel);return panel;
 };
 const badge=(x,y,color)=>{
  const mark=new T.Mesh(new T.CircleGeometry(.013,20),textile(color));
  mark.position.set(x,y,.136);body.add(mark);
 };
 if(attire==='judge'||attire==='lawyer'){
  const skirt=new T.Mesh(new T.CylinderGeometry(.172,.214,.34,22,1,true),cloth);
  skirt.position.y=-.015;skirt.scale.z=.7;body.add(skirt);
  for(const arm of arms)segment(arm.elbow,.24,.068,cloth);
 }
 if(attire==='judge'){
  front(textile(0x951b2b),0,.325,.093,.27);
  for(let i=0;i<4;i++)badge(0,.353-i*.039,0xdcb65c);
  badge(0,.413,0xe8c077);
 }else if(attire==='prosecutor'){
  front(white,0,.35,.115,.16);
  front(textile(0x303e57),0,.307,.027,.166,.131);
  const lapel=textile(0x252f43);
  for(const side of[-1,1])front(lapel,side*.075,.292,.061,.235,.133).rotation.z=side*.31;
  badge(.104,.347,0xbe9770);
 }else if(attire==='officer'){
  front(textile(0x536778),0,.397,.085,.068);
  for(const side of[-1,1]){
   const tab=new T.Mesh(new T.BoxGeometry(.087,.012,.078),textile(0x17242f));
   tab.position.set(side*.15,.42,0);body.add(tab);
  }
  badge(.105,.345,0xb4bbbf);
 }else if(attire==='lawyer'){
  front(textile(0x414343),0,.235,.082,.36);
  front(white,0,.407,.084,.067,.13);
  const scarf=textile(0xd5d6d0);
  for(const side of[-1,1])front(scarf,side*.022,.352,.036,.123,.135).rotation.z=side*.22;
  badge(.113,.346,0xaaa99e);
 }
}
function surfaceTexture(kind){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
 const ctx=canvas.getContext('2d');ctx.fillStyle=kind==='skin'?'#d7ab90':'#b5b7ba';ctx.fillRect(0,0,256,256);
 let seed=307;
 for(let i=0;i<9500;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%256;seed=(seed*1664525+1013904223)>>>0;const y=seed%256;ctx.fillStyle=i%2?'#ffffff16':'#33221b14';ctx.fillRect(x,y,1,kind==='skin'?1:2);}
 const texture=new T.CanvasTexture(canvas);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(kind==='skin'?1:3,3);return texture;
}
let skinTexture,clothTexture;
export function human(g,x,z,{rot=0,sit=false,color=0x333b40,hair=0x211b17,attire}={}){
 const root=new T.Group();root.position.set(x,0,z);root.rotation.y=rot;g.add(root);const index=actors.length;
 skinTexture??=surfaceTexture('skin');clothTexture??=surfaceTexture('cloth');const skin=new T.MeshStandardMaterial({color:0xf4d5bd,bumpMap:skinTexture,bumpScale:.002,roughness:.61});
 const cloth=new T.MeshStandardMaterial({color,bumpMap:clothTexture,bumpScale:.003,roughness:.92}),dark=new T.MeshStandardMaterial({color:0x252323,roughness:.87}),hairmat=new T.MeshStandardMaterial({color:hair,roughness:.99});
 const body=joint(root,0,sit?.67:.96,0);
 const torsoGeometry=new T.LatheGeometry([new T.Vector2(.145,0),new T.Vector2(.15,.05),new T.Vector2(.16,.16),new T.Vector2(.185,.32),new T.Vector2(.18,.4),new T.Vector2(.1,.46)],24);const torso=new T.Mesh(torsoGeometry,cloth);torso.scale.z=.65;torso.castShadow=true;body.add(torso);ellipsoid(body,cloth,0,.01,0,.153,.105,.102);
 const neck=joint(body,0,.49,0);ellipsoid(neck,skin,0,0,0,.053,.085,.052);
 const head=joint(neck,0,.14,0);ellipsoid(head,skin,0,.005,0,.105,.145,.103);ellipsoid(head,skin,0,-.069,.012,.068,.06,.067);
 const hairCap=new T.Mesh(new T.SphereGeometry(1,24,16,0,Math.PI*2,0,Math.PI*.53),hairmat);hairCap.scale.set(.109,.15,.106);hairCap.position.set(0,.025,-.009);head.add(hairCap);hairCap.castShadow=true;
 for(let i=0;i<8;i++){const lock=ellipsoid(head,hairmat,(i-3.5)*.025,.108-Math.abs(i-3.5)*.006,.065,.023,.035,.045);lock.rotation.z=(i-3)*.08;}
 ellipsoid(head,skin,0,-.006,.103,.012,.025,.017);ellipsoid(head,skin,-.11,-.006,0,.019,.035,.019);ellipsoid(head,skin,.11,-.006,0,.019,.035,.019);
 const eyes=[],brows=[];for(const side of[-1,1]){const eye=joint(head,side*.042,.026,.09);ellipsoid(eye,new T.MeshStandardMaterial({color:0xbeb6a8,roughness:.6}),0,0,0,.026,.011,.012);const pupil=ellipsoid(eye,dark,0,0,.011,.009,.009,.004);eyes.push({eye,pupil});const brow=ellipsoid(head,hairmat,side*.042,.048,.095,.029,.004,.005);brows.push(brow);}
 const jaw=joint(head,0,-.055,.093);const mouth=ellipsoid(jaw,new T.MeshStandardMaterial({color:0x402a28,roughness:.9}),0,0,0,.032,.003,.006);const lipmat=new T.MeshStandardMaterial({color:0x95675b,roughness:.85});ellipsoid(jaw,lipmat,0,-.006,0,.032,.004,.007);
 const trouser=new T.MeshStandardMaterial({color:attire?0x232631:color===0x6d6355?0x36455b:0x2c343b,bumpMap:clothTexture,bumpScale:.003,roughness:.89});const arms=[],legs=[];for(const side of[-1,1]){const shoulder=joint(body,side*.19,.39,0);segment(shoulder,.29,.058,cloth);const elbow=joint(shoulder,0,-.29,0);ellipsoid(elbow,cloth,0,0,0,.048,.052,.048);segment(elbow,.25,.045,cloth);const hand=joint(elbow,0,-.26,0);ellipsoid(hand,skin,0,-.035,.006,.037,.062,.024);for(let i=0;i<4;i++)ellipsoid(hand,skin,(i-1.5)*.015,-.079,.012,.008,.027,.009);ellipsoid(hand,skin,-side*.035,-.035,.015,.013,.03,.012);arms.push({shoulder,elbow,hand});
 const hip=joint(body,side*.09,-.01,0);segment(hip,.43,.073,trouser);const knee=joint(hip,0,-.43,0);ellipsoid(knee,trouser,0,0,0,.057,.06,.057);segment(knee,sit?.57:.43,.055,trouser);ellipsoid(knee,dark,0,sit?-.54:-.4,.06,.065,.055,.13);if(sit){hip.rotation.x=-Math.PI/2;knee.rotation.x=Math.PI/2;}legs.push({hip,knee});}
 // Shirt opening, jacket seams and cuffs give the silhouette clothing structure.
 const white=new T.MeshStandardMaterial({color:0xbfb9ad,roughness:1});ellipsoid(body,white,0,.427,.098,.055,.045,.009);ellipsoid(body,dark,0,.29,.113,.008,.11,.006);
 if(attire)courtAttire(body,arms,attire,cloth,white);
 else{
  const casual=new T.MeshStandardMaterial({color:color===0x6d6355?0xd7cab3:0x929d97,roughness:.9,bumpMap:clothTexture,bumpScale:.002});
  const collar=ellipsoid(body,casual,0,.425,.074,.074,.028,.043);
  for(const side of[-1,1]){
   const seam=ellipsoid(body,casual,side*.105,.15,.101,.044,.003,.005);
   seam.rotation.z=side*.08;
   const cuff=ellipsoid(arms[side<0?0:1].elbow,casual,0,-.23,0,.047,.018,.043);
   const shoeSole=ellipsoid(legs[side<0?0:1].knee,white,0,sit?-.577:-.44,.06,.065,.015,.128);
  }
 }
 for(const side of[-1,1]){
  const eye=eyes[side<0?0:1];
  ellipsoid(eye.eye,new T.MeshStandardMaterial({color:0x674736,roughness:.4}),0,0,.008,.012,.01,.004);
  ellipsoid(eye.eye,new T.MeshStandardMaterial({color:0xffffff,roughness:.15}),-.003,.003,.016,.003,.003,.002);
 }
 const locks=[];
 for(let i=0;i<22;i++){
  const x=(i-10.5)*.008;
  const path=new T.CatmullRomCurve3([new T.Vector3(x,.155,-.045),new T.Vector3(x+.02,.175,.016),new T.Vector3(x+.025,.12,.086)]);
  const lock=new T.Mesh(new T.TubeGeometry(path,8,.0016,3,false),hairmat);head.add(lock);locks.push(lock);
 }
 root.userData.hairLocks=locks;
 const phone=new T.Mesh(new T.BoxGeometry(.069,.138,.012),dark);
 phone.position.set(.017,-.028,.031);
 phone.rotation.set(.1,0,-.22);
 phone.visible=false;
 arms[1].hand.add(phone);
 const computer=new T.Group();const casing=new T.MeshStandardMaterial({color:0x68707a,metalness:.55,roughness:.39});const base=new T.Mesh(new T.BoxGeometry(.32,.018,.23),casing);computer.add(base);const lid=new T.Mesh(new T.BoxGeometry(.32,.2,.014),casing);lid.position.set(0,.1,-.11);computer.add(lid);computer.position.set(0,-.03,.12);computer.visible=false;arms[1].hand.add(computer);
 const gavel=new T.Group();const wood=new T.MeshStandardMaterial({color:0x653d29,roughness:.55});const handle=new T.Mesh(new T.CylinderGeometry(.009,.012,.22,12),wood);gavel.add(handle);const hammer=new T.Mesh(new T.CylinderGeometry(.033,.033,.105,20),wood);hammer.rotation.z=Math.PI/2;hammer.position.y=.11;gavel.add(hammer);gavel.visible=false;arms[1].hand.add(gavel);
 const droppedComputer=computer.clone();droppedComputer.visible=false;droppedComputer.position.set(.6,.035,-2.3);droppedComputer.rotation.set(0,.6,0);g.add(droppedComputer);
 const rig={droppedComputer,computer,gavel,root,body,head,jaw,mouth,arms,legs,eyes,brows,phone,sit,index,home:new T.Vector3(x,0,z),rot,scene:g,role:'',phase:index*1.731};root.userData.rig=rig;actors.push(rig);return root;
}
let detail={},lineTime=0,speech=null,fightElapsed=0;
function stageFor(text=''){return /周启明推了/.test(text)?'push':/停！|站在你们中间|上前劝阻|他打了我|他还在追|事情发生/.test(text)?'separate':/甩开|后退中反击|混乱中/.test(text)?'chase':/叫救护车|急救|报警|现场等|未读消息/.test(text)?'after':'separate';}
export function selectPerformance(d){if(d.combat!==detail.combat||d.chapter!==detail.chapter||stageFor(d.text)!==stageFor(detail.text))fightElapsed=0;detail=d;lineTime=0;}
export function setSpeech(d){speech=d;}
const clamp=T.MathUtils.clamp;
const fallBounds=new T.Box3();
const fallAxis=new T.Vector3(0,0,1);
const fallTurn=new T.Quaternion();
const smooth=(a,b,t)=>{const x=clamp((t-a)/(b-a),0,1);return x*x*(3-2*x);};
const pulse=(a,b,c,t)=>smooth(a,b,t)*(1-smooth(b,c,t));
export function fightPose(stage,t,route='main'){
 const p={linX:-.48,zhouX:.48,chenX:1.6,linZ:0,zhouZ:0,chenZ:.8,linTurn:Math.PI/2,zhouTurn:-Math.PI/2,chenTurn:-.8,linLean:0,zhouLean:0,linPunch:0,zhouPunch:0,guard:0,fall:0,walk:0,separate:0};
 if(stage==='push'){const shove=pulse(.35,1,1.8,t),strike=pulse(2,2.35,2.9,t);p.zhouX-=shove*.13+smooth(1.8,2.3,t)*.5;p.linX-=smooth(.8,1.5,t)*.3;p.zhouPunch=shove*.75+strike;p.guard=pulse(.75,1.4,2.3,t)*.85+strike*.7;p.linLean=shove*.16+strike*.22;p.linZ+=pulse(1.8,2.2,2.9,t)*.13;}
 if(stage==='separate'){const s=smooth(0,2,t);p.chenX=1.6*(1-s);p.chenZ=.8*(1-s);p.linX=-.78-s*.4;p.zhouX=.48+s*.6;p.separate=s;p.guard=.4*(1-s);if(route==='main'){p.zhouX+=smooth(2,4,t)*1.3;p.zhouTurn=-Math.PI/2+smooth(2,3,t)*Math.PI;p.walk=t<4?.4:0;}else if(route==='defense'){p.zhouX-=smooth(2,4,t)*1.2;p.zhouPunch=pulse(2.6,3.1,3.6,t);p.guard=p.zhouPunch*.8;} }
 if(stage==='chase'){p.linX=-1.18;p.zhouX=2.38;p.chenX=0;p.chenZ=.3;p.zhouTurn=Math.PI/2;if(route==='main'){const run=smooth(0,1.9,t);p.linX+=run*3.03;p.walk=t<1.9?1:0;p.linPunch=pulse(1.8,2.16,2.6,t);p.linLean=p.linPunch*.12;p.zhouLean=smooth(2.13,2.55,t)*.36;p.fall=smooth(2.4,3.5,t);p.zhouX+=smooth(2.15,3.3,t)*.35;}else if(route==='defense'){p.linX=-1.2-smooth(0,1.2,t)*.5;p.zhouX=-.3-smooth(0,1.2,t)*.5;p.zhouTurn=-Math.PI/2;p.guard=1-smooth(1.8,3,t);p.zhouPunch=pulse(.1,.55,1.2,t);p.linPunch=pulse(1.1,1.45,1.9,t)*.8;p.zhouLean=smooth(1.45,2,t)*.3;p.fall=smooth(1.8,3.2,t);}else{p.linX=-.5;p.zhouX=.4;p.zhouTurn=-Math.PI/2;p.chenX=0;p.chenZ=.6;}}
 if(stage==='kick'){
  p.linX=-.48;p.zhouX=.48;p.chenX=1.9;
  p.kick=pulse(.35,.9,1.45,t);
  p.zhouLean=smooth(.85,1.3,t)*.35;
  p.fall=smooth(1.15,2.8,t);
  p.zhouX+=smooth(.9,2.4,t)*.5;
 }
 if(stage==='laptop'){p.linX=-.48;p.zhouX=.48;p.chenX=1.8;p.strike=pulse(.2,.85,1.35,t);p.zhouLean=smooth(.92,1.5,t)*.3;p.fall=smooth(1.15,2.8,t);}
 if(stage==='after'&&route==='main'){return fightPose('laptop',5,route);}
 if(stage==='after'){Object.assign(p,fightPose('chase',5,route));}
 return p;
}
export function updatePerformance(dt,t,current,reduced=false,replay){if(!replay){lineTime+=dt;fightElapsed+=dt;}const visible=actors.filter(r=>r.scene.visible);const speaking=visible.find(r=>r.role===detail.who);let energy=0;if(speech&&speech.who===detail.who){if(speech.analyser){speech.analyser.getByteTimeDomainData(speech.data);let sum=0;for(const x of speech.data)sum+=((x-128)/128)**2;energy=clamp(Math.sqrt(sum/speech.data.length)*5,0,1);}else if(lineTime<speech.duration)energy=(.35+.3*Math.sin(t*23))*(.7+.3*Math.sin(t*7));}
 for(const r of visible){if(!reduced)for(const [i,lock]of (r.root.userData.hairLocks||[]).entries())lock.rotation.z=Math.sin(t*1.8+i*.21)*.008;r.droppedComputer.visible=false;r.computer.visible=false;r.gavel.visible=false;r.phone.visible=false;r.root.visible=!(r.scene.name==='court'&&r.role==='陈哲'&&detail.chapter!=='witness');const a=t+r.phase;r.body.rotation.set(0,0,0);r.body.position.y=(r.sit?.67:.96)+Math.sin(a*1.5)*.003;r.head.rotation.set(Math.sin(a*.63)*.018,Math.sin(a*.33)*.035,Math.sin(a*.44)*.012);r.root.rotation.set(0,r.rot,0);r.root.position.y=r.baseY||0;r.root.position.x=r.home.x;r.root.position.z=r.home.z;
 for(let i=0;i<2;i++){const arm=r.arms[i];arm.shoulder.rotation.set(r.sit?-.34:Math.sin(a*.47+i)*.025,0,(i?1:-1)*.06);arm.elbow.rotation.set(r.sit?-1.05:-.08,0,0);r.legs[i].hip.rotation.x=r.sit?-Math.PI/2:0;r.legs[i].knee.rotation.x=r.sit?Math.PI/2:0;const blink=(a% (4.1+r.index*.07));r.eyes[i].eye.scale.y=blink<.14?Math.max(.06,Math.abs(blink-.07)/.07):1;r.eyes[i].pupil.position.x=Math.sin(a*.42)*.002;r.brows[i].rotation.z=0;}
 if(r.role==='书记员'&&detail.chapter==='opening'&&detail.who==='书记员'){const rise=smooth(0,.8,lineTime);r.body.position.y+=rise*.29;for(const leg of r.legs){leg.hip.rotation.x=-Math.PI/2*(1-rise);leg.knee.rotation.x=Math.PI/2*(1-rise);}}
 if(r.role==='沈审判长'&&detail.gavel){r.gavel.visible=true;const strike=pulse(0,.38,.75,lineTime);r.arms[1].shoulder.rotation.x=-.75-strike*.65;r.arms[1].elbow.rotation.x=-.8+strike*.55;}
 if(detail.reaction&&r.scene.name==='campus'&&r.role==='你 · 林予安'){
  const tension=Math.min(1,lineTime*2.2);
  r.brows[0].rotation.z=-.41*tension;
  r.brows[1].rotation.z=.41*tension;
  r.eyes.forEach(({eye})=>eye.scale.y*=1-.26*tension);
  r.head.rotation.x+=.12*tension;
  r.arms[1].elbow.rotation.x-=.57*tension;
 }
 r.mouth.scale.y=.003;if(r===speaking){r.mouth.scale.y=.003+energy*.018;r.jaw.position.y=-.055-energy*.007;r.head.rotation.x+=Math.sin(a*2.1)*.025*energy;r.body.rotation.y=Math.sin(a*.6)*.025;const gesture=pulse(1.2,2.3,4.3,lineTime)+pulse(7,8,10,lineTime);r.arms[1].shoulder.rotation.x-=gesture*.28;r.arms[1].elbow.rotation.x-=gesture*.42;r.arms[1].shoulder.rotation.z+=gesture*.12;r.brows[0].rotation.z=-energy*.035;r.brows[1].rotation.z=energy*.035;}else{r.jaw.position.y=-.055;if(speaking){const dx=speaking.root.position.x-r.root.position.x,dz=speaking.root.position.z-r.root.position.z;const turn=Math.atan2(dx,dz)-r.rot;r.head.rotation.y+=clamp(Math.atan2(Math.sin(turn),Math.cos(turn)),-.25,.25)*.5;}r.head.rotation.x+=pulse(2.5+r.index*.11,3+r.index*.11,3.8+r.index*.11,lineTime)*.045;}
 }
 if(current==='outside'&&(replay||detail.chapter==='conflict')){
 const [lin,zhou,chen]=visible; if(!chen)return;const text=detail.text||'';let stage=detail.combat||(detail.argument?'argument':detail.call?'after':/周启明推了/.test(text)?'push':/停！|站在你们中间|上前劝阻/.test(text)?'separate':/甩开|后退中反击|混乱中/.test(text)?'chase':/叫救护车|急救|报警|现场等|未读消息/.test(text)?'after':'separate');
 if(replay)stage=replay.stage;
 const time=replay?replay.time:stage==='separate'&&/他打了我|他还在追|事情发生/.test(text)?5:fightElapsed;
 const p=fightPose(stage,time,replay?.route??detail.route);
 if((replay?.route??detail.route)==='main'&&['argument','laptop','after'].includes(stage)){p.linZ=-2.65;p.zhouZ=-2.65;p.chenZ=-1.75;}
 if(replay?.route==='doubt'&&stage==='after')p.fall=1;lin.root.position.set(p.linX,0,p.linZ);zhou.root.position.set(p.zhouX,0,p.zhouZ);chen.root.position.set(p.chenX,0,p.chenZ);lin.root.rotation.y=p.linTurn;zhou.root.rotation.y=p.zhouTurn;chen.root.rotation.y=p.chenTurn;
 if(detail.pointing){zhou.arms[1].shoulder.rotation.x=-1.1;zhou.arms[1].elbow.rotation.x=-.35;}
 if((replay?.route??detail.route)==='main'&&['argument','laptop'].includes(stage)){lin.computer.visible=true;lin.arms[1].shoulder.rotation.x=-.65;lin.arms[1].elbow.rotation.x=-1.2;lin.arms[0].shoulder.rotation.x=-.75;lin.arms[0].elbow.rotation.x=-1.05;}
 if(stage==='argument'){
  const speaker=detail.who===lin.role?lin:zhou;
  const listener=speaker===lin?zhou:lin;
  listener.head.rotation.x+=.06;
  speaker.body.rotation.z=(speaker===lin?-1:1)*.045;
  speaker.arms[1].shoulder.rotation.x-=pulse(.08,.55,1.75,lineTime)*.32;
  return;
 }
 lin.body.rotation.z=p.linLean;zhou.body.rotation.z=-p.zhouLean;lin.arms[1].shoulder.rotation.x=-p.linPunch*1.9;lin.arms[1].shoulder.rotation.z=-p.linPunch*.24;zhou.arms[1].shoulder.rotation.z=-p.zhouPunch*.24;lin.arms[1].hand.scale.y=1-p.linPunch*.3;zhou.arms[1].hand.scale.y=1-p.zhouPunch*.3;lin.arms[1].elbow.rotation.x=-.15-(1-p.linPunch)*.25;zhou.arms[1].shoulder.rotation.x=-p.zhouPunch*1.9;lin.arms[0].shoulder.rotation.x=-p.guard*1.3;lin.arms[0].elbow.rotation.x=-p.guard*.8;lin.head.rotation.z=-p.linLean*.5;
 if(!replay&&detail.callConnected){
  lin.phone.visible=true;
  lin.arms[1].shoulder.rotation.set(-.64,0,-.13);
  lin.arms[1].elbow.rotation.x=-2.42;
  lin.arms[1].hand.rotation.x=.18;
  lin.head.rotation.x=.05;
 }else{lin.arms[1].hand.rotation.x=0;}
 if(p.fall){
  const bend=smooth(0,.4,p.fall),drop=smooth(.16,.93,p.fall);
  const brace=pulse(.18,.58,1.1,p.fall);
  zhou.body.position.y-=bend*.13;
  zhou.legs[0].hip.rotation.x=-bend*.58;
  zhou.legs[1].hip.rotation.x=-drop*.25;
  zhou.legs[0].knee.rotation.x=bend*.94;
  zhou.legs[1].knee.rotation.x=drop*.39;
  zhou.arms[0].shoulder.rotation.set(-brace*.72,0,-drop*.48);
  zhou.arms[0].elbow.rotation.x=-bend*.48;
  zhou.head.rotation.x+=bend*.13;
  zhou.root.position.x+=p.fall*.27;
  zhou.root.position.z-=drop*.09;
  fallTurn.setFromAxisAngle(fallAxis,-drop*1.56);
  zhou.root.quaternion.premultiply(fallTurn);
  // Ground the lowest point of the posed character rather than rotating about the feet.
  fallBounds.setFromObject(zhou.root,true);
  zhou.root.position.y+=.012-fallBounds.min.y;
 }
 for(let i=0;i<2;i++){lin.legs[i].hip.rotation.x=Math.sin(t*13+i*Math.PI)*.58*p.walk;lin.legs[i].knee.rotation.x=Math.max(0,Math.sin(t*13+i*Math.PI))*.8*p.walk;chen.arms[i].shoulder.rotation.z=(i?1:-1)*p.separate*.65;}
 if(stage==='laptop'){lin.computer.visible=true;lin.arms[1].shoulder.rotation.x=-.75-p.strike*1.5;lin.arms[1].elbow.rotation.x=-1.15+p.strike*.8;lin.body.rotation.z=p.strike*.12;zhou.arms[0].shoulder.rotation.x=-smooth(.9,1.5,time)*1.4;}
 if((replay?.route??detail.route)==='main'&&(stage==='after'||(stage==='laptop'&&time>1.3))){lin.computer.visible=false;lin.droppedComputer.visible=true;}
 if(p.kick){lin.legs[1].hip.rotation.x=-p.kick*1.05;lin.legs[1].knee.rotation.x=pulse(.1,.4,.9,p.kick)*.65;lin.body.rotation.x=-p.kick*.12;}
 }
}
