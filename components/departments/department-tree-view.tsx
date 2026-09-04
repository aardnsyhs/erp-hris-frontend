'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Network,
  Search,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  RotateCw,
  AlertCircle,
  FolderTree,
} from 'lucide-react';
import { useDepartmentTree } from '@/hooks/use-departments';
import { DepartmentTreeNode } from '@/types/department';
import { DepartmentTreeNodeItem } from './department-tree-node';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export interface DepartmentTreeViewProps {
  isHrAdmin: boolean;
  onEdit: (node: DepartmentTreeNode) => void;
  onReparent: (node: DepartmentTreeNode) => void;
  onArchive: (node: DepartmentTreeNode) => void;
  onRestore: (node: DepartmentTreeNode) => void;
}

function collectAllBranchIds(nodes: DepartmentTreeNode[]): Set<string> {
  const ids = new Set<string>();
  function traverse(node: DepartmentTreeNode) {
    if (node.children && node.children.length > 0) {
      ids.add(node.id);
      for (const child of node.children) {
        traverse(child);
      }
    }
  }
  for (const root of nodes) {
    traverse(root);
  }
  return ids;
}

function findMatchingAncestorIds(nodes: DepartmentTreeNode[], query: string): Set<string> {
  const ancestorIds = new Set<string>();
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return ancestorIds;

  function traverse(node: DepartmentTreeNode, currentPath: string[]): boolean {
    const isMatch =
      node.name.toLowerCase().includes(lowerQuery) ||
      node.code.toLowerCase().includes(lowerQuery);

    let hasMatchingDescendant = false;
    for (const child of node.children || []) {
      if (traverse(child, [...currentPath, node.id])) {
        hasMatchingDescendant = true;
      }
    }

    if (isMatch || hasMatchingDescendant) {
      for (const id of currentPath) {
        ancestorIds.add(id);
      }
      return true;
    }

    return false;
  }

  for (const root of nodes) {
    traverse(root, []);
  }

  return ancestorIds;
}

