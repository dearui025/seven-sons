#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 强制重新部署脚本启动...');

// 检查当前配置
console.log('\n📋 检查当前配置:');

// 检查项目配置
const projectConfigPath = '.vercel/project.json';
if (fs.existsSync(projectConfigPath)) {
    const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'));
    console.log(`✅ 项目ID: ${projectConfig.projectId}`);
    console.log(`✅ 项目名称: ${projectConfig.projectName}`);
} else {
    console.log('❌ 未找到 .vercel/project.json');
}

// 检查vercel.json配置
const vercelConfigPath = 'vercel.json';
if (fs.existsSync(vercelConfigPath)) {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    console.log(`✅ 框架: ${vercelConfig.framework}`);
    console.log(`✅ 构建命令: ${vercelConfig.buildCommand}`);
    console.log(`✅ 输出目录: ${vercelConfig.outputDirectory}`);
} else {
    console.log('❌ 未找到 vercel.json');
}

// 检查环境变量
console.log('\n🔧 检查环境变量:');
try {
    const envOutput = execSync('vercel env ls', { encoding: 'utf8' });
    console.log('✅ 环境变量列表:');
    console.log(envOutput);
} catch (error) {
    console.log('❌ 无法获取环境变量列表:', error.message);
}

// 强制重新部署
console.log('\n🚀 开始强制重新部署...');
try {
    // 使用 --force 参数强制重新部署
    const deployOutput = execSync('vercel --prod --force', { 
        encoding: 'utf8',
        stdio: 'inherit'
    });
    console.log('\n✅ 部署完成!');
} catch (error) {
    console.log('\n❌ 部署失败:', error.message);
    process.exit(1);
}

console.log('\n🎉 强制重新部署完成!');
console.log('📝 请检查部署后的配置是否与本地一致。');