import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Verifying database state...')

    const services = await prisma.service.findMany({
        include: { serviceTiers: true }
    })

    console.log(`Found ${services.length} services.`)

    for (const service of services) {
        console.log(`- Service: ${service.name} (${service.slug})`)
        console.log(`  - Tiers: ${service.serviceTiers.length}`)
        service.serviceTiers.forEach(tier => {
            console.log(`    - ${tier.name}: ${tier.price} VND`)
        })
    }

    if (services.length === 0) {
        console.error('ERROR: No services found! Seeding failed.')
        process.exit(1)
    }

    console.log('Database verification successful.')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