export function DepartmentTreeView({
  isHrAdmin,
  onEdit,
  onReparent,
  onArchive,
  onRestore,
}: DepartmentTreeViewProps) {
  const t = useTranslations('departments');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Explicit user expanded overrides. null means initial default state (roots expanded)
  const [userExpandedState, setUserExpandedState] = useState<Map<string, boolean> | null>(null);

  const {
    data: tree = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useDepartmentTree({ includeArchived });

  // Purely computed matching ancestors when search query is active
  const matchingAncestors = useMemo(() => {
    return findMatchingAncestorIds(tree, searchQuery);
  }, [tree, searchQuery]);

  const allBranchIds = useMemo(() => collectAllBranchIds(tree), [tree]);

  const isNodeExpanded = useCallback(
    (node: DepartmentTreeNode): boolean => {
      // If search query is active and this node is an ancestor of a match, expand it
      if (searchQuery.trim().length > 0 && matchingAncestors.has(node.id)) {
        return true;
      }

      // If user has explicitly toggled this node, respect user choice
      if (userExpandedState && userExpandedState.has(node.id)) {
        return userExpandedState.get(node.id) === true;
      }

      // Default initial state: roots (level 0) are expanded
      return node.level === 0;
    },
    [searchQuery, matchingAncestors, userExpandedState],
  );

  const toggleExpandNode = useCallback(
    (node: DepartmentTreeNode) => {
      const currentlyExpanded = isNodeExpanded(node);
      setUserExpandedState((prev) => {
        const next = new Map(prev ?? []);
        next.set(node.id, !currentlyExpanded);
        return next;
      });
    },
    [isNodeExpanded],
  );

  const handleExpandAll = useCallback(() => {
    const next = new Map<string, boolean>();
    for (const id of allBranchIds) {
      next.set(id, true);
    }
    setUserExpandedState(next);
  }, [allBranchIds]);

  const handleCollapseAll = useCallback(() => {
    const next = new Map<string, boolean>();
    for (const id of allBranchIds) {
      next.set(id, false);
    }
    setUserExpandedState(next);
  }, [allBranchIds]);

  // Filter nodes if search is active
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return tree;

    const lower = searchQuery.toLowerCase().trim();

    function filterNode(node: DepartmentTreeNode): DepartmentTreeNode | null {
      const isSelfMatch =
        node.name.toLowerCase().includes(lower) ||
        node.code.toLowerCase().includes(lower);

      const matchingChildren: DepartmentTreeNode[] = [];
      for (const child of node.children || []) {
        const filteredChild = filterNode(child);
        if (filteredChild) {
          matchingChildren.push(filteredChild);
        }
      }

      if (isSelfMatch || matchingChildren.length > 0) {
        return {
          ...node,
          children: matchingChildren,
        };
      }

      return null;
    }

    const result: DepartmentTreeNode[] = [];
    for (const root of tree) {
      const filtered = filterNode(root);
      if (filtered) {
        result.push(filtered);
      }
    }
    return result;
  }, [tree, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Action and Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card/60">
        {/* Search Field */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('treeSearchPlaceholder')}
            className="pl-8 text-xs font-sans h-8.5"
          />
        </div>

        {/* Tree Control Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
          {/* Include Archived Toggle */}
          <Button
            type="button"
            variant={includeArchived ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setIncludeArchived((prev) => !prev)}
            className="text-xs font-mono h-8.5 cursor-pointer gap-1.5"
            title={t('includeArchivedTooltip')}
          >
            {includeArchived ? (
              <>
                <Eye className="w-3.5 h-3.5 text-status-warning" />
                <span>{t('archivedIncluded')}</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{t('archivedExcluded')}</span>
              </>
            )}
          </Button>

          {/* Expand All */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExpandAll}
            disabled={tree.length === 0}
            className="text-xs font-mono h-8.5 cursor-pointer gap-1"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            <span>{t('expandAll')}</span>
          </Button>

          {/* Collapse All */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCollapseAll}
            disabled={tree.length === 0}
            className="text-xs font-mono h-8.5 cursor-pointer gap-1"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{t('collapseAll')}</span>
          </Button>

          {/* Refresh Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8.5 w-8.5 text-muted-foreground hover:text-foreground cursor-pointer"
            title={t('refreshTree')}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-primary' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Main Tree Container */}
      <div className="rounded-lg border border-border bg-card p-4 min-h-[300px]">
        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="pl-6 space-y-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              <div className="pl-6 space-y-3">
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : isError ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm font-semibold text-foreground">
              {t('treeLoadErrorTitle')}
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              {error instanceof Error ? error.message : t('treeLoadErrorDesc')}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs font-mono cursor-pointer"
            >
              {t('retryLoadTree')}
            </Button>
          </div>
        ) : filteredTree.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-3 rounded-full bg-muted/60 mb-3 text-muted-foreground">
              <FolderTree className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {searchQuery.trim()
                ? t('noTreeMatchSearchTitle')
                : t('noDepartmentsFound')}
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              {searchQuery.trim()
                ? t('noTreeMatchSearchDesc', { query: searchQuery })
                : t('treeEmptyDesc')}
            </p>
          </div>
        ) : (
          /* Hierarchical Tree Render */
          <div className="space-y-2 overflow-x-auto pb-2">
            {filteredTree.map((rootNode) => (
              <DepartmentTreeNodeItem
                key={rootNode.id}
                node={rootNode}
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

      {/* Footer Hierarchy Info / Legend */}
      <div className="flex items-center justify-between gap-2 px-1 text-[11px] font-mono text-muted-foreground flex-wrap">
        <div className="flex items-center gap-2">
          <Network className="w-3 h-3 text-primary shrink-0" />
          <span>{t('treeLegendTitle')}:</span>
          <span className="font-semibold text-primary">L0 (Root)</span>
          <span>→</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">L1 (Divisi)</span>
          <span>→</span>
          <span className="font-semibold text-teal-600 dark:text-teal-400">L2 (Departemen)</span>
          <span>→</span>
          <span>L3 (Unit)</span>
        </div>
        <div>
          <span>{t('maxDepthNotice')}</span>
        </div>
      </div>
    </div>
  );
}
