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

const catalogs = {
  en: JSON.parse(fs.readFileSync(new URL('../messages/en.json', import.meta.url), 'utf8')),
  id: JSON.parse(fs.readFileSync(new URL('../messages/id.json', import.meta.url), 'utf8')),
};

function loadValidation(name) {
  return loadModule(`lib/validations/${name}.ts`);
}

function loadModule(relativePath) {
  const filename = fileURLToPath(new URL(`../${relativePath}`, import.meta.url));
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX },
  });
  const compiledModule = new Module(filename);
  compiledModule.filename = filename;
  compiledModule.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = compiledModule.require.bind(compiledModule);
  compiledModule.require = (specifier) => {
    if (!specifier.startsWith('@/')) return originalRequire(specifier);
    const relative = specifier.slice(2);
    const extension = fs.existsSync(new URL(`../${relative}.ts`, import.meta.url)) ? '.ts' : '.tsx';
    return loadModule(relative + extension);
  };
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

const { localizedApiError } = loadModule('lib/i18n/api-error.ts');
const { localizedDomainLabel } = loadModule('lib/i18n/domain-label.ts');
const { Breadcrumb } = loadModule('components/ui/breadcrumb.tsx');
const { AuditMeta } = loadModule('components/shared/audit-meta.tsx');

for (const locale of ['en', 'id']) {
  const tError = createTranslator({ locale, messages: catalogs[locale], namespace: 'apiErrors' });
  const tDomain = createTranslator({ locale, messages: catalogs[locale], namespace: 'domain' });

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
