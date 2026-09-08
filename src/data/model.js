import geometry from './geometry.json';
import layouts from './layouts.json';
import project from './project.json';
export {geometry,layouts,project};
export const mm = value => value / 1000;
export const metersToMm = value => value * 1000;
export const roomNames={adult:'Ваша спальня',alice:'Комната Алисы',kitchen:'Кухня',living:'Гостиная',bath:'Санузел',entry:'Прихожая'};
export function polygonArea(p){return Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0]},0))/2;}
