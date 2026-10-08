import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {SMAAPass} from 'three/addons/postprocessing/SMAAPass.js';

export class RealismRenderer {
 constructor(renderer,scene,camera){
  this.renderer=renderer;this.scene=scene;
  this.composer=new EffectComposer(renderer);
  this.base=new RenderPass(scene,camera);this.composer.addPass(this.base);
  this.ao=new GTAOPass(scene,camera,1,1,undefined,{radius:.23,thickness:.12,distanceExponent:2,distanceFallOff:1,scale:1,samples:12,screenSpaceRadius:false});
  this.ao.blendIntensity=.65;this.composer.addPass(this.ao);
  this.composer.addPass(new OutputPass());this.composer.addPass(new SMAAPass());
 }
 setPhotographic(value){this.ao.blendIntensity=value?.78:.65;}
 resize(w,h){this.composer.setPixelRatio(Math.min(this.renderer.getPixelRatio(),1.5));this.composer.setSize(w,h);}
 render(camera,enabled){
  // Plan/orthographic views stay crisp; mobile can use the same detailed models without AO.
  if(!enabled||!camera.isPerspectiveCamera){this.renderer.render(this.scene,camera);return;}
  this.base.camera=camera;this.ao.camera=camera;
  if(this.ao.gtaoMaterial.defines.PERSPECTIVE_CAMERA!==1){this.ao.gtaoMaterial.defines.PERSPECTIVE_CAMERA=1;this.ao.gtaoMaterial.needsUpdate=true;}
  this.composer.render();
 }
 dispose(){this.ao.dispose();this.composer.passes.forEach(p=>{if(p!==this.ao)p.dispose?.();});this.composer.dispose();}
}
