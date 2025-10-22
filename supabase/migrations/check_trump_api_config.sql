-- 检查所有角色的API配置
SELECT 
  id,
  name,
  api_config,
  CASE 
    WHEN api_config IS NULL THEN 'NULL'
    WHEN api_config = '{}' THEN 'EMPTY_OBJECT'
    WHEN api_config->>'provider' IS NULL THEN 'NO_PROVIDER'
    WHEN api_config->>'apiKey' IS NULL THEN 'NO_API_KEY'
    ELSE 'HAS_CONFIG'
  END as config_status,
  api_config->>'provider' as provider,
  CASE 
    WHEN api_config->>'apiKey' IS NOT NULL THEN 
      CONCAT(LEFT(api_config->>'apiKey', 10), '...')
    ELSE NULL
  END as api_key_preview,
  api_config->>'model' as model
FROM ai_roles 
WHERE api_config IS NOT NULL AND api_config != '{}'
ORDER BY name;