// components/layout/maintenance-mode.tsx
"use client";

import { Wrench } from "lucide-react";
import { Button } from "../ui/button";
import { Typography } from "../ui/typography";

export function MaintenanceMode() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Wrench className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <Typography variant="h2" weight="bold">
            Maintenance en cours
          </Typography>
          <Typography variant="body-lg" theme="muted">
            Nous effectuons des mises à jour pour améliorer votre expérience.
            Veuillez revenir plus tard.
          </Typography>
        </div>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Actualiser la page
        </Button>
      </div>
    </div>
  );
}
