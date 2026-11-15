export interface Download {
  label: string;
  url: string;
  type?: string;
  host?: string;
}
export interface Modpack {
  id: string;
  type: string;
  name: string;
  displayTitle?: string | null;
  version: string | null;
  minecraft: string | null;
  loader?: string | null;
  loaderVersion?: string | null;
  categories: string[];
  status?: string;
  isNew?: boolean;
  isRecommended?: boolean;
  isArchived?: boolean;
  badges?: string[];
  image?: string | null;
  imageAlt?: string | null;
  description: string;
  features?: string[];
  extraMods?: string[];
  extraModsNote?: string | null;
  additionalMods?: string[];
  resourcepacks?: string[];
  note?: { type: string; text: string } | null;
  credits?: string[];
  tips?: string[];
  downloads: Download[];
  theme?: string;
  edition?: string | null;
  ticker?: boolean;
  mods?: string[];
  verify?: string[];
}
export interface Apk {
  filename: string;
  arch: string;
  description: string;
  size: string;
  url: string;
  icon?: string;
  universal: boolean;
}
export interface SiteLinks {
  linktree: string;
  tiktok: string;
  whatsappChannel: string;
  whatsappGroup1: string;
  whatsappGroup2: string;
  discord: string;
  discordCasda: string;
  saweria: string;
}
export interface Site {
  title: string;
  subtitle: string;
  author: string;
  deviceSpec: string;
  links: SiteLinks;
  stats: {
    tiktokLikes: number;
    tiktokFollowers: number;
    tiktokFollowing: number;
    whatsappFollowers: number;
  };
  ticker: { icon: string; text: string }[];
}
export interface Zalith {
  version: string;
  developer: string;
  status: string;
  title: string;
  subtitle: string;
  changelog: { title: string; text: string }[];
  apks: Apk[];
}
