import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import ts from 'typescript';
import { createTranslator } from 'next-intl';
import { NextIntlClientProvider } from 'next-intl';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import sharp from 'sharp';
import { compile } from '@tailwindcss/node';
import postcss from 'postcss';

const catalogs = {
  en: JSON.parse(fs.readFileSync(new URL('../messages/en.json', import.meta.url), 'utf8')),
  id: JSON.parse(fs.readFileSync(new URL('../messages/id.json', import.meta.url), 'utf8')),
};

function loadValidation(name) {
  return loadModule(`lib/validations/${name}.ts`);
}

function loadModule(relativePath, overrides = {}) {
  const filename = fileURLToPath(new URL(`../${relativePath}`, import.meta.url));
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  const compiledModule = new Module(filename);
  compiledModule.filename = filename;
  compiledModule.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = compiledModule.require.bind(compiledModule);
  compiledModule.require = (specifier) => {
    if (specifier in overrides) return overrides[specifier];
    if (!specifier.startsWith('@/')) return originalRequire(specifier);
    const relative = specifier.slice(2);
    const extension = fs.existsSync(new URL(`../${relative}.ts`, import.meta.url)) ? '.ts' : '.tsx';
    return loadModule(relative + extension, overrides);
  };
  compiledModule._compile(compiled.outputText, filename);
  return compiledModule.exports;
}

function translator(locale) {
  return createTranslator({ locale, messages: catalogs[locale], namespace: 'validation' });
}

// Exercise component handlers without a DOM; browser layout remains a separate check.
function stateHarness() {
  const slots = [];
  let cursor = 0;
  let changed = false;
  const hooks = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], (value) => {
        const next = typeof value === 'function' ? value(slots[index]) : value;
        if (!Object.is(next, slots[index])) changed = true;
        slots[index] = next;
      }];
    },
  };
  return {
    react: { __esModule: true, default: hooks, ...hooks },
    render(Component, props = {}) {
      let tree;
      for (let attempt = 0; attempt < 10; attempt++) {
        cursor = 0;
        changed = false;
        tree = Component(props);
        if (!changed) return tree;
      }
      throw new Error('Component did not stabilize');
    },
  };
}

function elements(tree) {
  if (Array.isArray(tree)) return tree.flatMap(elements);
  if (!React.isValidElement(tree)) return [];
  return [tree, ...elements(tree.props.children)];
}

test('select wrappers allow full labels and preserve value callbacks and control states', () => {
  const primitive = Object.fromEntries(['Root', 'Group', 'Value', 'Trigger', 'Icon', 'Portal', 'Positioner', 'Popup', 'List', 'GroupLabel', 'Item', 'ItemText', 'ItemIndicator', 'Separator', 'ScrollUpArrow', 'ScrollDownArrow'].map((key) => [key, `select-${key}`]));
  const ui = loadModule('components/ui/select.tsx', { '@base-ui/react/select': { Select: primitive } });
  const label = 'Change password (CHANGE_PASSWORD)';
  const trigger = ui.SelectTrigger({ className: 'w-[170px] h-8.5', children: label, disabled: true, 'aria-invalid': true });
  assert.equal(trigger.props.disabled, true);
  assert.equal(trigger.props['aria-invalid'], true);
  assert.ok(trigger.props.className.split(' ').includes('h-auto'));
  assert.ok(!trigger.props.className.includes('line-clamp'));
  const value = ui.SelectValue({ children: label, placeholder: 'All Actions' });
  assert.equal(value.props.children, label);
  assert.ok(value.props.className.includes('whitespace-normal'));
  const item = ui.SelectItem({ value: 'CHANGE_PASSWORD', children: label });
  assert.equal(item.props.value, 'CHANGE_PASSWORD');
  const text = elements(item).find((node) => node.type === 'select-ItemText');
  assert.equal(text.props.children, label);
  assert.ok(text.props.className.includes('overflow-wrap:anywhere'));
  assert.ok(!text.props.className.includes('shrink-0'));
  const popup = ui.SelectContent({ children: item });
  const positioner = elements(popup).find((node) => node.type === 'select-Positioner');
  assert.equal(positioner.props.collisionPadding, 8);
  assert.equal(positioner.props.alignItemWithTrigger, false);
});

test('checkbox forwards boolean, uncontrolled, disabled and mixed state without coercion', () => {
  const { Checkbox } = loadModule('components/ui/checkbox.tsx');
  const changed = [];
  const tree = Checkbox({ checked: false, indeterminate: true, disabled: true, required: true, id: 'all', name: 'selection', 'aria-invalid': true, onCheckedChange: (value) => changed.push(value) });
  assert.equal(tree.props.indeterminate, true);
  assert.equal(tree.props.checked, false);
  assert.equal(tree.props.required, true);
  assert.equal(tree.props.disabled, true);
  assert.equal(tree.props.id, 'all');
  assert.equal(tree.props.name, 'selection');
  tree.props.onCheckedChange(true); tree.props.onCheckedChange(false);
  assert.deepEqual(changed, [true, false]);
  const uncontrolled = Checkbox({ defaultChecked: true });
  assert.equal(uncontrolled.props.defaultChecked, true);
  assert.equal(uncontrolled.props.checked, undefined);
  const html = renderToStaticMarkup(React.createElement(Checkbox, { checked: false, indeterminate: true, 'aria-label': 'Select all' }));
  assert.ok(html.includes('aria-checked="mixed"'));
  assert.ok(html.includes('type="checkbox"'));
});

test('checkbox renders the primitive state and SVG for checked, unchecked and mixed values', () => {
  const { Checkbox } = loadModule('components/ui/checkbox.tsx');
  for (const checked of [false, true, false]) {
    const html = renderToStaticMarkup(React.createElement(Checkbox, { checked, name: 'active', 'aria-label': 'Active' }));
    assert.ok(html.includes(`aria-checked="${checked}"`));
    assert.ok(html.includes(checked ? 'data-checked=""' : 'data-unchecked=""'));
    assert.equal(html.includes('<svg'), checked);
    assert.ok(!html.includes('data-disabled=""'));
    if (checked) {
      assert.ok(html.includes('lucide-check'));
      assert.ok(html.includes('stroke="currentColor"'));
      assert.ok(html.includes('stroke-width="2"'));
      assert.ok(html.includes('data-slot="checkbox-indicator"'));
    }
  }
  const uncontrolled = renderToStaticMarkup(React.createElement(Checkbox, { defaultChecked: true }));
  assert.ok(uncontrolled.includes('lucide-check'));
  assert.ok(uncontrolled.includes('type="checkbox"'));
  assert.ok(uncontrolled.includes('checked=""'));
  const disabled = renderToStaticMarkup(React.createElement(Checkbox, { checked: true, disabled: true }));
  assert.ok(disabled.includes('data-disabled=""'));
  assert.ok(disabled.includes('lucide-check'));
  const mixed = renderToStaticMarkup(React.createElement(Checkbox, { indeterminate: true }));
  assert.ok(mixed.includes('aria-checked="mixed"'));
  assert.ok(mixed.includes('data-indeterminate=""'));
  assert.ok(mixed.includes('lucide-minus'));
  assert.ok(!mixed.includes('lucide-check'));
  const indicator = Checkbox({}).props.children;
  const computedMixed = renderToStaticMarkup(indicator.props.render({}, { indeterminate: true }));
  assert.ok(computedMixed.includes('lucide-minus'));
  assert.ok(!computedMixed.includes('lucide-check'));
});

