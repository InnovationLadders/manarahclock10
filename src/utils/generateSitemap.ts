import { MosqueData } from '../types';

export const generateSitemap = (mosques: MosqueData[]): string => {
  const baseUrl = 'https://manarah-display.netlify.app';
  const currentDate = new Date().toISOString().split('T')[0];

  const urls = [
    {
      loc: baseUrl,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0'
    },
    ...mosques.map(mosque => ({
      loc: `${baseUrl}/mosque/${mosque.id}`,
      lastmod: mosque.createdAt.toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8'
    }))
  ];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xmlContent;
};

export const downloadSitemap = (mosques: MosqueData[]) => {
  const sitemapContent = generateSitemap(mosques);
  const blob = new Blob([sitemapContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
