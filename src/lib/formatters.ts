// 포맷팅 유틸리티 함수들

/**
 * 전화번호 자동 포맷팅 (010-1234-5678)
 */
export const formatPhoneNumber = (value: string): string => {
  // 숫자만 추출
  const numbers = value.replace(/\D/g, '')
  
  // 11자리 이상이면 11자리까지만 사용
  const truncated = numbers.slice(0, 11)
  
  // 길이에 따라 포맷팅
  if (truncated.length <= 3) {
    return truncated
  } else if (truncated.length <= 7) {
    return `${truncated.slice(0, 3)}-${truncated.slice(3)}`
  } else {
    return `${truncated.slice(0, 3)}-${truncated.slice(3, 7)}-${truncated.slice(7)}`
  }
}

/**
 * 사업자번호 자동 포맷팅 (123-12-12345)
 */
export const formatBusinessNumber = (value: string): string => {
  // 숫자만 추출
  const numbers = value.replace(/\D/g, '')
  
  // 10자리 이상이면 10자리까지만 사용
  const truncated = numbers.slice(0, 10)
  
  // 길이에 따라 포맷팅
  if (truncated.length <= 3) {
    return truncated
  } else if (truncated.length <= 5) {
    return `${truncated.slice(0, 3)}-${truncated.slice(3)}`
  } else {
    return `${truncated.slice(0, 3)}-${truncated.slice(3, 5)}-${truncated.slice(5)}`
  }
}

/**
 * 숫자 입력값에서 앞의 불필요한 0 제거
 */
export const formatNumber = (value: string): string => {
  // 빈 문자열이면 그대로 반환
  if (value === '') return ''
  
  // 숫자가 아닌 문자 제거
  const numbers = value.replace(/\D/g, '')
  
  // 빈 문자열이면 그대로 반환
  if (numbers === '') return ''
  
  // 앞의 0들 제거 (단, '0'만 있는 경우는 '0' 반환)
  const withoutLeadingZeros = numbers.replace(/^0+/, '') || '0'
  
  return withoutLeadingZeros
}

/**
 * 금액 포맷팅 (1,000,000원)
 */
export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseInt(amount) || 0 : amount
  return new Intl.NumberFormat('ko-KR').format(num) + '원'
}
