import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Navigation, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  onClose: () => void;
}

const LocationMarker: React.FC<{ position: [number, number]; onPositionChange: (lat: number, lng: number) => void }> = ({
  position,
  onPositionChange
}) => {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return <Marker position={position} />;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ latitude, longitude, onLocationChange, onClose }) => {
  const [position, setPosition] = useState<[number, number]>([latitude, longitude]);
  const [loading, setLoading] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('المتصفح لا يدعم تحديد الموقع الجغرافي');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setPosition([lat, lng]);
        onLocationChange(lat, lng);
        setLoading(false);
      },
      (error) => {
        console.error('خطأ في الحصول على الموقع:', error);
        alert('فشل في الحصول على موقعك الحالي. تأكد من السماح للمتصفح بالوصول إلى موقعك.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handlePositionChange = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
  };

  const handleSave = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 rounded-2xl shadow-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">اختيار موقع المسجد</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-200 text-sm">
            <MapPin className="w-5 h-5 flex-shrink-0" />
            <p>انقر على الخريطة لتحديد موقع المسجد بدقة، أو استخدم زر GPS للحصول على موقعك الحالي</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="h-96 rounded-lg overflow-hidden">
                <MapContainer
                  center={position}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={position} onPositionChange={handlePositionChange} />
                </MapContainer>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGetCurrentLocation}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 disabled:bg-gray-500/20 border border-green-500/30 disabled:border-gray-500/30 text-green-200 disabled:text-gray-400 rounded-xl transition-all duration-300 font-medium"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-green-200 border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري تحديد الموقع...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" />
                    <span>استخدام موقعي الحالي</span>
                  </>
                )}
              </button>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-medium mb-3">الإحداثيات المحددة</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-white/70 text-sm">خط العرض (Latitude)</label>
                    <div className="text-white font-mono text-lg mt-1">{position[0].toFixed(6)}</div>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm">خط الطول (Longitude)</label>
                    <div className="text-white font-mono text-lg mt-1">{position[1].toFixed(6)}</div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-yellow-200 text-sm">
                <p className="font-medium mb-2">نصائح لتحديد الموقع بدقة:</p>
                <ul className="list-disc list-inside space-y-1 text-yellow-200/80 text-xs">
                  <li>قم بتكبير الخريطة للحصول على دقة أفضل</li>
                  <li>حدد الموقع الدقيق للمسجد وليس المنطقة العامة</li>
                  <li>الموقع الدقيق يضمن حساب أوقات الصلاة بدقة عالية</li>
                </ul>
              </div>

              <button
                onClick={handleSave}
                className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-300 font-medium"
              >
                حفظ الموقع
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
