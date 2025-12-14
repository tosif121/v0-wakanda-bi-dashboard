'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

interface DeleteConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  isDeleting: boolean;
  displayName: string;
}

export default function DeleteConfirmationModal({
  open,
  onOpenChange,
  onDelete,
  isDeleting,
  displayName,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white text-center">Are you sure?</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400 text-center">
            Do you really want to delete "{displayName}"?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="justify-center mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isDeleting}
            className="border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button 
            onClick={onDelete} 
            disabled={isDeleting} 
            className="min-w-[100px] bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
