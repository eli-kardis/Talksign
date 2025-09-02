"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, User as UserIcon, Settings, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

export default function HeaderClient() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      // 오류가 발생해도 강제로 로그인 페이지로 이동
      window.location.href = '/auth/signin';
    }
  };

  return (
    <header className="bg-background border-b border-border px-4 py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 hidden md:block" />
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl md:text-2xl font-medium text-foreground">Link Flow</h1>
        </div>
        <div className="flex-1 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-10 w-10 rounded-full hover:bg-accent/50 hover:scale-105 transition-all duration-200">
            {theme === "light" ? <Moon className="h-5 w-5 text-foreground" /> : <Sun className="h-5 w-5 text-foreground" />}
            <span className="sr-only">테마 변경</span>
          </Button>

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
            <DropdownMenuContent className="w-56 bg-popover border-border" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-foreground font-medium">{user?.name || '사용자'}</p>
                {user?.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                {user?.businessName && <p className="text-xs text-muted-foreground">{user.businessName}</p>}
              </div>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="cursor-pointer text-foreground hover:bg-accent">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>프로필</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-foreground hover:bg-accent">
                <Settings className="mr-2 h-4 w-4" />
                <span>설정</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                className="cursor-pointer text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>로그아웃</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}