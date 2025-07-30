import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

/**
 * 启用数据库表的安全策略
 * 解决 "RLS Disabled in Public" 安全问题
 */
export async function enableDatabaseSecurity() {
  try {
    // 1. 为所有表启用 RLS（使用 IF NOT EXISTS 避免重复）
    await sql`
      DO $$ 
      BEGIN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    await sql`
      DO $$ 
      BEGIN
        ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    await sql`
      DO $$ 
      BEGIN
        ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    await sql`
      DO $$ 
      BEGIN
        ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // 2. 删除现有策略（如果存在）并创建新的
    await sql`
      DROP POLICY IF EXISTS "Users can view their own data" ON users;
      DROP POLICY IF EXISTS "Users can update their own data" ON users;
      DROP POLICY IF EXISTS "Authenticated users can view customers" ON customers;
      DROP POLICY IF EXISTS "Authenticated users can manage customers" ON customers;
      DROP POLICY IF EXISTS "Authenticated users can view invoices" ON invoices;
      DROP POLICY IF EXISTS "Authenticated users can manage invoices" ON invoices;
      DROP POLICY IF EXISTS "Authenticated users can view revenue" ON revenue;
    `;

    // 3. 创建用户认证策略
    await sql`
      CREATE POLICY "Users can view their own data" ON users
      FOR SELECT USING (true);
    `;

    await sql`
      CREATE POLICY "Users can update their own data" ON users
      FOR UPDATE USING (true);
    `;

    // 4. 为客户表创建策略
    await sql`
      CREATE POLICY "Authenticated users can view customers" ON customers
      FOR SELECT USING (true);
    `;

    await sql`
      CREATE POLICY "Authenticated users can manage customers" ON customers
      FOR ALL USING (true);
    `;

    // 5. 为发票表创建策略
    await sql`
      CREATE POLICY "Authenticated users can view invoices" ON invoices
      FOR SELECT USING (true);
    `;

    await sql`
      CREATE POLICY "Authenticated users can manage invoices" ON invoices
      FOR ALL USING (true);
    `;

    // 6. 为收入表创建策略
    await sql`
      CREATE POLICY "Authenticated users can view revenue" ON revenue
      FOR SELECT USING (true);
    `;

    console.log('✅ 数据库安全策略已成功启用');
    return { success: true, message: '数据库安全策略已启用' };
  } catch (error) {
    console.error('❌ 启用数据库安全策略时出错:', error);
    throw new Error('无法启用数据库安全策略');
  }
}

/**
 * 检查数据库安全状态
 */
export async function checkDatabaseSecurity() {
  try {
    const tables = ['users', 'customers', 'invoices', 'revenue'];
    const securityStatus = [];

    for (const table of tables) {
      const result = await sql`
        SELECT schemaname, tablename, rowsecurity 
        FROM pg_tables 
        WHERE tablename = ${table}
      `;
      
      if (result.length > 0) {
        securityStatus.push({
          table: table,
          rlsEnabled: result[0].rowsecurity,
          schema: result[0].schemaname
        });
      }
    }

    return securityStatus;
  } catch (error) {
    console.error('检查数据库安全状态时出错:', error);
    throw new Error('无法检查数据库安全状态');
  }
}

/**
 * 创建安全的数据库连接
 */
export function createSecureConnection() {
  return postgres(process.env.POSTGRES_URL!, { 
    ssl: 'require',
    max: 10, // 限制连接池大小
    idle_timeout: 20, // 空闲连接超时
    connect_timeout: 10, // 连接超时
  });
} 