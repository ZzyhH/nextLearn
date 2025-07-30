const postgres = require('postgres');

// 测试数据库安全设置
async function testSecuritySettings() {
  const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });
  
  try {
    console.log('🔍 检查数据库安全设置...\n');
    
    // 检查 RLS 状态
    const tables = ['users', 'customers', 'invoices', 'revenue'];
    
    for (const table of tables) {
      const result = await sql`
        SELECT schemaname, tablename, rowsecurity 
        FROM pg_tables 
        WHERE tablename = ${table}
      `;
      
      if (result.length > 0) {
        const status = result[0].rowsecurity ? '✅ 已启用' : '❌ 未启用';
        console.log(`${table} 表 RLS 状态: ${status}`);
      } else {
        console.log(`${table} 表: 未找到`);
      }
    }
    
    console.log('\n🔍 检查安全策略...\n');
    
    // 检查策略
    const policies = await sql`
      SELECT schemaname, tablename, policyname 
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `;
    
    if (policies.length > 0) {
      console.log('找到的安全策略:');
      policies.forEach(policy => {
        console.log(`  - ${policy.tablename}.${policy.policyname}`);
      });
    } else {
      console.log('❌ 未找到安全策略');
    }
    
    console.log('\n✅ 安全设置检查完成');
    
  } catch (error) {
    console.error('❌ 检查安全设置时出错:', error);
  } finally {
    await sql.end();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testSecuritySettings();
}

module.exports = { testSecuritySettings }; 