test('compiled checkbox CSS restricts the dark neutral fill to unchecked state', async () => {
  const { Checkbox } = loadModule('components/ui/checkbox.tsx');
  const root = Checkbox({});
  const indicator = root.props.children;
  const compiler = await compile(fs.readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8'), {
    base: fileURLToPath(new URL('..', import.meta.url)), onDependency() {},
  });
  const css = postcss.parse(compiler.build([...root.props.className.split(' '), ...indicator.props.className.split(' ')]));
  const backgrounds = [];
  css.walkDecls('background-color', (declaration) => {
    if (declaration.parent.selector) backgrounds.push({ selector: declaration.parent.selector, value: declaration.value });
  });
  const neutral = backgrounds.filter(({ value }) => value.includes('var(--input)'));
  assert.ok(neutral.length > 0);
  for (const { selector } of neutral) {
    assert.ok(selector.includes(':is(.dark *)'));
    assert.ok(selector.includes('[data-unchecked]'));
  }
  for (const state of ['checked', 'indeterminate']) {
    assert.ok(backgrounds.some(({ selector, value }) => selector.includes(`[data-${state}]`) && value === 'var(--primary)'));
    let foreground = false;
    css.walkDecls('color', (declaration) => {
      if (declaration.parent.selector?.includes(`[data-${state}]`) && declaration.value === 'var(--primary-foreground)') foreground = true;
    });
    assert.ok(foreground);
  }
  let svgSize = false;
  css.walkDecls('width', (declaration) => {
    if (declaration.parent.selector?.includes('>svg') && declaration.value.includes('3.5')) svgSize = true;
  });
  assert.ok(svgSize);
  let disabledOpacity = false;
  css.walkDecls('opacity', (declaration) => {
    if (declaration.parent.selector?.includes('[data-disabled]') && declaration.value === '50%') disabledOpacity = true;
  });
  assert.ok(disabledOpacity);
});

test('table page-size select retains numeric values and existing pagination actions', () => {
  const sizes = [];
  const { DataTablePagination } = loadModule('components/shared/data-table-pagination.tsx', {
    'next-intl': { useTranslations: () => createTranslator({ locale: 'en', messages: catalogs.en, namespace: 'common' }) },
    '@/components/ui/select': { Select: 'select', SelectTrigger: 'trigger', SelectValue: 'value', SelectContent: 'options', SelectItem: 'option' },
  });
  const table = {
    getState: () => ({ pagination: { pageIndex: 2, pageSize: 10 } }),
    getPageCount: () => 5,
    getFilteredRowModel: () => ({ rows: [] }),
    setPageSize: (size) => sizes.push(size),
    getCanPreviousPage: () => true, getCanNextPage: () => true,
  };
  const tree = DataTablePagination({ table, totalRows: 50 });
  const select = elements(tree).find((node) => node.type === 'select');
  assert.equal(select.props.value, '10');
  assert.deepEqual(elements(tree).filter((node) => node.type === 'option').map((node) => node.props.value), ['10', '20', '30', '50']);
  select.props.onValueChange('30');
  assert.deepEqual(sizes, [30]);
});

test('Audit Logs Action selection preserves enum values, long labels and pagination reset', () => {
  const state = stateHarness();
  const queries = [];
  const Page = loadModule('app/(dashboard)/audit-logs/page.tsx', {
    react: state.react,
    'next-intl': { useLocale: () => 'en', useTranslations: (namespace) => createTranslator({ locale: 'en', messages: catalogs.en, namespace }) },
    '@/hooks/use-domain-label': { useDomainLabel: () => (group, value) => value === 'CHANGE_PASSWORD' ? 'Change password' : value },
    '@/lib/stores/auth-store': { useAuthStore: (select) => select({ user: { role: 'HR_ADMIN' } }) },
    '@/hooks/use-audit-logs': { useAuditLogs: (query) => { queries.push(query); return { data: { data: [] } }; } },
    '@/components/shared/data-table': { DataTable: 'table' },
    '@/components/ui/select': { Select: 'select', SelectTrigger: 'trigger', SelectValue: 'value', SelectContent: 'options', SelectItem: 'option' },
  }).default;
  let tree = state.render(Page);
  elements(tree).find((node) => node.type === 'table').props.onPaginationChange({ pageIndex: 3, pageSize: 10 });
  tree = state.render(Page);
  elements(tree).filter((node) => node.type === 'select')[1].props.onValueChange('CHANGE_PASSWORD');
  tree = state.render(Page);
  assert.equal(queries.at(-1).action, 'CHANGE_PASSWORD');
  assert.equal(queries.at(-1).page, 1);
  assert.ok(elements(tree).some((node) => node.type === 'value' && node.props.children === 'Change password (CHANGE_PASSWORD)'));
});

