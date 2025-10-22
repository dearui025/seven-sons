-- 查询所有角色的详细API配置
SELECT 
  id,
  name,
  api_config,
  settings,
  CASE 
    WHEN api_config IS NOT NULL AND api_config != '{}' THEN 'api_config字段有数据'
    WHEN settings IS NOT NULL AND settings->'api_config' IS NOT NULL THEN 'settings.api_config有数据'
    ELSE '无API配置'
  END as config_location,
  CASE 
    WHEN api_config->>'apiKey' IS NOT NULL AND api_config->>'apiKey' != '' THEN '有API密钥'
    WHEN settings->'api_config'->>'apiKey' IS NOT NULL AND settings->'api_config'->>'apiKey' != '' THEN '有API密钥(在settings中)'
    ELSE '无API密钥'
  END as api_key_status
FROM ai_roles
ORDER BY name;