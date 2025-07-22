# 🚀 Quick GitHub Setup Guide

## Option 1: Tự động với Script (Recommended)
```bash
./create-github-repo.sh
```
Script sẽ:
- Hỏi GitHub username
- Hỏi tên repository 
- Tạo private repository
- Push code tự động

## Option 2: Manual qua Browser
1. Vào https://github.com/new
2. Repository name: `rok-services`
3. Private repository ✓
4. KHÔNG tick "Add README"
5. Create repository
6. Copy lệnh từ GitHub và chạy:
```bash
git remote add origin https://github.com/YOUR_USERNAME/rok-services.git
git push -u origin main
```

## Option 3: Nếu đã có GitHub CLI
```bash
gh auth login
gh repo create rok-services --private --source=. --push
```

## 🔑 Personal Access Token
Nếu cần token:
1. Vào https://github.com/settings/tokens/new
2. Note: "ROK Services Deploy"
3. Expiration: 90 days
4. Scopes: ✓ repo (full control)
5. Generate token
6. Copy và dùng làm password khi push

---
**Chạy `./create-github-repo.sh` là nhanh nhất!**