test('replaced form checkboxes retain boolean payloads for positions, contacts and reporting lines', async () => {
  for (const kind of ['position', 'contact', 'reporting']) {
    const state = stateHarness();
    let initialEffect;
    state.react.useEffect = state.react.default.useEffect = (effect) => { initialEffect = effect; };
    const payloads = [];
    const mutation = { isPending: false, mutateAsync: async (payload) => { payloads.push(payload); } };
    const overrides = {
      react: state.react,
      'next-intl': { useLocale: () => 'en', useTranslations: (namespace) => createTranslator({ locale: 'en', messages: catalogs.en, namespace }) },
      sonner: { toast: { success() {}, error() {} } },
      '@/hooks/use-api-error': { useApiError: () => () => '' },
      '@/components/ui/checkbox': { Checkbox: 'checkbox' },
      '@/components/ui/input': { Input: 'input' },
      '@/components/ui/button': { Button: 'button' },
      '@/components/ui/select': { Select: 'select', SelectTrigger: 'trigger', SelectValue: 'value', SelectContent: 'options', SelectItem: 'option' },
      '@/hooks/use-positions': { useCreatePosition: () => mutation, useUpdatePosition: () => mutation },
      '@/hooks/use-emergency-contacts': { useEmergencyContacts: () => ({ data: [{ id: 'contact', name: 'Test fixture', relationship: 'Sibling', phone: '0812345678', isPrimary: true }] }), useCreateEmergencyContact: () => mutation, useUpdateEmergencyContact: () => mutation, useDeleteEmergencyContact: () => mutation },
      '@/hooks/use-reporting-lines': { useReportingLines: () => ({ data: [] }), useCreateReportingLine: () => mutation },
      '@/hooks/use-employees': { useEmployees: () => ({ data: { data: [{ id: 'manager', fullName: 'Test fixture' }] } }) },
    };
    const [file, name] = kind === 'position' ? ['components/positions/position-form-dialog.tsx', 'PositionFormDialog'] : kind === 'contact' ? ['components/employees/emergency-contacts-tab.tsx', 'EmergencyContactsTab'] : ['components/employees/reporting-lines-tab.tsx', 'ReportingLinesTab'];
    const Component = loadModule(file, overrides)[name];
    const props = { open: true, onOpenChange() {}, employeeId: 'employee', isHrAdmin: true };
    if (kind === 'position') props.positionToEdit = { id: 'position', code: 'FIXTURE', title: 'Test fixture', level: 1, isActive: true };
    let tree = state.render(Component, props);
    if (initialEffect) { initialEffect(); tree = state.render(Component, props); }
    if (kind === 'contact') {
      elements(tree).find((node) => node.type === 'button' && React.Children.toArray(node.props.children).includes(catalogs.en.common.edit)).props.onClick();
      tree = state.render(Component, props);
    }
    const initialCheckbox = elements(tree).find((node) => node.type === 'checkbox');
    assert.equal(initialCheckbox.props.checked, true);
    assert.ok(elements(tree).some((node) => node.type === 'label' && node.props.htmlFor === initialCheckbox.props.id));
    const inputs = elements(tree).filter((node) => node.type === 'input');
    const values = kind === 'position' ? ['FIXTURE', 'Test fixture', '1'] : kind === 'contact' ? ['Test fixture', 'Sibling', '0812345678', ''] : ['2026-10-09'];
    inputs.forEach((input, index) => input.props.onChange({ target: { value: values[index] } }));
    if (kind === 'reporting') elements(tree).find((node) => node.type === 'select').props.onValueChange('manager');
    tree = state.render(Component, props);
    for (const checked of [false, true, false]) {
      const checkbox = elements(tree).find((node) => node.type === 'checkbox');
      checkbox.props.onCheckedChange(checked);
      tree = state.render(Component, props);
      assert.equal(elements(tree).find((node) => node.type === 'checkbox').props.checked, checked);
      await elements(tree).find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
      const payload = kind === 'position' ? payloads.at(-1).payload : kind === 'contact' ? payloads.at(-1).input : payloads.at(-1);
      assert.equal(payload[kind === 'position' ? 'isActive' : 'isPrimary'], checked);
      if (kind === 'reporting') {
        elements(tree).find((node) => node.type === 'select').props.onValueChange('manager');
        tree = state.render(Component, props);
      }
    }
  }
});

function pickerHarness(locale = 'en') {
  const state = stateHarness();
  const picker = loadModule('components/ui/date-picker.tsx', {
    react: state.react,
    'next-intl': {
      useLocale: () => locale,
      useTranslations: (namespace) => createTranslator({ locale, messages: catalogs[locale], namespace }),
    },
    '@/components/ui/calendar': { Calendar: 'calendar' },
    '@/components/ui/button': { Button: 'button' },
    '@/components/ui/popover': { Popover: 'popover', PopoverContent: 'popup', PopoverTrigger: 'trigger' },
  });
  let props = { from: '2026-10-02', to: '2026-10-08' };
  let tree;
  return {
    ...picker,
    render(next = {}) { props = { ...props, ...next }; tree = state.render(picker.DateRangePicker, props); return tree; },
    single(next) { tree = state.render(picker.DatePicker, next); return tree; },
    calendar: () => elements(tree).find((item) => item.type === 'calendar').props,
    open(value) { tree.props.onOpenChange(value); },
    action(key) {
      const label = catalogs[locale].datePicker[key];
      const button = elements(tree).find((item) => item.type === 'button' && elements(item).length && React.Children.toArray(item.props.children).includes(label));
      assert.ok(button, `Missing ${key} button`);
      return button.props;
    },
  };
}

for (const locale of ['en', 'id']) {
  test(`${locale}: range selection inside an applied range stays controlled until Apply`, () => {
    const picker = pickerHarness(locale);
    const changes = [];
    picker.render({ onChange: (range) => changes.push(range) });
    picker.open(true);
    picker.render();
    assert.equal(typeof picker.calendar().onSelect, 'function');
    assert.equal(picker.calendar().onDayClick, undefined);
    picker.calendar().onSelect(undefined, picker.parseFromYMD('2026-10-06'));
    let tree = picker.render();
    assert.equal(picker.formatToYMD(picker.calendar().selected.from), '2026-10-06');
    assert.equal(picker.calendar().selected.to, undefined);
    assert.equal(picker.action('apply').disabled, true);
    assert.deepEqual(changes, []);
    picker.calendar().onSelect(undefined, picker.parseFromYMD('2026-10-08'));
    tree = picker.render();
    assert.equal(picker.formatToYMD(picker.calendar().selected.to), '2026-10-08');
    const text = elements(tree).flatMap((item) => React.Children.toArray(item.props.children).filter((value) => typeof value === 'string'));
    assert.ok(text.includes(picker.formatPickerDate(picker.parseFromYMD('2026-10-06'), locale)));
    assert.ok(text.some((value) => value.includes(picker.formatPickerDate(picker.parseFromYMD('2026-10-02'), locale))));
    assert.deepEqual(changes, []);
    picker.action('apply').onClick();
    assert.deepEqual(changes, [{ from: '2026-10-06', to: '2026-10-08' }]);
    picker.render({ from: changes[0].from, to: changes[0].to });
    picker.open(true);
    picker.render();
    assert.equal(picker.formatToYMD(picker.calendar().selected.from), '2026-10-06');
  });
}

