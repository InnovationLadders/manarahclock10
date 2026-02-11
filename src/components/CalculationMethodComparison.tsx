import React, { useState, useEffect } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes, Madhab } from 'adhan';
import { Settings as SettingsType, CALCULATION_METHODS } from '../types';
import { formatTime } from '../utils/prayerCalculations';
import { ArrowUpDown, CheckCircle } from 'lucide-react';

interface CalculationMethodComparisonProps {
  settings: SettingsType;
  officialTimes?: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
}

interface MethodResult {
  methodKey: string;
  methodName: string;
  times: {
    fajr: Date;
    dhuhr: Date;
    asr: Date;
    maghrib: Date;
    isha: Date;
  };
  totalDifference?: number;
}

const CalculationMethodComparison: React.FC<CalculationMethodComparisonProps> = ({
  settings,
  officialTimes
}) => {
  const [results, setResults] = useState<MethodResult[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'difference'>('name');

  useEffect(() => {
    calculateAllMethods();
  }, [settings.location, settings.madhab]);

  const getCalculationParams = (methodKey: string) => {
    switch (methodKey) {
      case 'UmmAlQura':
        return CalculationMethod.UmmAlQura();
      case 'MuslimWorldLeague':
        return CalculationMethod.MuslimWorldLeague();
      case 'Egyptian':
        return CalculationMethod.Egyptian();
      case 'Karachi':
        return CalculationMethod.Karachi();
      case 'NorthAmerica':
        return CalculationMethod.NorthAmerica();
      case 'Dubai':
        return CalculationMethod.Dubai();
      case 'Kuwait':
        return CalculationMethod.Kuwait();
      case 'Qatar':
        return CalculationMethod.Qatar();
      case 'Singapore':
        return CalculationMethod.Singapore();
      case 'Turkey':
        return CalculationMethod.Turkey();
      case 'Tehran':
        return CalculationMethod.Tehran();
      case 'MoonsightingCommittee':
        return CalculationMethod.MoonsightingCommittee();
      default:
        return CalculationMethod.MuslimWorldLeague();
    }
  };

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

    const diffMs = Math.abs(calculated.getTime() - officialDate.getTime());
    return Math.round(diffMs / 60000);
  };

  const calculateAllMethods = () => {
    const coordinates = new Coordinates(settings.location.latitude, settings.location.longitude);
    const date = new Date();
    const methodResults: MethodResult[] = [];

    CALCULATION_METHODS.forEach(method => {
      const params = getCalculationParams(method.key);
      params.madhab = settings.madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;

      try {
        const prayerTimes = new AdhanPrayerTimes(coordinates, date, params);

        const times = {
          fajr: prayerTimes.fajr,
          dhuhr: prayerTimes.dhuhr,
          asr: prayerTimes.asr,
          maghrib: prayerTimes.maghrib,
          isha: prayerTimes.isha
        };

        let totalDifference = undefined;
        if (officialTimes && officialTimes.fajr && officialTimes.dhuhr) {
          totalDifference =
            calculateDifference(times.fajr, officialTimes.fajr) +
            calculateDifference(times.dhuhr, officialTimes.dhuhr) +
            calculateDifference(times.asr, officialTimes.asr) +
            calculateDifference(times.maghrib, officialTimes.maghrib) +
            calculateDifference(times.isha, officialTimes.isha);
        }

        methodResults.push({
          methodKey: method.key,
          methodName: `${method.name} - ${method.region}`,
          times,
          totalDifference
        });
      } catch (error) {
        console.error(`Error calculating for method ${method.key}:`, error);
      }
    });

    setResults(methodResults);
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'difference' && a.totalDifference !== undefined && b.totalDifference !== undefined) {
      return a.totalDifference - b.totalDifference;
    }
    return a.methodName.localeCompare(b.methodName);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">مقارنة جميع طرق الحساب</h3>
        <button
          onClick={() => setSortBy(sortBy === 'name' ? 'difference' : 'name')}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 text-sm"
          disabled={!officialTimes || !officialTimes.fajr}
        >
          <ArrowUpDown className="w-4 h-4" />
          {sortBy === 'name' ? 'ترتيب حسب الاسم' : 'ترتيب حسب الدقة'}
        </button>
      </div>

      {!officialTimes || !officialTimes.fajr ? (
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-200 text-sm">
          أدخل الأوقات الرسمية أعلاه ثم اضغط "مقارنة الأوقات" لرؤية أي طريقة حساب هي الأدق لموقعك.
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-right p-3 text-white/70 font-medium">طريقة الحساب</th>
              <th className="text-center p-3 text-white/70 font-medium">الفجر</th>
              <th className="text-center p-3 text-white/70 font-medium">الظهر</th>
              <th className="text-center p-3 text-white/70 font-medium">العصر</th>
              <th className="text-center p-3 text-white/70 font-medium">المغرب</th>
              <th className="text-center p-3 text-white/70 font-medium">العشاء</th>
              {officialTimes && officialTimes.fajr && (
                <th className="text-center p-3 text-white/70 font-medium">إجمالي الفرق</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((result, index) => {
              const isCurrentMethod = result.methodKey === settings.calculationMethod;
              const isBest = sortBy === 'difference' && index === 0 && result.totalDifference !== undefined;

              return (
                <tr
                  key={result.methodKey}
                  className={`border-b border-white/5 transition-colors ${
                    isCurrentMethod
                      ? 'bg-blue-500/10 border-blue-500/20'
                      : isBest
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {isCurrentMethod && <CheckCircle className="w-4 h-4 text-blue-400" />}
                      {isBest && <CheckCircle className="w-4 h-4 text-green-400" />}
                      <span className={isCurrentMethod ? 'text-blue-200 font-medium' : isBest ? 'text-green-200 font-medium' : 'text-white'}>
                        {result.methodName}
                      </span>
                    </div>
                  </td>
                  <td className="text-center p-3 font-mono text-white/90">{formatTime(result.times.fajr)}</td>
                  <td className="text-center p-3 font-mono text-white/90">{formatTime(result.times.dhuhr)}</td>
                  <td className="text-center p-3 font-mono text-white/90">{formatTime(result.times.asr)}</td>
                  <td className="text-center p-3 font-mono text-white/90">{formatTime(result.times.maghrib)}</td>
                  <td className="text-center p-3 font-mono text-white/90">{formatTime(result.times.isha)}</td>
                  {officialTimes && officialTimes.fajr && (
                    <td className="text-center p-3">
                      {result.totalDifference !== undefined ? (
                        <span className={`font-bold ${
                          result.totalDifference <= 10 ? 'text-green-300' :
                          result.totalDifference <= 30 ? 'text-yellow-300' :
                          'text-red-300'
                        }`}>
                          {result.totalDifference} د
                        </span>
                      ) : '-'}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {officialTimes && officialTimes.fajr && sortedResults.length > 0 && sortedResults[0].totalDifference !== undefined && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-green-200 font-medium mb-1">
            أفضل طريقة حساب لموقعك: {sortedResults[0].methodName}
          </p>
          <p className="text-green-200/80 text-sm">
            إجمالي الفرق: {sortedResults[0].totalDifference} دقيقة فقط
          </p>
        </div>
      )}
    </div>
  );
};

export default CalculationMethodComparison;
