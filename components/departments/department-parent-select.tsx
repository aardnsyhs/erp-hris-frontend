'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useDepartmentTree } from '@/hooks/use-departments';
import { DepartmentTreeNode } from '@/types/department';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Network, CornerDownRight } from 'lucide-react';

export const ROOT_SENTINEL_VALUE = '__ROOT__';

export interface DepartmentParentSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  excludeId?: string;
  disabled?: boolean;
  placeholder?: string;
  allowRoot?: boolean;
}

interface FlatCandidate {
  id: string;
  code: string;
  name: string;
  level: number;
  isDisabled: boolean;
  disabledReason?: string;
}

function collectExcludedIds(nodes: DepartmentTreeNode[], targetId: string): Set<string> {
  const excluded = new Set<string>();

  function findAndCollect(current: DepartmentTreeNode, foundTarget: boolean) {
    const isTarget = foundTarget || current.id === targetId;
    if (isTarget) {
      excluded.add(current.id);
    }
    for (const child of current.children || []) {
      findAndCollect(child, isTarget);
    }
  }

  for (const root of nodes) {
    findAndCollect(root, false);
  }

  return excluded;
}

function computeSubtreeHeight(nodes: DepartmentTreeNode[], targetId: string): number {
  function findNode(current: DepartmentTreeNode): DepartmentTreeNode | null {
    if (current.id === targetId) return current;
    for (const child of current.children || []) {
      const found = findNode(child);
      if (found) return found;
    }
    return null;
  }

  let targetNode: DepartmentTreeNode | null = null;
  for (const root of nodes) {
    targetNode = findNode(root);
    if (targetNode) break;
  }

  if (!targetNode) return 0;

  function getHeight(node: DepartmentTreeNode): number {
    if (!node.children || node.children.length === 0) return 0;
    let maxChildHeight = 0;
    for (const child of node.children) {
      maxChildHeight = Math.max(maxChildHeight, 1 + getHeight(child));
    }
    return maxChildHeight;
  }

  return getHeight(targetNode);
}

function flattenTreeCandidates(
  nodes: DepartmentTreeNode[],
  excludedIds: Set<string>,
  targetSubtreeHeight: number = 0,
): FlatCandidate[] {
  const result: FlatCandidate[] = [];

  function traverse(node: DepartmentTreeNode) {
    if (excludedIds.has(node.id)) {
      return;
    }

    if (!node.isActive) {
      return;
    }

    const wouldExceedDepth = node.level + 1 + targetSubtreeHeight > 3;

    result.push({
      id: node.id,
      code: node.code,
      name: node.name,
      level: node.level,
      isDisabled: wouldExceedDepth,
      disabledReason: wouldExceedDepth
        ? 'Batas level organisasi maksimum (Level 0–3) terlampaui'
        : undefined,
    });

    for (const child of node.children || []) {
      traverse(child);
    }
  }

  for (const root of nodes) {
    traverse(root);
  }

  return result;
}

export function DepartmentParentSelect({
  value,
  onChange,
  excludeId,
  disabled = false,
  placeholder,
  allowRoot = true,
}: DepartmentParentSelectProps) {
  const t = useTranslations('departments');

  // Fetch full active tree for candidate filtering
  const { data: tree = [], isLoading } = useDepartmentTree({ includeArchived: false });

  const targetSubtreeHeight = useMemo(() => {
    if (!excludeId) return 0;
    return computeSubtreeHeight(tree, excludeId);
  }, [tree, excludeId]);

  const excludedIds = useMemo(() => {
    if (!excludeId) return new Set<string>();
    return collectExcludedIds(tree, excludeId);
  }, [tree, excludeId]);

  const candidates = useMemo(() => {
    return flattenTreeCandidates(tree, excludedIds, targetSubtreeHeight);
  }, [tree, excludedIds, targetSubtreeHeight]);

  const internalValue = value === null ? ROOT_SENTINEL_VALUE : (value ?? ROOT_SENTINEL_VALUE);

  const handleValueChange = (val: string | null) => {
    if (val === ROOT_SENTINEL_VALUE || val === null || val === '') {
      onChange(null);
    } else {
      onChange(val);
    }
  };

  return (
    <Select
      value={internalValue}
      onValueChange={handleValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className="w-full text-xs font-sans">
        <SelectValue placeholder={placeholder || t('selectParentPlaceholder')} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {allowRoot && (
          <>
            <SelectGroup>
              <SelectLabel className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                {t('rootLevelLabel')}
              </SelectLabel>
              <SelectItem value={ROOT_SENTINEL_VALUE} className="text-xs cursor-pointer font-medium">
                <div className="flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{t('makeRootDepartment')}</span>
                </div>
              </SelectItem>
            </SelectGroup>
            <SelectSeparator />
          </>
        )}

        <SelectGroup>
          <SelectLabel className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            {t('parentCandidateLabel')}
          </SelectLabel>
          {candidates.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground italic">
              {t('noEligibleParents')}
            </div>
          ) : (
            candidates.map((cand) => (
              <SelectItem
                key={cand.id}
                value={cand.id}
                disabled={cand.isDisabled}
                className="text-xs cursor-pointer"
              >
                <div
                  className="flex items-center gap-1.5"
                  style={{ paddingLeft: `${cand.level * 14}px` }}
                >
                  {cand.level > 0 && (
                    <CornerDownRight className="w-3 h-3 text-muted-foreground shrink-0" />
                  )}
                  <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-muted text-muted-foreground border border-border shrink-0">
                    L{cand.level}
                  </span>
                  <span className="font-mono font-semibold text-foreground shrink-0">
                    {cand.code}
                  </span>
                  <span className="text-muted-foreground truncate">— {cand.name}</span>
                  {cand.isDisabled && (
                    <span className="text-[10px] text-destructive italic ml-1 shrink-0">
                      ({t('depthLimitReached')})
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
