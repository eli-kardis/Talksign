// 은행 및 증권사 목록
export interface BankOption {
  value: string;
  label: string;
  group: '은행' | '지방은행' | '기타' | '증권사';
}

export const BANKS: BankOption[] = [
  // 은행
  { value: 'kb', label: 'KB국민은행', group: '은행' },
  { value: 'shinhan', label: '신한은행', group: '은행' },
  { value: 'woori', label: '우리은행', group: '은행' },
  { value: 'hana', label: '하나은행', group: '은행' },
  { value: 'nh', label: 'NH농협은행', group: '은행' },
  { value: 'ibk', label: 'IBK기업은행', group: '은행' },
  { value: 'sc', label: 'SC제일은행', group: '은행' },
  { value: 'citi', label: '한국씨티은행', group: '은행' },
  { value: 'kakao', label: '카카오뱅크', group: '은행' },
  { value: 'kbank', label: '케이뱅크', group: '은행' },
  { value: 'toss', label: '토스뱅크', group: '은행' },
  { value: 'kdb', label: 'KDB산업은행', group: '은행' },
  { value: 'sh', label: 'Sh수협은행', group: '은행' },
  { value: 'koreaexim', label: '수출입은행', group: '은행' },

  // 지방은행
  { value: 'dgb', label: 'DGB대구은행', group: '지방은행' },
  { value: 'bnk-busan', label: 'BNK부산은행', group: '지방은행' },
  { value: 'bnk-kyongnam', label: 'BNK경남은행', group: '지방은행' },
  { value: 'kjbank', label: '광주은행', group: '지방은행' },
  { value: 'jbbank', label: '전북은행', group: '지방은행' },
  { value: 'jeju', label: '제주은행', group: '지방은행' },

  // 기타
  { value: 'post', label: '우체국예금', group: '기타' },
  { value: 'mg', label: 'MG새마을금고', group: '기타' },
  { value: 'cu', label: '신협', group: '기타' },
  { value: 'savings', label: '저축은행(개별)', group: '기타' },
  { value: 'nfcf', label: '산림조합중앙회', group: '기타' },

  // 증권사
  { value: 'mirae', label: '미래에셋증권', group: '증권사' },
  { value: 'samsung', label: '삼성증권', group: '증권사' },
  { value: 'nh-invest', label: 'NH투자증권', group: '증권사' },
  { value: 'koreainvest', label: '한국투자증권', group: '증권사' },
  { value: 'kb-securities', label: 'KB증권', group: '증권사' },
  { value: 'shinhan-invest', label: '신한투자증권', group: '증권사' },
  { value: 'hana-securities', label: '하나증권', group: '증권사' },
  { value: 'kiwoom', label: '키움증권', group: '증권사' },
  { value: 'daishin', label: '대신증권', group: '증권사' },
  { value: 'hanwha', label: '한화투자증권', group: '증권사' },
  { value: 'meritz', label: '메리츠증권', group: '증권사' },
  { value: 'eugene', label: '유진투자증권', group: '증권사' },
  { value: 'hyundai', label: '현대차증권', group: '증권사' },
  { value: 'sk', label: 'SK증권', group: '증권사' },
  { value: 'shinyoung', label: '신영증권', group: '증권사' },
  { value: 'kyobo', label: '교보증권', group: '증권사' },
  { value: 'db', label: 'DB금융투자', group: '증권사' },
  { value: 'ebest', label: '이베스트투자증권', group: '증권사' },
  { value: 'bookook', label: '부국증권', group: '증권사' },
  { value: 'ibk-securities', label: 'IBK투자증권', group: '증권사' },
  { value: 'bnk-securities', label: 'BNK투자증권', group: '증권사' },
  { value: 'daol', label: '다올투자증권', group: '증권사' },
  { value: 'kakaopay', label: '카카오페이증권', group: '증권사' },
  { value: 'toss-securities', label: '토스증권', group: '증권사' },
];

// 그룹별로 정렬된 은행 목록
export const BANKS_BY_GROUP = {
  은행: BANKS.filter(bank => bank.group === '은행'),
  지방은행: BANKS.filter(bank => bank.group === '지방은행'),
  기타: BANKS.filter(bank => bank.group === '기타'),
  증권사: BANKS.filter(bank => bank.group === '증권사'),
};
