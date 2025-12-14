import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import DataTable from '@/components/reusable/DataTable'
import DeleteConfirmationModal from '@/components/reusable/DeleteConfirmationModal'
import { History, Trash2, Filter, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'
import moment from 'moment'
import type { Execution } from '@/lib/types'
import type { ColumnDef } from '@tanstack/react-table'

interface ExecutionHistoryProps {
  executions?: Execution[]
  onDeleteExecution?: (executionId: string) => Promise<void>
}

const statusStyles: Record<string, string> = {
  success:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  running:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  failed:
    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
}

export function ExecutionHistory({ executions = [], onDeleteExecution }: ExecutionHistoryProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; execution: Execution | null }>({
    open: false,
    execution: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (execution: Execution) => {
    setDeleteModal({ open: true, execution })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.execution || !onDeleteExecution) return

    setIsDeleting(true)
    try {
      await onDeleteExecution(deleteModal.execution.id)
      toast.success('Execution deleted successfully')
      setDeleteModal({ open: false, execution: null })
    } catch (error) {
      toast.error('Failed to delete execution')
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const ProgressBar = ({ value }: { value: number }) => {
    // Ensure value is a valid number between 0 and 100
    const safeValue =
      typeof value === 'number' && !isNaN(value) ? Math.max(0, Math.min(100, value)) : 0

    const getColor = (score: number) => {
      if (score >= 80) return 'bg-emerald-500'
      if (score >= 60) return 'bg-amber-500'
      return 'bg-red-500'
    }

    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getColor(safeValue)}`}
            style={{ width: `${safeValue}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-900 dark:text-white w-8">{safeValue}</span>
      </div>
    )
  }

  // Filter executions based on status
  const filteredExecutions = useMemo(() => {
    return executions.filter(exec => {
      const matchesStatus = statusFilter === 'all' || exec.status === statusFilter
      return matchesStatus
    })
  }, [executions, statusFilter])

  // Define columns for DataTable
  const columns: ColumnDef<Execution>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Execution ID',
        cell: ({ row }) => (
          <span className="text-xs text-gray-900 dark:text-white">{row.getValue('id')}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string
          return (
            <Badge className={statusStyles[status] || statusStyles.success}>
              {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'dataset_name',
        header: 'Dataset',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {row.getValue('dataset_name')}
          </span>
        ),
      },
      {
        accessorKey: 'impact_score',
        header: 'Impact Score',
        cell: ({ row }) => <ProgressBar value={row.getValue('impact_score')} />,
      },
      {
        accessorKey: 'duration',
        header: 'Duration',
        cell: ({ row }) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {row.getValue('duration')}
          </span>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ row }) => {
          const createdAt = row.getValue('created_at') as string
          const momentDate = moment(createdAt)

          return (
            <div className="flex flex-col">
              <span className="text-sm text-gray-900 dark:text-white">
                {momentDate.format('MMM DD, YYYY')}
              </span>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                <span>{momentDate.format('h:mm:ss A')}</span>
                <span className="text-gray-400">•</span>
                <span>{momentDate.format('HH:mm:ss')}</span>
              </div>
            </div>
          )
        },
      },
      ...(onDeleteExecution
        ? [
            {
              id: 'actions',
              header: 'Actions',
              cell: ({ row }: { row: any }) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(row.original)}
                  className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ),
              disableSorting: true,
            },
          ]
        : []),
    ],
    [onDeleteExecution, handleDeleteClick]
  )

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
              <History className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Executions
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="text-xs border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          >
            {filteredExecutions.length} of {executions.length}
          </Badge>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="running">Running</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </CardHeader>

      <CardContent>
        <DataTable
          data={filteredExecutions}
          columns={columns}
          searchPlaceholder="Search executions by ID or dataset..."
        />
      </CardContent>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModal.open}
        onOpenChange={open => setDeleteModal({ open, execution: null })}
        onDelete={handleDeleteConfirm}
        isDeleting={isDeleting}
        displayName={deleteModal.execution?.id || ''}
      />
    </Card>
  )
}
