import raw from './modpacks.json';import type {Modpack} from './types';
export const modpacks=raw as Modpack[];
const ids=new Set<string>();for(const item of modpacks){if(ids.has(item.id))throw new Error(`ID modpack duplikat: ${item.id}`);ids.add(item.id);if(!item.downloads?.length||item.downloads.some(d=>!d.url))throw new Error(`URL unduhan kosong: ${item.id}`)}
export const categories=[...new Set(modpacks.filter(m=>m.type==='modpack').flatMap(m=>m.categories))].sort();
export const versions=[...new Set(modpacks.filter(m=>m.type==='modpack'&&!m.isArchived).map(m=>m.minecraft).filter((v):v is string=>!!v))].sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));
export const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
