# 📦 GitHub Push Guide - Rise of Kingdoms Services

## 🚀 Bước tiếp theo để push lên GitHub:

### 1. **Tạo repository mới trên GitHub:**
- Vào https://github.com/new
- Repository name: `rok-services` hoặc `rokdbot-website`
- Description: "Rise of Kingdoms Services - B2C Website for Vietnamese Gamers"
- Set to **Private** (để bảo mật payment gateway code)
- KHÔNG chọn "Initialize with README" (vì đã có sẵn)

### 2. **Kết nối và push code:**
```bash
# Thay YOUR_USERNAME bằng GitHub username của bạn
git remote add origin https://github.com/YOUR_USERNAME/rok-services.git

# Push code lên GitHub
git push -u origin main
```

### 3. **Nếu dùng SSH (recommended):**
```bash
# Hoặc dùng SSH nếu đã setup SSH keys
git remote add origin git@github.com:YOUR_USERNAME/rok-services.git
git push -u origin main
```

### 4. **Nếu gặp lỗi authentication:**
```bash
# Generate Personal Access Token tại:
# https://github.com/settings/tokens/new
# Chọn scopes: repo (full control)

# Khi push, dùng:
# Username: your-github-username
# Password: your-personal-access-token
```

## 🔒 **Security Notes:**
- Repository nên để **Private** vì có payment gateway logic
- KHÔNG commit file `.env` với credentials thật
- Dùng GitHub Secrets cho production variables

## 🎯 **Sau khi push xong:**
1. Vào Vercel.com
2. Import Git Repository
3. Chọn repository vừa push
4. Auto-deploy sẽ bắt đầu
5. Setup environment variables trong Vercel dashboard

---
**Ready to push! Chỉ cần tạo repo trên GitHub và chạy lệnh git remote + push.**