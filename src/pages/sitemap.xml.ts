import type { APIRoute } from 'astro';

const pages = [
  '',
  'komunitas/',
  'modpacks/',
  'zalith/',
  'casda-network/'
];

export const GET: APIRoute = async () => {
  const siteUrl = 'https://gyzenn-communityy.vercel.app';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${siteUrl}/${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
};
