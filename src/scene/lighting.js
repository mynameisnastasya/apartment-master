import * as THREE from 'three';
export function addLighting(scene){
 const g=new THREE.Group();g.name='LIGHTING_TECHNICAL';
 g.add(new THREE.HemisphereLight(0xfff9ef,0xb6b0a5,1.0));
 const key=new THREE.DirectionalLight(0xfff8eb,2.0);key.position.set(-3,10,9);key.target.position.set(3,0,4);key.castShadow=true;
 key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.5,far:25});key.shadow.normalBias=.045;key.shadow.bias=-.0003;key.shadow.radius=3;
 // Keep the key in position 1: only this light casts shadows.
 g.add(key);g.add(key.target);
 const fill=new THREE.DirectionalLight(0xe7efff,.45);fill.position.set(9,6,-3);g.add(fill);
 for(const [x,z,intensity,distance] of [[1.1,1.2,3.5,3.8],[3.5,1.0,2.5,2.8],[1.3,3.5,3,4.2],[2.1,6.2,2,3.6],[4.7,5.5,2,3.6]]){const lamp=new THREE.PointLight(0xffe7c7,intensity,distance,2);lamp.position.set(x,2.3,z);lamp.castShadow=false;g.add(lamp);}
 scene.add(g);return g;
}
