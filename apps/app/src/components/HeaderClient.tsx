"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, User as UserIcon, Settings, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Settings as SettingsModal } from "@/components/Settings";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/components/ui/use-mobile";

export default function HeaderClient() {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Context를 통해 사이드바 토글 함수를 전달받는 대신 이벤트를 사용
  const handleMenuClick = () => {
    // 커스텀 이벤트를 발생시켜 사이드바를 토글
    const event = new CustomEvent('toggleMobileSidebar');
    window.dispatchEvent(event);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // 로그아웃 후 로그인 페이지로 이동
      window.location.href = '/auth/signin';
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      // 오류가 발생해도 강제로 로그인 페이지로 이동
      window.location.href = '/auth/signin';
    }
  };

  return (
    <header className="bg-background border-b border-border px-4 sm:px-6 py-2 sm:py-4">
      <div className={`w-full ${isMobile ? 'grid grid-cols-3 items-center' : 'flex items-center justify-between'}`}>
        {/* 왼쪽 영역 */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleMenuClick}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          )}
          {!isMobile && (
            <h1 className="text-lg sm:text-xl md:text-2xl font-medium text-foreground">TalkSign</h1>
          )}
        </div>

        {/* 중앙 영역 (모바일에서만 로고 표시) */}
        {isMobile && (
          <div className="flex justify-center">
            <h1 className="text-lg font-medium text-foreground">TalkSign</h1>
          </div>
        )}

        {/* 오른쪽 영역 */}
        <div className={`flex items-center gap-1 sm:gap-2 ${isMobile ? 'justify-end' : ''}`}>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-accent/50">
                <Avatar className="h-10 w-10 border-2 border-transparent">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {user?.name?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 border-2 shadow-xl z-50" 
              align="end" 
              forceMount
              style={{ 
                backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
                borderColor: theme === 'dark' ? '#333333' : '#e2e8f0',
                zIndex: 9999,
                opacity: 1
              }}
            >
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-foreground font-medium">{user?.name || '사용자'}</p>
                {user?.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                {user?.businessName && <p className="text-xs text-muted-foreground">{user.businessName}</p>}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-foreground hover:bg-accent"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>계정 설정</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>로그아웃</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <SettingsModal 
        open={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen} 
      />
    </header>
  );
}