import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', logger(console.log));
app.use('*', cors({
  origin: ['https://figma.dev', 'http://localhost:3000', '*'],
  allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests', 'Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// 회원가입 엔드포인트
app.post('/auth/signup', async (c) => {
  try {
    const { name, email, password, businessName, phone } = await c.req.json();

    // 유효성 검증
    if (!name || !email || !password || !phone) {
      return c.json({ error: '필수 정보를 모두 입력해주세요.' }, 400);
    }

    if (password.length < 8) {
      return c.json({ error: '비밀번호는 8자 이상이어야 합니다.' }, 400);
    }

    // Supabase Auth를 통한 사용자 생성
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: { 
        name: name,
        business_name: businessName || '',
        phone: phone
      },
      // 자동으로 이메일 확인 (이메일 서버가 설정되지 않았으므로)
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: '회원가입 중 오류가 발생했습니다: ' + error.message }, 400);
    }

    // 사용자 프로필 정보를 KV Store에 저장
    const userProfile = {
      id: data.user.id,
      name,
      email,
      businessName: businessName || '',
      phone,
      createdAt: new Date().toISOString()
    };

    await kv.set(`user:${data.user.id}:profile`, userProfile);

    return c.json({ 
      message: '회원가입이 완료되었습니다.',
      user: {
        id: data.user.id,
        name,
        email,
        businessName: businessName || '',
        phone
      }
    });

  } catch (error) {
    console.log('Signup server error:', error);
    return c.json({ error: '서버 오류가 발생했습니다.' }, 500);
  }
});

// 로그인 검증 엔드포인트
app.post('/auth/verify', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: '인증 토큰이 필요합니다.' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: '유효하지 않은 토큰입니다.' }, 401);
    }

    // KV Store에서 사용자 프로필 조회
    const userProfile = await kv.get(`user:${user.id}:profile`);

    if (!userProfile) {
      // 프로필이 없는 경우 기본값으로 생성 (소셜 로그인 사용자일 수 있음)
      const profile = {
        id: user.id,
        name: user.user_metadata?.name || user.user_metadata?.full_name || '',
        email: user.email || '',
        businessName: user.user_metadata?.business_name || '',
        phone: user.user_metadata?.phone || '',
        provider: user.app_metadata?.provider || 'email',
        createdAt: new Date().toISOString()
      };
      await kv.set(`user:${user.id}:profile`, profile);
      return c.json({ user: profile });
    }

    return c.json({ user: userProfile });

  } catch (error) {
    console.log('Auth verify error:', error);
    return c.json({ error: '인증 확인 중 오류가 발생했습니다.' }, 500);
  }
});

// 소셜 로그인 사용자 정보 업데이트 (추가 정보 입력)
app.post('/auth/social-complete', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { businessName, phone } = await c.req.json();
    
    if (!accessToken) {
      return c.json({ error: '인증이 필요합니다.' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: '인증에 실패했습니다.' }, 401);
    }

    // 기존 프로필 조회
    const existingProfile = await kv.get(`user:${user.id}:profile`);
    
    // 업데이트된 프로필 생성
    const updatedProfile = {
      ...existingProfile,
      businessName: businessName || '',
      phone: phone || '',
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user:${user.id}:profile`, updatedProfile);

    return c.json({ 
      message: '프로필이 업데이트되었습니다.',
      user: updatedProfile 
    });

  } catch (error) {
    console.log('Social complete error:', error);
    return c.json({ error: '프로필 업데이트 중 오류가 발생했습니다.' }, 500);
  }
});

// 사용자 프로필 조회
app.get('/user/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: '인증이 필요합니다.' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: '인증에 실패했습니다.' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}:profile`);
    
    if (!userProfile) {
      return c.json({ error: '사용자 프로필을 찾을 수 없습니다.' }, 404);
    }

    return c.json({ user: userProfile });

  } catch (error) {
    console.log('Profile fetch error:', error);
    return c.json({ error: '프로필 조회 중 오류가 발생했습니다.' }, 500);
  }
});

// 사용자 데이터 저장 (견적서, 계약서, 일정 등)
app.post('/user/data/:type', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const dataType = c.req.param('type');
    const data = await c.req.json();
    
    if (!accessToken) {
      return c.json({ error: '인증이 필요합니다.' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: '인증에 실패했습니다.' }, 401);
    }

    // 데이터에 사용자 ID와 타임스탬프 추가
    const userData = {
      ...data,
      userId: user.id,
      updatedAt: new Date().toISOString()
    };

    // 데이터 타입에 따라 키 생성
    const key = `user:${user.id}:${dataType}`;
    await kv.set(key, userData);

    return c.json({ message: '데이터가 저장되었습니다.', data: userData });

  } catch (error) {
    console.log('Data save error:', error);
    return c.json({ error: '데이터 저장 중 오류가 발생했습니다.' }, 500);
  }
});

// 사용자 데이터 조회
app.get('/user/data/:type', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const dataType = c.req.param('type');
    
    if (!accessToken) {
      return c.json({ error: '인증이 필요합니다.' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: '인증에 실패했습니다.' }, 401);
    }

    const key = `user:${user.id}:${dataType}`;
    const userData = await kv.get(key);

    if (!userData) {
      return c.json({ data: null });
    }

    return c.json({ data: userData });

  } catch (error) {
    console.log('Data fetch error:', error);
    return c.json({ error: '데이터 조회 중 오류가 발생했습니다.' }, 500);
  }
});

serve(app.fetch);
