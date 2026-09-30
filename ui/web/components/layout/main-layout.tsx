// components/layout/main-layout.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { Header } from "./header";
import { Footer } from "./footer";
import { MaintenanceMode } from "./maintenance-mode";
import { LoadingScreen } from "./loading-screen";
import {
  findRouteConfig,
  canAccessRoute,
  shouldExcludeLayout,
  getLayoutOptions,
  getRouteStyleGroup,
  routeContainsTerm,
  UserRoles,
} from "@/configs/routes/routes-config";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, userDocument } = useAuthContext();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [isMaintenanceMode] = useState(false);

  const userRoles: UserRoles | null = user
    ? {
        isAuthenticated: true,
        role: userDocument?.role,
        isAdmin: userDocument?.role === "ADMIN",
        displayName: user.displayName ?? undefined,
        email: user.email ?? undefined,
      }
    : {
        isAuthenticated: false,
        role: undefined,
        isAdmin: false,
      };

  const styleGroup = getRouteStyleGroup(pathname);
  const isCrudRoute = routeContainsTerm(pathname, [
    "create",
    "new",
    "edit",
    "update",
    "add",
  ]);
  const excludeLayout = shouldExcludeLayout(pathname) || isCrudRoute;
  const layoutOptions = getLayoutOptions(pathname);

  useEffect(() => {
    if (!authLoading && pathname) {
      setIsCheckingAccess(true);

      if (pathname.startsWith("/auth/")) {
        setIsCheckingAccess(false);
        return;
      }

      const accessCheck = canAccessRoute(pathname, userRoles);

      if (!accessCheck.hasAccess && accessCheck.redirectTo) {
        setShouldRedirect(true);
        setRedirectPath(accessCheck.redirectTo);
      } else {
        setShouldRedirect(false);
        setRedirectPath(null);
      }

      setIsCheckingAccess(false);
    }
  }, [authLoading, pathname, userRoles]);

  useEffect(() => {
    if (shouldRedirect && redirectPath && !authLoading) {
      router.push(redirectPath);
    }
  }, [shouldRedirect, redirectPath, authLoading, router]);

  if (isMaintenanceMode && pathname !== "/maintenance") {
    return <MaintenanceMode />;
  }

  if (authLoading || isCheckingAccess) {
    return <LoadingScreen />;
  }

  if (shouldRedirect) {
    return <LoadingScreen />;
  }

  if (excludeLayout) {
    return (
      <TooltipProvider>
        <div className={styleGroup ? `${styleGroup}-layout` : ""}>
          {children}
          <Toaster />
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header
          showNavigation={layoutOptions.navigation || false}
          user={userRoles}
        />

        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={`flex-1 container mx-auto px-4 py-6 ${
              styleGroup ? `${styleGroup}-content` : ""
            }`}
          >
            {children}
          </motion.main>
        </AnimatePresence>

        {layoutOptions.footer && <Footer />}

        <Toaster />
      </div>
    </TooltipProvider>
  );
}
