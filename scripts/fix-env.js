
const fs = require('fs');
const content = `NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=supersecretkey123
DATABASE_URL="postgresql://postgres:Dungvnn001*@db.inondhimzqiguvdhyjng.supabase.co:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:Dungvnn001*@db.inondhimzqiguvdhyjng.supabase.co:5432/postgres?sslmode=require"
`;
fs.writeFileSync('.env.local', content);
console.log('.env.local written');
