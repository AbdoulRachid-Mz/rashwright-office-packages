
// components/shared/delete-dropdown.tsx
'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Trash2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDelete, DeleteOptions } from '@/hooks/use-delete';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface DeleteDropdownProps extends DeleteOptions {
  triggerIcon?: React.ReactNode;
  triggerClassName?: string;
  menuAlign?: 'start' | 'center' | 'end';
  showDialog?: boolean;
}

export function DeleteDropdown({
  triggerIcon = <MoreVertical className="w-4 h-4" />,
  triggerClassName,
  menuAlign = 'end',
  showDialog = true,
  ...deleteOptions
}: DeleteDropdownProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const {
    handleDelete,
    confirmDelete,
    cancelDelete,
    isLoading,
    finalConfirmMessage,
  } = useDelete(deleteOptions);

  const handleItemClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (showDialog) {
      setIsDialogOpen(true);
      handleDelete();
    } else {
      confirmDelete();
    }
  };

  const handleDialogConfirm = () => {
    confirmDelete();
    setIsDialogOpen(false);
  };

  const handleDialogCancel = () => {
    cancelDelete();
    setIsDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-8 w-8 p-0', triggerClassName)}
            onClick={(e) => e.stopPropagation()}
          >
            {triggerIcon}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={menuAlign} className="w-40">
          <DropdownMenuItem
            onClick={handleItemClick}
            className="text-destructive focus:text-destructive"
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isLoading ? 'Deleting...' : 'Delete'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog */}
      {showDialog && isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-destructive">
                Confirm Delete
              </DialogTitle>
              <DialogDescription>
                {finalConfirmMessage}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDialogCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDialogConfirm}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
