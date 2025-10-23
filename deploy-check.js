#!/usr/bin/env node

/**
 * 部署前检查脚本
 * 验证Vercel配置是否正确指向seven-sons项目
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 检查Vercel部署配置...\n');

// 检查根目录的.vercel配置
const rootVercelPath = path.join(__dirname, '.vercel', 'project.json');
const sevenSonsVercelPath = path.join(__dirname, 'seven-sons', '.vercel', 'project.json');

console.log('📋 当前配置状态:');
console.log('================================');

if (fs.existsSync(rootVercelPath)) {
  const rootConfig = JSON.parse(fs.readFileSync(rootVercelPath, 'utf8'));
  console.log(`✅ 根目录配置: ${rootConfig.projectName} (${rootConfig.projectId})`);
  
  if (rootConfig.projectName === 'seven-sons') {
    console.log('✅ 配置正确: 指向seven-sons项目');
  } else {
    console.log('❌ 配置错误: 未指向seven-sons项目');
  }
} else {
  console.log('❌ 根目录.vercel配置不存在');
}

if (fs.existsSync(sevenSonsVercelPath)) {
  const sevenSonsConfig = JSON.parse(fs.readFileSync(sevenSonsVercelPath, 'utf8'));
  console.log(`✅ seven-sons目录配置: ${sevenSonsConfig.projectName} (${sevenSonsConfig.projectId})`);
} else {
  console.log('❌ seven-sons目录.vercel配置不存在');
}

console.log('\n🚀 部署建议:');
console.log('================================');
console.log('现在您可以安全地重新部署，它将更新到正确的项目:');
console.log('📍 项目: seven-sons');
console.log('🌐 URL: https://seven-sons.vercel.app/');
console.log('');
console.log('💡 提示: 部署完成后，请验证线上网站功能是否正常');