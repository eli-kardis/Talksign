interface QuoteEmailData {
  quoteId: string;
  title: string;
  clientName: string;
  supplierName: string;
  totalAmount: number;
  expiryDate?: string;
  viewUrl: string;
  customMessage?: string;
}

interface ContractEmailData {
  contractId: string;
  title: string;
  clientName: string;
  supplierName: string;
  totalAmount: number;
  viewUrl: string;
  customMessage?: string;
}

export function generateQuoteEmailTemplate(data: QuoteEmailData): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 32px 24px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 24px;
    }
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
      font-size: 14px;
    }
    .info-label {
      color: #666;
      font-weight: 500;
    }
    .info-value {
      font-weight: 600;
      color: #333;
    }
    .message-box {
      background: #fffbeb;
      border-left: 4px solid #fbbf24;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .cta-button {
      display: inline-block;
      background: #667eea;
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      margin: 24px 0;
      transition: background 0.3s;
    }
    .cta-button:hover {
      background: #5568d3;
    }
    .footer {
      background: #f8f9fa;
      padding: 24px;
      text-align: center;
      font-size: 13px;
      color: #666;
      border-top: 1px solid #e9ecef;
    }
    .attachment-notice {
      background: #e7f3ff;
      border-left: 4px solid #3b82f6;
      padding: 12px 16px;
      margin: 16px 0;
      border-radius: 4px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📄 견적서가 도착했습니다</h1>
    </div>

    <div class="content">
      <div class="greeting">
        안녕하세요, <strong>${data.clientName}</strong>님
      </div>

      <p>
        <strong>${data.supplierName}</strong>에서 견적서를 보내드립니다.<br>
        아래 내용을 확인해주세요.
      </p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">견적서 제목</span>
          <span class="info-value">${data.title}</span>
        </div>
        <div class="info-row">
          <span class="info-label">총 견적 금액</span>
          <span class="info-value">₩${data.totalAmount.toLocaleString('ko-KR')}</span>
        </div>
        ${data.expiryDate ? `
        <div class="info-row">
          <span class="info-label">유효기한</span>
          <span class="info-value">${data.expiryDate}</span>
        </div>
        ` : ''}
      </div>

      ${data.customMessage ? `
      <div class="message-box">
        <strong>💬 메시지</strong>
        <p style="margin: 8px 0 0 0;">${data.customMessage.replace(/\n/g, '<br>')}</p>
      </div>
      ` : ''}

      <div class="attachment-notice">
        📎 첨부파일: 견적서 PDF 파일이 첨부되어 있습니다.
      </div>

      <div style="text-align: center;">
        <a href="${data.viewUrl}" class="cta-button">
          견적서 상세 보기 →
        </a>
      </div>

      <p style="font-size: 13px; color: #666; margin-top: 24px;">
        이 이메일에 답장하시면 발송자에게 직접 전달됩니다.<br>
        견적서에 대한 문의사항이 있으시면 언제든지 연락 주세요.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 8px 0;">
        이 이메일은 <strong>Talksign</strong>에서 발송되었습니다.
      </p>
      <p style="margin: 0; font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} Talksign. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateContractEmailTemplate(data: ContractEmailData): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 32px 24px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 24px;
    }
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #f5576c;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
      font-size: 14px;
    }
    .info-label {
      color: #666;
      font-weight: 500;
    }
    .info-value {
      font-weight: 600;
      color: #333;
    }
    .message-box {
      background: #fffbeb;
      border-left: 4px solid #fbbf24;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .cta-button {
      display: inline-block;
      background: #f5576c;
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      margin: 24px 0;
      transition: background 0.3s;
    }
    .cta-button:hover {
      background: #e14760;
    }
    .footer {
      background: #f8f9fa;
      padding: 24px;
      text-align: center;
      font-size: 13px;
      color: #666;
      border-top: 1px solid #e9ecef;
    }
    .attachment-notice {
      background: #e7f3ff;
      border-left: 4px solid #3b82f6;
      padding: 12px 16px;
      margin: 16px 0;
      border-radius: 4px;
      font-size: 14px;
    }
    .important-notice {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📝 계약서가 도착했습니다</h1>
    </div>

    <div class="content">
      <div class="greeting">
        안녕하세요, <strong>${data.clientName}</strong>님
      </div>

      <p>
        <strong>${data.supplierName}</strong>에서 계약서를 보내드립니다.<br>
        아래 내용을 확인하시고 검토 부탁드립니다.
      </p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">계약서 제목</span>
          <span class="info-value">${data.title}</span>
        </div>
        <div class="info-row">
          <span class="info-label">총 계약 금액</span>
          <span class="info-value">₩${data.totalAmount.toLocaleString('ko-KR')}</span>
        </div>
      </div>

      ${data.customMessage ? `
      <div class="message-box">
        <strong>💬 메시지</strong>
        <p style="margin: 8px 0 0 0;">${data.customMessage.replace(/\n/g, '<br>')}</p>
      </div>
      ` : ''}

      <div class="attachment-notice">
        📎 첨부파일: 계약서 PDF 파일이 첨부되어 있습니다.
      </div>

      <div class="important-notice">
        <strong>⚠️ 중요 안내</strong>
        <p style="margin: 8px 0 0 0; font-size: 14px;">
          계약서 내용을 꼼꼼히 검토하신 후, 동의하시는 경우에만 서명해주시기 바랍니다.
        </p>
      </div>

      <div style="text-align: center;">
        <a href="${data.viewUrl}" class="cta-button">
          계약서 확인 및 서명 →
        </a>
      </div>

      <p style="font-size: 13px; color: #666; margin-top: 24px;">
        이 이메일에 답장하시면 발송자에게 직접 전달됩니다.<br>
        계약서에 대한 문의사항이 있으시면 언제든지 연락 주세요.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 8px 0;">
        이 이메일은 <strong>Talksign</strong>에서 발송되었습니다.
      </p>
      <p style="margin: 0; font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} Talksign. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
