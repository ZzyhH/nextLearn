# 数据库安全设置指南

## 问题描述

您的应用程序显示了一个安全警告：`public.users_rels` 表是公开的，但没有启用行级安全（RLS）。这可能导致数据泄露风险。

## 解决方案

### 1. 自动解决方案

我们已经为您创建了一个安全设置页面，您可以通过以下步骤启用安全策略：

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 访问安全设置页面：
   ```
   http://localhost:3000/dashboard/security
   ```

3. 点击"启用安全策略"按钮

### 2. 手动解决方案

如果您需要手动设置，可以执行以下 SQL 命令：

```sql
-- 启用所有表的 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;

-- 创建安全策略
CREATE POLICY "Users can view their own data" ON users
FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Authenticated users can view customers" ON customers
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view invoices" ON invoices
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view revenue" ON revenue
FOR SELECT USING (auth.role() = 'authenticated');
```

## 安全特性

### 行级安全（RLS）
- 确保只有授权用户可以访问数据
- 防止未授权访问和潜在的数据泄露
- 符合数据保护法规要求

### 安全策略
- **用户表**：用户只能查看和修改自己的数据
- **客户表**：只有认证用户可以查看客户信息
- **发票表**：只有认证用户可以查看发票数据
- **收入表**：只有认证用户可以查看收入数据

## API 端点

### 启用安全策略
```
POST /api/security
```

### 检查安全状态
```
GET /api/security
```

## 文件结构

```
app/
├── api/security/route.ts          # 安全 API 端点
├── dashboard/security/page.tsx     # 安全设置页面
└── lib/database-security.ts       # 数据库安全配置
```

## 注意事项

1. **备份数据**：在启用 RLS 之前，请确保备份您的数据库
2. **测试**：在生产环境中启用之前，请在测试环境中验证所有功能
3. **权限**：确保数据库用户有足够的权限来创建策略
4. **监控**：启用后监控应用程序的性能和功能

## 故障排除

### 常见问题

1. **权限错误**
   - 确保数据库用户有 `CREATE POLICY` 权限
   - 检查数据库连接字符串

2. **策略冲突**
   - 删除现有的冲突策略
   - 重新创建安全策略

3. **性能问题**
   - 监控查询性能
   - 优化策略条件

## 联系支持

如果您遇到任何问题，请检查：
1. 数据库连接配置
2. 用户权限设置
3. 应用程序日志

---

**重要提示**：此安全设置将显著提高您的应用程序安全性，建议在生产环境中实施。 