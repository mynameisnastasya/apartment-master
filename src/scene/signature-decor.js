import * as THREE from 'three';

const mm=n=>n/1000;
const cream=new THREE.MeshStandardMaterial({color:0xe9dfcb,roughness:.94,side:THREE.DoubleSide,vertexColors:true});
const gold=new THREE.MeshStandardMaterial({color:0xb49a68,metalness:.62,roughness:.33});
const berry=new THREE.MeshStandardMaterial({color:0x553b4a,roughness:.75});
const paper=new THREE.MeshStandardMaterial({color:0xf7ede1,roughness:1});
const blue=new THREE.MeshStandardMaterial({color:0xa0b4bd,roughness:.92});
const blush=new THREE.MeshStandardMaterial({color:0xdcaca6,roughness:.94});
const honey=new THREE.MeshStandardMaterial({color:0xc6945f,roughness:.9});
const ink=new THREE.MeshStandardMaterial({color:0x3b4053,roughness:.85});
function block(g,material,x,y,z,w,d,h,round=0){
 const geo=round?new THREE.SphereGeometry(1,16,12):new THREE.BoxGeometry(mm(w),mm(h),mm(d));
 const o=new THREE.Mesh(geo,material);o.position.set(mm(x),mm(z),mm(y));
 if(round)o.scale.set(mm(w/2),mm(h/2),mm(d/2));
 o.castShadow=true;g.add(o);return o;
}
function arc(g,material,x,y,z,r,thick){
 const o=new THREE.Mesh(new THREE.TorusGeometry(mm(r),mm(thick),8,96),material);
 o.rotation.y=Math.PI/2;o.position.set(mm(x),mm(z),mm(y));g.add(o);return o;
}
export function createSignatureDecor(layout,m){
 const g=new THREE.Group();g.name='PERSONAL_DETAILS';
 const byId=id=>layout.furniture.find(o=>o.id===id);
 const wallX=layout.partitions.find(o=>o.id==='divider-lower')?.x||layout.partitions.find(o=>o.id==='d-adult-divider').x;
 const wallY=6810;
 // Two-metre sculpted moon: real displacement makes the craters catch grazing light.
 const N=116,R=965,cx=wallX-90,cy=wallY,cz=1510;
 const pits=[[.1,.07,.18],[-.46,.30,.13],[.46,.38,.11],[-.24,-.42,.19],[.45,-.39,.16],
  [-.57,-.2,.08],[.04,.64,.1],[.7,.02,.08],[-.1,-.05,.06],[.18,-.66,.09],
  [-.63,.55,.06],[.56,.67,.045],[-.39,-.65,.065],[.33,.15,.05]];
 const positions=[],colors=[],uv=[],index=[];
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){
  const u=i/N*2-1,v=j/N*2-1,rr=u*u+v*v;
  let relief=6*Math.sin(u*31+v*18)*Math.sin(v*37-u*12)+4*Math.sin(u*73+v*51);
  let shade=.83+.06*Math.sin(u*18)*Math.sin(v*22)+.035*Math.sin(u*84+v*61);
  for(const [px,py,pr] of pits){
   const d=Math.hypot(u-px,v-py)/pr;
   relief+=22*Math.exp(-Math.pow((d-1)/.18,2))-32*Math.exp(-d*d*2.8);
   shade-=.105*Math.exp(-d*d*2.7);shade+=.045*Math.exp(-Math.pow((d-1)/.19,2));
  }
  positions.push(mm(cx-relief),mm(cz+v*R),mm(cy+u*R));
  colors.push(shade,shade*.96,shade*.87);uv.push(i/N,j/N);
 }
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  const u=(i+.5)/N*2-1,v=(j+.5)/N*2-1;
  if(u*u+v*v>.995)continue;
  const a=j*(N+1)+i,b=a+1,c=a+N+1,d=c+1;
  index.push(a,b,c,b,d,c);
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geometry.setIndex(index);geometry.computeVertexNormals();
 const moon=new THREE.Mesh(geometry,cream);moon.castShadow=true;moon.receiveShadow=true;g.add(moon);
 arc(g,gold,cx+24,cy,cz,R+9,8);
 const halo=new THREE.Mesh(new THREE.RingGeometry(1,1.052,96),new THREE.MeshBasicMaterial({color:0xffdda1,transparent:true,opacity:.35,side:THREE.DoubleSide,depthWrite:false}));
 halo.rotation.y=Math.PI/2;halo.position.set(mm(cx+42),mm(cz),mm(cy));g.add(halo);

 const vanity=byId('adult-dresser');
 if(vanity){
  const vy=vanity.y+vanity.depth/2;
  // Organic mirror above the writing surface, plus a small tray of ritual objects.
  const mirror=new THREE.Mesh(new THREE.SphereGeometry(1,32,24),m.glass);
  mirror.scale.set(.014,.39,.27);mirror.position.set(.042,1.38,mm(vy));g.add(mirror);
  for(let i=0;i<9;i++){
   const t=i*Math.PI*2/9;
   block(g,gold,215+Math.cos(t)*150,vy+Math.sin(t)*158,vanity.height+3,66,104,3);
   block(g,berry,215+Math.cos(t)*150,vy+Math.sin(t)*158,vanity.height+7,52,88,2);
   const star=new THREE.Mesh(new THREE.OctahedronGeometry(.013,0),gold);star.position.set(mm(215+Math.cos(t)*150),mm(vanity.height+11),mm(vy+Math.sin(t)*158));g.add(star);
  }
  block(g,blush,300,vanity.y+110,vanity.height+8,140,115,18,true);
  for(let i=0;i<5;i++){
   const rune=new THREE.Mesh(new THREE.IcosahedronGeometry(.023+i%2*.004,0),i%2?paper:honey);
   rune.position.set(mm(225+i*27),mm(vanity.height+24),mm(vanity.y+113+i%2*26));g.add(rune);
   const mark=new THREE.Mesh(new THREE.BoxGeometry(.002,.001,.026),ink);mark.position.copy(rune.position);mark.position.y+=.025;mark.rotation.y=i*.7;g.add(mark);
  }
  block(g,m.upholstery,660,vanity.y+440,270,300,310,440,true); // tuck-in upholstered stool
 }
 const toys=byId('alice-toys');
 if(toys){
  const sx=toys.x+toys.width/2,sy=toys.y;
  // Low book spines, baskets and a soft rabbit live on the child's shelf.
  for(let i=0;i<11;i++)block(g,[honey,blush,blue,paper][i%4],sx,sy+70+i*52,445,115,34,205-i%3*23);
  for(let i=0;i<3;i++)block(g,[blush,honey,blue][i],sx,sy+135+i*200,105,225,160,160,true);
  block(g,paper,sx,sy+355,925,210,205,215,true);
  block(g,paper,sx-67,sy+285,1085,48,48,150,true);
  block(g,paper,sx+67,sy+285,1085,48,48,150,true);
  block(g,blush,sx-39,sy+270,1010,12,8,12,true);
  block(g,blush,sx+39,sy+270,1010,12,8,12,true);
  const child=byId('alice-bed');
  if(child){
   // A constellation mural and a low, washable play mat near the bed.
   const y=child.y+child.depth/2;
   for(let i=0;i<15;i++){
    const yy=y-720+(i*271)%1440,zz=1120+(i*397)%1090;
    const star=new THREE.Mesh(new THREE.OctahedronGeometry(.022+i%3*.01),i%3?gold:blush);
    star.position.set(6.334,mm(zz),mm(yy));g.add(star);
   }
   const rug=new THREE.Mesh(new THREE.CircleGeometry(.53,64),new THREE.MeshStandardMaterial({color:0xc69f92,roughness:1,side:THREE.DoubleSide}));
   rug.rotation.x=-Math.PI/2;rug.position.set(5.43,.018,6.53);rug.receiveShadow=true;g.add(rug);
  }
 }
 return g;
}
