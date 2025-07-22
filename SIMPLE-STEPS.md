# 📋 3 Bước Đơn Giản Để Push Code Lên GitHub

## 🎯 Tôi đã làm sẵn:
- ✅ Git repository đã init
- ✅ Code đã commit (122 files)
- ✅ Script push tự động đã tạo

## 👨‍💻 Bạn chỉ cần làm:

### Bước 1: Tạo repository trên GitHub
1. Vào https://github.com/new
2. Repository name: `rok-services`
3. Chọn **Private**
4. **KHÔNG** tick "Add README"
5. Click "Create repository"

### Bước 2: Copy lệnh từ GitHub
GitHub sẽ hiện giao diện như này:
```
…or push an existing repository from the command line

git remote add origin https://github.com/ok123dung/rok-services.git
git branch -M main
git push -u origin main
```

### Bước 3: Chạy lệnh trong terminal
```bash
git remote add origin https://github.com/ok123dung/rok-services.git
git push -u origin main
```

**Khi hỏi username/password:**
- Username: `ok123dung`
- Password: `Dungvnn01*` (hoặc Personal Access Token)

## 🎉 Xong!
Sau khi push xong → Vào Vercel.com để deploy!

---
**HOẶC chạy script tự động:** `./create-github-repo.sh`