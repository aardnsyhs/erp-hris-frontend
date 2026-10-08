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
