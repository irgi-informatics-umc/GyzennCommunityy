import type {ImageMetadata} from 'astro';
const images=import.meta.glob<ImageMetadata>('../assets/img/*',{eager:true,import:'default'});
export function imageFor(path:string|undefined|null){if(!path)return undefined;const file=path.split('/').pop();return file?images[`../assets/img/${file}`]:undefined}
