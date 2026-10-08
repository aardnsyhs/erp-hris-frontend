import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import ts from 'typescript';
import { createTranslator } from 'next-intl';

const catalogs = {
  en: JSON.parse(fs.readFileSync(new URL('../messages/en.json', import.meta.url), 'utf8')),
  id: JSON.parse(fs.readFileSync(new URL('../messages/id.json', import.meta.url), 'utf8')),
};

function loadValidation(name) {
  const filename = fileURLToPath(new URL(`../lib/validations/${name}.ts`, import.meta.url));
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  const compiledModule = new Module(filename);
  compiledModule.filename = filename;
  compiledModule.paths = Module._nodeModulePaths(path.dirname(filename));
  compiledModule._compile(compiled.outputText, filename);
  return compiledModule.exports;
}

function translator(locale) {
  return createTranslator({ locale, messages: catalogs[locale], namespace: 'validation' });
}

function keys(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [fullKey] : keys(value, fullKey);
  }).sort();
}

test('English and Indonesian catalogs contain the same keys', () => {
  assert.deepEqual(keys(catalogs.en), keys(catalogs.id));
});

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