test('range Cancel, dismiss, reopen and external props discard unfinished drafts; Reset clears', () => {
  const picker = pickerHarness();
  const changes = [];
  picker.render({ onChange: (range) => changes.push(range) });
  for (const close of [() => picker.action('cancel').onClick(), () => picker.open(false)]) {
    picker.open(true); picker.render();
    picker.calendar().onSelect(undefined, picker.parseFromYMD('2026-10-06')); picker.render();
    close(); picker.render();
    picker.open(true); picker.render();
    assert.equal(picker.formatToYMD(picker.calendar().selected.from), '2026-10-02');
    assert.deepEqual(changes, []);
  }
  picker.calendar().onSelect(undefined, picker.parseFromYMD('2026-10-07')); picker.render();
  picker.render({ from: '2026-09-28', to: '2026-10-03' });
  assert.equal(picker.formatToYMD(picker.calendar().selected.from), '2026-09-28');
  picker.action('reset').onClick();
  assert.deepEqual(changes, [{ from: '', to: '' }]);
  picker.render({ from: '', to: '' }); picker.open(true); picker.render();
  assert.equal(picker.calendar().selected, undefined);
  const defaults = briefHelpers.defaultBriefPeriod(new Date('2026-10-08T08:00:00Z'));
  picker.render({ from: defaults.startDate, to: defaults.endDate });
  assert.equal(picker.formatToYMD(picker.calendar().selected.from), '2026-10-02');
});

test('range supports same-day, reverse and cross-month selection; auto waits for both dates', () => {
  const picker = pickerHarness();
  const changes = [];
  picker.render({ applyMode: 'auto', onChange: (range) => changes.push(range) });
  for (const [first, second, expected] of [
    ['2026-10-08', '2026-10-08', { from: '2026-10-08', to: '2026-10-08' }],
    ['2026-10-03', '2026-09-28', { from: '2026-09-28', to: '2026-10-03' }],
    ['2026-01-01', '2026-05-01', { from: '2026-01-01', to: '2026-05-01' }],
  ]) {
    picker.open(true); picker.render();
    const before = changes.length;
    picker.calendar().onSelect(undefined, picker.parseFromYMD(first)); picker.render();
    assert.equal(changes.length, before);
    picker.calendar().onSelect(undefined, picker.parseFromYMD(second)); picker.render();
    assert.deepEqual(changes.at(-1), expected);
    picker.render(expected);
  }
});

test('single-date selection follows props immediately and date-only parsing stays local and strict', () => {
  const picker = pickerHarness();
  const changes = [];
  const onChange = (value) => changes.push(value);
  picker.single({ value: '2026-10-02', onChange });
  assert.equal(picker.calendar().mode, 'single');
  picker.calendar().onSelect(picker.parseFromYMD('2026-10-06'));
  assert.deepEqual(changes, ['2026-10-06']);
  picker.single({ value: '2026-10-06', onChange });
  assert.equal(picker.formatToYMD(picker.calendar().selected), '2026-10-06');
  for (const invalid of ['2026-02-29', '2026-13-01', '2026-10-32', '2026-1-01', 'bad']) assert.equal(picker.parseFromYMD(invalid), undefined);
  for (const date of ['2024-02-29', '2026-10-08', '0001-01-01']) assert.equal(picker.formatToYMD(picker.parseFromYMD(date)), date);
});

test('actual calendar marks only draft endpoints, independently of today and focus styling', () => {
  const { Calendar } = loadModule('components/ui/calendar.tsx');
  const from = new Date(2026, 9, 6);
  const to = new Date(2026, 9, 8);
  const html = renderToStaticMarkup(React.createElement(Calendar, {
    mode: 'range', selected: { from, to }, onSelect: () => {},
    defaultMonth: new Date(2026, 9, 1), today: new Date(2026, 9, 2),
  }));
  const buttons = html.match(/<button\b[^>]*>/g) || [];
  assert.equal(buttons.filter((button) => button.includes('data-range-start="true"')).length, 1);
  assert.equal(buttons.filter((button) => button.includes('data-range-end="true"')).length, 1);
  assert.ok(buttons.find((button) => button.includes(`data-day="${from.toLocaleDateString()}"`)).includes('data-range-start="true"'));
  assert.ok(buttons.find((button) => button.includes(`data-day="${to.toLocaleDateString()}"`)).includes('data-range-end="true"'));
  const previousStart = buttons.find((button) => button.includes(`data-day="${new Date(2026, 9, 2).toLocaleDateString()}"`));
  assert.ok(!previousStart.includes('data-range-start="true"'));
  assert.ok(!previousStart.includes('aria-selected="true"'));
});

function keys(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [fullKey] : keys(value, fullKey);
  }).sort();
}

test('English and Indonesian catalogs contain the same keys', () => {
  assert.deepEqual(keys(catalogs.en), keys(catalogs.id));
});

const briefHelpers = loadModule('lib/hr-brief.ts');
const briefFixture = {
  period: { startDate: '2026-10-02', endDate: '2026-10-08' },
  referenceDate: '2026-10-08', timezone: 'Asia/Jakarta', generatedAt: '2026-10-07T17:05:00.000Z',
  departmentId: null, contractHorizon: { days: 30, endDate: '2026-11-07' },
  attendance: { PRESENT: 201, LATE: 37, ABSENT: 0, recordedEmployeeDays: 238 },
  open: {
    total: 258,
    leaves: { total: 81, remaining: 80, limit: 20, items: [{ id: 'old-pending', employeeId: 'emp-1', employee: { id: 'emp-1', fullName: 'Test fixture', nip: 'TEST-1' }, startDate: '2026-09-01', endDate: '2026-09-02', createdAt: '2026-08-25T02:00:00Z', datesPassed: true }] },
    upcomingContracts: { total: 30, remaining: 29, limit: 20, items: [{ id: 'contract-1', employeeId: 'emp-1', employee: { id: 'emp-1', fullName: 'Test fixture', nip: 'TEST-1' }, contractNumber: 'FIXTURE-1', endDate: '2026-10-15' }] },
    expiredActiveContracts: { total: 2, remaining: 2, limit: 20, items: [] },
    payrolls: { total: 145, remaining: 145, limit: 20, items: [], groups: [{ periodStart: '2026-09-01', periodEnd: '2026-09-30', status: 'DRAFT', total: 145 }] },
  },
};

