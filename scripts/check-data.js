const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  const users = await prisma.user.count();
  const services = await prisma.service.count();
  const tiers = await prisma.serviceTier.count();
  
  console.log('📊 Database Status:');
  console.log('👤 Users:', users);
  console.log('🛍️ Services:', services);  
  console.log('💎 Service Tiers:', tiers);
  
  // Get services with tiers
  const servicesWithTiers = await prisma.service.findMany({
    include: {
      serviceTiers: true
    }
  });
  
  console.log('\n📋 Services Detail:');
  servicesWithTiers.forEach(service => {
    console.log(`\n${service.name}:`);
    service.serviceTiers.forEach(tier => {
      console.log(`  - ${tier.name}: ${tier.price.toNumber().toLocaleString('vi-VN')} VNĐ`);
    });
  });
  
  await prisma.$disconnect();
}

checkData();