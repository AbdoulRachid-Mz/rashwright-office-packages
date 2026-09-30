// components/layout/footer.tsx
"use client";

import Link from "next/link";
import { Building2, X } from "lucide-react";
import { Typography } from "../ui/typography";
import { Button } from "../ui/button";
import { FacebookIcon } from "../icons/facebook";
import { InstagramIcon } from "../icons/instagram";
import { LinkedinIcon } from "../icons/linkedin";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <Typography variant="h4" weight="bold">
                Immo360
              </Typography>
            </Link>
            <Typography variant="body-lg" theme="muted">
              Trouvez votre propriété idéale avec Immo360, la plateforme immobilière de référence.
            </Typography>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                <FacebookIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                <InstagramIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                <X className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                <LinkedinIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Typography variant="body-lg" weight="semibold">
              Liens rapides
            </Typography>
            <div className="grid gap-2">
              <Link href="/properties" className="text-muted-foreground hover:text-primary transition-colors">
                <Typography variant="body-sm">Propriétés</Typography>
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                <Typography variant="body-sm">À propos</Typography>
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                <Typography variant="body-sm">Contact</Typography>
              </Link>
              <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                <Typography variant="body-sm">FAQ</Typography>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <Typography variant="body-lg" weight="semibold">
              Légal
            </Typography>
            <div className="grid gap-2">
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                <Typography variant="body-sm">Conditions d'utilisation</Typography>
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                <Typography variant="body-sm">Politique de confidentialité</Typography>
              </Link>
              <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                <Typography variant="body-sm">Politique de cookies</Typography>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center">
          <Typography variant="body-sm" theme="muted">
            © {new Date().getFullYear()} Immo360. Tous droits réservés.
          </Typography>
        </div>
      </div>
    </footer>
  );
}
