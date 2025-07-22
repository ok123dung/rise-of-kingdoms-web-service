import Script from 'next/script'

interface OrganizationSchemaProps {
  name: string
  url: string
  description: string
  address?: string
  phone?: string
  email?: string
}

export function OrganizationSchema({ 
  name, 
  url, 
  description, 
  address, 
  phone, 
  email 
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": url,
    "description": description,
    "address": address ? {
      "@type": "PostalAddress",
      "addressLocality": address,
      "addressCountry": "VN"
    } : undefined,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": phone,
      "email": email,
      "contactType": "customer service",
      "availableLanguage": "Vietnamese"
    },
    "sameAs": [
      "https://discord.gg/rokservices"
    ]
  }

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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
}

export function ServiceSchema({ 
  name, 
  description, 
  provider, 
  areaServed, 
  serviceType, 
  offers 
}: ServiceSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": name,
    "description": description,
    "provider": {
      "@type": "Organization",
      "name": provider
    },
    "areaServed": {
      "@type": "Country",
      "name": areaServed
    },
    "serviceType": serviceType,
    "offers": offers.map(offer => ({
      "@type": "Offer",
      "name": offer.name,
      "price": offer.price,
      "priceCurrency": offer.currency,
      "description": offer.description,
      "availability": "https://schema.org/InStock"
    }))
  }

  return (
    <Script
      id="service-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface FAQSchemaProps {
  faqs: Array<{
    question: string
    answer: string
  }>
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
