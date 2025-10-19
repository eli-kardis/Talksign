import { type Quote, type Contract, type SupplierInfo } from '@/lib/types'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

// 견적서 HTML 템플릿 생성
function generateQuoteHTML(quote: Quote, supplierInfo: SupplierInfo): string {
  const createdDate = quote.created_at
    ? new Date(quote.created_at).toLocaleDateString('ko-KR')
    : '';
  const expiryDate = quote.expiry_date
    ? new Date(quote.expiry_date).toLocaleDateString('ko-KR')
    : '';

  const itemsHTML = quote.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.unit_price.toLocaleString('ko-KR')}원</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${item.amount.toLocaleString('ko-KR')}원</td>
    </tr>
    ${item.description ? `
    <tr>
      <td colspan="4" style="padding: 8px 12px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #6b7280;">
        ${item.description}
      </td>
    </tr>
    ` : ''}
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>견적서 - ${quote.title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif;
          padding: 40px;
          color: #1f2937;
          background: white;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
        }
        .header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 8px;
        }
        .meta-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          padding: 15px;
          background-color: #f3f4f6;
          border-radius: 8px;
        }
        .meta-item {
          font-size: 14px;
          color: #4b5563;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .info-box {
          padding: 20px;
          background-color: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .info-box h3 {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
        }
        .info-row {
          display: flex;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .info-label {
          color: #6b7280;
          min-width: 120px;
        }
        .info-value {
          color: #1f2937;
          font-weight: 500;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        thead {
          background-color: #3b82f6;
          color: white;
        }
        th {
          padding: 14px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
        }
        th:nth-child(2), th:nth-child(3), th:nth-child(4) {
          text-align: center;
        }
        td {
          font-size: 14px;
          color: #374151;
        }
        .total-section {
          margin-top: 20px;
          padding: 20px;
          background-color: #eff6ff;
          border-radius: 8px;
          border: 2px solid #3b82f6;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 20px;
          font-weight: 700;
          color: #1e40af;
        }
        .notes {
          margin-top: 30px;
          padding: 20px;
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          border-radius: 4px;
        }
        .notes-title {
          font-weight: 600;
          margin-bottom: 8px;
          color: #92400e;
        }
        .notes-content {
          font-size: 14px;
          color: #78350f;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>견 적 서</h1>
        </div>

        <!-- Meta Information -->
        <div class="meta-info">
          <div class="meta-item">
            <strong>견적서 번호:</strong> ${quote.id}
          </div>
          ${createdDate ? `<div class="meta-item"><strong>작성일:</strong> ${createdDate}</div>` : ''}
          ${expiryDate ? `<div class="meta-item"><strong>유효기한:</strong> ${expiryDate}</div>` : ''}
        </div>

        <!-- Supplier and Client Info -->
        <div class="info-grid">
          <div class="info-box">
            <h3>공급자 정보</h3>
            ${supplierInfo?.company_name || supplierInfo?.name ? `
              <div class="info-row">
                <span class="info-label">회사명:</span>
                <span class="info-value">${supplierInfo.company_name || supplierInfo.name}</span>
              </div>
            ` : ''}
            ${supplierInfo?.name ? `
              <div class="info-row">
                <span class="info-label">대표자:</span>
                <span class="info-value">${supplierInfo.name}</span>
              </div>
            ` : ''}
            ${supplierInfo?.business_registration_number ? `
              <div class="info-row">
                <span class="info-label">사업자등록번호:</span>
                <span class="info-value">${supplierInfo.business_registration_number}</span>
              </div>
            ` : ''}
            ${supplierInfo?.business_type ? `
              <div class="info-row">
                <span class="info-label">업태:</span>
                <span class="info-value">${supplierInfo.business_type}</span>
              </div>
            ` : ''}
            ${supplierInfo?.business_category ? `
              <div class="info-row">
                <span class="info-label">업종:</span>
                <span class="info-value">${supplierInfo.business_category}</span>
              </div>
            ` : ''}
            ${supplierInfo?.phone ? `
              <div class="info-row">
                <span class="info-label">연락처:</span>
                <span class="info-value">${supplierInfo.phone}</span>
              </div>
            ` : ''}
            ${supplierInfo?.fax ? `
              <div class="info-row">
                <span class="info-label">팩스:</span>
                <span class="info-value">${supplierInfo.fax}</span>
              </div>
            ` : ''}
            ${supplierInfo?.business_address ? `
              <div class="info-row">
                <span class="info-label">주소:</span>
                <span class="info-value">${supplierInfo.business_address}</span>
              </div>
            ` : ''}
          </div>

          <div class="info-box">
            <h3>수신자 정보</h3>
            <div class="info-row">
              <span class="info-label">대표자명:</span>
              <span class="info-value">${quote.client_name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">이메일:</span>
              <span class="info-value">${quote.client_email}</span>
            </div>
            ${quote.client_phone ? `
              <div class="info-row">
                <span class="info-label">연락처:</span>
                <span class="info-value">${quote.client_phone}</span>
              </div>
            ` : ''}
            ${quote.client_company ? `
              <div class="info-row">
                <span class="info-label">회사명:</span>
                <span class="info-value">${quote.client_company}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Project Info -->
        <div class="section">
          <div class="section-title">프로젝트 정보</div>
          <div class="info-box">
            <div class="info-row">
              <span class="info-label">제목:</span>
              <span class="info-value">${quote.title}</span>
            </div>
            ${quote.notes ? `
              <div class="info-row" style="margin-top: 12px;">
                <span class="info-label">설명:</span>
                <span class="info-value" style="flex: 1;">${quote.notes}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Items Table -->
        <div class="section">
          <div class="section-title">견적 항목</div>
          <table>
            <thead>
              <tr>
                <th>항목명</th>
                <th style="text-align: center;">수량</th>
                <th style="text-align: center;">단가</th>
                <th style="text-align: center;">금액</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
        </div>

        <!-- Total -->
        <div class="total-section">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 16px;">
            <span>소계</span>
            <span>${(quote.subtotal || 0).toLocaleString('ko-KR')}원</span>
          </div>
          ${quote.discount_amount && quote.discount_amount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 16px; color: #dc2626;">
              <span>할인</span>
              <span>-${quote.discount_amount.toLocaleString('ko-KR')}원</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 16px;">
            <span>공급가액</span>
            <span>${((quote.subtotal || 0) - (quote.discount_amount || 0)).toLocaleString('ko-KR')}원</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 16px;">
            <span>부가세 (10%)</span>
            <span>${(Math.floor(((quote.subtotal || 0) - (quote.discount_amount || 0)) * 0.1)).toLocaleString('ko-KR')}원</span>
          </div>
          <div style="border-top: 2px solid #3b82f6; padding-top: 8px; margin-top: 8px;"></div>
          <div class="total-row">
            <span>최종 견적</span>
            <span>${(((quote.subtotal || 0) - (quote.discount_amount || 0)) + Math.floor(((quote.subtotal || 0) - (quote.discount_amount || 0)) * 0.1)).toLocaleString('ko-KR')}원</span>
          </div>
        </div>

        <!-- Payment Information -->
        ${quote.payment_condition || quote.payment_method || quote.bank_name ? `
        <div class="section">
          <div class="section-title">결제 정보</div>
          <div class="info-box">
            ${quote.payment_condition ? `
              <div class="info-row">
                <span class="info-label">결제 조건:</span>
                <span class="info-value">${quote.payment_condition}</span>
              </div>
            ` : ''}
            ${quote.payment_method ? `
              <div class="info-row">
                <span class="info-label">결제 방법:</span>
                <span class="info-value">${quote.payment_method}</span>
              </div>
            ` : ''}
            ${quote.payment_due_date ? `
              <div class="info-row">
                <span class="info-label">결제 기한:</span>
                <span class="info-value">${new Date(quote.payment_due_date).toLocaleDateString('ko-KR')}</span>
              </div>
            ` : ''}
            ${quote.bank_name ? `
              <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">입금 계좌</div>
                <div class="info-row">
                  <span class="info-label">은행명:</span>
                  <span class="info-value">${quote.bank_name}</span>
                </div>
                ${quote.bank_account_number ? `
                  <div class="info-row">
                    <span class="info-label">계좌번호:</span>
                    <span class="info-value">${quote.bank_account_number}</span>
                  </div>
                ` : ''}
                ${quote.bank_account_holder ? `
                  <div class="info-row">
                    <span class="info-label">예금주:</span>
                    <span class="info-value">${quote.bank_account_holder}</span>
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>
        </div>
        ` : ''}

        <!-- Quote Conditions -->
        ${quote.delivery_due_date || quote.warranty_period || quote.as_conditions || quote.special_notes || quote.disclaimer ? `
        <div class="section">
          <div class="section-title">견적 조건</div>
          <div class="info-box">
            ${quote.delivery_due_date ? `
              <div class="info-row">
                <span class="info-label">납품/완료 기한:</span>
                <span class="info-value">${new Date(quote.delivery_due_date).toLocaleDateString('ko-KR')}</span>
              </div>
            ` : ''}
            ${quote.warranty_period ? `
              <div class="info-row">
                <span class="info-label">하자보증 기간:</span>
                <span class="info-value">${quote.warranty_period}</span>
              </div>
            ` : ''}
            ${quote.as_conditions ? `
              <div style="margin-top: 12px;">
                <div style="font-weight: 600; margin-bottom: 4px; color: #374151;">A/S 조건</div>
                <div style="color: #4b5563; white-space: pre-wrap; line-height: 1.6;">${quote.as_conditions}</div>
              </div>
            ` : ''}
            ${quote.special_notes ? `
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                <div style="font-weight: 600; margin-bottom: 4px; color: #374151;">특기사항</div>
                <div style="color: #4b5563; white-space: pre-wrap; line-height: 1.6;">${quote.special_notes}</div>
              </div>
            ` : ''}
            ${quote.disclaimer ? `
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                <div style="font-weight: 600; margin-bottom: 4px; color: #374151;">면책사항</div>
                <div style="color: #4b5563; white-space: pre-wrap; line-height: 1.6;">${quote.disclaimer}</div>
              </div>
            ` : ''}
          </div>
        </div>
        ` : ''}

        <!-- Discount Information -->
        ${quote.discount_rate || quote.discount_amount || quote.promotion_code ? `
        <div class="section">
          <div class="section-title">할인 정보</div>
          <div class="info-box">
            ${quote.discount_rate && quote.discount_rate > 0 ? `
              <div class="info-row">
                <span class="info-label">할인율:</span>
                <span class="info-value">${quote.discount_rate}%</span>
              </div>
            ` : ''}
            ${quote.discount_amount && quote.discount_amount > 0 ? `
              <div class="info-row">
                <span class="info-label">할인 금액:</span>
                <span class="info-value" style="color: #dc2626; font-weight: 600;">-${quote.discount_amount.toLocaleString('ko-KR')}원</span>
              </div>
            ` : ''}
            ${quote.promotion_code ? `
              <div class="info-row">
                <span class="info-label">프로모션 코드:</span>
                <span class="info-value">${quote.promotion_code}</span>
              </div>
            ` : ''}
            ${quote.promotion_name ? `
              <div class="info-row">
                <span class="info-label">프로모션명:</span>
                <span class="info-value">${quote.promotion_name}</span>
              </div>
            ` : ''}
          </div>
        </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
}

// 계약서 HTML 템플릿 생성
function generateContractHTML(contract: Contract, supplierInfo: SupplierInfo): string {
  const createdDate = contract.created_at
    ? new Date(contract.created_at).toLocaleDateString('ko-KR')
    : '';
  const signedDate = contract.signed_at
    ? new Date(contract.signed_at).toLocaleDateString('ko-KR')
    : '';
  const startDate = contract.project_start_date
    ? new Date(contract.project_start_date).toLocaleDateString('ko-KR')
    : '';
  const endDate = contract.project_end_date
    ? new Date(contract.project_end_date).toLocaleDateString('ko-KR')
    : '';

  const itemsHTML = contract.items && contract.items.length > 0 ? contract.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.unit_price.toLocaleString('ko-KR')}원</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${item.amount.toLocaleString('ko-KR')}원</td>
    </tr>
    ${item.description ? `
    <tr>
      <td colspan="4" style="padding: 8px 12px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #6b7280;">
        ${item.description}
      </td>
    </tr>
    ` : ''}
  `).join('') : '';

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>계약서 - ${contract.title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif;
          padding: 40px;
          color: #1f2937;
          background: white;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #10b981;
          padding-bottom: 20px;
        }
        .header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #047857;
          margin-bottom: 8px;
        }
        .meta-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          padding: 15px;
          background-color: #f3f4f6;
          border-radius: 8px;
        }
        .meta-item {
          font-size: 14px;
          color: #4b5563;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }
        .party-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .party-box {
          padding: 20px;
          background-color: #ecfdf5;
          border-radius: 8px;
          border: 1px solid #10b981;
        }
        .party-box h3 {
          font-size: 16px;
          font-weight: 600;
          color: #047857;
          margin-bottom: 12px;
        }
        .info-row {
          display: flex;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .info-label {
          color: #6b7280;
          min-width: 120px;
        }
        .info-value {
          color: #1f2937;
          font-weight: 500;
        }
        .info-box {
          padding: 20px;
          background-color: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        thead {
          background-color: #10b981;
          color: white;
        }
        th {
          padding: 14px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
        }
        td {
          font-size: 14px;
          color: #374151;
        }
        .amount-summary {
          margin-top: 20px;
          padding: 20px;
          background-color: #f0fdf4;
          border-radius: 8px;
          border: 1px solid #10b981;
        }
        .amount-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 15px;
        }
        .amount-row.total {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 2px solid #10b981;
          font-size: 20px;
          font-weight: 700;
          color: #047857;
        }
        .terms-box {
          margin-top: 30px;
          padding: 20px;
          background-color: #fefce8;
          border-left: 4px solid #eab308;
          border-radius: 4px;
        }
        .terms-title {
          font-weight: 600;
          margin-bottom: 12px;
          color: #854d0e;
          font-size: 16px;
        }
        .terms-content {
          font-size: 14px;
          color: #713f12;
          line-height: 1.8;
          white-space: pre-wrap;
        }
        .signature-section {
          margin-top: 50px;
          padding-top: 30px;
          border-top: 2px solid #e5e7eb;
        }
        .signature-text {
          text-align: center;
          font-size: 14px;
          line-height: 1.8;
          color: #4b5563;
          margin-bottom: 30px;
        }
        .signature-boxes {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: 30px;
        }
        .signature-box {
          text-align: center;
        }
        .signature-box h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #1f2937;
        }
        .signature-line {
          border-bottom: 2px solid #374151;
          margin: 20px 0;
          padding-bottom: 40px;
        }
        .signature-name {
          font-size: 14px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>업무 계약서</h1>
        </div>

        <!-- Meta Information -->
        <div class="meta-info">
          <div class="meta-item">
            <strong>계약서 번호:</strong> ${contract.id}
          </div>
          ${createdDate ? `<div class="meta-item"><strong>작성일:</strong> ${createdDate}</div>` : ''}
          ${signedDate ? `<div class="meta-item"><strong>체결일:</strong> ${signedDate}</div>` : ''}
        </div>

        <!-- Parties -->
        <div class="section">
          <div class="section-title">계약 당사자</div>
          <div class="party-section">
            <div class="party-box">
              <h3>갑 (공급자)</h3>
              ${supplierInfo?.company_name || supplierInfo?.name ? `
                <div class="info-row">
                  <span class="info-label">회사명:</span>
                  <span class="info-value">${supplierInfo.company_name || supplierInfo.name}</span>
                </div>
              ` : ''}
              ${supplierInfo?.name ? `
                <div class="info-row">
                  <span class="info-label">대표자명:</span>
                  <span class="info-value">${supplierInfo.name}</span>
                </div>
              ` : ''}
              ${supplierInfo?.business_registration_number ? `
                <div class="info-row">
                  <span class="info-label">사업자등록번호:</span>
                  <span class="info-value">${supplierInfo.business_registration_number}</span>
                </div>
              ` : ''}
              ${supplierInfo?.phone ? `
                <div class="info-row">
                  <span class="info-label">연락처:</span>
                  <span class="info-value">${supplierInfo.phone}</span>
                </div>
              ` : ''}
            </div>

            <div class="party-box">
              <h3>을 (발주처)</h3>
              ${contract.client_company ? `
                <div class="info-row">
                  <span class="info-label">회사명:</span>
                  <span class="info-value">${contract.client_company}</span>
                </div>
              ` : ''}
              <div class="info-row">
                <span class="info-label">대표자명:</span>
                <span class="info-value">${contract.client_name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">이메일:</span>
                <span class="info-value">${contract.client_email}</span>
              </div>
              ${contract.client_phone ? `
                <div class="info-row">
                  <span class="info-label">연락처:</span>
                  <span class="info-value">${contract.client_phone}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Project Overview -->
        <div class="section">
          <div class="section-title">프로젝트 개요</div>
          <div class="info-box">
            <div class="info-row">
              <span class="info-label">프로젝트명:</span>
              <span class="info-value">${contract.title}</span>
            </div>
            ${contract.project_description ? `
              <div class="info-row" style="margin-top: 12px;">
                <span class="info-label">프로젝트 설명:</span>
                <span class="info-value" style="flex: 1;">${contract.project_description}</span>
              </div>
            ` : ''}
            ${startDate || endDate ? `
              <div class="info-row" style="margin-top: 12px;">
                ${startDate ? `<span class="info-label">시작일: ${startDate}</span>` : ''}
                ${endDate ? `<span class="info-label">종료일: ${endDate}</span>` : ''}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Contract Amount -->
        <div class="section">
          <div class="section-title">계약 금액</div>
          ${itemsHTML ? `
            <table>
              <thead>
                <tr>
                  <th>항목명</th>
                  <th style="text-align: center;">수량</th>
                  <th style="text-align: center;">단가</th>
                  <th style="text-align: center;">금액</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
          ` : ''}
          <div class="amount-summary">
            <div class="amount-row">
              <span>소계</span>
              <span>${(contract.subtotal || 0).toLocaleString('ko-KR')}원</span>
            </div>
            <div class="amount-row">
              <span>부가세 (${contract.tax_rate || 0}%)</span>
              <span>${(contract.tax_amount || 0).toLocaleString('ko-KR')}원</span>
            </div>
            <div class="amount-row total">
              <span>총 계약금액</span>
              <span>${(contract.total_amount || 0).toLocaleString('ko-KR')}원</span>
            </div>
          </div>
        </div>

        <!-- Payment Terms -->
        ${contract.payment_terms || contract.payment_method ? `
          <div class="section">
            <div class="section-title">결제 조건</div>
            <div class="info-box">
              ${contract.payment_method ? `
                <div class="info-row">
                  <span class="info-label">결제 방법:</span>
                  <span class="info-value">${contract.payment_method}</span>
                </div>
              ` : ''}
              ${contract.payment_terms ? `
                <div class="info-row" style="margin-top: 12px;">
                  <span class="info-label">결제 조건:</span>
                  <span class="info-value" style="flex: 1;">${contract.payment_terms}</span>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Contract Terms -->
        ${contract.terms ? `
          <div class="terms-box">
            <div class="terms-title">계약 조건</div>
            <div class="terms-content">${contract.terms}</div>
          </div>
        ` : ''}

        <!-- Detailed Payment Information -->
        ${contract.down_payment_ratio || contract.bank_name ? `
          <div class="section">
            <div class="section-title">상세 결제 정보</div>
            <div class="info-box">
              ${contract.down_payment_ratio || contract.interim_payment_ratio || contract.final_payment_ratio ? `
                <div style="margin-bottom: 16px;">
                  <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">대금 지급 비율</div>
                  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                    ${contract.down_payment_ratio ? `
                      <div class="info-row">
                        <span class="info-label">선금:</span>
                        <span class="info-value">${contract.down_payment_ratio}%</span>
                      </div>
                    ` : ''}
                    ${contract.interim_payment_ratio ? `
                      <div class="info-row">
                        <span class="info-label">중도금:</span>
                        <span class="info-value">${contract.interim_payment_ratio}%</span>
                      </div>
                    ` : ''}
                    ${contract.final_payment_ratio ? `
                      <div class="info-row">
                        <span class="info-label">잔금:</span>
                        <span class="info-value">${contract.final_payment_ratio}%</span>
                      </div>
                    ` : ''}
                  </div>
                </div>
              ` : ''}
              ${contract.down_payment_date || contract.interim_payment_date || contract.final_payment_date ? `
                <div style="margin-bottom: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                  <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">대금 지급일</div>
                  ${contract.down_payment_date ? `
                    <div class="info-row">
                      <span class="info-label">선금:</span>
                      <span class="info-value">${contract.down_payment_date}</span>
                    </div>
                  ` : ''}
                  ${contract.interim_payment_date ? `
                    <div class="info-row">
                      <span class="info-label">중도금:</span>
                      <span class="info-value">${contract.interim_payment_date}</span>
                    </div>
                  ` : ''}
                  ${contract.final_payment_date ? `
                    <div class="info-row">
                      <span class="info-label">잔금:</span>
                      <span class="info-value">${contract.final_payment_date}</span>
                    </div>
                  ` : ''}
                </div>
              ` : ''}
              ${contract.bank_name ? `
                <div style="padding-top: 16px; border-top: 1px solid #e5e7eb;">
                  <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">입금 계좌</div>
                  <div class="info-row">
                    <span class="info-label">은행:</span>
                    <span class="info-value">${contract.bank_name}</span>
                  </div>
                  ${contract.bank_account_number ? `
                    <div class="info-row">
                      <span class="info-label">계좌번호:</span>
                      <span class="info-value">${contract.bank_account_number}</span>
                    </div>
                  ` : ''}
                  ${contract.bank_account_holder ? `
                    <div class="info-row">
                      <span class="info-label">예금주:</span>
                      <span class="info-value">${contract.bank_account_holder}</span>
                    </div>
                  ` : ''}
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Delivery Conditions -->
        ${contract.delivery_conditions || contract.warranty_period ? `
          <div class="section">
            <div class="section-title">계약 이행 조건</div>
            <div class="info-box">
              ${contract.delivery_conditions ? `
                <div class="info-row">
                  <span class="info-label">인도/납품 조건:</span>
                  <span class="info-value" style="flex: 1;">${contract.delivery_conditions}</span>
                </div>
              ` : ''}
              ${contract.delivery_location ? `
                <div class="info-row">
                  <span class="info-label">납품 장소:</span>
                  <span class="info-value">${contract.delivery_location}</span>
                </div>
              ` : ''}
              ${contract.delivery_deadline ? `
                <div class="info-row">
                  <span class="info-label">납품 기한:</span>
                  <span class="info-value">${contract.delivery_deadline}</span>
                </div>
              ` : ''}
              ${contract.warranty_period ? `
                <div class="info-row">
                  <span class="info-label">하자보증 기간:</span>
                  <span class="info-value">${contract.warranty_period}</span>
                </div>
              ` : ''}
              ${contract.warranty_scope ? `
                <div class="info-row">
                  <span class="info-label">하자보증 범위:</span>
                  <span class="info-value" style="flex: 1;">${contract.warranty_scope}</span>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Legal Clauses -->
        ${contract.nda_clause || contract.termination_conditions || contract.force_majeure_clause ? `
          <div class="section">
            <div class="section-title">법적 보호 조항</div>
            <div class="info-box">
              ${contract.nda_clause ? `
                <div style="margin-bottom: 16px;">
                  <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">비밀유지 조항 (NDA)</div>
                  <div style="font-size: 14px; color: #4b5563; line-height: 1.8; white-space: pre-wrap;">${contract.nda_clause}</div>
                </div>
              ` : ''}
              ${contract.termination_conditions ? `
                <div style="margin-bottom: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                  <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">계약 해지 조건</div>
                  <div style="font-size: 14px; color: #4b5563; line-height: 1.8; white-space: pre-wrap;">${contract.termination_conditions}</div>
                </div>
              ` : ''}
              ${contract.dispute_resolution || contract.jurisdiction_court ? `
                <div style="margin-bottom: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                  <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">분쟁 해결</div>
                  ${contract.dispute_resolution ? `
                    <div class="info-row">
                      <span class="info-label">해결 방법:</span>
                      <span class="info-value">${contract.dispute_resolution}</span>
                    </div>
                  ` : ''}
                  ${contract.jurisdiction_court ? `
                    <div class="info-row">
                      <span class="info-label">관할 법원:</span>
                      <span class="info-value">${contract.jurisdiction_court}</span>
                    </div>
                  ` : ''}
                </div>
              ` : ''}
              ${contract.force_majeure_clause ? `
                <div style="padding-top: 16px; border-top: 1px solid #e5e7eb;">
                  <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">불가항력 조항</div>
                  <div style="font-size: 14px; color: #4b5563; line-height: 1.8; white-space: pre-wrap;">${contract.force_majeure_clause}</div>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Additional Clauses -->
        ${contract.renewal_conditions || contract.amendment_procedure || contract.special_terms || contract.penalty_clause ? `
          <div class="section">
            <div class="section-title">추가 조항</div>
            <div class="info-box">
              ${contract.renewal_conditions ? `
                <div style="margin-bottom: 16px;">
                  <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">계약 갱신 조건</div>
                  <div style="font-size: 14px; color: #4b5563; line-height: 1.8; white-space: pre-wrap;">${contract.renewal_conditions}</div>
                </div>
              ` : ''}
              ${contract.amendment_procedure ? `
                <div style="margin-bottom: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                  <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">계약 변경/수정 절차</div>
                  <div style="font-size: 14px; color: #4b5563; line-height: 1.8; white-space: pre-wrap;">${contract.amendment_procedure}</div>
                </div>
              ` : ''}
              ${contract.assignment_prohibition ? `
                <div style="margin-bottom: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                  <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">권리/의무 양도 금지</div>
                  <div style="font-size: 14px; color: #4b5563; line-height: 1.8; white-space: pre-wrap;">${contract.assignment_prohibition}</div>
                </div>
              ` : ''}
              ${contract.special_terms ? `
                <div style="margin-bottom: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                  <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">특약 사항</div>
                  <div style="font-size: 14px; color: #4b5563; line-height: 1.8; white-space: pre-wrap;">${contract.special_terms}</div>
                </div>
              ` : ''}
              ${contract.penalty_clause ? `
                <div style="padding-top: 16px; border-top: 1px solid #e5e7eb;">
                  <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">위약금 조항</div>
                  <div style="font-size: 14px; color: #4b5563; line-height: 1.8; white-space: pre-wrap;">${contract.penalty_clause}</div>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Signatures -->
        <div class="signature-section">
          <div class="signature-text">
            본 계약의 성실한 이행을 위하여 계약서 2통을 작성하고<br>
            갑, 을이 각각 서명한 후 1통씩 보관한다.
          </div>
          <div class="signature-text">
            ${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월 ${new Date().getDate()}일
          </div>
          <div class="signature-boxes">
            <div class="signature-box">
              <h4>갑 (공급자)</h4>
              <div class="signature-line"></div>
              <div class="signature-name">서명: ${supplierInfo?.name || '_______________'}</div>
              ${signedDate ? `<div class="signature-name" style="margin-top: 8px;">서명일: ${signedDate}</div>` : ''}
            </div>
            <div class="signature-box">
              <h4>을 (고객)</h4>
              <div class="signature-line"></div>
              <div class="signature-name">서명: ${contract.client_name || '_______________'}</div>
              ${signedDate ? `<div class="signature-name" style="margin-top: 8px;">서명일: ${signedDate}</div>` : ''}
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Puppeteer를 사용한 PDF 생성
export async function generateQuotePDF(quote: Quote, supplierInfo: SupplierInfo): Promise<Buffer> {
  const html = generateQuoteHTML(quote, supplierInfo);

  // Vercel 환경에서는 @sparticuz/chromium 사용, 로컬에서는 일반 puppeteer 사용
  const isVercel = process.env.VERCEL === '1';

  const browser = await puppeteer.launch({
    args: isVercel ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: isVercel ? await chromium.executablePath() : undefined,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

export async function generateContractPDF(contract: Contract, supplierInfo: SupplierInfo): Promise<Buffer> {
  const html = generateContractHTML(contract, supplierInfo);

  // Vercel 환경에서는 @sparticuz/chromium 사용, 로컬에서는 일반 puppeteer 사용
  const isVercel = process.env.VERCEL === '1';

  const browser = await puppeteer.launch({
    args: isVercel ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: isVercel ? await chromium.executablePath() : undefined,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
