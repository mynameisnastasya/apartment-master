import geometry from './geometry.json';
import baseLayouts from './layouts.json';
import referenceLayout from './layout-reference.json';
import project from './project.json';
export const layouts=[referenceLayout,...baseLayouts.map(layout=>({...layout,recommended:false}))];
export {geometry,project};
export const mm = value => value / 1000;
export const metersToMm = value => value * 1000;
export const roomNames={adult:'Спальня',alice:'Вторая спальня',kitchen:'Кухня',living:'Кухня-гостиная',bath:'Санузел',entry:'Прихожая'};
export function polygonArea(p){return Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0]},0))/2;}
