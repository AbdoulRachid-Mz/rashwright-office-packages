
// components/shared/entity-list.tsx
'use client';

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Grid, List, Plus, RefreshCw, LayoutGrid } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Types
export interface EntityListProps<T> {
  title: string;
  description?: string;
  entityType: string;
  data: T[];
  total: number;
  loading?: boolean;

  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;

  searchTerm: string;
  onSearchChange: (search: string) => void;
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;

  onAdd?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;

  viewMode?: 'grid' | 'list' | 'compact';
  itemsPerView?: {
    mobile?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  onViewModeChange?: (mode: 'grid' | 'list' | 'compact') => void;

  renderCard: (item: T, viewMode: 'grid' | 'list' | 'compact') => React.ReactNode;
  renderStats?: () => React.ReactNode;

  availableFilters?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
  }>;
}

export function EntityList<T>({
  title,
  description,
  entityType,
  data,
  total,
  loading = false,
  page,
  limit,
  onPageChange,
  onLimitChange,
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  onAdd,
  onRefresh,
  onExport,
  viewMode = 'grid',
  itemsPerView = {
    mobile: viewMode === 'grid' ? 1 : viewMode === 'list' ? 1 : 2,
    md: viewMode === 'grid' ? 2 : viewMode === 'list' ? 1 : 3,
    lg: viewMode === 'grid' ? 2 : viewMode === 'list' ? 1 : 3,
    xl: viewMode === 'grid' ? 3 : viewMode === 'list' ? 1 : 4,
  },
  onViewModeChange,
  renderCard,
  renderStats,
  availableFilters = [],
}: EntityListProps<T>) {
  const totalPages = Math.ceil(total / limit) || 1;

  // Combine default and available filters
  const allFilters = useMemo(() => [
    {
      key: 'limit',
      label: 'Items per page',
      options: [
        { value: '10', label: '10' },
        { value: '20', label: '20' },
        { value: '50', label: '50' },
        { value: '100', label: '100' },
      ],
    },
    ...availableFilters,
  ], [availableFilters]);

  return (
    <div className="space-y-4">
      {/* Header with title and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onViewModeChange && (
            <div className="flex border rounded-lg p-1 bg-muted/50">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="h-8 w-8 p-0"
                title="Grid"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="h-8 w-8 p-0"
                title="List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'compact' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('compact')}
                className="h-8 w-8 p-0"
                title="Compact"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          )}

          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}

          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Plus className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}

          {onAdd && (
            <Button size="sm" onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {renderStats && renderStats()}

      {/* Search and filters */}
      <Card className="py-1 gap-1">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {allFilters.map((filter) => (
                <Select
                  key={filter.key}
                  value={
                    filter.key === 'limit'
                      ? limit.toString()
                      : (filters[filter.key] ?? 'all')
                  }
                  onValueChange={(value) => {
                    if (filter.key === 'limit') {
                      onLimitChange(Number(value));
                    } else {
                      onFilterChange({
                        ...filters,
                        [filter.key]: value === 'all' ? undefined : value,
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">
              {total} {total > 1 ? 'items' : 'item'} found
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Page {page} of {totalPages}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div
              className={cn(
                'grid gap-4',
                viewMode === 'grid' &&
                  'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
                viewMode === 'list' && 'grid-cols-1',
                viewMode === 'compact' &&
                  'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
              )}
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No results found
              </h3>
              <p className="text-sm text-muted-foreground">
                No {title.toLowerCase()} match your search criteria.
              </p>
            </div>
          ) : (
            <div
              className={cn(
                'grid gap-4',
                viewMode === 'grid' &&
                  `grid-cols-${itemsPerView.mobile} md:grid-cols-${itemsPerView.md} lg:grid-cols-${itemsPerView.lg} xl:grid-cols-${itemsPerView.xl}`,
                viewMode === 'list' && 'grid-cols-1',
                viewMode === 'compact' &&
                  `grid-cols-${itemsPerView.mobile} md:grid-cols-${itemsPerView.md} lg:grid-cols-${itemsPerView.lg} xl:grid-cols-${itemsPerView.xl}`
              )}
            >
              {data.map((item, index) => (
                <React.Fragment key={(item as any).id || index}>
                  {renderCard(item, viewMode)}
                </React.Fragment>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to{' '}
            {Math.min(page * limit, total)} of {total} items
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) onPageChange(page - 1);
                  }}
                  aria-disabled={page <= 1}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {/* First page */}
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(1);
                  }}
                  isActive={page === 1}
                >
                  1
                </PaginationLink>
              </PaginationItem>

              {/* Ellipsis before current page window */}
              {page > 3 && totalPages > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Current page window */}
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                const center = Math.min(Math.max(page, 3), totalPages - 2);
                const p = center - 1 + i;
                if (p <= 1 || p >= totalPages) return null;
                return (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(p);
                      }}
                      isActive={page === p}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {/* Ellipsis after current page window */}
              {page < totalPages - 2 && totalPages > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Last page */}
              {totalPages > 1 && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(totalPages);
                    }}
                    isActive={page === totalPages}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) onPageChange(page + 1);
                  }}
                  aria-disabled={page >= totalPages}
                  className={
                    page >= totalPages ? 'pointer-events-none opacity-50' : ''
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
