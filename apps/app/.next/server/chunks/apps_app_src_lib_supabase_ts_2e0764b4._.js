module.exports = {

"[project]/apps/app/src/lib/supabase.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "API_BASE_URL": ()=>API_BASE_URL,
    "apiRequest": ()=>apiRequest,
    "supabase": ()=>supabase,
    "supabaseAdmin": ()=>supabaseAdmin
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
;
// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = ("TURBOPACK compile-time value", "https://fwbkesioorqklhlcgmio.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3Ymtlc2lvb3Jxa2xobGNnbWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNDkxNzgsImV4cCI6MjA3MDgyNTE3OH0.YWsNJBHYzbm-y-zRNfxRu777qVU_8NYEWmLa62tf-3I");
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// 필수 환경 변수 검증
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
if (!supabaseServiceKey) {
    console.warn('Missing SUPABASE_SERVICE_ROLE_KEY - using anon key for service operations');
}
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
const API_BASE_URL = `${supabaseUrl}/functions/v1/make-server-e83d4894`;
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
        'Content-Type': 'application/json'
    };
    // 현재 세션에서 액세스 토큰 가져오기
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        defaultHeaders['Authorization'] = `Bearer ${session.access_token}`;
    }
    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });
    if (!response.ok) {
        const errorData = await response.json().catch(()=>({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}
}),

};

//# sourceMappingURL=apps_app_src_lib_supabase_ts_2e0764b4._.js.map