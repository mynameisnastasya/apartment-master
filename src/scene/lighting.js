import * as THREE from 'three';
export function addLighting(scene){
 const g=new THREE.Group();g.name='LIGHTING_TECHNICAL';
 g.add(new THREE.HemisphereLight(0xffffff,0xaab0ae,1.25));
 const key=new THREE.DirectionalLight(0xffffff,2.35);key.position.set(-5,12,7);key.castShadow=true;
 key.shadow.mapSize.set(3072,3072);
 Object.assign(key.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.1,far:35});
 key.shadow.normalBias=.015;key.shadow.bias=-.00015;key.shadow.radius=3;g.add(key);
 const fill=new THREE.DirectionalLight(0xffffff,.5);fill.position.set(8,7,-5);g.add(fill);
 for(const [x,z,power,distance] of [[1.1,1.2,38,3.8],[3.5,1.0,26,2.8],[1.3,3.5,36,4.2],[2.1,6.2,25,3.6],[4.7,5.5,28,3.6]]){
  const lamp=new THREE.PointLight(0xffe7c7,power,distance,2);lamp.position.set(x,2.25,z);g.add(lamp);
 }
 scene.add(g);return g;
}
