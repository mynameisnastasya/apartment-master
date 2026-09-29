import * as THREE from 'three';

export function addLighting(scene){
 const g=new THREE.Group();g.name='LIGHTING_EDITORIAL';

 // Ambient level stays intentionally low so material relief and integrated light read.
 g.add(new THREE.HemisphereLight(0xfff2df,0x77736e,.58));

 // One broad daylight key. main.js relies on this being child index 1.
 const key=new THREE.DirectionalLight(0xfff0dd,1.65);
 key.position.set(-3.5,9.5,8.5);key.target.position.set(2.7,0,3.8);key.castShadow=true;
 key.shadow.mapSize.set(2048,2048);
 Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.5,far:25});
 key.shadow.normalBias=.045;key.shadow.bias=-.0003;key.shadow.radius=3;
 g.add(key);g.add(key.target);

 // Quiet reflected fill from the entry side; no ceiling-grid effect.
 const fill=new THREE.DirectionalLight(0xdde3e1,.24);fill.position.set(8,5,-2);g.add(fill);

 const aim=(color,intensity,distance,angle,penumbra,pos,target)=>{
  const s=new THREE.SpotLight(color,intensity,distance,angle,penumbra,1.5);
  s.position.set(...pos);s.target.position.set(...target);s.castShadow=false;g.add(s);g.add(s.target);return s;
 };

 // Kitchen stone lantern: narrow grazing light from the ceiling edge.
 aim(0xffd9aa,25,5.5,.48,.78,[1.2,2.58,1.25],[.65,.74,2.2]);
 // Living wall: warmer and softer, aimed at the architectural portal rather than the sofa.
 aim(0xffd0a0,18,5.0,.56,.84,[1.9,2.5,3.9],[.12,1.0,3.62]);
 // Adult headboard: low-intensity wall wash that makes timber and upholstery read in relief.
 aim(0xffc98f,14,4.4,.62,.9,[1.75,2.52,6.55],[3.02,1.28,6.6]);
 // Bathroom mirror / stone: slightly cleaner light for faces without turning the room clinical.
 aim(0xffe6c9,17,3.8,.52,.86,[3.2,2.48,.8],[2.58,1.35,.18]);

 scene.add(g);return g;
}
