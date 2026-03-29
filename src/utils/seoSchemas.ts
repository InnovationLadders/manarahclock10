import { MosqueData } from '../types';

export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ساعة منارة للمساجد',
  alternateName: 'Manarah Mosque Display',
  url: 'https://manarahclock.net',
  logo: 'https://manarahclock.net/logo MANARAH25-01.png',
  description: 'نظام ساعة المسجد الذكية من منارة لعرض أوقات الصلاة والأذان بدقة عالية مع محتوى دعوي متنوع',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+966-55-434-4899',
    contactType: 'Sales',
    email: 'sales@innovationladders.com',
    areaServed: 'SA',
    availableLanguage: ['ar', 'en']
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'جدة',
    addressRegion: 'مكة المكرمة',
    addressCountry: 'SA'
  },
  founder: {
    '@type': 'Organization',
    name: 'سلالم الإبداع',
    alternateName: 'Innovation Ladders'
  }
});

export const generateWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ساعة منارة للمساجد',
  url: 'https://manarahclock.net',
  description: 'ساعة المسجد الذكية لعرض أوقات الصلاة والأذان',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://manarahclock.net/?search={search_term_string}'
    },
    'query-input': 'required name=search_term_string'
  },
  inLanguage: 'ar'
});

export const generateSoftwareApplicationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ساعة منارة',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Web Browser, iOS, Android',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'SAR'
  },
  description: 'تطبيق ساعة المسجد الذكية لعرض أوقات الصلاة والأذان والمحتوى الدعوي',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150'
  }
});

export const generateMosqueSchema = (mosque: MosqueData) => ({
  '@context': 'https://schema.org',
  '@type': 'PlaceOfWorship',
  '@id': `https://manarahclock.net/mosque/${mosque.id}`,
  name: mosque.mosqueName,
  description: `ساعة المسجد الذكية لـ ${mosque.mosqueName} - عرض أوقات الصلاة والأذان`,
  image: mosque.imageUrl || 'https://images.pexels.com/photos/2233416/pexels-photo-2233416.jpeg',
  address: {
    '@type': 'PostalAddress',
    addressLocality: mosque.location.city,
    addressCountry: mosque.location.country
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: mosque.location.latitude,
    longitude: mosque.location.longitude
  },
  url: `https://manarahclock.net/mosque/${mosque.id}`,
  additionalType: 'https://schema.org/Mosque'
});

export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
});

export const generateLocalBusinessSchema = (mosque: MosqueData) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: mosque.mosqueName,
  description: `${mosque.mosqueName} - مسجد في ${mosque.location.city}، ${mosque.location.country}`,
  image: mosque.imageUrl || 'https://images.pexels.com/photos/2233416/pexels-photo-2233416.jpeg',
  '@id': `https://manarahclock.net/mosque/${mosque.id}`,
  url: `https://manarahclock.net/mosque/${mosque.id}`,
  telephone: '+966-55-434-4899',
  address: {
    '@type': 'PostalAddress',
    streetAddress: mosque.location.city,
    addressLocality: mosque.location.city,
    addressRegion: mosque.location.city,
    addressCountry: mosque.location.country
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: mosque.location.latitude,
    longitude: mosque.location.longitude
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ],
      opens: '00:00',
      closes: '23:59'
    }
  ]
});