test('HR Brief previews five records, expands loaded details and preserves backend totals and scope', () => {
  const state = stateHarness();
  const fixture = structuredClone(briefFixture);
  fixture.open.leaves.items = Array.from({ length: 20 }, (_, index) => ({ ...briefFixture.open.leaves.items[0], id: `leave-${index}` }));
  fixture.open.leaves.remaining = 61;
  fixture.open.payrolls.items = Array.from({ length: 20 }, (_, index) => ({ id: `payroll-${index}`, employeeId: 'emp-1', employee: { fullName: 'Fixture' }, periodStart: '2026-09-01', periodEnd: '2026-09-30', status: 'DRAFT' }));
  fixture.open.payrolls.remaining = 125;
  const t = createTranslator({ locale: 'en', messages: catalogs.en, namespace: 'hrBrief' });
  const Page = loadModule('app/(dashboard)/hr-brief/page.tsx', {
    react: state.react,
    'next-intl': { useLocale: () => 'en', useTranslations: () => t },
    '@/hooks/use-api-error': { useApiError: () => () => '' },
    '@/hooks/use-hr-brief': { useHrBrief: () => ({ data: fixture, isPending: false, isError: false }) },
    '@/hooks/use-departments': { useDepartmentTree: () => ({ data: [], isPending: false, isError: false }) },
    '@/lib/stores/auth-store': { useAuthStore: (selector) => selector({ user: { role: 'HR_ADMIN' } }) },
    '@/components/ui/button': { Button: 'button', buttonVariants: () => '' },
    '@/components/ui/select': { Select: 'select', SelectTrigger: 'trigger', SelectValue: 'value', SelectContent: 'options', SelectItem: 'option' },
  }).default;
  const Content = Page().type;
  let tree = state.render(Content);
  const byId = (id) => elements(tree).find((item) => item.props.id === id);
  const action = (label) => elements(tree).find((item) => item.type === 'button' && React.Children.toArray(item.props.children).includes(label));
  const count = (id) => React.Children.toArray(byId(id).props.children).length;
  assert.equal(count('brief-leaves'), 5);
  assert.equal(byId('brief-payroll-records').props.hidden, true);
  assert.equal(count('brief-payroll-list'), 5);
  const section = elements(tree).find((item) => item.props.title === t('pendingLeaves'));
  assert.equal(section.props.count, 81);
  assert.ok(elements(tree).some((item) => item.props.children === t('remaining', { count: 76 })));
  const summary = briefHelpers.buildBriefSummary(fixture, 'en', t('allDepartments'), t);
  assert.ok(elements(tree).some((item) => item.props.children === summary));
  action(t('showMore')).props.onClick(); tree = state.render(Content);
  assert.equal(count('brief-leaves'), 20);
  assert.ok(elements(tree).some((item) => item.props.children === t('remaining', { count: 61 })));
  action(t('showLess')).props.onClick(); tree = state.render(Content);
  assert.equal(count('brief-leaves'), 5);
  action(t('showRecords')).props.onClick(); tree = state.render(Content);
  assert.equal(byId('brief-payroll-records').props.hidden, false);
  assert.equal(count('brief-payroll-list'), 5);
  const payrollMore = elements(tree).find((item) => item.props['aria-controls'] === 'brief-payroll-list');
  payrollMore.props.onClick(); tree = state.render(Content);
  assert.equal(count('brief-payroll-list'), 20);
  assert.ok(elements(tree).some((item) => item.props.href === '/payrolls/payroll-19'));
  assert.ok(elements(tree).some((item) => item.props.children === t('remaining', { count: 125 })));
  elements(tree).find((item) => item.props['aria-controls'] === 'brief-payroll-list').props.onClick(); tree = state.render(Content);
  assert.equal(count('brief-payroll-list'), 5);
  action(t('hideRecords')).props.onClick(); tree = state.render(Content);
  assert.equal(byId('brief-payroll-records').props.hidden, true);
  action(t('showMore')).props.onClick(); tree = state.render(Content);
  elements(tree).find((item) => item.type === 'select').props.onValueChange('dept-1'); tree = state.render(Content);
  assert.equal(count('brief-leaves'), 5);
  assert.equal(byId('brief-payroll-records').props.hidden, true);
  const allLeaves = elements(tree).find((item) => item.props.href?.startsWith('/leave-requests?'));
  const source = new URL(allLeaves.props.href, 'https://example.test');
  assert.equal(source.searchParams.get('status'), 'PENDING');
  assert.equal(source.searchParams.get('departmentId'), 'dept-1');
});

test('HR Brief calendar defaults use WIB and validate inclusive 90-day bounds', () => {
  assert.deepEqual(briefHelpers.defaultBriefPeriod(new Date('2026-10-07T17:00:00Z')), { startDate: '2026-10-02', endDate: '2026-10-08' });
  assert.equal(briefHelpers.wibCalendarDate(new Date('2026-10-07T16:59:59Z')), '2026-10-07');
  assert.equal(briefHelpers.validBriefPeriod('2026-01-01', '2026-03-31'), true);
  for (const [start, end] of [['2026-02-29', '2026-03-01'], ['2026-01-01', '2026-04-01'], ['2026-10-09', '2026-10-08']]) assert.equal(briefHelpers.validBriefPeriod(start, end), false);
});

test('View all pending leave initializes the actual API query with its department and no recap date restriction', () => {
  const state = stateHarness();
  const queries = [];
  const params = new URLSearchParams('status=PENDING&departmentId=dept-1');
  const Page = loadModule('app/(dashboard)/leave-requests/page.tsx', {
    react: state.react,
    'next/navigation': { useSearchParams: () => params },
    '@/components/shared/data-table': { DataTable: 'table' },
    'next-intl': {
      useLocale: () => 'en',
      useTranslations: (namespace) => createTranslator({ locale: 'en', messages: catalogs.en, namespace }),
    },
    '@/hooks/use-domain-label': { useDomainLabel: () => (value) => value },
    '@/lib/stores/auth-store': { useAuthStore: (selector) => selector({ user: { role: 'HR_ADMIN' } }) },
    '@/hooks/use-departments': { useDepartments: () => ({ data: { data: [] } }) },
    '@/hooks/use-leave-requests': {
      useApproveLeaveRequest: () => ({}),
      useLeaveRequests: (query) => { queries.push(query); return { data: { data: [] }, isLoading: false }; },
    },
  }).default;
  const Content = Page().props.children.type;
  state.render(Content);
  assert.equal(queries.at(-1).status, 'PENDING');
  assert.equal(queries.at(-1).departmentId, 'dept-1');
  assert.equal(queries.at(-1).startDate, undefined);
  assert.equal(queries.at(-1).endDate, undefined);
});

