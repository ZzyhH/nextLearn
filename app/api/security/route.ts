import { NextRequest, NextResponse } from 'next/server';
import { enableDatabaseSecurity, checkDatabaseSecurity } from '@/app/lib/database-security';

export async function POST(request: NextRequest) {
  try {
    const result = await enableDatabaseSecurity();
    
    return NextResponse.json({
      success: true,
      message: '数据库安全策略已成功启用',
      data: result
    });
  } catch (error) {
    console.error('启用安全策略时出错:', error);
    
    return NextResponse.json({
      success: false,
      message: '启用安全策略失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const securityStatus = await checkDatabaseSecurity();
    
    return NextResponse.json({
      success: true,
      message: '数据库安全状态检查完成',
      data: securityStatus
    });
  } catch (error) {
    console.error('检查安全状态时出错:', error);
    
    return NextResponse.json({
      success: false,
      message: '检查安全状态失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 