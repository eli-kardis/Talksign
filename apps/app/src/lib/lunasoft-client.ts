/**
 * Lunasoft KakaoTalk API Client
 *
 * 루나소프트(Blumn AI) 알림톡 발송 클라이언트
 * API 문서: https://jupiter.lunasoft.co.kr/
 */

import { getServerEnv, env } from './env'

/**
 * 루나소프트 API 요청 메시지 타입
 */
interface LunasoftMessage {
  no: string                    // 메시지 번호 (0부터 시작)
  tel_num: string                // 수신자 전화번호 (01012345678 형식)
  msg_content: string            // 템플릿 본문 내용 (변수가 치환된 내용 또는 빈 문자열)
  sms_content?: string           // 대체문자 내용 (선택)
  use_sms?: '0' | '1'           // 대체문자 발송 여부 (0=미사용, 1=사용)
  title?: string                 // 강조표기 타이틀 (변수 치환 가능)
  btn_url?: {
    url_pc: string               // PC 버튼 링크
    url_mobile: string           // 모바일 버튼 링크
  }
  // 템플릿 변수 (동적으로 추가 가능)
  [key: string]: any
}

/**
 * 루나소프트 API 요청 타입
 */
interface LunasoftRequest {
  userid: string                 // 사용자 ID (talksign)
  api_key: string                // API 키
  template_id: string            // 템플릿 코드
  messages: LunasoftMessage[]    // 메시지 배열
}

/**
 * 루나소프트 API 응답 타입
 */
interface LunasoftResponse {
  success: boolean
  message?: string
  data?: any
}

/**
 * 알림톡 템플릿 타입
 */
export type KakaoTemplate =
  | 'QUOTE_SEND'           // 견적서 발송
  | 'QUOTE_APPROVED'       // 견적서 승인됨
  | 'QUOTE_REJECTED'       // 견적서 거절됨
  | 'CONTRACT_SEND'        // 계약서 발송
  | 'CONTRACT_APPROVED'    // 계약서 승인됨
  | 'CONTRACT_REJECTED'    // 계약서 거절됨
  | 'PAYMENT_REQUEST'      // 결제 요청
  | 'PAYMENT_CONFIRMED'    // 결제 확인 완료

/**
 * 알림톡 발송 옵션
 */
export interface SendKakaoOptions {
  template: KakaoTemplate       // 템플릿 종류
  phoneNumber: string           // 수신자 전화번호
  title?: string                // 강조표기 타이틀
  buttonUrl?: string            // 버튼 링크 URL
  smsContent?: string           // 대체문자 내용
  useSms?: boolean              // 대체문자 사용 여부
  variables?: Record<string, string | number>  // 템플릿 변수
}

/**
 * 템플릿 ID 매핑
 */
const TEMPLATE_IDS: Record<KakaoTemplate, string> = {
  QUOTE_SEND: env.KAKAO_TEMPLATE_QUOTE_SEND || '50035',
  QUOTE_APPROVED: env.KAKAO_TEMPLATE_QUOTE_APPROVED || '50036',
  QUOTE_REJECTED: env.KAKAO_TEMPLATE_QUOTE_REJECTED || '50037',
  CONTRACT_SEND: env.KAKAO_TEMPLATE_CONTRACT_SEND || '50038',
  CONTRACT_APPROVED: env.KAKAO_TEMPLATE_CONTRACT_APPROVED || '50039',
  CONTRACT_REJECTED: env.KAKAO_TEMPLATE_CONTRACT_REJECTED || '50040',
  PAYMENT_REQUEST: env.KAKAO_TEMPLATE_PAYMENT_REQUEST || '50041',
  PAYMENT_CONFIRMED: env.KAKAO_TEMPLATE_PAYMENT_CONFIRMED || '50042',
}

/**
 * 전화번호 포맷 정규화
 * 010-1234-5678 -> 01012345678
 */
function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '')
}

/**
 * 루나소프트 API로 알림톡 발송
 */
