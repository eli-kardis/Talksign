#!/usr/bin/env node

/**
 * Environment Variables Checker for TalkSign
 * Vercel 배포 전 환경 변수 설정을 확인하는 스크립트
 */

const chalk = require('chalk');

// 필수 환경 변수
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

// 선택적 환경 변수 (기능별)
const OPTIONAL_ENV_VARS = {
  payment: [
    'NEXT_PUBLIC_TOSS_CLIENT_KEY',
    'TOSS_SECRET_KEY'
  ],
  notification: [
    'KAKAO_API_KEY',
    'KAKAO_SENDER_KEY'
  ],
  auth: [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'KAKAO_CLIENT_ID',
    'KAKAO_CLIENT_SECRET'
  ],
  security: [
    'JWT_SECRET'
  ]
};

console.log(chalk.blue.bold('\n🔍 TalkSign 환경 변수 체크\n'));

let hasError = false;

// 필수 환경 변수 확인
console.log(chalk.yellow('📋 필수 환경 변수:'));
REQUIRED_ENV_VARS.forEach(key => {
  const value = process.env[key];
  if (value) {
    console.log(chalk.green(`  ✅ ${key}: 설정됨`));
  } else {
    console.log(chalk.red(`  ❌ ${key}: 누락됨`));
    hasError = true;
  }
});

// 선택적 환경 변수 확인
console.log(chalk.yellow('\n🔧 선택적 환경 변수:'));

Object.entries(OPTIONAL_ENV_VARS).forEach(([category, vars]) => {
  console.log(chalk.cyan(`\n  ${category}:`));

  const categoryComplete = vars.every(key => process.env[key]);
  const categoryPartial = vars.some(key => process.env[key]);

  vars.forEach(key => {
    const value = process.env[key];
    if (value) {
      console.log(chalk.green(`    ✅ ${key}: 설정됨`));
    } else {
      console.log(chalk.gray(`    ⚪ ${key}: 설정되지 않음`));
    }
  });

  if (categoryComplete) {
    console.log(chalk.green(`    ✨ ${category} 기능 완전 활성화`));
  } else if (categoryPartial) {
    console.log(chalk.yellow(`    ⚠️  ${category} 기능 부분 활성화`));
  } else {
    console.log(chalk.gray(`    💤 ${category} 기능 비활성화`));
  }
});

// 환경별 안내
console.log(chalk.yellow('\n🌍 환경별 설정 가이드:'));
console.log(chalk.blue('  • 로컬 개발: .env.local 파일 사용'));
console.log(chalk.blue('  • Vercel 배포: Dashboard > Settings > Environment Variables'));
console.log(chalk.blue('  • 참고 파일: .env.example'));

// 결과 요약
if (hasError) {
  console.log(chalk.red.bold('\n❌ 환경 변수 설정이 완료되지 않았습니다.'));
  console.log(chalk.red('필수 환경 변수를 설정한 후 다시 확인해주세요.\n'));
  process.exit(1);
} else {
  console.log(chalk.green.bold('\n✅ 모든 필수 환경 변수가 설정되었습니다!'));
  console.log(chalk.green('배포 준비가 완료되었습니다. 🚀\n'));
}