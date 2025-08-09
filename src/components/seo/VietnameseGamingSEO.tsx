import Script from 'next/script'

import { OrganizationSchema, ServiceSchema, FAQSchema } from './StructuredData'

// Vietnamese gaming-specific structured data
export function VietnameseGamingSchema() {
  const organizationData = {
    name: 'RoK Services Vietnam',
    url: 'https://rokdbot.com',
    description:
      'Dịch vụ Rise of Kingdoms chuyên nghiệp tại Việt Nam - Tư vấn chiến thuật, quản lý liên minh, training commander',
    address: 'Hồ Chí Minh, Việt Nam',
    phone: '+84123456789',
    email: 'contact@rokdbot.com'
  }

  const serviceData = {
    name: 'Dịch vụ Rise of Kingdoms chuyên nghiệp',
    description:
      'Tư vấn chiến thuật, quản lý liên minh, training commander cho game Rise of Kingdoms tại Việt Nam',
    provider: 'RoK Services Vietnam',
    areaServed: 'Vietnam',
    serviceType: 'Gaming Consulting Services',
    offers: [
      {
        name: 'Tư vấn chiến thuật cơ bản',
        price: '750000',
        currency: 'VND',
        description: 'Phân tích tài khoản, tư vấn build commander, farm gem 4-7k/ngày'
      },
      {
        name: 'Tư vấn chiến thuật Pro',
        price: '900000',
        currency: 'VND',
        description: 'Tư vấn toàn diện, farm gem 8-15k/ngày, hỗ trợ KvK'
      },
      {
        name: 'Tư vấn chiến thuật Premium',
        price: '1200000',
        currency: 'VND',
        description: 'Coaching cá nhân, farm gem 12-20k/ngày, hỗ trợ 24/7'
      }
    ]
  }

  const faqData = [
    {
      question: 'Dịch vụ Rise of Kingdoms có an toàn không?',
      answer:
        'Hoàn toàn an toàn! Chúng tôi chỉ sử dụng các phương pháp được Lilith Games cho phép. Tỷ lệ bị ban < 0.1% và chúng tôi bảo hiểm 100% tài khoản.'
    },
    {
      question: 'Bao lâu để thấy kết quả cải thiện power trong RoK?',
      answer:
        'Thông thường bạn sẽ thấy cải thiện rõ rệt trong 2-3 tuần đầu. Power tăng 30-50% trong tháng đầu là hoàn toàn bình thường với chiến thuật của chúng tôi.'
    },
    {
      question: 'Có hỗ trợ farm gem Rise of Kingdoms không?',
      answer:
        'Có! Chúng tôi hướng dẫn farm gem an toàn 4-20k gems/ngày tùy theo gói dịch vụ. Phương pháp được kiểm chứng qua 500+ khách hàng thành công.'
    },
    {
      question: 'Dịch vụ có phù hợp với F2P players Rise of Kingdoms không?',
      answer:
        'Tuyệt đối! Nhiều khách hàng F2P của chúng tôi đã tăng power 150-200% và cạnh tranh được với low spenders nhờ chiến thuật tối ưu.'
    }
  ]

  return (
    <>
      <OrganizationSchema {...organizationData} />
      <ServiceSchema {...serviceData} />
      <FAQSchema faqs={faqData} />
    </>
  )
}

// Vietnamese gaming keywords optimization
export function VietnameseKeywordsOptimization() {
  const keywordSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Dịch vụ Rise of Kingdoms Việt Nam - RoK Services chuyên nghiệp',
    description:
      'Dịch vụ Rise of Kingdoms hàng đầu Việt Nam: tư vấn chiến thuật RoK, farm gem, build commander, quản lý liên minh. Tăng power 100-200% an toàn.',
    keywords: [
      'dịch vụ rise of kingdoms',
      'tư vấn chiến thuật rok',
      'rise of kingdoms việt nam',
      'coaching rise of kingdoms',
      'farm gem rok',
      'build commander rok',
      'quản lý liên minh rok',
      'kvk support vietnam',
      'rok services vietnam',
      'rise of kingdoms coaching',
      'chiến thuật rise of kingdoms',
      'hướng dẫn rise of kingdoms',
      'rok gem farming',
      'rise of kingdoms strategy',
      'rok power increase',
      'rise of kingdoms tips vietnam'
    ],
    inLanguage: 'vi-VN',
    audience: {
      '@type': 'Audience',
      audienceType: 'Vietnamese Rise of Kingdoms Players',
      geographicArea: {
        '@type': 'Country',
        name: 'Vietnam'
      }
    },
    about: [
      {
        '@type': 'Thing',
        name: 'Rise of Kingdoms',
        description: 'Strategy mobile game by Lilith Games'
      },
      {
        '@type': 'Thing',
        name: 'Gaming Consulting',
        description: 'Professional gaming strategy consulting services'
      },
      {
        '@type': 'Thing',
        name: 'Vietnamese Gaming',
        description: 'Gaming services specifically for Vietnamese players'
      }
    ]
  }

  return (
    <Script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(keywordSchema) }}
      id="vietnamese-keywords-schema"
      type="application/ld+json"
    />
  )
}

// Local business schema for Vietnamese market
export function VietnameseLocalBusinessSchema() {
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'RoK Services Vietnam',
    description: 'Dịch vụ Rise of Kingdoms chuyên nghiệp tại Việt Nam',
    url: 'https://rokdbot.com',
    telephone: '+84123456789',
    email: 'contact@rokdbot.com',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'VN',
      addressLocality: 'Hồ Chí Minh',
      addressRegion: 'Hồ Chí Minh'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '10.8231',
      longitude: '106.6297'
    },
    areaServed: {
      '@type': 'Country',
      name: 'Vietnam'
    },
    serviceArea: {
      '@type': 'Country',
      name: 'Vietnam'
    },
    knowsAbout: [
      'Rise of Kingdoms Strategy',
      'Mobile Gaming Consulting',
      'Vietnamese Gaming Market',
      'RoK Gem Farming',
      'Commander Building',
      'Alliance Management'
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Rise of Kingdoms Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Tư vấn chiến thuật Rise of Kingdoms',
            description: 'Phân tích tài khoản, tối ưu chiến thuật, farm gem an toàn'
          },
          price: '750000',
          priceCurrency: 'VND'
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Quản lý liên minh RoK',
            description: 'Hỗ trợ toàn diện cho liên minh, điều phối KvK'
          },
          price: '1000000',
          priceCurrency: 'VND'
        }
      ]
    },
    review: [
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Nguyễn Minh Tuấn'
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5'
        },
        reviewBody:
          'Dịch vụ tư vấn chiến thuật rất chuyên nghiệp. Power tăng từ 50M lên 120M chỉ trong 2 tháng!'
      }
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '200',
      bestRating: '5',
      worstRating: '1'
    }
  }

  return (
    <Script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      id="vietnamese-local-business-schema"
      type="application/ld+json"
    />
  )
}

// Gaming-specific breadcrumb schema
export function GamingBreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: {
        '@type': 'WebPage',
        '@id': item.url,
        name: item.name,
        inLanguage: 'vi-VN'
      }
    }))
  }

  return (
    <Script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      id="gaming-breadcrumb-schema"
      type="application/ld+json"
    />
  )
}
