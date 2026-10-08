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
// Trend-led decorations must not repeat the old mistake: a beautiful mesh
// visually blocking a room while staying invisible to 2D circulation tests.
const dining=bed('dining'),sculpture=bounds('trend-sculptural-pendant');
assert.ok(sculpture.min.y>=2.0&&sculpture.max.y<=2.7,'Sculptural pendant must clear head height and ceiling');
assert.ok(sculpture.min.x>=dining.x/1000&&sculpture.max.x<=(dining.x+dining.width)/1000,'Pendant must stay over the peninsula');
assert.ok(sculpture.min.z>=dining.y/1000&&sculpture.max.z<=(dining.y+dining.depth)/1000,'Pendant must stay inside peninsula plan');
assert.ok(decor.getObjectByName('trend-pendant-warm-pool')?.isRectAreaLight,'Missing pendant light layer');
const kitchen=layout.furniture.find(o=>o.id==='fridge');
const fridge=createFurniture(kitchen,m),integrated=fridge.getObjectByName('trend-integrated-fridge-front');
assert.ok(integrated,'Handleless refrigerator front missing');
const frontBounds=new THREE.Box3().setFromObject(integrated);
assert.ok(frontBounds.min.x>=kitchen.x/1000-.001&&frontBounds.max.x<=(kitchen.x+kitchen.width)/1000+.001,'Fridge front extends outside appliance x footprint');
assert.ok(frontBounds.min.z>=kitchen.y/1000-.001&&frontBounds.max.z<=(kitchen.y+kitchen.depth)/1000+.001,'Fridge front extends into appliance clearance');
const bar=createFurniture(dining,{...m,darkStone:finish});
assert.ok(bar.getObjectByName('trend-stone-peninsula-lip'),'Sculpted peninsula stone top missing');
const kitchenFronts=[];decor.traverse(o=>{if(o.name==='trend-concealed-kitchen-front')kitchenFronts.push(o)});
assert.equal(kitchenFronts.length,2,'Kitchen joinery panels should form one quiet concealed line');
for(const panel of kitchenFronts){
 const p=new THREE.Box3().setFromObject(panel);
 assert.ok(p.max.z<.35&&p.min.y>1.7&&p.max.y<2.5,'Concealed kitchen doors must live on original overhead kitchen face');
}
const art=[];decor.traverse(o=>{if(o.name==='trend-entry-ceramic-relief')art.push(o)});
assert.equal(art.length,3,'Expect a restrained trio of wall relief pieces');
for(const piece of art){
 const p=new THREE.Box3().setFromObject(piece);
 assert.ok(p.min.x>=6.34&&p.max.x<=6.4,'Entry art must not block approach to exterior wall');
 assert.ok(p.min.z>1.1&&p.min.y>.9,'Entry art must clear entrance aperture and low shoe cabinet');
}
console.log('L trend QA: integrated refrigerator, sculptural pendant, wall art and overhead storage remain out of circulation (passed)');
console.log('L visual + furniture QA: mirrored entry, shoe cabinet envelope, bed-aligned panels, clear shelf (passed)');
