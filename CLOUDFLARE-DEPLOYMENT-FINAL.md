# 🚀 Cloudflare Pages - Deployment Cuối Cùng

## Vấn đề hiện tại
- Project đang ở chế độ "Direct Upload" 
- KHÔNG THỂ chuyển sang Git integration

## Giải pháp: 2 Options

### Option 1: Tạo Project Mới (Khuyến nghị)
1. **Vào Cloudflare Dashboard**
2. **Workers & Pages** → **Create** → **Pages**
3. **QUAN TRỌNG**: Chọn **"Connect to Git"** (KHÔNG phải Upload)
4. **Connect GitHub** → Authorize
5. **Chọn repository**: `ok123dung/rok-services`
6. **Settings**:
   ```
   Project name: rok-services-prod
   Production branch: main
   Framework: Next.js
   Build command: npm run build
   Output directory: .next
   ```
7. **Environment Variables**:
   ```
   DATABASE_URL=<new-database-url>
   NEXTAUTH_URL=https://rokdbot.com
   NEXTAUTH_SECRET=<generate-new-secret>
   NODE_ENV=production
   ```

### Option 2: Wrangler CLI (Backup)
```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build project
npm run build

# Deploy to existing project
wrangler pages deploy .next --project-name=rok-services

# Or create new project
wrangler pages project create rok-services-git
wrangler pages deploy .next --project-name=rok-services-git
```

## Custom Domain Setup
1. **Vào project mới** → **Custom domains**
2. **Add custom domain**: `rokdbot.com`
3. **DNS auto-configured** (vì domain đã ở Cloudflare)

## Migration Plan
1. Deploy project mới
2. Test hoạt động
3. Move domain từ project cũ sang mới
4. Delete project cũ

---
**Thời gian**: 15 phút | **Result**: rokdbot.com hoạt động hoàn hảo