import * as THREE from 'three';

// Tailored fabric surfaces, in metres. Deterministic folds keep exports identical.
const signedPow=(v,p)=>Math.sign(v)*Math.pow(Math.abs(v),p);
export function cushion(parent,material,x,z,w,d,h,e,{upright=false,seed=1}={}){
 const group=new THREE.Group();group.name='tailored-cushion';
 const geo=new THREE.SphereGeometry(1,48,28),p=geo.attributes.position;
 for(let i=0;i<p.count;i++){
  const a=p.getX(i),b=p.getY(i),c=p.getZ(i);
  const xx=signedPow(a,.48)*w/2,zz=signedPow(c,.48)*d/2;
  const edge=Math.max(Math.abs(xx)/(w/2),Math.abs(zz)/(d/2));
  const crease=Math.sin(xx*88+zz*11+seed)*Math.exp(-Math.pow((edge-.86)*12,2))*.0025;
  const yy=signedPow(b,.65)*h/2+crease*Math.abs(b);
  p.setXYZ(i,xx,yy,zz);
 }
 geo.computeVertexNormals();
 const body=new THREE.Mesh(geo,material);body.castShadow=body.receiveShadow=true;group.add(body);
 const pts=[];
 for(let i=0;i<=128;i++){
  const a=i/128*Math.PI*2;
  pts.push(new THREE.Vector3(signedPow(Math.cos(a),.48)*w*.496,0,signedPow(Math.sin(a),.48)*d*.496));
 }
 const seam=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),128,.0015,5,true),material);
 seam.name='continuous-piping';group.add(seam);
 if(upright)group.rotation.x=Math.PI/2-.10;
 group.position.set(x,e,z);parent.add(group);return group;
}

export function drape(parent,material,{x,z,width,depth,height,drop=.12,seed=0,name='draped-linen',support=null}){
 const geo=new THREE.PlaneGeometry(width,depth,80,72),p=geo.attributes.position;
 const point=(u,v)=>{
  const side=Math.pow(Math.max(0,(Math.abs(u)/(width/2)-.84)/.16),1.65);
  const foot=Math.pow(Math.max(0,(v/(depth/2)-.82)/.18),1.5);
  const waves=.010*Math.sin(u*24+v*7+seed)+.005*Math.sin(u*49-v*13)+.003*Math.sin(v*58+u*15);
  const diagonal=.022*Math.exp(-Math.pow((u*.7+v-.17)*11,2));
  const elevation=height+waves+diagonal-drop*Math.max(side,foot);
  return new THREE.Vector3(u,support?Math.max(elevation,support(x+u,z+v)+.008):elevation,v);
 };
 for(let i=0;i<p.count;i++){const q=point(p.getX(i),-p.getY(i));p.setXYZ(i,q.x,q.y,q.z);}
 geo.computeVertexNormals();
 const cloth=new THREE.Mesh(geo,material);cloth.position.set(x,0,z);cloth.castShadow=cloth.receiveShadow=true;cloth.name=name;parent.add(cloth);
 cloth.userData.surfaceHeight=(worldX,worldZ)=>point(worldX-x,worldZ-z).y;
 const edge=[];const n=80;
 for(let i=0;i<=n;i++)edge.push(point(-width/2+width*i/n,-depth/2));
 for(let i=1;i<=n;i++)edge.push(point(width/2,-depth/2+depth*i/n));
 for(let i=1;i<=n;i++)edge.push(point(width/2-width*i/n,depth/2));
 for(let i=1;i<=n;i++)edge.push(point(-width/2,depth/2-depth*i/n));
 const hem=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edge,true),240,.002,5,true),material);
 hem.position.copy(cloth.position);hem.name='stitched-hem';parent.add(hem);
 return cloth;
}
