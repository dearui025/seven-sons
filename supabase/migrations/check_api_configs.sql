-- 查询所有角色的API配置
SELECT 
  id,
  name,
  api_config,
  CASE 
    WHEN api_config->>'apiKey' IS NOT NULL AND api_config->>'apiKey' != '' THEN '有API密钥'
    ELSE '无API密钥'
  END as api_status
FROM ai_roles
ORDER BY id;