const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin123!@#', 14)

    const admin = await prisma.user.create({
      data: {
        email: 'admin@rokdbot.com',
        password: hashedPassword,
        fullName: 'Administrator',
        phone: '+84901234567',
        status: 'active',
        emailVerified: new Date(),
        lastLogin: new Date(),
        staffProfile: {
          create: {
            role: 'admin',
            isActive: true,
            permissions: {
              all: true
            },
            specializations: ['Quản lý hệ thống', 'Hỗ trợ khách hàng']
          }
        }
      },
      include: {
        staffProfile: true
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@rokdbot.com')
    console.log('🔑 Password: Admin123!@#')
    console.log('👤 User ID:', admin.id)
    console.log('👔 Staff Role:', admin.staffProfile?.role)

    // Save password to history
    await prisma.passwordHistory.create({
      data: {
        userId: admin.id,
        passwordHash: hashedPassword
      }
    })

    console.log('✅ Password history saved')
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  Admin user already exists')
    } else {
      console.error('❌ Error creating admin:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
