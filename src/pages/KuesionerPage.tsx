import { useState } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
  MinusCircleIcon,
  SealWarningIcon,
  SignOutIcon,
  SpinnerGapIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { useKuesioner, useSubmitJawaban, useLogout } from '../lib/hooks';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/api';
import { filterKelompokByKategori } from '../lib/filterKelompok';
import type { JawabanPayload } from '../types/kuesioner';
import { ThemeToggle } from '../components/ThemeToggle';

const LIKERT_OPTIONS = [
  { value: 'STS', label: 'Sangat Tidak Setuju', icon: XCircleIcon },
  { value: 'TS', label: 'Tidak Setuju', icon: MinusCircleIcon },
  { value: 'S', label: 'Setuju', icon: CheckCircleIcon },
  { value: 'SS', label: 'Sangat Setuju', icon: CheckCircleIcon },
] as const;

const formatPeriode = (kdperiode: string) => {
  const digits = kdperiode.replace(/\D/g, '');
  const tahun = digits.slice(0, 4);
  const kodeSemester = digits.charAt(4);
  const semester = kodeSemester === '1' ? 'Gasal' : kodeSemester === '2' ? 'Genap' : '';
  return semester ? `${tahun} ${semester}` : kdperiode;
};

export const KuesionerPage = () => {
  const { user } = useAuth();
  const { data: kuesionerData, isLoading, isError, error } = useKuesioner();
  const mutation = useSubmitJawaban();
  const logout = useLogout();
  const [jawabanState, setJawabanState] = useState<Record<number, string | number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  if (logout.isPending || logout.isSuccess) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <div className="text-center">
          <SpinnerGapIcon size={36} weight="bold" className="mx-auto animate-spin text-amber-500" />
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">Keluar...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-zinc-50 px-4 py-10 dark:bg-zinc-950 md:px-8">
        <div className="mx-auto max-w-4xl animate-pulse">
          <div className="mb-8 h-24 rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-900" />
          <div className="mb-8 h-16 rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-900" />
          <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-900 md:p-8">
            <div className="h-5 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-24 rounded-xl bg-zinc-100 dark:bg-zinc-800/60" />
            <div className="h-5 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-24 rounded-xl bg-zinc-100 dark:bg-zinc-800/60" />
          </div>
        </div>
      </div>
    );
  }

  const isPeriodeKosong = !kuesionerData?.periode || !kuesionerData.periode.kdperiode;
  const isKelompokKosong =
    !kuesionerData?.is_sudah_mengisi && (!kuesionerData?.kuesioner || kuesionerData.kuesioner.length === 0);
  const isDataKosong = !kuesionerData || isPeriodeKosong || isKelompokKosong;

  if (isError || isDataKosong) {
    const errorMsg = isError ? getErrorMessage(error) : null;
    let fallbackMsg = 'Pertanyaan belum diset sesuai dosen, Tendik Unit, dan Tendik Fakultas. Silakan hubungi Admin Kuesioner.';
    if (!isError && isPeriodeKosong) {
      fallbackMsg = 'Periode kuesioner aktif belum diset oleh Admin. Silakan hubungi Admin Kuesioner.';
    } else if (!isError && isKelompokKosong) {
      fallbackMsg = 'Kelompok dan pertanyaan kuesioner belum diset untuk peran Anda. Silakan hubungi Admin Kuesioner.';
    }
    const displayMsg = (errorMsg && errorMsg !== 'Terjadi kesalahan pada server. Silakan coba lagi nanti.')
      ? errorMsg
      : fallbackMsg;

    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-50 px-4 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <div className="animate-fade-in w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            <SealWarningIcon size={28} weight="bold" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Peringatan</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{displayMsg}</p>
          <button
            onClick={() => logout.mutate()}
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-zinc-200 px-6 text-sm font-semibold text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            <SignOutIcon size={16} weight="bold" />
            Keluar
          </button>
        </div>
      </div>
    );
  }

  if (kuesionerData.is_sudah_mengisi || (submitted && mutation.isSuccess)) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-50 px-4 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <div className="animate-fade-in w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircleIcon size={28} weight="bold" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Terima Kasih</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            Anda sudah mengisi kuesioner untuk periode{' '}
            <strong className="font-semibold text-zinc-700 dark:text-zinc-200">{formatPeriode(kuesionerData.periode.kdperiode)}</strong>. Terima
            kasih atas partisipasi Anda dalam membantu peningkatan mutu institusi.
          </p>
          <button
            onClick={() => logout.mutate()}
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-zinc-200 px-6 text-sm font-semibold text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            <SignOutIcon size={16} weight="bold" />
            Keluar
          </button>
        </div>
      </div>
    );
  }

  const rawKelompokList = kuesionerData.kuesioner || [];
  const kelompokList = filterKelompokByKategori(rawKelompokList, user).map((k) => ({
    ...k,
    pertanyaan: [...k.pertanyaan].sort((a, b) => (a.jenisjwb === 'B' ? 1 : 0) - (b.jenisjwb === 'B' ? 1 : 0)),
  }));

  const allPertanyaan = kelompokList.flatMap((k) => k.pertanyaan);
  const totalSoal = allPertanyaan.length;
  const totalDijawab = Object.keys(jawabanState).length;
  const progressPersen = totalSoal > 0 ? Math.round((totalDijawab / totalSoal) * 100) : 0;
  const isFormValid = totalDijawab === totalSoal && totalSoal > 0;

  const currentKelompok = kelompokList[currentStep];
  const isLastStep = currentStep === kelompokList.length - 1;
  const isCurrentStepValid = currentKelompok
    ? currentKelompok.pertanyaan.every((soal) => {
        const jawaban = jawabanState[soal.idpertanyaan];
        return jawaban !== undefined && jawaban !== '';
      })
    : false;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleNext = () => {
    if (!isCurrentStepValid) return;
    setCurrentStep((step) => Math.min(step + 1, kelompokList.length - 1));
    scrollToTop();
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
    scrollToTop();
  };

  const handlePilihJawaban = (idpertanyaan: number, value: string | number) => {
    setJawabanState((prev) => ({ ...prev, [idpertanyaan]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLastStep || !isFormValid || mutation.isPending) return;

    const jawabanPayload: JawabanPayload[] = allPertanyaan.map((p) => {
      const parentKelompok = kelompokList.find((k) =>
        k.pertanyaan.some((q) => q.idpertanyaan === p.idpertanyaan),
      );
      return {
        idpertanyaan: p.idpertanyaan,
        jenisjwb: p.jenisjwb,
        kdkelompok: parentKelompok ? parentKelompok.kdkelompok : '',
        jawaban: jawabanState[p.idpertanyaan],
      };
    });

    mutation.mutate(
      { kdperiode: kuesionerData.periode.kdperiode, jawaban: jawabanPayload },
      { onSuccess: () => setSubmitted(true) },
    );
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 md:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="animate-fade-in mb-6 flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-3xl">
              Kuesioner <span className="text-amber-500">Kewidyamandalaan</span>
            </h1>
            <p className="mt-2 truncate text-sm text-zinc-500 dark:text-zinc-400">
              {user?.nama ? `Halo, ${user.nama} · ` : ''}Periode Aktif:{' '}
              <span className="font-semibold text-zinc-700 dark:text-zinc-200">{formatPeriode(kuesionerData.periode.kdperiode)}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => logout.mutate()}
              className="flex min-h-[44px] items-center gap-2 rounded-full border border-zinc-200 px-4 text-xs font-semibold text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
            >
              <SignOutIcon size={14} weight="bold" />
              Keluar
            </button>
          </div>
        </header>

        <div className="sticky top-4 z-40 mb-6 rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/95">
          <div className="mb-3 flex items-center justify-between gap-3 overflow-x-auto">
            <ol className="flex shrink-0 items-center gap-1.5">
              {kelompokList.map((k, i) => (
                <li
                  key={k.kdkelompok}
                  title={k.namakelompok}
                  className={`flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-2 text-[11px] font-bold transition-colors ${
                    i === currentStep
                      ? 'bg-amber-500 text-zinc-900'
                      : i < currentStep
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                  }`}
                >
                  {i < currentStep ? <CheckIcon size={13} weight="bold" /> : i + 1}
                </li>
              ))}
            </ol>
            <span className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {totalDijawab} / {totalSoal} soal
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPersen}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentKelompok && (
            <section
              key={currentKelompok.kdkelompok}
              className="animate-fade-in relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900 md:p-8"
            >
              <span className="absolute inset-y-0 left-0 w-1.5 bg-amber-500" />
              <h2 className="text-lg font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
                {currentKelompok.namakelompok}
              </h2>

              <div className="mt-6 space-y-8 divide-y divide-zinc-100 dark:divide-white/5">
                {currentKelompok.pertanyaan.map((soal, index) => (
                  <div key={soal.idpertanyaan} className={`space-y-4 pt-6 ${index === 0 ? 'pt-0' : ''}`}>
                    <p className="flex gap-3 font-medium leading-relaxed text-zinc-700 dark:text-zinc-200">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-500 text-xs font-bold text-amber-600 dark:text-amber-400">
                        {index + 1}
                      </span>
                      {soal.pertanyaan}
                    </p>

                    {soal.jenisjwb === 'A' && (
                      <div className="grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4">
                        {LIKERT_OPTIONS.map(({ value, label, icon: OptionIcon }) => {
                          const isSelected = jawabanState[soal.idpertanyaan] === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handlePilihJawaban(soal.idpertanyaan, value)}
                              className={`flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-center text-[11px] font-semibold leading-snug transition-all duration-150 active:scale-[0.98] ${
                                isSelected
                                  ? 'border-amber-500 bg-amber-500 text-zinc-900'
                                  : 'border-zinc-200 bg-white text-zinc-500 hover:border-amber-300 hover:text-zinc-700 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-400 dark:hover:border-amber-400/40 dark:hover:text-zinc-300'
                              }`}
                            >
                              <OptionIcon size={20} weight={isSelected ? 'fill' : 'regular'} />
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {soal.jenisjwb !== 'A' && (
                      <div className="max-w-2xl">
                        <textarea
                          rows={4}
                          placeholder="Ketik jawaban esai bebas Anda di sini..."
                          value={jawabanState[soal.idpertanyaan] || ''}
                          onChange={(e) => handlePilihJawaban(soal.idpertanyaan, e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 placeholder-zinc-400 transition-all focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-300 dark:placeholder-zinc-600"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border border-zinc-200 px-6 text-sm font-semibold text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5 ${
                currentStep === 0 ? 'invisible' : ''
              }`}
            >
              <ArrowLeftIcon size={16} weight="bold" />
              Kembali
            </button>

            {isLastStep ? (
              <button
                type="submit"
                disabled={!isFormValid || mutation.isPending}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-8 text-sm font-bold tracking-wide transition-all duration-200 ${
                  isFormValid && !mutation.isPending
                    ? 'cursor-pointer bg-amber-500 text-zinc-900 hover:bg-amber-400 active:scale-[0.98]'
                    : 'cursor-not-allowed border border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-500'
                }`}
              >
                {mutation.isPending ? (
                  <>
                    <SpinnerGapIcon size={16} weight="bold" className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Kirim Semua Jawaban'
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isCurrentStepValid}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-8 text-sm font-bold tracking-wide transition-all duration-200 ${
                  isCurrentStepValid
                    ? 'cursor-pointer bg-amber-500 text-zinc-900 hover:bg-amber-400 active:scale-[0.98]'
                    : 'cursor-not-allowed border border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-500'
                }`}
              >
                Lanjut
                <ArrowRightIcon size={16} weight="bold" />
              </button>
            )}
          </div>

          {mutation.isError && (
            <p className="text-right text-sm font-medium text-rose-600 dark:text-rose-400">
              {getErrorMessage(mutation.error)}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