export async function sendKakaoTalk(options: SendKakaoOptions): Promise<boolean> {
  const serverEnv = getServerEnv()

  if (!serverEnv.LUNASOFT_API_KEY || !serverEnv.LUNASOFT_API_ENDPOINT || !serverEnv.LUNASOFT_USER_ID) {
    throw new Error('Lunasoft API credentials are not configured')
  }

  const templateId = TEMPLATE_IDS[options.template]
  if (!templateId) {
    throw new Error(`Invalid template: ${options.template}`)
  }

  const normalizedPhone = normalizePhoneNumber(options.phoneNumber)

  const message: LunasoftMessage = {
    no: '0',
    tel_num: normalizedPhone,
    msg_content: '', // 템플릿 사용 시 빈 문자열
    sms_content: options.smsContent || '',
    use_sms: options.useSms ? '1' : '0',
    title: options.title,
  }

  // 템플릿 변수 추가
  if (options.variables) {
    Object.assign(message, options.variables)
  }

  // 버튼 URL이 있는 경우 추가
  if (options.buttonUrl) {
    message.btn_url = {
      url_pc: options.buttonUrl,
      url_mobile: options.buttonUrl,
    }
  }

  const requestBody: LunasoftRequest = {
    userid: serverEnv.LUNASOFT_USER_ID,
    api_key: serverEnv.LUNASOFT_API_KEY,
    template_id: templateId,
    messages: [message],
  }

  try {
    const response = await fetch(`${serverEnv.LUNASOFT_API_ENDPOINT}/api/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Lunasoft API error: ${response.status} - ${errorText}`)
    }

    const result: LunasoftResponse = await response.json()

    if (!result.success) {
      throw new Error(`Lunasoft API failed: ${result.message || 'Unknown error'}`)
    }

    return true
  } catch (error) {
    console.error('Failed to send KakaoTalk:', error)
    throw error
  }
}

/**
 * 견적서 발송 알림톡 (템플릿 50035)
 * 변수: #{company}, #{quotation_name}, #{time}, #{quotation_time}, #{quotation_cost}
 */
export async function sendQuoteSentKakao(params: {
  phoneNumber: string
  clientName: string
  clientCompany?: string
  supplierName: string
  quoteTitle: string
  quoteCost?: number
  expiryDate?: string
  viewUrl: string
}): Promise<boolean> {
  // 시간 포맷: "2025-10-21. 오후 2:30"
  const now = new Date()
  const timeStr = now.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).replace(/\. /g, '. ')

  return sendKakaoTalk({
    template: 'QUOTE_SEND',
    phoneNumber: params.phoneNumber,
    title: `업체명: ${params.supplierName}`,
    buttonUrl: params.viewUrl,
    variables: {
      '#{company}': params.supplierName,
      '#{quotation_name}': params.quoteTitle,
      '#{time}': timeStr,
      '#{quotation_time}': params.expiryDate || '미정',
      '#{quotation_cost}': params.quoteCost ? `${params.quoteCost.toLocaleString('ko-KR')}원` : '미정',
    },
  })
}

/**
 * 견적서 승인됨 알림톡 (템플릿 50036 - 발송자에게)
 * 변수: #{client}, #{quotation_name}, #{quotation_time}, #{quotation_cost}
 */
export async function sendQuoteApprovedKakao(params: {
  phoneNumber: string
  supplierName: string
  clientName: string
  clientCompany?: string
  quoteTitle: string
  quoteCost?: number
  expiryDate?: string
  createContractUrl: string
}): Promise<boolean> {
  return sendKakaoTalk({
    template: 'QUOTE_APPROVED',
    phoneNumber: params.phoneNumber,
    title: `업체명: ${params.supplierName}`,
    buttonUrl: params.createContractUrl,
    variables: {
      '#{client}': params.clientCompany || params.clientName,
      '#{quotation_name}': params.quoteTitle,
      '#{quotation_time}': params.expiryDate || '미정',
      '#{quotation_cost}': params.quoteCost ? `${params.quoteCost.toLocaleString('ko-KR')}원` : '미정',
    },
  })
}

/**
 * 견적서 거절됨 알림톡 (템플릿 50037 - 발송자에게)
 * 변수: #{client}, #{quotation_name}, #{quotation_time}, #{quotation_cost}
 */
export async function sendQuoteRejectedKakao(params: {
  phoneNumber: string
  supplierName: string
  clientName: string
  clientCompany?: string
  quoteTitle: string
  quoteCost?: number
  expiryDate?: string
}): Promise<boolean> {
  return sendKakaoTalk({
    template: 'QUOTE_REJECTED',
    phoneNumber: params.phoneNumber,
    title: `업체명: ${params.supplierName}`,
    variables: {
      '#{client}': params.clientCompany || params.clientName,
      '#{quotation_name}': params.quoteTitle,
      '#{quotation_time}': params.expiryDate || '미정',
      '#{quotation_cost}': params.quoteCost ? `${params.quoteCost.toLocaleString('ko-KR')}원` : '미정',
    },
  })
}

/**
 * 계약서 발송 알림톡 (템플릿 50038)
 * 변수: #{company}, #{contract_name}, #{time}, #{project_start_date}, #{contract_cost}, #{terms_of_payment}
 */
