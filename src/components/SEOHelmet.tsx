import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  noIndex?: boolean;
  schemaData?: object;
}

const SEOHelmet: React.FC<SEOHelmetProps> = ({
  title = 'ساعة منارة | ساعة المسجد الذكية لعرض أوقات الصلاة والأذان',
  description = 'ساعة منارة - ساعة المسجد الذكية والتلفزيونية لعرض أوقات الصلاة والأذان بدقة عالية. نظام متطور لإدارة شاشات المساجد مع عرض الأدعية والإعلانات والمحتوى الدعوي.',
  keywords = 'ساعة المسجد الذكية, ساعة مسجد, ساعة منارة, ساعة المسجد التلفزيونية, ساعة اوقات الاذن, أوقات الصلاة, شاشة المسجد, مواقيت الصلاة',
  ogImage = 'https://manarah-display.netlify.app/logo MANARAH25-01.png',
  ogUrl = 'https://manarah-display.netlify.app/',
  canonical = 'https://manarah-display.netlify.app/',
  noIndex = false,
  schemaData
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="ar_SA" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      <link rel="canonical" href={canonical} />

      {schemaData && (
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHelmet;
