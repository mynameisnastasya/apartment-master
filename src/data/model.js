import geometry from './geometry.json' with {type:'json'};
import {layouts} from './layout-variations.js';
import project from './project.json' with {type:'json'};
export {layouts};
export {geometry,project};
export const mm = value => value / 1000;
export const metersToMm = value => value * 1000;
export const roomNames={adult:'Спальня',alice:'Вторая спальня',kitchen:'Кухня',living:'Кухня-гостиная',bath:'Санузел',entry:'Прихожая',dressing:'Гардеробная'};
export function polygonArea(p){return Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0]},0))/2;}
