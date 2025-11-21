# Hướng Dẫn Deploy Database Migration

## Thứ tự chạy các file SQL:

### 1. Xóa policies cũ (nếu cần)

```sql
-- Chỉ chạy nếu bạn gặp lỗi "policy already exists"
-- Copy nội dung file: 000_cleanup_policies.sql
```

### 2. Bật RLS và tạo policies

```sql
-- Copy nội dung file: 001_enable_rls.sql
```

### 3. Tạo indexes cho performance

```sql
-- Copy nội dung file: 002_create_indexes.sql
```

### 4. Setup encryption (tùy chọn)

```sql
-- Copy nội dung file: 003_setup_encryption.sql
-- Sau đó chạy: SELECT vault.migrate_encrypt_sensitive_data();
```

### 5. Setup audit logging (tùy chọn)

```sql
-- Copy nội dung file: 004_audit_monitoring.sql
```

### 6. Kiểm tra kết quả

```sql
-- Copy nội dung file: check_rls_status.sql
```

## Xử lý lỗi thường gặp:

### Lỗi "policy already exists"

1. Chạy file `000_cleanup_policies.sql` trước
2. Sau đó chạy lại `001_enable_rls.sql`

### Lỗi "column does not exist"

- Database schema chưa được migrate đầy đủ
- Chạy `prisma db push` trước khi chạy SQL scripts

### Lỗi "function already exists"

- Bỏ qua, không ảnh hưởng đến kết quả

## Lưu ý quan trọng:

- Chạy từng file một, đừng chạy tất cả cùng lúc
- Đọc kỹ thông báo lỗi để biết cách xử lý
- File 003 và 004 là tùy chọn, có thể bỏ qua nếu không cần
