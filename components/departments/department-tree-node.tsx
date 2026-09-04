'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  ChevronRight,
  ChevronDown,
  Users,
  Archive,
  MoreHorizontal,
  Edit2,
  GitFork,
  RotateCcw,
} from 'lucide-react';
import { DepartmentTreeNode } from '@/types/department';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface DepartmentTreeNodeProps {
  node: DepartmentTreeNode;
  isHrAdmin: boolean;
  isNodeExpanded: (node: DepartmentTreeNode) => boolean;
  toggleExpandNode: (node: DepartmentTreeNode) => void;
  onEdit: (node: DepartmentTreeNode) => void;
  onReparent: (node: DepartmentTreeNode) => void;
  onArchive: (node: DepartmentTreeNode) => void;
  onRestore: (node: DepartmentTreeNode) => void;
  searchQuery?: string;
}

export function DepartmentTreeNodeItem({
  node,
  isHrAdmin,
  isNodeExpanded,
  toggleExpandNode,
  onEdit,
  onReparent,
  onArchive,
  onRestore,
  searchQuery = '',
}: DepartmentTreeNodeProps) {
  const t = useTranslations('departments');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('navigation');

  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = isNodeExpanded(node);
  const employeeCount = node._count?.employees ?? 0;

  // Level badge styling
  const getLevelBadge = (level: number) => {
    switch (level) {
      case 0:
        return (
          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
            L0 • Root
          </span>
        );
      case 1:
        return (
          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
            L1 • Divisi
          </span>
        );
      case 2:
        return (
          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shrink-0">
            L2 • Dept
          </span>
        );
      default:
        return (
          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border shrink-0">
            L{level} • Unit
          </span>
        );
    }
  };

  const isMatchedSearch =
    searchQuery.trim().length > 0 &&
    (node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.code.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col">
      {/* Node Row Card */}
      <div
        className={`group relative flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-all duration-150 ${
          isMatchedSearch
            ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20'
            : node.isActive
            ? 'bg-card hover:bg-muted/40 border-border/70 hover:border-border'
            : 'bg-muted/30 border-dashed border-border opacity-75 hover:opacity-100'
        }`}
        style={{
          marginLeft: `${node.level * 24}px`,
        }}
      >
        {/* Left Area: Expand Toggle, Level Badge, Code, Name */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Expand/Collapse Toggle Button */}
          {hasChildren ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => toggleExpandNode(node)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded cursor-pointer shrink-0"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6 shrink-0 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-border" />
            </div>
          )}

          {/* Level Badge */}
          {getLevelBadge(node.level)}

          {/* Code Badge */}
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border shrink-0">
            {node.code}
          </span>

          {/* Department Name */}
          <Link
            href={`/employees?departmentId=${node.id}`}
            className="font-semibold text-foreground text-xs hover:text-primary hover:underline transition-colors truncate"
            title={node.name}
          >
            {node.name}
          </Link>
        </div>

        {/* Right Area: Status Badge, Headcount, Children Count, Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Sub-departments count badge */}
          {hasChildren && (
            <span className="hidden sm:inline-flex text-[11px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted/60">
              {t('subUnitCount', { count: node.children.length })}
            </span>
          )}

          {/* Headcount Link */}
          <Link
            href={`/employees?departmentId=${node.id}`}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="tabular-nums font-medium text-foreground">
              {t('headcount', { count: employeeCount })}
            </span>
          </Link>

          {/* Status Badge */}
          {node.isActive ? (
            <Badge
              variant="outline"
              className="text-[10px] font-mono px-1.5 py-0 text-status-success border-(--status-success)/40 bg-status-success-bg gap-1 shrink-0"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-status-success inline-block" />
              {t('statusActive')}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-[10px] font-mono px-1.5 py-0 text-status-warning border-(--status-warning)/40 bg-status-warning-bg gap-1 shrink-0"
            >
              <Archive className="w-3 h-3 text-status-warning" />
              {t('statusArchived')}
            </Badge>
          )}

          {/* Actions Dropdown */}
          {isHrAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={tNav('menuAction')}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground outline-none cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 font-sans">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                    {tCommon('actions')}
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => onReparent(node)}
                    className="flex items-center gap-2 cursor-pointer text-xs font-medium text-primary"
                  >
                    <GitFork className="h-3.5 w-3.5 text-primary" />
                    <span>{t('moveDepartment')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onEdit(node)}
                    className="flex items-center gap-2 cursor-pointer text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{t('editDepartment')}</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {node.isActive ? (
                    <DropdownMenuItem
                      onClick={() => onArchive(node)}
                      className="flex items-center gap-2 text-status-warning cursor-pointer focus:bg-status-warning-bg text-xs"
                    >
                      <Archive className="h-3.5 w-3.5 text-status-warning" />
                      <span>{t('archiveDepartment')}</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => onRestore(node)}
                      className="flex items-center gap-2 text-status-success cursor-pointer focus:bg-status-success-bg text-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-status-success" />
                      <span>{t('restoreDepartment')}</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Recursive Children Container */}
      {hasChildren && isExpanded && (
        <div className="relative flex flex-col gap-2 pt-2">
          {node.children.map((child) => (
            <DepartmentTreeNodeItem
              key={child.id}
              node={child}
              isHrAdmin={isHrAdmin}
              isNodeExpanded={isNodeExpanded}
              toggleExpandNode={toggleExpandNode}
              onEdit={onEdit}
              onReparent={onReparent}
              onArchive={onArchive}
              onRestore={onRestore}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}