test('HR Brief source URLs preserve record IDs and exact payroll group filters', () => {
  const contract = new URL(briefHelpers.contractSourceLink('emp-1', 'contract-1'), 'https://example.test');
  assert.equal(contract.pathname, '/employees/emp-1');
  assert.equal(contract.searchParams.get('tab'), 'contracts');
  assert.equal(contract.searchParams.get('contractId'), 'contract-1');
  const payroll = new URL(briefHelpers.payrollGroupSourceLink(briefFixture.open.payrolls.groups[0], 'dept-1'), 'https://example.test');
  assert.equal(payroll.searchParams.get('status'), 'DRAFT');
  assert.equal(payroll.searchParams.get('departmentId'), 'dept-1');
  assert.equal(payroll.searchParams.get('exactPeriod'), 'true');
});

test('successful mutations invalidate every cached brief filter; failed mutations do not', async () => {
  const { createQueryClient } = loadModule('lib/api/query-client.ts');
  const { queryKeys } = loadModule('lib/api/query-keys.ts');
  const client = createQueryClient();
  const first = queryKeys.hrBrief.detail({ departmentId: 'dept-1' });
  const second = queryKeys.hrBrief.detail({ departmentId: 'dept-2' });
  client.setQueryData(first, briefFixture);
  client.setQueryData(second, briefFixture);
  await client.getMutationCache().build(client, { mutationFn: async () => ({ status: 'APPROVED' }) }).execute();
  assert.equal(client.getQueryState(first).isInvalidated, true);
  assert.equal(client.getQueryState(second).isInvalidated, true);
  client.setQueryData(first, briefFixture);
  await assert.rejects(client.getMutationCache().build(client, { mutationFn: async () => { throw new Error('fixture failure'); } }).execute());
  assert.equal(client.getQueryState(first).isInvalidated, false);
  client.clear();
});

for (const locale of ['en', 'id']) {
  test(`${locale}: HR Brief summary uses actual totals, explicit scopes, WIB and complete templates`, () => {
    const errors = [];
    const t = createTranslator({ locale, messages: catalogs[locale], namespace: 'hrBrief', onError: (error) => errors.push(error) });
    const summary = briefHelpers.buildBriefSummary(briefFixture, locale, t('allDepartments'), t);
    for (const count of [201, 37, 238, 81, 30, 2, 145]) assert.ok(summary.includes(String(count)));
    assert.ok(summary.includes('WIB'));
    assert.ok(summary.includes('2026'));
    assert.ok(summary.includes(t('allDepartments')));
    const singular = structuredClone(briefFixture);
    singular.open.leaves.total = 1;
    singular.open.payrolls.total = 1;
    const singularSummary = briefHelpers.buildBriefSummary(singular, locale, 'Fixture', t);
    assert.ok(singularSummary.includes(locale === 'en' ? '1 pending leave request,' : '1 pengajuan cuti'));
    for (const key of Object.keys(catalogs[locale].hrBrief)) {
      if (key === 'summaryTemplate') continue;
      t(key, { count: 2, days: 30, time: '00:05', date: '8 Oct', start: '2 Oct', end: '8 Oct' });
    }
    assert.deepEqual(errors, []);
  });

  test(`${locale}: HR Brief renders data, bounded detail counts and real source links; errors never show zero metrics`, () => {
    const renderBrief = (query, role = 'HR_ADMIN') => {
      const Page = loadModule('app/(dashboard)/hr-brief/page.tsx', {
        '@/hooks/use-hr-brief': { useHrBrief: () => query },
        '@/hooks/use-departments': { useDepartmentTree: () => ({ data: [], isPending: false, isError: false }) },
        '@/lib/stores/auth-store': { useAuthStore: (selector) => selector({ user: { role } }) },
      }).default;
      return renderToStaticMarkup(React.createElement(NextIntlClientProvider, { locale, messages: catalogs[locale], timeZone: 'Asia/Jakarta' }, React.createElement(Page)));
    };
    const ready = renderBrief({ data: briefFixture, isPending: false, isError: false, isFetching: false });
    assert.ok(ready.includes('/leave-requests/old-pending'));
    assert.ok(ready.includes('contractId=contract-1'));
    assert.ok(ready.includes('exactPeriod=true'));
    assert.ok(ready.includes('80'));
    assert.ok(ready.includes(catalogs[locale].hrBrief.datesPassed));
    const error = renderBrief({ data: briefFixture, isError: true, isPending: false, error: new Error('fixture'), refetch: () => {} });
    assert.ok(error.includes('role="alert"'));
    assert.ok(!error.includes(catalogs[locale].hrBrief.attention));
    assert.ok(!error.includes('201'));
    const loading = renderBrief({ isPending: true, isError: false });
    assert.ok(loading.includes('role="status"'));
    const denied = renderBrief({ isPending: true, isError: false }, 'MANAGER');
    assert.ok(denied.includes(catalogs[locale].hrBrief.adminOnly));
    assert.ok(!denied.includes(catalogs[locale].hrBrief.copy));
  });
}

const { localizedApiError } = loadModule('lib/i18n/api-error.ts');
const { localizedDomainLabel } = loadModule('lib/i18n/domain-label.ts');
const { Breadcrumb } = loadModule('components/ui/breadcrumb.tsx');
const { AuditMeta } = loadModule('components/shared/audit-meta.tsx');
const { formatRupiah } = loadModule('lib/i18n/currency.ts');
const site = loadModule('lib/site.ts');
const robots = loadModule('app/robots.ts').default;
const sitemap = loadModule('app/sitemap.ts').default;
const { middleware } = loadModule('middleware.ts');
const { NextRequest } = await import('next/server.js');

