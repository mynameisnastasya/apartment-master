import assert from 'node:assert/strict';
import * as THREE from 'three';
import {layouts} from '../src/data/layout-variations.js';
import {createFurniture} from '../src/scene/furniture.js';
import {createSignatureDecor} from '../src/scene/signature-decor.js';

const layout=layouts.find(l=>l.id==='L');
assert.ok(layout,'Reference-derived L plan is available');
const finish=new THREE.MeshStandardMaterial({color:0xddd6ca});
const names=['wall','joinery','marble','bronze','lamp','shadow','lacquer','upholstery','bedding','mirror','glass','wine','olive','fixture'];
const m=Object.fromEntries(names.map(key=>[key,finish]));
m.wall=new THREE.MeshStandardMaterial();m.wall.userData.warmModern=true;
const decor=createSignatureDecor(layout,m);
const bed=id=>layout.furniture.find(o=>o.id===id);
const bounds=name=>{
 const mesh=decor.getObjectByName(name);
 assert.ok(mesh,'Missing visual anchor '+name);
 return new THREE.Box3().setFromObject(mesh);
};
for(const [id,part] of [['adult-bed','adult-walnut-headboard-panel'],['alice-bed','alice-oak-headboard-panel']]){
 const b=bed(id),panel=bounds(part);
 const east=(b.x+(b.width+b.depth)/2)/1000;
 const minY=(b.y+(b.depth-b.width)/2)/1000;
 const maxY=minY+b.width/1000;
 assert.ok(panel.min.x>=east+.008,`${part} clips bed frame`);
 assert.ok(panel.min.z<=minY+.001&&panel.max.z>=maxY-.001,`${part} fails to cover rotated bed`);
 assert.ok(panel.max.y<=2.7,`${part} sticks through ceiling`);
 const edge=id==='adult-bed'?3.175:6.4;
 assert.ok(panel.max.x<edge,`${part} pierces east partition`);
}
const adult=bed('adult-bed');
const southEnd=(adult.y+(adult.depth+adult.width)/2)/1000;
assert.ok(bounds('floating-stone-shelf').min.z>=southEnd+.2,'Floating shelf clips bed / window route');
const shoe=bed('hall-wardrobe');
assert.equal(shoe.type,'storage');
const shoeRender=createFurniture(shoe,m);
const shoeBounds=new THREE.Box3().setFromObject(shoeRender);
assert.ok(shoeBounds.min.x>=shoe.x/1000-.001&&shoeBounds.max.x<=(shoe.x+shoe.width)/1000+.001,'Entry cabinet rendering leaks beyond collision envelope');
assert.ok(shoeBounds.min.z>=shoe.y/1000-.001&&shoeBounds.max.z<=(shoe.y+shoe.depth)/1000+.001,'Entry cabinet rendering blocks more space than collision model');
assert.ok(shoeRender.getObjectByName('shoe-cabinet-stone-top'),'Missing cabinet detail');
const mirror=bed('mirror');
const mirrorRender=createFurniture(mirror,m);
const face=mirrorRender.getObjectByName('mirror-face');
assert.ok(face?.isMesh&&face.material===m.mirror,'Entry mirror must be reflective, not see-through glass');
assert.ok(face.geometry.parameters.width>.5&&face.geometry.parameters.height>1.5,'Mirror glass too small');
console.log('L visual + furniture QA: mirrored entry, shoe cabinet envelope, bed-aligned panels, clear shelf (passed)');
