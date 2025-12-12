import Script from 'next/script'

interface OrganizationSchemaProps {
  name: string
  url: string
  description: string
  address?: string
  phone?: string
  email?: string
  nonce?: string
}

export function OrganizationSchema({
  name,
  url,
  description,
  address = 'Hồ Chí Minh',
  phone = '+84123456789',
  email = 'contact@rokdbot.com',
  nonce
}: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: name,
    url: url,
    description: description,
    logo: `${url}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: address,
      addressCountry: 'VN'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: phone,
      email: email,
      contactType: 'customer service',
      availableLanguage: ['vi', 'en']
    },
    sameAs: ['https://discord.gg/UPuFYCw4JG', 'https://facebook.com/rokservices'],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
      bestRating: '5',
      worstRating: '1'
    }
  }

  return (
    <Script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      id="organization-schema"
      nonce={nonce}
      type="application/ld+json"
    />
  )
}

interface ServiceSchemaProps {
  name: string
  description: string
  provider: string
  areaServed: string
  serviceType: string
  offers: Array<{
    name: string
    price: string
    currency: string
    description: string
  }>
  nonce?: string
}

export function ServiceSchema({
  name,
  description,
  provider,
  areaServed,
  serviceType,
  offers,
  nonce
}: ServiceSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: name,
    description: description,
    provider: {
      '@type': 'Organization',
      name: provider
    },
    areaServed: {
      '@type': 'Country',
      name: areaServed
    },
    serviceType: serviceType,
    offers: offers.map(offer => ({
      '@type': 'Offer',
      name: offer.name,
      price: offer.price,
      priceCurrency: offer.currency,
      description: offer.description,
      availability: 'https://schema.org/InStock'
    }))
  }

  return (
    <Script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      id="service-schema"
      nonce={nonce}
      type="application/ld+json"
    />
  )
}

interface FAQSchemaProps {
  faqs: Array<{
    question: string
    answer: string
  }>
  nonce?: string
}

export function FAQSchema({ faqs, nonce }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <Script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      id="faq-schema"
      nonce={nonce}
      type="application/ld+json"
    />
  )
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string
    url: string
  }>
  nonce?: string
}

export function BreadcrumbSchema({ items, nonce }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }

  return (
    <Script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      id="breadcrumb-schema"
      nonce={nonce}
      type="application/ld+json"
    />
  )
}
