import React, { useState, useEffect } from 'react';
import { Settings as SettingsType, PrayerTimes } from '../types';
import { calculatePrayerTimes, formatTime } from '../utils/prayerCalculations';
import { Clock, CheckCircle, AlertTriangle, Info, Calculator } from 'lucide-react';
import CalculationMethodComparison from './CalculationMethodComparison';

interface PrayerTimeVerificationProps {
  settings: SettingsType;
  onApplyAdjustments?: (adjustments: { fajr: number; dhuhr: number; asr: number; maghrib: number; isha: number }) => void;
}

interface PrayerComparison {
  prayer: string;
  arabicName: string;
  calculatedTime: Date;
  officialTime: string;
  difference: number;
}

const PrayerTimeVerification: React.FC<PrayerTimeVerificationProps> = ({ settings, onApplyAdjustments }) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [officialTimes, setOfficialTimes] = useState({
    fajr: '',
    dhuhr: '',
    asr: '',
    maghrib: '',
    isha: ''
  });
  const [comparisons, setComparisons] = useState<PrayerComparison[]>([]);

  useEffect(() => {
    const times = calculatePrayerTimes(settings);
    setPrayerTimes(times);
  }, [settings]);

  const parseTimeString = (timeStr: string): Date | null => {
    if (!timeStr || timeStr.trim() === '') return null;

    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return null;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3]?.toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const calculateDifference = (calculated: Date, official: string): number => {
    const officialDate = parseTimeString(official);
    if (!officialDate) return 0;

    const diffMs = calculated.getTime() - officialDate.getTime();
    return Math.round(diffMs / 60000);
  };

  const handleCompare = () => {
    if (!prayerTimes) return;

    const newComparisons: PrayerComparison[] = [
      {
        prayer: 'fajr',
        arabicName: 'الفجر',
        calculatedTime: prayerTimes.fajr,
        officialTime: officialTimes.fajr,
        difference: calculateDifference(prayerTimes.fajr, officialTimes.fajr)
      },
      {
        prayer: 'dhuhr',
        arabicName: 'الظهر',
        calculatedTime: prayerTimes.dhuhr,
        officialTime: officialTimes.dhuhr,
        difference: calculateDifference(prayerTimes.dhuhr, officialTimes.dhuhr)
      },
      {
        prayer: 'asr',
        arabicName: 'العصر',
        calculatedTime: prayerTimes.asr,
        officialTime: officialTimes.asr,
        difference: calculateDifference(prayerTimes.asr, officialTimes.asr)
      },
      {
        prayer: 'maghrib',
        arabicName: 'المغرب',
        calculatedTime: prayerTimes.maghrib,
        officialTime: officialTimes.maghrib,
        difference: calculateDifference(prayerTimes.maghrib, officialTimes.maghrib)
      },
      {
        prayer: 'isha',
        arabicName: 'العشاء',
        calculatedTime: prayerTimes.isha,
        officialTime: officialTimes.isha,
        difference: calculateDifference(prayerTimes.isha, officialTimes.isha)
      }
    ];

    setComparisons(newComparisons);
  };

  const getDifferenceColor = (diff: number): string => {
    const absDiff = Math.abs(diff);
    if (absDiff <= 2) return 'text-green-300';
    if (absDiff <= 5) return 'text-yellow-300';
    return 'text-red-300';
  };

  const getDifferenceIcon = (diff: number) => {
    const absDiff = Math.abs(diff);
    if (absDiff <= 2) return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (absDiff <= 5) return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    return <AlertTriangle className="w-5 h-5 text-red-400" />;
  };

  const averageDifference = comparisons.length > 0
    ? Math.round(comparisons.reduce((sum, c) => sum + Math.abs(c.difference), 0) / comparisons.length)
    : 0;

  const handleApplyAdjustments = () => {
    if (!onApplyAdjustments || comparisons.length === 0) return;

    const adjustments = {
      fajr: -1 * comparisons.find(c => c.prayer === 'fajr')?.difference || 0,
      dhuhr: -1 * comparisons.find(c => c.prayer === 'dhuhr')?.difference || 0,
      asr: -1 * comparisons.find(c => c.prayer === 'asr')?.difference || 0,
      maghrib: -1 * comparisons.find(c => c.prayer === 'maghrib')?.difference || 0,
      isha: -1 * comparisons.find(c => c.prayer === 'isha')?.difference || 0
    };

    onApplyAdjustments(adjustments);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-200">
            <p className="font-medium mb-2">كيفية استخدام أداة التحقق من دقة الأوقات:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-200/80">
              <li>احصل على أوقات الصلاة الرسمية من مصدر موثوق (موقع وزارة الأوقاف، تطبيق محلي، إمام المسجد)</li>
              <li>أدخل الأوقات الرسمية في الحقول أدناه بتنسيق 12 ساعة (مثال: 05:30 AM أو 1:15 PM)</li>
              <li>اضغط على زر "مقارنة الأوقات" لمشاهدة الفروقات</li>
              <li>إذا كان الفرق أكثر من دقيقتين، استخدم قسم "تعديل أوقات الأذان" في الإعدادات المتقدمة لتصحيحه</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-400" />
          الأوقات المحسوبة حالياً
        </h3>

        {prayerTimes && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { key: 'fajr', name: 'الفجر', time: prayerTimes.fajr },
              { key: 'dhuhr', name: 'الظهر', time: prayerTimes.dhuhr },
              { key: 'asr', name: 'العصر', time: prayerTimes.asr },
              { key: 'maghrib', name: 'المغرب', time: prayerTimes.maghrib },
              { key: 'isha', name: 'العشاء', time: prayerTimes.isha }
            ].map(prayer => (
              <div key={prayer.key} className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-white/70 text-sm mb-1">{prayer.name}</div>
                <div className="text-white font-mono text-lg">{formatTime(prayer.time)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-green-400" />
          الأوقات الرسمية (من المصدر الموثوق)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          {[
            { key: 'fajr', name: 'الفجر' },
            { key: 'dhuhr', name: 'الظهر' },
            { key: 'asr', name: 'العصر' },
            { key: 'maghrib', name: 'المغرب' },
            { key: 'isha', name: 'العشاء' }
          ].map(prayer => (
            <div key={prayer.key}>
              <label className="block text-white/70 text-sm mb-2">{prayer.name}</label>
              <input
                type="text"
                value={officialTimes[prayer.key as keyof typeof officialTimes]}
                onChange={(e) => setOfficialTimes({ ...officialTimes, [prayer.key]: e.target.value })}
                placeholder="05:30 AM"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent font-mono text-center"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleCompare}
          className="w-full px-4 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-200 rounded-xl transition-all duration-300 font-medium flex items-center justify-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          مقارنة الأوقات
        </button>
      </div>

      {comparisons.length > 0 && (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold mb-4">نتائج المقارنة</h3>

          <div className="space-y-3 mb-6">
            {comparisons.map(comparison => (
              comparison.officialTime && (
                <div
                  key={comparison.prayer}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    {getDifferenceIcon(comparison.difference)}
                    <div>
                      <div className="text-white font-medium">{comparison.arabicName}</div>
                      <div className="text-white/60 text-sm">
                        محسوب: {formatTime(comparison.calculatedTime)} | رسمي: {comparison.officialTime}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-mono font-bold ${getDifferenceColor(comparison.difference)}`}>
                    {comparison.difference > 0 ? '+' : ''}{comparison.difference} دقيقة
                  </div>
                </div>
              )
            ))}
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/90 font-medium">متوسط الفرق المطلق:</span>
              <span className={`text-2xl font-bold ${averageDifference <= 2 ? 'text-green-300' : averageDifference <= 5 ? 'text-yellow-300' : 'text-red-300'}`}>
                {averageDifference} دقيقة
              </span>
            </div>

            {averageDifference > 2 && (
              <div className="text-sm text-white/70 mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="font-medium text-yellow-200 mb-2">توصيات للتحسين:</p>
                <ul className="list-disc list-inside space-y-1 text-yellow-200/80 mb-3">
                  <li>جرب طريقة حساب مختلفة من القائمة المتاحة</li>
                  <li>تأكد من دقة الموقع الجغرافي (خط العرض والطول)</li>
                  <li>تحقق من اختيار المذهب الفقهي الصحيح (يؤثر على وقت العصر)</li>
                  <li>استخدم التعديلات اليدوية في قسم "الإعدادات المتقدمة" لتصحيح الفروقات</li>
                </ul>
                {onApplyAdjustments && (
                  <button
                    onClick={handleApplyAdjustments}
                    className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-200 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    تطبيق التعديلات تلقائياً
                  </button>
                )}
              </div>
            )}

            {averageDifference <= 2 && (
              <div className="text-sm text-green-200/80 mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                ممتاز! الأوقات المحسوبة دقيقة جداً ومتوافقة مع الأوقات الرسمية.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <CalculationMethodComparison
          settings={settings}
          officialTimes={comparisons.length > 0 ? officialTimes : undefined}
        />
      </div>
    </div>
  );
};

export default PrayerTimeVerification;
