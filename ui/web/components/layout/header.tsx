// components/layout/header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  Bell,
  User,
  Shield,
  LogOut,
  Settings,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRoles } from "@/configs/routes/routes-config";
import {
  getHeaderMenuGroups,
  getRouteIcon,
} from "@/configs/routes/header-config";
import { ThemeToggle } from "../shared/ThemeToggle";

interface HeaderProps {
  showNavigation?: boolean;
  user: UserRoles | null;
}

export function Header({ showNavigation = true, user }: HeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useAuthContext();

  const menuGroups = getHeaderMenuGroups(user);

const MenuItem = ({ item }: { item: any }) => {
    const IconComponent = getRouteIcon(item.url) || item.icon;

    return (
        <Link
            href={item.url}
            className={cn(
                "flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors",
                pathname === item.url && "bg-accent"
            )}
        >
            {IconComponent && (
                <IconComponent className="h-4 w-4 text-primary" />
            )}

            <div className="flex flex-col">
                <span className="text-sm font-medium">
                    {item.title}
                </span>

                {item.description && (
                    <span className="text-xs text-muted-foreground">
                        {item.description}
                    </span>
                )}
            </div>
        </Link>
    );
};

  const DesktopNavigation = () => (
    <div className="flex items-center gap-2">
      {menuGroups.map((group) => (
        <DropdownMenu key={group.title}>
          <DropdownMenuTrigger
            render={(props) => (
              <Button
                {...props}
                variant="ghost"
                className="gap-1 h-10"
              >
                {group.title}
              </Button>
            )}
          />
          <DropdownMenuContent className="w-[360px]">
            <DropdownMenuGroup className="grid grid-cols-2 gap-1 p-2">
              {group.items.map((item) => (
                <DropdownMenuItem key={item.url} className="p-0 rounded-md">
                  <MenuItem item={item} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  );

  const MobileNavigation = () => (
    <div className="md:hidden border-t py-2">
      <div className="space-y-2">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <Typography variant="body-sm" weight="medium" className="px-3">
              {group.title}
            </Typography>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <Button
                    key={item.url}
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link href={item.url}>
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.title}</span>
                      {isActive && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
                      )}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <Typography
                variant="h4"
                weight="bold"
                className="hidden sm:block"
              >
                Immo360
              </Typography>
            </Link>
          </div>

          {showNavigation && (
            <div className="hidden md:block">
              <DesktopNavigation />
            </div>
          )}

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                0
              </Badge>
            </Button>

            {user?.isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={(props) => (
                    <Button
                      {...props}
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  )}
                />
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <div className="flex items-center justify-center gap-2 space-y-1">
                        <Typography variant="body-sm" weight="medium">
                          {user.displayName || user.email}
                        </Typography>
                        <Typography variant="caption2" theme="muted">
                          {user.role || "Utilisateur"}
                        </Typography>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem>
                    <Link href="/profile" className={'flex items-center justify-center gap-2'}>
                      <User className="mr-2 h-4 w-4" />
                      Mon profil
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem >
                    <Link href="/profile/settings" className={'flex items-center justify-center gap-2'}>
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </Link>
                  </DropdownMenuItem>

                  {user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem >
                        <Link href="/ad" className={'flex items-center justify-center gap-2'}>
                          <Shield className="mr-2 h-4 w-4" />
                          Administration
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer flex justify-center gap-2 items-center"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Link href="/auth/sign-in">Connexion</Link>
                </Button>
                <Button size="sm">
                  <Link href="/auth/sign-up">Inscription</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {isMobileMenuOpen && showNavigation && <MobileNavigation />}
      </div>
    </header>
  );
}
