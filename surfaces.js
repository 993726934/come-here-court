import * as T from './vendor/three.module.js';
let seed=72911;function rand(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
function texture(kind){const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d'),img=ctx.createImageData(512,512);for(let y=0;y<512;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4;let v=rand();if(kind==='wood'){const warp=Math.sin(y*.008)*8+Math.sin(y*.027)*2;v=.48+.035*Math.sin((x+warp)*.45)+.012*Math.sin(x*2.5)+rand()*.035;}if(kind==='stone')v=.65+rand()*.13+.07*Math.sin(x*.018+Math.sin(y*.023));if(kind==='fabric')v=.45+rand()*.15+((x+y)%3)*.05;if(kind==='plaster')v=.86+rand()*.035;let base=kind==='wood'?[104,73,49]:kind==='stone'?[158,157,149]:kind==='fabric'?[130,128,121]:[225,224,217];for(let k=0;k<3;k++)img.data[i+k]=base[k]*(.65+v*.5);img.data[i+3]=255;}ctx.putImageData(img,0,0);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.anisotropy=4;return tx;}
export function createSurfaces(){const wood=texture('wood'),stone=texture('stone'),wall=texture('plaster'),fabric=texture('fabric');return {wood:new T.MeshStandardMaterial({color:0xc8b69d,map:wood,bumpMap:wood,bumpScale:.009,roughness:.66}),wall:new T.MeshStandardMaterial({color:0xf2f0e6,map:wall,bumpMap:wall,bumpScale:.006,roughness:.94}),floor:new T.MeshStandardMaterial({color:0xcac7bb,map:stone,bumpMap:stone,bumpScale:.008,roughness:.78}),fabric:new T.MeshStandardMaterial({color:0x654a40,map:fabric,bumpMap:fabric,bumpScale:.006,roughness:1})};}
export const environmentMotion=[];
function defenseSlide(group){
 const canvas=document.createElement('canvas');
 canvas.width=960;canvas.height=480;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#17292d';ctx.fillRect(0,0,960,480);
 ctx.fillStyle='#d8e4e2';ctx.font='bold 36px Microsoft YaHei';ctx.fillText('校创项目组  /  比赛答辩',56,79);
 ctx.fillStyle='#f4f2e5';ctx.font='bold 80px Microsoft YaHei';ctx.fillText('明早 09:00',53,184);
 ctx.fillStyle='#b5c6c4';ctx.font='31px Microsoft YaHei';ctx.fillText('每组限时 5 分钟',58,243);
 ctx.fillStyle='#e9ba6b';ctx.fillRect(56,305,848,111);
 ctx.fillStyle='#231b13';ctx.font='bold 60px Microsoft YaHei';ctx.fillText('今晚合稿，林予安负责',82,382);
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
 const slide=new T.Mesh(new T.PlaneGeometry(5.44,2.67),new T.MeshBasicMaterial({map}));
 slide.position.set(0,2.8,-5.745);group.add(slide);
}
export function enrich(groups,box,text,surfaces){
 const metal=new T.MeshStandardMaterial({color:0x505550,metalness:.65,roughness:.36}),glass=new T.MeshPhysicalMaterial({color:0xaec5c6,transparent:true,opacity:.28,roughness:.13,metalness:.1,depthWrite:false}),trim=new T.MeshStandardMaterial({color:0xd1cec1,roughness:.7}),seam=new T.MeshStandardMaterial({color:0x8c8b82,roughness:1});
 for(const [id,g]of Object.entries(groups)){if(id==='field')continue;g.children[0].material=surfaces.floor;
  // Tile joints are physical, varied-size surface noise is finer than the joints.
  for(let x=-10;x<=10;x+=1.4)box(g,x,.006,0,.009,.006,22,seam);for(let z=-10;z<=10;z+=1.4)box(g,0,.006,z,20,.006,.009,seam);
  if(['court','campus','lawyer','corridor','home'].includes(id)){const ceiling=box(g,0,5.5,0,18,.12,24,surfaces.wall);ceiling.castShadow=false;const back=id==='court'?-7.55:id==='campus'?-5.75:id==='lawyer'?-4.65:id==='home'?-3.75:-6.55;box(g,0,.13,back,12,.26,.05,surfaces.wood);box(g,0,5.35,back,12,.1,.16,trim);
   for(let x=-4;x<=4;x+=4){const light=new T.Mesh(new T.BoxGeometry(1.7,.035,.36),new T.MeshStandardMaterial({color:0xfff4d9,emissive:0xffe5be,emissiveIntensity:.7}));light.position.set(x,4.9,-2);g.add(light);box(g,x,4.94,-2,1.8,.05,.42,metal);}
  }
 }
 const court=groups.court;
 // Realistic wall panels with fine horizontal joins, recording equipment and cable routing.
 for(let y=.7;y<5;y+=1.1)box(court,0,y,-7.66,15,.016,.02,seam);
 for(const x of[-6.8,6.8]){box(court,x,3.3,-7.45,.32,.64,.17,metal);for(let j=0;j<6;j++)box(court,x,3.1+j*.065,-7.35,.26,.015,.02,seam);}
 for(const x of[-3.8,2.8]){box(court,x,.88,-1.3,.22,.045,.15,metal);const stalk=box(court,x,1.03,-1.3,.012,.3,.012,metal);stalk.rotation.x=-.3;box(court,x,1.17,-1.34,.065,.025,.025,metal);}
 for(const [id,z,max]of[['court',-7,5],['campus',-5,3]]){const g=groups[id];for(let n=z;n<=max;n+=4){box(g,-7.72,3,n,.035,3.5,2.5,glass);for(let y=1.3;y<=4.8;y+=.43)box(g,-7.58,y,n,.12,.025,2.5,trim);
   const curtain=new T.Group();curtain.position.set(-7.45,4.9,n-1.3);g.add(curtain);for(let j=0;j<8;j++){const strip=box(curtain,.02*Math.sin(j),-1.65,j*.07,.04,3.3,.08,new T.MeshStandardMaterial({color:0xc4c1ad,roughness:1,side:T.DoubleSide}));}environmentMotion.push({object:curtain,kind:'curtain',phase:n});
 }}
 const classroom=groups.campus;box(classroom,0,4.6,-1,.6,.25,.45,trim);box(classroom,0,4.95,-1,.05,.6,.05,metal);defenseSlide(classroom);
 for(const x of[-2.2,2.2])for(const z of[-2,.5,3]){box(classroom,x+.9,.89,z+.15,.22,.045,.3,new T.MeshStandardMaterial({color:x<0?0x4b655d:0x7b5445,roughness:1}));box(classroom,x+.92,.917,z+.15,.19,.006,.27,trim);box(classroom,x+.5,.88,z-.2,.15,.015,.07,metal);}
 const outside=groups.outside;box(outside,0,4.1,-3.9,8,.16,2.1,trim);for(const x of[-3.6,3.6])box(outside,x,2,-3.1,.22,4,.22,surfaces.wall);for(let x=-7;x<=7;x+=2.5){box(outside,x,1.9,-4.63,.045,3.3,.04,metal);box(outside,x,2.8,-4.62,1.8,.045,.04,metal);}text(outside,'东教学楼  ·  教学区',-4.9,1.7,-4.5,1.6,.5,'#e2ded1','#3c524c');
 for(const x of[-5.9,5.9]){box(outside,x,.23,-2,1.4,.46,1.4,surfaces.floor);const trunk=new T.Mesh(new T.CylinderGeometry(.075,.11,2.6,12),new T.MeshStandardMaterial({color:0x5c5040,roughness:1}));trunk.position.set(x,1.6,-2);outside.add(trunk);const tree=new T.Group();tree.position.set(x,3,-2);outside.add(tree);const leaves=new T.InstancedMesh(new T.SphereGeometry(1,5,3),new T.MeshStandardMaterial({color:0x657755,roughness:1}),480);const leafPose=new T.Object3D();for(let i=0;i<480;i++){const a=rand()*Math.PI*2,r=Math.sqrt(rand())*1.05;leafPose.position.set(Math.cos(a)*r,rand()*1.4,Math.sin(a)*r);leafPose.scale.set(.09+rand()*.07,.017,.14+rand()*.1);leafPose.rotation.set(rand()*2,rand()*6,rand());leafPose.updateMatrix();leaves.setMatrixAt(i,leafPose.matrix);leaves.setColorAt(i,new T.Color().setHSL(.25+rand()*.05,.19,.23+rand()*.18));}leaves.castShadow=true;tree.add(leaves);environmentMotion.push({object:tree,kind:'tree',phase:x});}
 // Subtle moving dust in window light, not a full-screen particle overlay.
 for(const id of['court','campus']){const geo=new T.BufferGeometry(),p=new Float32Array(120*3);for(let i=0;i<p.length;i+=3){p[i]=-6+rand()*4;p[i+1]=.7+rand()*3;p[i+2]=-5+rand()*9;}geo.setAttribute('position',new T.BufferAttribute(p,3));const dust=new T.Points(geo,new T.PointsMaterial({color:0xf1dfbb,size:.014,transparent:true,opacity:.22,depthWrite:false}));groups[id].add(dust);environmentMotion.push({object:dust,kind:'dust',phase:0});}
}
export function updateEnvironment(t,reduced){if(reduced)return;for(const m of environmentMotion){if(!m.object.parent.visible)continue;if(m.kind==='dust'){m.object.position.y=Math.sin(t*.12)*.09;m.object.position.x=Math.sin(t*.08)*.06;}else m.object.rotation.z=Math.sin(t*.55+m.phase)* (m.kind==='tree'?.012:.009);}}
