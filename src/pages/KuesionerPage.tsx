import { useState } from 'react';
import { useKuesioner, useSubmitJawaban, useLogout } from '../lib/hooks';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/api';
import type { JawabanPayload } from '../types/kuesioner';
import { ThemeToggle } from '../components/ThemeToggle';

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 text-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 dark:text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">Keluar...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 text-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 dark:text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">Memuat pertanyaan kuesioner...</p>
        </div>
      </div>
    );
  }

  const isPeriodeKosong = !kuesionerData?.periode || !kuesionerData.periode.kdperiode;
  const isKelompokKosong = !kuesionerData?.kuesioner || kuesionerData.kuesioner.length === 0;
  const isDataKosong = !kuesionerData || isPeriodeKosong || isKelompokKosong;

  if (isError || isDataKosong) {
    const errorMsg = isError ? getErrorMessage(error) : null;
    // Jika backend mengirimkan pesan error spesifik, kita bisa tampilkan,
    // tapi secara default tampilkan warning belum diset.
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4 text-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 dark:text-white">
        <div className="animate-fade-in max-w-md rounded-3xl border border-amber-300 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-md dark:border-amber-500/30 dark:bg-slate-800/50">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-3xl font-bold text-amber-500 dark:text-amber-400">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Peringatan</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {displayMsg}
          </p>
          <button
            onClick={() => logout.mutate()}
            className="mt-6 min-h-[44px] rounded-xl border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Keluar
          </button>
        </div>
      </div>
    );
  }

  if (kuesionerData.is_sudah_mengisi || (submitted && mutation.isSuccess)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4 text-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 dark:text-white">
        <div className="animate-fade-in max-w-lg rounded-3xl border border-emerald-300 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-md dark:border-emerald-500/20 dark:bg-slate-800/50">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-3xl text-emerald-500 dark:text-emerald-400">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Terima Kasih</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Anda sudah mengisi kuesioner untuk periode{' '}
            <strong className="text-slate-700 dark:text-slate-200">{kuesionerData.periode.kdperiode}</strong>. Terima
            kasih atas partisipasi Anda dalam membantu peningkatan mutu institusi.
          </p>
          <button
            onClick={() => logout.mutate()}
            className="mt-6 min-h-[44px] rounded-xl border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Keluar
          </button>
        </div>
      </div>
    );
  }

  const kelompokList = kuesionerData.kuesioner || [];
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4 py-10 text-slate-800 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 dark:text-slate-100 md:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="animate-fade-in mb-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-white/5">
          <div>
            <h1 className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-2xl font-bold text-transparent dark:from-indigo-300 dark:to-cyan-300 md:text-3xl">
              Kuesioner Evaluasi
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {user?.nama ? `Halo, ${user.nama} · ` : ''}Periode Aktif:{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{kuesionerData.periode.kdperiode}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => logout.mutate()}
              className="min-h-[44px] rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Keluar
            </button>
          </div>
        </header>

        <div className="sticky top-4 z-40 mb-8 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-2xl backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/80">
          <div className="mb-1 flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>
              Kategori {currentStep + 1} dari {kelompokList.length}
            </span>
            <span>
              {totalDijawab} dari {totalSoal} Soal Terjawab ({progressPersen}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPersen}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentKelompok && (
            <section
              key={currentKelompok.kdkelompok}
              className="animate-fade-in space-y-6 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-white/5 md:p-8"
            >
              <h2 className="flex items-center border-b border-slate-200 pb-3 text-xl font-bold text-slate-700 dark:border-white/10 dark:text-slate-200">
                <span className="mr-3 h-6 w-1.5 rounded-full bg-indigo-500" />
                {currentKelompok.namakelompok}
              </h2>

              <div className="space-y-8 divide-y divide-slate-200 dark:divide-white/10">
                {currentKelompok.pertanyaan.map((soal, index) => (
                  <div key={soal.idpertanyaan} className={`space-y-3 pt-6 ${index === 0 ? 'pt-0' : ''}`}>
                    <p className="font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                      {index + 1}. {soal.pertanyaan}
                    </p>

                    {soal.jenisjwb === 'A' && (
                      <div className="grid max-w-3xl grid-cols-1 gap-2 sm:grid-cols-4">
                        {[
                          { value: 'STS', label: 'Sangat Tidak Setuju' },
                          { value: 'TS', label: 'Tidak Setuju' },
                          { value: 'S', label: 'Setuju' },
                          { value: 'SS', label: 'Sangat Setuju' },
                        ].map(({ value, label }) => {
                          const isSelected = jawabanState[soal.idpertanyaan] === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handlePilihJawaban(soal.idpertanyaan, value)}
                              className={`min-h-[44px] rounded-xl border px-3 py-2 text-center text-xs font-semibold leading-snug transition-all duration-200 ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:border-white/20 dark:hover:text-slate-300'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {soal.jenisjwb === 'B' && (
                      <div className="max-w-2xl">
                        <textarea
                          rows={4}
                          placeholder="Ketik jawaban esai bebas Anda di sini..."
                          value={jawabanState[soal.idpertanyaan] || ''}
                          onChange={(e) => handlePilihJawaban(soal.idpertanyaan, e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-400 transition-all focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300 dark:placeholder-slate-600"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex items-center justify-between gap-3 pt-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`min-h-[44px] rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 ${
                currentStep === 0 ? 'invisible' : ''
              }`}
            >
              Kembali
            </button>

            {isLastStep ? (
              <button
                type="submit"
                disabled={!isFormValid || mutation.isPending}
                className={`flex min-h-[44px] items-center rounded-2xl px-8 py-3 font-bold tracking-wide shadow-xl transition-all duration-300 ${
                  isFormValid && !mutation.isPending
                    ? 'cursor-pointer bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:scale-[1.02] hover:opacity-90'
                    : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400 dark:border-white/10 dark:bg-slate-800 dark:text-slate-500'
                }`}
              >
                {mutation.isPending ? (
                  <>
                    <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
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
                className={`flex min-h-[44px] items-center rounded-2xl px-8 py-3 font-bold tracking-wide shadow-xl transition-all duration-300 ${
                  isCurrentStepValid
                    ? 'cursor-pointer bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:scale-[1.02] hover:opacity-90'
                    : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400 dark:border-white/10 dark:bg-slate-800 dark:text-slate-500'
                }`}
              >
                Lanjut
              </button>
            )}
          </div>

          {mutation.isError && (
            <p className="text-right text-sm text-red-500 dark:text-red-400">{getErrorMessage(mutation.error)}</p>
          )}
        </form>
      </div>
    </div>
  );
};