test('production sitemap includes only public localized pages at the configured origin', () => {
  const originalMode = process.env.NODE_ENV;
  const originalSite = process.env.SITE_URL;
  try {
    process.env.NODE_ENV = 'production';
    process.env.SITE_URL = 'https://hris.ardiansyah.app';
    assert.deepEqual(sitemap().map((entry) => entry.url), [
      'https://hris.ardiansyah.app/about', 'https://hris.ardiansyah.app/id/about',
    ]);
    assert.equal(robots().sitemap, 'https://hris.ardiansyah.app/sitemap.xml');
    assert.equal(site.canIndexPublicPages(), true);
    for (const value of ['invalid', 'http://example.com', 'https://example.com/private', 'https://user:password@example.com', 'https://example.com/?query=1', 'https://localhost']) {
      process.env.SITE_URL = value;
      assert.equal(site.getSiteUrl(), undefined);
      assert.deepEqual(sitemap(), []);
      assert.equal(robots().rules.disallow, '/');
    }
    delete process.env.SITE_URL;
    assert.equal(site.getSiteUrl().origin, 'https://hris.ardiansyah.app');
    process.env.NODE_ENV = 'development';
    assert.equal(site.canIndexPublicPages(), false);
    assert.deepEqual(sitemap(), []);
  } finally {
    if (originalMode === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = originalMode;
    if (originalSite === undefined) delete process.env.SITE_URL; else process.env.SITE_URL = originalSite;
  }
});

test('public SEO pages bypass login while private routes still redirect and cannot accept a spoofed public locale', () => {
  for (const [pathname, locale] of [['/about', 'en'], ['/id/about', 'id'], ['/id/about/', 'id']]) {
    const response = middleware(new NextRequest(`https://hris.ardiansyah.app${pathname}`, {
      headers: { cookie: 'NEXT_LOCALE=en', 'x-public-locale': 'spoofed' },
    }));
    assert.equal(response.headers.get('location'), null);
    assert.equal(response.headers.get('x-middleware-request-x-public-locale'), locale);
  }
  for (const pathname of ['/', '/employees', '/payrolls', '/about/private', '/id/about/private', '/login/other']) {
    const response = middleware(new NextRequest(`https://hris.ardiansyah.app${pathname}`));
    assert.equal(new URL(response.headers.get('location')).pathname, '/login');
    assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  }
  const authenticated = middleware(new NextRequest('https://hris.ardiansyah.app/employees', {
    headers: { cookie: 'auth_role=HR_ADMIN', 'x-public-locale': 'id' },
  }));
  assert.equal(authenticated.headers.get('location'), null);
  assert.equal(authenticated.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  assert.equal(authenticated.headers.get('x-middleware-request-x-public-locale'), null);
  for (const pathname of ['/robots.txt', '/sitemap.xml', '/brand-mark.svg', '/apple-touch-icon.png', '/share/en', '/share/id']) {
    assert.equal(middleware(new NextRequest(`https://hris.ardiansyah.app${pathname}`)).headers.get('location'), null);
  }
  assert.equal(middleware(new NextRequest('https://hris.ardiansyah.app/login')).headers.get('X-Robots-Tag'), 'noindex, nofollow');
});

test('public URL language overrides cookies while workspace language still follows the saved preference', async () => {
  for (const [publicLocale, cookieLocale, expected] of [
    ['en', 'id', 'en'], ['id', 'en', 'id'], [null, 'id', 'id'], [null, 'invalid', 'en'], [null, undefined, 'en'],
  ]) {
    const configure = loadModule('i18n/request.ts', {
      'next-intl/server': { getRequestConfig: (callback) => callback },
      'next/headers': {
        cookies: async () => ({ get: () => cookieLocale ? { value: cookieLocale } : undefined }),
        headers: async () => ({ get: () => publicLocale }),
      },
    }).default;
    const config = await configure();
    assert.equal(config.locale, expected);
    assert.equal(config.messages.metadata.description, catalogs[expected].metadata.description);
  }
});

for (const locale of ['en', 'id']) {
  const tError = createTranslator({ locale, messages: catalogs[locale], namespace: 'apiErrors' });
  const tDomain = createTranslator({ locale, messages: catalogs[locale], namespace: 'domain' });
  const getTranslations = async (options) => createTranslator({
    locale: options?.locale ?? locale,
    messages: catalogs[options?.locale ?? locale],
    namespace: typeof options === 'string' ? options : options.namespace,
  });

  test(`${locale}: social preview endpoint renders a PNG at the advertised dimensions`, async () => {
    const { GET } = loadModule('app/share/[locale]/route.tsx', { 'next-intl/server': { getTranslations } });
    const response = await GET(new Request(`https://hris.ardiansyah.app/share/${locale}`), { params: Promise.resolve({ locale }) });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'image/png');
    const { width, height } = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
    assert.equal(width, 1200);
    assert.equal(height, 630);
    assert.equal((await GET(new Request('https://hris.ardiansyah.app/share/invalid'), {
      params: Promise.resolve({ locale: 'invalid' }),
    })).status, 404);
  });

  test(`${locale}: public metadata has canonical and reciprocal language URLs without indexing private pages`, async () => {
    const { getPublicMetadata } = loadModule('lib/public-metadata.ts', { 'next-intl/server': { getTranslations } });
    const metadata = await getPublicMetadata(locale);
    assert.equal(metadata.alternates.canonical, `https://hris.ardiansyah.app${site.publicPages[locale]}`);
    assert.equal(metadata.alternates.languages.en, 'https://hris.ardiansyah.app/about');
    assert.equal(metadata.alternates.languages.id, 'https://hris.ardiansyah.app/id/about');
    assert.equal(metadata.openGraph.siteName, 'Lajur');
    assert.equal(metadata.openGraph.images[0].url, `https://hris.ardiansyah.app/share/${locale}`);
    assert(metadata.description.includes('Lajur'));
    const { generateMetadata } = loadModule('app/(auth)/login/layout.tsx', { 'next-intl/server': { getTranslations } });
    assert.equal((await generateMetadata()).robots.index, false);
  });

  test(`${locale}: public overview renders meaningful translated text and working route destinations`, async () => {
    const { ProductOverview } = loadModule('components/public/product-overview.tsx', { 'next-intl/server': { getTranslations } });
    const content = await ProductOverview({ locale });
    const html = renderToStaticMarkup(React.createElement(NextIntlClientProvider, {
      locale, messages: catalogs[locale], timeZone: 'Asia/Jakarta',
    }, content));
    assert(html.includes(catalogs[locale].product.title));
    assert(html.includes('href="/login"'));
    assert(html.includes('href="/about"'));
    assert(html.includes('href="/id/about"'));
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    for (const module of ['people', 'attendance', 'contracts', 'payroll']) {
      assert(html.includes(catalogs[locale].product[`${module}Title`]));
    }
  });

  test(`${locale}: payslip currency follows the display language, including zero and invalid values`, () => {
    const formatter = new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0,
    });
    assert.equal(formatRupiah('1250000', locale), formatter.format(1250000));
    for (const value of [null, undefined, '', 'invalid', Infinity]) {
      assert.equal(formatRupiah(value, locale), formatter.format(0));
    }
  });

  test(`${locale}: shared navigation and actor metadata render translated accessible labels`, () => {
    const render = (child) => renderToStaticMarkup(React.createElement(NextIntlClientProvider, {
      locale, messages: catalogs[locale], timeZone: 'Asia/Jakarta',
    }, child));
    const breadcrumb = render(React.createElement(Breadcrumb));
    assert(breadcrumb.includes(`aria-label="${catalogs[locale].uiCopy.breadcrumb}"`));
    assert(render(React.createElement(Breadcrumb, { 'aria-label': 'Custom navigation' })).includes('aria-label="Custom navigation"'));
    for (const compact of [true, false]) {
      const metadata = render(React.createElement(AuditMeta, { actorName: 'Test User', actorRole: 'HR_ADMIN', compact }));
      assert(metadata.includes(catalogs[locale].domain.roles.HR_ADMIN));
      assert(!metadata.includes('HR_ADMIN'));
    }
  });

  test(`${locale}: known backend errors and arrays use localized messages`, () => {
    const examples = [
      ['Anda sudah melakukan check-in hari ini', 'alreadyCheckedIn'],
      ['Password saat ini tidak sesuai', 'currentPasswordIncorrect'],
      ["Karyawan dengan NIP 'EMP-001' sudah terdaftar", 'employeeIdUsed'],
      ["Nomor kontrak 'CTR-01' sudah digunakan", 'contractNumberUsed'],
      ['Karyawan tidak dapat dijadikan atasan untuk dirinya sendiri (self-reporting tidak diizinkan)', 'selfReporting'],
      ['Maksimal 3 kontak darurat per karyawan telah tercapai', 'contactLimit'],
      ['Tidak dapat mengarsipkan departemen karena masih memiliki 2 karyawan aktif. Pindahkan karyawan terlebih dahulu.', 'departmentEmployees'],
    ];
    for (const [message, key] of examples) {
      assert.equal(localizedApiError({ response: { status: 400, data: { message } } }, tError, 'fallback'), tError(key));
    }
    assert.equal(localizedApiError({ response: { status: 400, data: {
      message: ['Anda sudah melakukan check-in hari ini', 'Anda sudah melakukan check-in hari ini'],
    } } }, tError, 'fallback'), tError('alreadyCheckedIn'));
  });

  test(`${locale}: unknown backend wording cannot bypass localized fallback`, () => {
    const fallback = tError('invalidDate');
    for (const message of ['Pesan baru dari backend', ['Pesan baru', 'Anda sudah melakukan check-in hari ini'], { text: 'unknown' }, null, []]) {
      assert.equal(localizedApiError({ response: { status: 400, data: { message } } }, tError, fallback), fallback);
    }
    assert.equal(localizedApiError(new Error('developer detail'), tError, fallback), fallback);
    assert.equal(localizedApiError(null, tError, fallback), fallback);
    assert.equal(localizedApiError({ response: { status: 500, data: { message: 'Anda sudah melakukan check-in hari ini' } } }, tError, fallback), fallback);
  });

  test(`${locale}: network and HTTP failures are localized`, () => {
    for (const [status, key] of [[401, 'unauthorized'], [403, 'forbidden'], [404, 'notFound'], [410, 'gone'], [413, 'fileTooLarge'], [429, 'rateLimited']]) {
      assert.equal(localizedApiError({ response: { status } }, tError, 'fallback'), tError(key));
    }
    assert.equal(localizedApiError({ isAxiosError: true }, tError, 'fallback'), tError('network'));
  });

  test(`${locale}: domain labels cover API enums and safely handle unknown values`, () => {
    for (const group of ['roles', 'leaveTypes', 'actions', 'entities', 'documentTypes']) {
      for (const [value, label] of Object.entries(catalogs[locale].domain[group])) {
        assert.equal(localizedDomainLabel(tDomain, group, value), label);
      }
      for (const value of ['FUTURE_ENUM', null, undefined]) {
        assert.equal(localizedDomainLabel(tDomain, group, value), tDomain('unknown'));
      }
    }
  });
}

