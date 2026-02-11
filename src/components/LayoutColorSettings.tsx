import React, { useState } from 'react';
import { Settings, LayoutSettings, FontColors } from '../types';
import { 
  Move, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Palette, 
  Type,
  Monitor,
  Smartphone,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface LayoutColorSettingsProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  previewMode?: boolean;
  onPreviewModeChange?: (enabled: boolean) => void;
}

const LayoutColorSettings: React.FC<LayoutColorSettingsProps> = ({ 
  settings, 
  onSettingsChange,
  previewMode = false,
  onPreviewModeChange
}) => {
  const [activeTab, setActiveTab] = useState<'layout' | 'colors' | 'fonts'>('layout');
  const [expandedSections, setExpandedSections] = useState<string[]>(['layout']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // عناصر التخطيط
  const layoutElements = [
    { key: 'mosqueName', name: 'اسم المسجد', icon: Type },
    { key: 'mainTime', name: 'الوقت الرئيسي', icon: Monitor },
    { key: 'gregorianHijriDate', name: 'التاريخ الهجري والميلادي', icon: Type },
    { key: 'countdownCircle', name: 'دائرة العد التنازلي', icon: RotateCcw },
    { key: 'duasPanel', name: 'لوحة الأدعية', icon: Type },
    { key: 'announcementsPanel', name: 'لوحة الإعلانات', icon: Type },
    { key: 'prayerTimesBar', name: 'شريط أوقات الصلاة', icon: Monitor }
  ];

  // ألوان النصوص
  const colorElements = [
    { key: 'mosqueName', name: 'اسم المسجد', category: 'main' },
    { key: 'mainTime', name: 'الوقت الرئيسي', category: 'main' },
    { key: 'gregorianDate', name: 'التاريخ الميلادي', category: 'dates' },
    { key: 'hijriDate', name: 'التاريخ الهجري', category: 'dates' },
    { key: 'countdownType', name: 'نوع العد التنازلي', category: 'countdown' },
    { key: 'prayerName', name: 'اسم الصلاة', category: 'countdown' },
    { key: 'countdownTimer', name: 'مؤقت العد التنازلي', category: 'countdown' },
    { key: 'prayerNamesBar', name: 'أسماء الصلوات في الشريط', category: 'prayers' },
    { key: 'adhanTimes', name: 'أوقات الأذان', category: 'prayers' },
    { key: 'iqamahTimes', name: 'أوقات الإقامة', category: 'prayers' },
    { key: 'duasTitle', name: 'عنوان الأدعية', category: 'content' },
    { key: 'duasText', name: 'نص الأدعية', category: 'content' },
    { key: 'announcementsTitle', name: 'عنوان الإعلانات', category: 'content' },
    { key: 'announcementsText', name: 'نص الإعلانات', category: 'content' }
  ];

  const colorCategories = {
    main: 'العناصر الرئيسية',
    dates: 'التواريخ',
    countdown: 'العد التنازلي',
    prayers: 'أوقات الصلاة',
    content: 'المحتوى'
  };

  // تحديث إعدادات التخطيط
  const updateLayoutSetting = (elementKey: string, property: keyof LayoutSettings, value: number) => {
    const newSettings = {
      ...settings,
      layout: {
        ...settings.layout,
        [elementKey]: {
          ...settings.layout[elementKey as keyof typeof settings.layout],
          [property]: value
        }
      }
    };
    onSettingsChange(newSettings);
  };

  // إعادة تعيين إعدادات التخطيط
  const resetLayoutElement = (elementKey: string) => {
    updateLayoutSetting(elementKey, 'xOffset', 0);
    updateLayoutSetting(elementKey, 'yOffset', 0);
    updateLayoutSetting(elementKey, 'scale', 1);
  };

  // تحديث الألوان
  const updateColor = (colorKey: keyof FontColors, value: string) => {
    const newSettings = {
      ...settings,
      colors: {
        ...settings.colors,
        [colorKey]: value
      }
    };
    onSettingsChange(newSettings);
  };

  // تحديث إعدادات الخطوط
  const updateFontSetting = (property: string, value: string | number) => {
    const newSettings = {
      ...settings,
      fontSettings: {
        ...settings.fontSettings,
        [property]: value
      }
    };
    onSettingsChange(newSettings);
  };

  // تحديث وضع العرض
  const updateDisplayMode = (mode: 'landscape' | 'portrait') => {
    const newSettings = {
      ...settings,
      displayMode: mode
    };
    onSettingsChange(newSettings);
  };

  return (
    <div className="space-y-6">
      {/* التبويبات */}
      <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('layout')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
            activeTab === 'layout'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Move className="w-4 h-4" />
          <span>التخطيط</span>
        </button>
        
        <button
          onClick={() => setActiveTab('colors')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
            activeTab === 'colors'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>الألوان</span>
        </button>

        <button
          onClick={() => setActiveTab('fonts')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
            activeTab === 'fonts'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>الخطوط</span>
        </button>
      </div>

      {/* وضع المعاينة */}
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            {previewMode ? <Eye className="w-5 h-5 text-blue-200" /> : <EyeOff className="w-5 h-5 text-blue-200" />}
          </div>
          <div>
            <h3 className="font-medium text-white">وضع المعاينة</h3>
            <p className="text-sm text-white/70">
              {previewMode ? 'يتم عرض التغييرات مباشرة' : 'التغييرات محفوظة ولكن غير مرئية'}
            </p>
          </div>
        </div>
        <button
          onClick={() => onPreviewModeChange?.(!previewMode)}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            previewMode
              ? 'bg-green-500/20 text-green-200 border border-green-500/30'
              : 'bg-gray-500/20 text-gray-200 border border-gray-500/30'
          }`}
        >
          {previewMode ? 'تشغيل' : 'إيقاف'}
        </button>
      </div>

      {/* محتوى التبويبات */}
      {activeTab === 'layout' && (
        <div className="space-y-4">
          {/* وضع العرض */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="font-medium text-white mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              وضع العرض
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateDisplayMode('landscape')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-300 ${
                  settings.displayMode === 'landscape'
                    ? 'bg-blue-500/20 border-blue-500/30 text-blue-200'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <Monitor className="w-5 h-5" />
                <span>أفقي</span>
              </button>
              <button
                onClick={() => updateDisplayMode('portrait')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-300 ${
                  settings.displayMode === 'portrait'
                    ? 'bg-blue-500/20 border-blue-500/30 text-blue-200'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span>طولي</span>
              </button>
            </div>
          </div>

          {/* عناصر التخطيط */}
          {layoutElements.map((element) => {
            const layoutSettings = settings.layout[element.key as keyof typeof settings.layout];
            const isExpanded = expandedSections.includes(element.key);
            
            return (
              <div key={element.key} className="p-4 bg-white/5 rounded-xl border border-white/10">
                <button
                  onClick={() => toggleSection(element.key)}
                  className="w-full flex items-center justify-between text-white hover:text-blue-200 transition-colors duration-300"
                >
                  <div className="flex items-center gap-3">
                    <element.icon className="w-5 h-5" />
                    <span className="font-medium">{element.name}</span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isExpanded && (
                  <div className="mt-4 space-y-4">
                    {/* الإزاحة الأفقية */}
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        الإزاحة الأفقية ({layoutSettings.xOffset}%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          step="1"
                          value={layoutSettings.xOffset}
                          onChange={(e) => updateLayoutSetting(element.key, 'xOffset', parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <input
                          type="number"
                          min="-50"
                          max="50"
                          value={layoutSettings.xOffset}
                          onChange={(e) => updateLayoutSetting(element.key, 'xOffset', parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                        />
                      </div>
                    </div>

                    {/* الإزاحة العمودية */}
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        الإزاحة العمودية ({layoutSettings.yOffset}%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          step="1"
                          value={layoutSettings.yOffset}
                          onChange={(e) => updateLayoutSetting(element.key, 'yOffset', parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <input
                          type="number"
                          min="-50"
                          max="50"
                          value={layoutSettings.yOffset}
                          onChange={(e) => updateLayoutSetting(element.key, 'yOffset', parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                        />
                      </div>
                    </div>

                    {/* المقياس */}
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        المقياس ({(layoutSettings.scale * 100).toFixed(0)}%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={layoutSettings.scale}
                          onChange={(e) => updateLayoutSetting(element.key, 'scale', parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <input
                          type="number"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={layoutSettings.scale}
                          onChange={(e) => updateLayoutSetting(element.key, 'scale', parseFloat(e.target.value) || 1)}
                          className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                        />
                      </div>
                    </div>

                    {/* زر إعادة التعيين */}
                    <button
                      onClick={() => resetLayoutElement(element.key)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 rounded-lg transition-all duration-300 text-sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>إعادة تعيين</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'colors' && (
        <div className="space-y-4">
          {Object.entries(colorCategories).map(([categoryKey, categoryName]) => {
            const categoryColors = colorElements.filter(color => color.category === categoryKey);
            const isExpanded = expandedSections.includes(categoryKey);
            
            return (
              <div key={categoryKey} className="p-4 bg-white/5 rounded-xl border border-white/10">
                <button
                  onClick={() => toggleSection(categoryKey)}
                  className="w-full flex items-center justify-between text-white hover:text-blue-200 transition-colors duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5" />
                    <span className="font-medium">{categoryName}</span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isExpanded && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryColors.map((colorElement) => (
                      <div key={colorElement.key} className="space-y-2">
                        <label className="block text-white/90 text-sm font-medium">
                          {colorElement.name}
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={settings.colors[colorElement.key as keyof FontColors]}
                            onChange={(e) => updateColor(colorElement.key as keyof FontColors, e.target.value)}
                            className="w-12 h-10 rounded-lg border border-white/20 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.colors[colorElement.key as keyof FontColors]}
                            onChange={(e) => updateColor(colorElement.key as keyof FontColors, e.target.value)}
                            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'fonts' && (
        <div className="space-y-4">
          {/* خط الأدعية */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="font-medium text-white mb-4 flex items-center gap-2">
              <Type className="w-5 h-5" />
              إعدادات خط الأدعية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  نوع الخط
                </label>
                <select
                  value={settings.fontSettings.duasFontFamily}
                  onChange={(e) => updateFontSetting('duasFontFamily', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="Amiri">أميري (Amiri)</option>
                  <option value="Cairo">القاهرة (Cairo)</option>
                  <option value="Noto Sans Arabic">نوتو سانس عربي</option>
                  <option value="Tajawal">تجوال (Tajawal)</option>
                </select>
              </div>
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  حجم الخط ({settings.fontSettings.duasFontSize}px)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="12"
                    max="48"
                    value={settings.fontSettings.duasFontSize}
                    onChange={(e) => updateFontSetting('duasFontSize', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <input
                    type="number"
                    min="12"
                    max="48"
                    value={settings.fontSettings.duasFontSize}
                    onChange={(e) => updateFontSetting('duasFontSize', parseInt(e.target.value) || 24)}
                    className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* خط الإعلانات */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="font-medium text-white mb-4 flex items-center gap-2">
              <Type className="w-5 h-5" />
              إعدادات خط الإعلانات
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  نوع الخط
                </label>
                <select
                  value={settings.fontSettings.announcementsFontFamily}
                  onChange={(e) => updateFontSetting('announcementsFontFamily', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="Amiri">أميري (Amiri)</option>
                  <option value="Cairo">القاهرة (Cairo)</option>
                  <option value="Noto Sans Arabic">نوتو سانس عربي</option>
                  <option value="Tajawal">تجوال (Tajawal)</option>
                </select>
              </div>
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  حجم الخط ({settings.fontSettings.announcementsFontSize}px)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="12"
                    max="48"
                    value={settings.fontSettings.announcementsFontSize}
                    onChange={(e) => updateFontSetting('announcementsFontSize', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <input
                    type="number"
                    min="12"
                    max="48"
                    value={settings.fontSettings.announcementsFontSize}
                    onChange={(e) => updateFontSetting('announcementsFontSize', parseInt(e.target.value) || 24)}
                    className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* أنماط CSS للمنزلقات */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-webkit-slider-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 5px;
          height: 8px;
        }

        .slider::-moz-range-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 5px;
          height: 8px;
        }
      `}</style>
    </div>
  );
};

export default LayoutColorSettings;