export async function sendContractSentKakao(params: {
  phoneNumber: string
  clientName: string
  clientCompany?: string
  supplierName: string
  contractTitle: string
  contractCost?: number
  projectStartDate?: string
  termsOfPayment?: string
  viewUrl: string
}): Promise<boolean> {
  // 시간 포맷: "2025-10-21. 오후 2:30"
  const now = new Date()
  const timeStr = now.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).replace(/\. /g, '. ')

  return sendKakaoTalk({
    template: 'CONTRACT_SEND',
    phoneNumber: params.phoneNumber,
    title: `업체명: ${params.supplierName}`,
    buttonUrl: params.viewUrl,
    variables: {
      '#{company}': params.supplierName,
      '#{contract_name}': params.contractTitle,
      '#{time}': timeStr,
      '#{project_start_date}': params.projectStartDate || '미정',
      '#{contract_cost}': params.contractCost ? `${params.contractCost.toLocaleString('ko-KR')}원` : '미정',
      '#{terms_of_payment}': params.termsOfPayment || '미정',
    },
  })
}

/**
 * 계약서 승인됨 알림톡 (템플릿 50039 - 발송자에게)
 * 변수: #{client}, #{contract_name}, #{project_start_date}, #{contract_cost}, #{terms_of_payment}
 */
export async function sendContractApprovedKakao(params: {
  phoneNumber: string
  supplierName: string
  clientName: string
  clientCompany?: string
  contractTitle: string
  contractCost?: number
  projectStartDate?: string
  termsOfPayment?: string
}): Promise<boolean> {
  return sendKakaoTalk({
    template: 'CONTRACT_APPROVED',
    phoneNumber: params.phoneNumber,
    title: `업체명: ${params.supplierName}`,
    variables: {
      '#{client}': params.clientCompany || params.clientName,
      '#{contract_name}': params.contractTitle,
      '#{project_start_date}': params.projectStartDate || '미정',
      '#{contract_cost}': params.contractCost ? `${params.contractCost.toLocaleString('ko-KR')}원` : '미정',
      '#{terms_of_payment}': params.termsOfPayment || '미정',
    },
  })
}

/**
 * 계약서 거절됨 알림톡 (템플릿 50040 - 발송자에게)
 * 변수: #{client}, #{contract_name}, #{project_start_date}, #{contract_cost}, #{terms_of_payment}
 */
export async function sendContractRejectedKakao(params: {
  phoneNumber: string
  supplierName: string
  clientName: string
  clientCompany?: string
  contractTitle: string
  contractCost?: number
  projectStartDate?: string
  termsOfPayment?: string
}): Promise<boolean> {
  return sendKakaoTalk({
    template: 'CONTRACT_REJECTED',
    phoneNumber: params.phoneNumber,
    title: `업체명: ${params.supplierName}`,
    variables: {
      '#{client}': params.clientCompany || params.clientName,
      '#{contract_name}': params.contractTitle,
      '#{project_start_date}': params.projectStartDate || '미정',
      '#{contract_cost}': params.contractCost ? `${params.contractCost.toLocaleString('ko-KR')}원` : '미정',
      '#{terms_of_payment}': params.termsOfPayment || '미정',
    },
  })
}

/**
 * 결제 요청 알림톡 (템플릿 50041)
 * 변수: #{company}, #{contract_name}, #{project_start_date}, #{contract_cost}, #{terms_of_payment}
 */
export async function sendPaymentRequestKakao(params: {
  phoneNumber: string
  clientName: string
  clientCompany?: string
  supplierName: string
  amount: number
  contractTitle: string
  projectStartDate?: string
  termsOfPayment?: string
}): Promise<boolean> {
  return sendKakaoTalk({
    template: 'PAYMENT_REQUEST',
    phoneNumber: params.phoneNumber,
    title: `업체명: ${params.supplierName}`,
    variables: {
      '#{company}': params.supplierName,
      '#{contract_name}': params.contractTitle,
      '#{project_start_date}': params.projectStartDate || '미정',
      '#{contract_cost}': `${params.amount.toLocaleString('ko-KR')}원`,
      '#{terms_of_payment}': params.termsOfPayment || '미정',
    },
  })
}

/**
 * 결제 확인 완료 알림톡 (템플릿 50042)
 * 변수: #{company}, #{contract_name}, #{project_start_date}, #{contract_cost}, #{terms_of_payment}
 */
export async function sendPaymentConfirmedKakao(params: {
  phoneNumber: string
  clientName: string
  clientCompany?: string
  supplierName: string
  amount: number
  contractTitle: string
  projectStartDate?: string
  termsOfPayment?: string
}): Promise<boolean> {
  return sendKakaoTalk({
    template: 'PAYMENT_CONFIRMED',
    phoneNumber: params.phoneNumber,
    title: `업체명: ${params.supplierName}`,
    variables: {
      '#{company}': params.supplierName,
      '#{contract_name}': params.contractTitle,
      '#{project_start_date}': params.projectStartDate || '미정',
      '#{contract_cost}': `${params.amount.toLocaleString('ko-KR')}원`,
      '#{terms_of_payment}': params.termsOfPayment || '미정',
    },
  })
}
