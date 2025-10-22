// 测试特朗普角色的API配置
const { createSupabaseServiceClient } = require('./src/lib/supabase.js');

async function testTrumpConfig() {
  try {
    const supabase = createSupabaseServiceClient();
    
    // 查询所有角色
    const { data: allRoles, error: allError } = await supabase
      .from('ai_roles')
      .select('id, name, api_config, settings');
    
    if (allError) {
      console.error('查询所有角色错误:', allError);
      return;
    }
    
    console.log('=== 所有角色列表 ===');
    allRoles?.forEach(role => {
      console.log(`${role.name} (ID: ${role.id})`);
      console.log('  API配置:', role.api_config ? 'YES' : 'NO');
      if (role.api_config && role.api_config.apiKey) {
        console.log('  API密钥:', role.api_config.apiKey.substring(0, 10) + '...');
        console.log('  提供商:', role.api_config.provider);
        console.log('  模型:', role.api_config.model);
      }
      console.log('---');
    });
    
    // 查询特朗普角色
    const { data: roles, error } = await supabase
      .from('ai_roles')
      .select('*')
      .ilike('name', '%特朗普%');
    
    if (error) {
      console.error('查询特朗普角色错误:', error);
      return;
    }
    
    console.log('\n=== 特朗普角色详情 ===');
    console.log('找到的角色:', roles?.length || 0);
    
    if (roles && roles.length > 0) {
      const trump = roles[0];
      console.log('ID:', trump.id);
      console.log('名称:', trump.name);
      console.log('API配置:', JSON.stringify(trump.api_config, null, 2));
      console.log('Settings:', JSON.stringify(trump.settings, null, 2));
    } else {
      console.log('未找到特朗普角色');
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testTrumpConfig();