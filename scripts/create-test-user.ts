
process.env.DATABASE_URL = 'postgresql://postgres:Dungvnn001*@db.inondhimzqiguvdhyjng.supabase.co:5432/postgres?sslmode=require'

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUser() {
    console.log('👤 Creating test user...')

    try {
        const email = 'testuser@example.com'
        const password = 'Test@123456'
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                fullName: 'Test User',
                status: 'active'
            },
            create: {
                email,
                password: hashedPassword,
                fullName: 'Test User',
                status: 'active',
                preferredLanguage: 'vi',
                timezone: 'Asia/Ho_Chi_Minh'
            }
        })

        console.log(`✅ Test user created/updated: ${user.email}`)
        console.log(`🔑 Password: ${password}`)
    } catch (error) {
        console.error('❌ Error creating test user:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

createTestUser()
