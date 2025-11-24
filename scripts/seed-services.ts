
import { PrismaClient } from '@prisma/client'
import { servicesData } from '../src/data/services'

const prisma = new PrismaClient()

async function seedServices() {
    console.log('🌱 Starting database seeding...')

    try {
        for (const serviceSlug in servicesData) {
            const serviceData = servicesData[serviceSlug]
            console.log(`Processing service: ${serviceData.name} (${serviceData.slug})`)

            // 1. Create or Update Service
            const service = await prisma.service.upsert({
                where: { slug: serviceData.slug },
                update: {
                    name: serviceData.name,
                    description: serviceData.description,
                    basePrice: serviceData.pricing[0]?.price || 0, // Use first tier price as base
                    isActive: true,
                    category: 'general', // Default category
                    metadata: {
                        shortDescription: serviceData.shortDescription,
                        features: serviceData.features,
                        benefits: serviceData.benefits
                    }
                },
                create: {
                    slug: serviceData.slug,
                    name: serviceData.name,
                    description: serviceData.description,
                    basePrice: serviceData.pricing[0]?.price || 0,
                    isActive: true,
                    category: 'general',
                    metadata: {
                        shortDescription: serviceData.shortDescription,
                        features: serviceData.features,
                        benefits: serviceData.benefits
                    }
                }
            })

            // 2. Create or Update Service Tiers
            for (const tierData of serviceData.pricing) {
                const tierSlug = `${serviceData.slug}-${tierData.tier.toLowerCase().replace(/\s+/g, '-')}`

                console.log(`  - Processing tier: ${tierData.tier} (${tierSlug})`)

                await prisma.serviceTier.upsert({
                    where: {
                        serviceId_slug: {
                            serviceId: service.id,
                            slug: tierSlug
                        }
                    },
                    update: {
                        name: tierData.tier,
                        price: tierData.price,
                        features: tierData.features,
                        metadata: {
                            duration: tierData.duration,
                            description: `${tierData.duration} - ${tierData.features.length} features`
                        }
                    },
                    create: {
                        serviceId: service.id,
                        name: tierData.tier,
                        slug: tierSlug,
                        price: tierData.price,
                        features: tierData.features,
                        metadata: {
                            duration: tierData.duration,
                            description: `${tierData.duration} - ${tierData.features.length} features`
                        }
                    }
                })
            }
        }

        console.log('✅ Seeding completed successfully!')
    } catch (error) {
        console.error('❌ Error seeding database:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

seedServices()
