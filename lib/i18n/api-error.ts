type ErrorTranslator = (key: string) => string;

// The backend sends prose without stable error codes; unknown messages use the caller's localized fallback.
const messagePatterns: [RegExp, string][] = [
  [/^Anda sudah melakukan check-in hari ini$/, 'alreadyCheckedIn'],
  [/^Anda sudah melakukan check-out hari ini$/, 'alreadyCheckedOut'],
  [/^Anda belum melakukan check-in hari ini$/, 'checkInRequired'],
  [/^Password saat ini tidak sesuai$/, 'currentPasswordIncorrect'],
  [/^Akun Anda tidak terhubung dengan data karyawan$/, 'employeeAccountRequired'],
  [/^Nomor kontrak '.+' sudah digunakan$/, 'contractNumberUsed'],
  [/^Karyawan dengan NIP '.+' sudah terdaftar$/, 'employeeIdUsed'],
  [/^Karyawan dengan email '.+' sudah terdaftar$|^Email sudah terdaftar sebagai akun pengguna$/, 'emailUsed'],
  [/^(Departemen|Posisi) dengan kode '.+' sudah terdaftar$/, 'codeUsed'],
  [/^Karyawan tidak dapat dijadikan atasan untuk dirinya sendiri/, 'selfReporting'],
  [/^Siklus hierarki|^Departemen tidak dapat menjadi induk bagi dirinya sendiri/, 'hierarchyCycle'],
  [/^Batas kedalaman hierarki/, 'hierarchyDepth'],
  [/^Tidak dapat (mengarsipkan|menghapus) departemen karena masih memiliki .*sub-departemen/, 'departmentChildren'],
  [/^Tidak dapat (mengarsipkan|menghapus) departemen karena masih memiliki .*karyawan aktif/, 'departmentEmployees'],
  [/^Tidak dapat menghapus departemen karena masih (memiliki riwayat|memiliki .*riwayat penugasan|direferensikan)/, 'departmentHistory'],
  [/^(Departemen|Tidak dapat menambahkan sub-departemen|Tidak dapat mengaktifkan kembali departemen).*diarsipkan/, 'archivedDepartment'],
  [/^Kontrak dengan status '.+' bersifat immutable/, 'contractImmutable'],
  [/^Posisi '.+' sedang non-aktif/, 'inactivePosition'],
  [/^Maksimal 3 kontak darurat per karyawan telah tercapai$/, 'contactLimit'],
  [/^Tipe file tidak didukung/, 'unsupportedFile'],
  [/^Ukuran file .*melebihi batas maksimal 10MB$/, 'fileTooLarge'],
  [/^Format tanggal .+ tidak valid$/, 'invalidDate'],
];

export function localizedApiError(error: unknown, t: ErrorTranslator, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;
  if (!('response' in error)) {
    return 'isAxiosError' in error && error.isAxiosError === true ? t('network') : fallback;
  }
  const response = error.response as { status?: number; data?: { message?: unknown } } | undefined;
  if (!response) return t('network');
  if (response.status && response.status >= 500) return fallback;
  const raw = response.data?.message;
  const messages = Array.isArray(raw) ? raw : [raw];
  const translated = messages.map((message) => {
    if (typeof message !== 'string') return undefined;
    const match = messagePatterns.find(([pattern]) => pattern.test(message));
    return match ? t(match[1]) : undefined;
  });
  if (translated.length && translated.every((message) => message !== undefined)) {
    return [...new Set(translated)].join(', ');
  }
  switch (response.status) {
    case 401: return t('unauthorized');
    case 403: return t('forbidden');
    case 404: return t('notFound');
    case 410: return t('gone');
    case 413: return t('fileTooLarge');
    case 429: return t('rateLimited');
    default: return fallback;
  }
}
