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
 * 사업자등록번호 자동 포맷팅 (123-12-12345)
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
 * 팩스 번호 자동 포맷팅
 * - 02: 02-1234-5678 (02-4자리-4자리) 또는 02-123-4567 (02-3자리-4자리)
 * - 기타: 031-1234-5678 (3자리-4자리-4자리) 또는 031-123-4567 (3자리-3자리-4자리)
 */
export const formatFaxNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, '')

  if (numbers.length === 0) return ''

  // 02로 시작하는 경우
  if (numbers.startsWith('02')) {
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 5) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2)}`
    } else if (numbers.length <= 9) {
      // 뒷자리가 7자리면 3-4, 8자리면 4-4
      const remaining = numbers.slice(2)
      if (remaining.length === 7) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5, 9)}`
      } else {
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`
      }
    } else {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`
    }
  }
  // 그 외 (031, 051 등)
  else {
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    } else if (numbers.length <= 10) {
      // 뒷자리가 7자리면 3-4, 8자리면 4-4
      const remaining = numbers.slice(3)
      if (remaining.length === 7) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
      } else {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
      }
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
    }
  }
}

/**
 * 금액 포맷팅 (1,000,000원)
 */
export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseInt(amount) || 0 : amount
  return new Intl.NumberFormat('ko-KR').format(num) + '원'
}
