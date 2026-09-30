
// components/shared/delete-button.tsx
'use client';

import { useState, ReactNode } from 'react';
import { Trash2, AlertTriangle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useDelete, DeleteOptions } from '@/hooks/use-delete';

// Props
export interface DeleteButtonProps extends Omit<DeleteOptions, 'entityType' | 'entityId'> {
  entityType: DeleteOptions['entityType'];
  entityId: string | number;
  entityName?: string;
  iconOnly?: boolean;
  children?: ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dialog?: {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
  };
}

export function DeleteButton({
  entityType,
  entityId,
  entityName,
  iconOnly = false,
  children,
  variant = 'destructive',
  size = 'md',
  className,
  redirectPath,
  invalidateQueries,
  onSuccess,
  onError,
  confirmMessage,
  successMessage,
  errorMessage,
  dialog = {},
}: DeleteButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Use delete hook
  const {
    handleDelete,
    confirmDelete,
    cancelDelete,
    isLoading,
    finalConfirmMessage,
  } = useDelete({
    entityType,
    entityId,
    entityName,
    redirectPath,
    invalidateQueries,
    onSuccess,
    onError,
    confirmMessage,
    successMessage,
    errorMessage,
  });

  // Handle button click
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDialogOpen(true);
    handleDelete();
  };

  // Handle confirm
  const handleConfirm = () => {
    confirmDelete();
    setIsDialogOpen(false);
  };

  // Handle cancel
  const handleCancel = () => {
    cancelDelete();
    setIsDialogOpen(false);
  };

  // Default labels
  const defaultLabels = {
    delete: 'Delete',
    confirming: 'Confirm Delete',
    cancel: 'Cancel',
  };

  const Icon = Trash2;

  // Size classes
  const sizeClasses = {
    sm: 'h-8 px-2 text-sm gap-1',
    md: 'h-10 px-3 text-base gap-2',
    lg: 'h-12 px-4 text-lg gap-2',
  };

  // Dialog config
  const dialogConfig = {
    title: dialog.title || `Delete ${entityName || entityType}`,
    description: dialog.description || finalConfirmMessage,
    confirmText: dialog.confirmText || 'Delete',
    cancelText: dialog.cancelText || 'Cancel',
  };

  return (
    <>
      <Button
        variant={variant}
        size={size === 'md' ? 'default' : size}
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50 select-none',
          sizeClasses[size],
          className
        )}
        aria-label={`Delete ${entityName || entityType}`}
      >
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Icon className={cn(
              'shrink-0',
              size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
            )} />
          )}
          {!iconOnly && (
            <span>{isLoading ? 'Deleting...' : (children || defaultLabels.delete)}</span>
          )}
        </div>
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              {dialogConfig.title}
            </DialogTitle>
            <DialogDescription>
              {dialogConfig.description}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 my-2">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ Warning: This action is permanent and cannot be undone.
            </p>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              {dialogConfig.cancelText}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Deleting...' : dialogConfig.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
