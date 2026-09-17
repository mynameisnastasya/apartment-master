// All geometry and collision calculations use millimetres. Avatar radius 250 mm.
export function insidePolygon(x,y,p){let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))c=!c;}return c;}
export function colliders(geometry,layout,{furniture=true,doorsOpen=true}={}){
 const walls=[...geometry.walls,...layout.partitions].filter(o=>(o.elevation||0)<1800).map(o=>({...o,kind:'wall'}));
 const objects=furniture?layout.furniture.filter(o=>o.collidable!==false&&(o.elevation||0)<1800).map(o=>({...o,kind:'furniture'})):[];
 const doors=[geometry.entry,...layout.doors].map(d=>doorsOpen?{id:d.id,x:d.openX,y:d.openY,width:d.openWidth,depth:d.openDepth,rotation:d.openRotation||0,kind:'door'}:{id:d.id,x:d.x,y:d.y,width:d.axis==='x'?d.width:40,depth:d.axis==='y'?d.width:40,rotation:d.rotation||0,kind:'door'});
 return [...walls,...objects,...doors];
}
export function hitsRect(x,y,r,o){const a=(o.rotation||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a),cx=o.x+o.width/2,cy=o.y+o.depth/2,dx=x-cx,dy=y-cy,lx=dx*c+dy*s,ly=-dx*s+dy*c,hx=o.width/2,hy=o.depth/2,px=Math.max(-hx,Math.min(lx,hx)),py=Math.max(-hy,Math.min(ly,hy));return (lx-px)**2+(ly-py)**2<r*r-.01;}
export function canStand(x,y,geometry,obstacles,r=250){return insidePolygon(x,y,geometry.floor)&&!obstacles.some(o=>hitsRect(x,y,r,o));}
export function moveWithCollision(position,dx,dy,geometry,obstacles,r=250){let {x,y}=position;const n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/50));for(let i=0;i<n;i++){if(canStand(x+dx/n,y,geometry,obstacles,r))x+=dx/n;if(canStand(x,y+dy/n,geometry,obstacles,r))y+=dy/n;}return{x,y};}
export function findRoute(start,end,geometry,obstacles,{step=75,radius=250}={}){
 const snap=p=>[Math.round(p[0]/step),Math.round(p[1]/step)];
 const valid=(x,y)=>canStand(x*step,y*step,geometry,obstacles,radius);
 const nearest=p=>{const [x,y]=snap(p);for(let r=0;r<=5;r++)for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++)if(valid(x+dx,y+dy))return[x+dx,y+dy];return null;};
 const a=nearest(start),b=nearest(end);if(!a||!b)return{ok:false,reason:'blocked endpoint',start,end};
 const key=(x,y)=>x+','+y;const queue=[a],prev=new Map([[key(...a),null]]);let goal=null;
 for(let i=0;i<queue.length;i++){const p=queue[i];if(p[0]===b[0]&&p[1]===b[1]){goal=p;break;}for(const [dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=p[0]+dx,ny=p[1]+dy,k=key(nx,ny);if(!prev.has(k)&&valid(nx,ny)){prev.set(k,p);queue.push([nx,ny]);}}}
 if(!goal)return{ok:false,reason:'no connected route',start,end};let path=[];for(let p=goal;p;p=prev.get(key(...p)))path.push([p[0]*step,p[1]*step]);path.reverse();
 return{ok:true,path,lengthMm:(path.length-1)*step,requestedStart:start,requestedEnd:end,endpointSnapMm:[Math.hypot(path[0][0]-start[0],path[0][1]-start[1]),Math.hypot(path.at(-1)[0]-end[0],path.at(-1)[1]-end[1])]};
}
