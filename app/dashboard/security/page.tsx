'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/ui/button';

interface SecurityStatus {
  table: string;
  rlsEnabled: boolean;
  schema: string;
}

export default function SecurityPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus[]>([]);
  const [message, setMessage] = useState('');

  const enableSecurity = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ 安全策略已成功启用！');
        checkSecurityStatus();
      } else {
        setMessage(`❌ 启用失败: ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ 请求失败，请检查网络连接');
    } finally {
      setIsLoading(false);
    }
  };

  const checkSecurityStatus = async () => {
    try {
      const response = await fetch('/api/security');
      const data = await response.json();
      
      if (data.success) {
        setSecurityStatus(data.data);
      }
    } catch (error) {
      console.error('检查安全状态失败:', error);
    }
  };

  // 页面加载时检查安全状态
  useEffect(() => {
    checkSecurityStatus();
  }, []);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">数据库安全设置</h1>
      </div>
      
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-gray-50 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">安全状态</h3>
            <p className="text-sm text-gray-600">
              检查数据库表的安全策略状态
            </p>
          </div>
          <div className="space-y-2">
            {securityStatus.map((status) => (
              <div key={status.table} className="flex items-center justify-between">
                <span className="text-sm font-medium">{status.table}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  status.rlsEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {status.rlsEnabled ? '已启用' : '未启用'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">启用安全策略</h3>
            <p className="text-sm text-gray-600">
              为所有数据库表启用行级安全（RLS）
            </p>
          </div>
          <Button 
            onClick={enableSecurity} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? '启用中...' : '启用安全策略'}
          </Button>
          {message && (
            <p className={`mt-2 text-sm ${
              message.includes('✅') ? 'text-green-600' : 'text-red-600'
            }`}>
              {message}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-gray-50 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">安全说明</h3>
            <p className="text-sm text-gray-600">
              了解行级安全的重要性
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <p>• 行级安全（RLS）确保只有授权用户可以访问数据</p>
            <p>• 防止未授权访问和潜在的数据泄露</p>
            <p>• 符合数据保护法规要求</p>
            <p>• 提高应用程序的整体安全性</p>
          </div>
        </div>
      </div>
    </div>
  );
} 