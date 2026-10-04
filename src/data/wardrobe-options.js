import {layouts} from './layout-variations.js';
import {createWardrobeStudies} from './wardrobe-studies.js';
export const wardrobeOptions=createWardrobeStudies(layouts[0],layouts.find(l=>l.id==='I'));
