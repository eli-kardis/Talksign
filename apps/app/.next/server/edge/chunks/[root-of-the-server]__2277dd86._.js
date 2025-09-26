(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/[root-of-the-server]__2277dd86._.js", {

"[externals]/node:buffer [external] (node:buffer, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}}),
"[project]/apps/app/src/middleware.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "config": ()=>config,
    "middleware": ()=>middleware
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
;
function middleware(request) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';
    // 개발 환경에서는 미들웨어 비활성화
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // 도메인별 라우팅 처리
    switch(hostname){
        case 'talksign.co.kr':
            // 랜딩 페이지 도메인: 오직 마케팅 페이지만 허용
            const authRoutes = [
                '/auth',
                '/login',
                '/signup',
                '/signin'
            ];
            const appRoutes = [
                '/dashboard',
                '/documents',
                '/finance',
                '/schedule',
                '/customers'
            ];
            // 인증 관련 라우트는 accounts 도메인으로 리다이렉트
            if (authRoutes.some((route)=>url.pathname.startsWith(route))) {
                url.hostname = 'accounts.talksign.co.kr';
                url.pathname = url.pathname.replace('/auth', ''); // /auth 접두사 제거
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
            }
            // 앱 관련 라우트는 app 도메인으로 리다이렉트
            if (appRoutes.some((route)=>url.pathname.startsWith(route))) {
                url.hostname = 'app.talksign.co.kr';
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
            }
            // 랜딩 페이지 허용 경로: /, /pricing, /features, /about, /contact
            const allowedLandingPaths = [
                '/',
                '/pricing',
                '/features',
                '/about',
                '/contact',
                '/api'
            ];
            if (!allowedLandingPaths.some((path)=>url.pathname.startsWith(path))) {
                // 허용되지 않은 경로는 홈으로 리다이렉트
                url.pathname = '/';
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
            }
            break;
        case 'accounts.talksign.co.kr':
            // 인증 도메인: 로그인/회원가입만 허용
            const allowedAuthPaths = [
                '/',
                '/login',
                '/signup',
                '/signin',
                '/forgot-password',
                '/reset-password',
                '/api'
            ];
            if (!allowedAuthPaths.some((path)=>url.pathname.startsWith(path))) {
                // 허용되지 않은 경로는 로그인 페이지로 리다이렉트
                url.pathname = '/login';
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
            }
            break;
        case 'app.talksign.co.kr':
            // 앱 도메인: 모든 앱 기능 허용
            // 인증되지 않은 사용자의 경우 accounts 도메인으로 리다이렉트는 각 페이지에서 처리
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
        default:
            // 알 수 없는 도메인은 메인 랜딩 페이지로 리다이렉트
            url.hostname = 'talksign.co.kr';
            url.pathname = '/';
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */ '/((?!_next/static|_next/image|favicon.ico).*)'
    ]
};
}),
}]);

//# sourceMappingURL=%5Broot-of-the-server%5D__2277dd86._.js.map