const invalidCases = [
  ['attendance', 'attendanceActionSchema', { notes: 'x'.repeat(256) }],
  ['attendance', 'workScheduleSchema', {
    startTime: '99:00', lateToleranceMinutes: -1, standardWorkMinutes: 59,
  }],
  ['department', 'departmentFormSchema', { code: 'X', name: 'X', parentId: 'invalid' }],
  ['department', 'reparentDepartmentSchema', { parentId: 'invalid', reason: 'x'.repeat(256) }],
  ['employee', 'employeeFormSchema', {
    role: 'invalid', departmentId: 'invalid', nip: 'X', fullName: 'X',
    email: 'invalid', jobTitle: 'X', hireDate: '', baseSalary: '-1', status: 'invalid',
  }],
  ['leave-request', 'leaveRequestFormSchema', {
    leaveType: 'ANNUAL', startDate: '2026-10-08', endDate: '2026-10-07', reason: 'Family leave',
  }],
  ['leave-request', 'rejectLeaveRequestSchema', { rejectionReason: 'x' }],
  ['payroll', 'createPayrollSchema', {
    employeeId: 'employee', periodStart: '2026-10-08', periodEnd: '2026-10-07',
    allowances: '-1', deductions: '-1',
  }],
  ['payroll', 'updatePayrollSchema', { allowances: '-1', deductions: 'abc' }],
  ['profile', 'changePasswordSchema', {
    currentPassword: '', newPassword: '123', confirmPassword: 'different',
  }],
];

for (const [file, name, input] of invalidCases) {
  test(`${name} rejects invalid input with localized messages`, () => {
    const factory = loadValidation(file)[name];
    const errors = {};
    for (const locale of ['en', 'id']) {
      const result = factory(translator(locale)).safeParse(input);
      assert.equal(result.success, false);
      errors[locale] = result.error.issues.map((issue) => issue.message);
      assert(errors[locale].every((message) => !message.startsWith('validation.')));
    }
    assert.notDeepEqual(errors.en, errors.id);
  });
}

test('valid work schedule boundaries remain accepted in both languages', () => {
  for (const locale of ['en', 'id']) {
    const schema = loadValidation('attendance').workScheduleSchema(translator(locale));
    assert(schema.safeParse({ startTime: '00:00', lateToleranceMinutes: 0, standardWorkMinutes: 60 }).success);
    assert(schema.safeParse({ startTime: '23:59', lateToleranceMinutes: 120, standardWorkMinutes: 1440 }).success);
  }
});

test('zero payroll amounts and matching passwords remain valid in both languages', () => {
  for (const locale of ['en', 'id']) {
    const t = translator(locale);
    assert(loadValidation('payroll').updatePayrollSchema(t).safeParse({ allowances: '0', deductions: '' }).success);
    assert(loadValidation('profile').changePasswordSchema(t).safeParse({
      currentPassword: 'old', newPassword: '12345678', confirmPassword: '12345678',
    }).success);
  }
});
