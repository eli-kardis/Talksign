import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient, getUserFromRequest } from '@/lib/auth-utils';
import { sendEmail } from '@/lib/email';
import { generateQuoteEmailTemplate, generateContractEmailTemplate } from '@/lib/email-templates';
import { parseQuoteFromDb, parseContractFromDb } from '@/lib/types';

export const runtime = 'nodejs';

interface SendEmailRequest {
  entityType: 'quote' | 'contract';
  entityId: string;
  toEmail: string;
  fromEmail: string;
  subject?: string;
  customMessage?: string;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SendEmailRequest = await request.json();
    const { entityType, entityId, toEmail, fromEmail, subject, customMessage } = body;

    if (!entityType || !entityId || !toEmail || !fromEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createUserSupabaseClient(request);

    let pdfBuffer: Buffer;
    let emailHtml: string;
    let finalSubject: string;
    let viewUrl: string;
    let pdfFileName: string;

    if (entityType === 'quote') {
      // 견적서 조회
      const { data: quote, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', entityId)
        .eq('user_id', userId)
        .single();

      if (error || !quote) {
        return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
      }

      const validQuote = parseQuoteFromDb(quote);

      // 사용자 정보 조회 (공급자 정보)
      const { data: user } = await supabase
        .from('users')
        .select('name, phone, business_registration_number, company_name, business_name')
        .eq('id', userId)
        .single();

      const supplierInfo = user || {} as any;

      // PDF 생성
      const { generateQuotePDF } = await import('@/lib/pdf-generator');
      pdfBuffer = await generateQuotePDF(validQuote, supplierInfo);

      // 파일명 생성: 공급자명_제목_견적서_날짜.pdf
      const supplierName = (supplierInfo.company_name || supplierInfo.name || '공급자')
        .replace(/[/\\?%*:|"<>]/g, '_')
        .replace(/\s+/g, '_');

      const title = validQuote.title
        .replace(/[/\\?%*:|"<>]/g, '_')
        .replace(/\s+/g, '_');

      const date = new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace(/\.$/, '');
      pdfFileName = `${supplierName}_${title}_견적서_${date}.pdf`;

      // 이메일 템플릿 생성
      viewUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://app.talksign.co.kr'}/quotes/${entityId}`;
      emailHtml = generateQuoteEmailTemplate({
        quoteId: entityId,
        title: validQuote.title,
        clientName: validQuote.client_name,
        supplierName: supplierInfo.name || supplierInfo.company_name || '공급자',
        totalAmount: validQuote.total || 0,
        expiryDate: validQuote.expiry_date
          ? new Date(validQuote.expiry_date).toLocaleDateString('ko-KR')
          : undefined,
        viewUrl,
        customMessage,
      });

      finalSubject = subject || `견적서가 도착했습니다 - ${validQuote.title}`;

    } else if (entityType === 'contract') {
      // 계약서 조회
      const { data: contract, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', entityId)
        .eq('user_id', userId)
        .single();

      if (error || !contract) {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      }

      const validContract = parseContractFromDb(contract);

      // 사용자 정보 조회 (공급자 정보)
      const { data: user } = await supabase
        .from('users')
        .select('name, phone, business_registration_number, company_name, business_name')
        .eq('id', userId)
        .single();

      const supplierInfo = user || {} as any;

      // PDF 생성
      const { generateContractPDF } = await import('@/lib/pdf-generator');
      pdfBuffer = await generateContractPDF(validContract, supplierInfo);

      // 파일명 생성: 공급자명_제목_계약서_날짜.pdf
      const supplierName = (supplierInfo.company_name || supplierInfo.name || '공급자')
        .replace(/[/\\?%*:|"<>]/g, '_')
        .replace(/\s+/g, '_');

      const title = validContract.title
        .replace(/[/\\?%*:|"<>]/g, '_')
        .replace(/\s+/g, '_');

      const date = new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace(/\.$/, '');
      pdfFileName = `${supplierName}_${title}_계약서_${date}.pdf`;

      // 이메일 템플릿 생성
      viewUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://app.talksign.co.kr'}/contracts/${entityId}`;
      emailHtml = generateContractEmailTemplate({
        contractId: entityId,
        title: validContract.title,
        clientName: validContract.client_name,
        supplierName: supplierInfo.name || supplierInfo.company_name || '공급자',
        totalAmount: validContract.total_amount || 0,
        viewUrl,
        customMessage,
      });

      finalSubject = subject || `계약서가 도착했습니다 - ${validContract.title}`;
    } else {
      return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
    }

    // 이메일 발송
    const result = await sendEmail({
      to: toEmail,
      from: fromEmail,
      subject: finalSubject,
      html: emailHtml,
      attachments: [
        {
          filename: pdfFileName,
          content: pdfBuffer,
        },
      ],
    });

    // 이메일 로그 저장 (TODO: database.types.ts에 email_logs 타입 추가 후 활성화)
    // await supabase.from('email_logs').insert({
    //   entity_type: entityType,
    //   entity_id: entityId,
    //   to_email: toEmail,
    //   from_email: fromEmail,
    //   subject: finalSubject,
    //   message: customMessage || null,
    //   resend_id: result.id,
    //   status: 'sent',
    // });

    return NextResponse.json({
      success: true,
      emailId: result.id,
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
