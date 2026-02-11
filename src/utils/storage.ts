import { User } from 'firebase/auth';
import { createUserWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../firebase';
import { Settings } from '../types';

const STORAGE_KEY = 'mosque_display_settings';
const MOSQUE_SETTINGS_PREFIX = 'mosque_settings_';

// الإعدادات الافتراضية
export const DEFAULT_SETTINGS: Settings = {
  mosqueName: 'مسجد الهدى',
  location: {
    latitude: 24.7136,
    longitude: 46.6753,
    city: 'الرياض',
    country: 'المملكة العربية السعودية'
  },
  calculationMethod: 'UmmAlQura',
  madhab: 'Shafi',
  backgrounds: [
    {
      id: '1',
      url: 'https://images.pexels.com/photos/96957/pexels-photo-96957.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900',
      type: 'image',
      name: 'الغروب',
      objectFit: 'fill',
      objectPosition: 'center'
    },
    {
      id: '2',
      url: 'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900',
      type: 'image',
      name: 'المسجد',
      objectFit: 'fill',
      objectPosition: 'center'
    }
  ],
  rotateBackgrounds: false,
  rotationInterval: 30, // 30 ثانية
  selectedBackgroundId: null,
  displayMode: 'landscape',
  screenType: 'dawahScreen',
  fontSettings: {
    mosqueName: {
      fontFamily: 'Amiri',
      fontWeight: '700'
    },
    mainTime: {
      fontFamily: 'Cairo',
      fontWeight: '700'
    },
    gregorianDate: {
      fontFamily: 'Cairo',
      fontWeight: '400'
    },
    hijriDate: {
      fontFamily: 'Amiri',
      fontWeight: '600'
    },
    prayerTimes: {
      fontFamily: 'Cairo',
      fontWeight: '700'
    },
    prayerNames: {
      fontFamily: 'Amiri',
      fontWeight: '600'
    },
    countdown: {
      fontFamily: 'Cairo',
      fontWeight: '700'
    },
    duasFontSize: 24,
    duasFontFamily: 'Amiri',
    duasFontWeight: '400',
    autoAdjustDuasFontSize: true,
    announcementsFontSize: 24,
    announcementsFontFamily: 'Cairo',
    announcementsFontWeight: '500',
    autoAdjustAnnouncementsFontSize: true,
    postPrayerDhikrFontSize: 28,
    postPrayerDhikrFontFamily: 'Amiri',
    postPrayerDhikrFontWeight: '400',
    autoAdjustPostPrayerDhikrFontSize: true,
  },
  colors: {
    mosqueName: '#ffffff',
    mainTime: '#ffffff',
    gregorianDate: '#93c5fd',
    hijriDate: '#a7f3d0',
    countdownType: '#a7f3d0',
    prayerName: '#ffffff',
    countdownTimer: '#fde047',
    prayerNamesBar: '#ffffff',
    adhanTimes: '#a7f3d0',
    iqamahTimes: '#fde68a',
    duasTitle: '#ffffff',
    duasText: '#ffffff',
    announcementsTitle: '#ffffff',
    announcementsText: '#ffffff'
  },
  layout: {
    mosqueName: {
      xOffset: 0,
      yOffset: 0,
      scale: 1
    },
    mainTime: {
      xOffset: 0,
      yOffset: 0,
      scale: 1
    },
    gregorianHijriDate: {
      xOffset: 0,
      yOffset: 0,
      scale: 1
    },
    mainClock: {
      xOffset: 0,
      yOffset: 0,
      scale: 1
    },
    countdownCircle: {
      xOffset: 0,
      yOffset: 0,
      scale: 1
    },
    duasPanel: {
      xOffset: 0,
      yOffset: 0,
      scale: 1
    },
    announcementsPanel: {
      xOffset: 0,
      yOffset: 0,
      scale: 1
    },
    prayerTimesBar: {
      xOffset: 0,
      yOffset: 0,
      scale: 1
    }
  },
  iqamahDelays: {
    fajr: 20,
    sunrise: 0,
    dhuhr: 10,
    asr: 10,
    maghrib: 5,
    isha: 10
  },
  prayerTimeAdjustments: {
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0
  },
  duas: [
    'اللهم اغفر لي ذنبي وخطئي وجهلي',
    'ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار',
    'اللهم أعني على ذكرك وشكرك وحسن عبادتك',
    'سبحان الله وبحمده سبحان الله العظيم',
    'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير',
    'اللهم صل وسلم على نبينا محمد وعلى آله وصحبه أجمعين'
  ],
  announcements: [
    'درس العصر يوم الخميس بعد صلاة العصر',
    'تبرعات لصيانة المسجد',
    'حلقة تحفيظ القرآن للأطفال',
    'محاضرة دينية يوم الجمعة بعد صلاة المغرب',
    'دروس تعليم التجويد للكبار'
  ],
  enablePrayerInProgressScreen: true,
  prayerDuration: {
    fajr: 10,
    sunrise: 0,
    dhuhr: 15,
    asr: 10,
    maghrib: 10,
    isha: 15
  },
  enablePostPrayerDhikrScreen: true,
  postPrayerDhikrDuration: 5,
  postPrayerDhikrText: `أستغفر الله (ثلاث مرات)
اللهم أنت السلام، ومنكَ السلام، تباركتَ يا ذا الجلالِ والإكرام.
لا إله إلا الله وحده لا شريك له، له الملك، وله الحمد، وهو على كل شيء قدير، اللهم لا مانع لما أعطيتَ، ولا معطي لما منعتَ، ولا ينفع ذا الجَدِّ منك الجَد
لا إله إلا الله وحده لا شريك له، له الملك، وله الحمد، وهو على كل شيء قدير، لا حول ولا قوة إلا بالله، لا إله إلا الله، ولا نعبد إلا إياه، له النعمة، وله الفضل، وله الثناء الحسن، لا إله إلا الله، مخلصين له الدين ولو كره الكافرون.
سبحان الله (33) مرة، الحمد لله (33) مرة، الله أكبر (33) مرة، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد، وهو على كل شيء قدير.
قراءة آية الكرسي
قراءة سورة الإخلاص والمعوذتين (مرة واحدة)
ربِ قِنِي عذابَك يوم تبعثُ عبادك.
اللهم اغفر لي ما قدمتُ وما أخرتُ، وما أسررتُ وما أعلنتُ، وما أسرفتُ، وما أنت أعلم به مني، أنت المُقدِّم وأنت المُؤخر، لا إله إلا أنت.
بعد الفجر والمغرب: لا إله إلا الله وحده لا شريك له، له الملك وله الحمد، يُحيي ويُميت، وهو على كل شيء قدير. (10) مرات.`,
  showDuasPanel: true,
  showAnnouncementsPanel: true
};

// دالة مساعدة لدمج الكائنات بعمق
const deepMerge = (target: any, source: any): any => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
};

// جلب الإعدادات من التخزين المحلي
const getLocalSettings = (mosqueId?: string): Settings => {
  try {
    const storageKey = mosqueId ? `${MOSQUE_SETTINGS_PREFIX}${mosqueId}` : STORAGE_KEY;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsedSettings = JSON.parse(stored);
      return deepMerge(DEFAULT_SETTINGS, parsedSettings);
    }
  } catch (error) {
    console.warn(`خطأ في قراءة الإعدادات المحلية${mosqueId ? ` للمسجد ${mosqueId}` : ''}:`, error);
  }
  
  return DEFAULT_SETTINGS;
};

// حفظ الإعدادات في التخزين المحلي
const saveLocalSettings = (settings: Settings, mosqueId?: string): void => {
  try {
    const storageKey = mosqueId ? `${MOSQUE_SETTINGS_PREFIX}${mosqueId}` : STORAGE_KEY;
    localStorage.setItem(storageKey, JSON.stringify(settings));
    console.log(`تم حفظ الإعدادات محلياً${mosqueId ? ` للمسجد ${mosqueId}` : ''}`);
  } catch (error) {
    console.error(`خطأ في حفظ الإعدادات محلياً${mosqueId ? ` للمسجد ${mosqueId}` : ''}:`, error);
  }
};

// جلب الإعدادات من Firestore
const getFirestoreSettings = async (user: User): Promise<Settings | null> => {
  try {
    const docRef = doc(db, 'mosques', user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const firestoreData = docSnap.data() as Settings;
      return deepMerge(DEFAULT_SETTINGS, firestoreData);
    }
    
    return null;
  } catch (error) {
    console.warn('خطأ في جلب الإعدادات من Firestore:', error);
    return null;
  }
};

// جلب الإعدادات من Firestore باستخدام mosqueId
const getFirestoreSettingsById = async (mosqueId: string): Promise<Settings | null> => {
  try {
    const docRef = doc(db, 'mosques', mosqueId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const firestoreData = docSnap.data() as Settings;
      return deepMerge(DEFAULT_SETTINGS, firestoreData);
    }
    
    return null;
  } catch (error) {
    console.warn(`خطأ في جلب الإعدادات من Firestore للمسجد ${mosqueId}:`, error);
    return null;
  }
};

// حفظ الإعدادات في Firestore
const saveFirestoreSettings = async (user: User, settings: Settings): Promise<void> => {
  try {
    const docRef = doc(db, 'mosques', user.uid);
    await setDoc(docRef, settings, { merge: true });
    console.log('تم حفظ الإعدادات في Firestore بنجاح');
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      console.error('خطأ في الصلاحيات: المستخدم لا يملك صلاحية الكتابة في قاعدة البيانات');
      throw new Error('PERMISSION_DENIED');
    }
    console.error('خطأ في حفظ الإعدادات في Firestore:', error);
    throw error;
  }
};

// الدالة الرئيسية لجلب الإعدادات
export const getSettings = async (user?: User | null, mosqueId?: string): Promise<{ settings: Settings; found: boolean }> => {
  console.log('🔍 [getSettings] بدء جلب الإعدادات - User:', user?.uid, 'MosqueId:', mosqueId);
  console.log('🔍 [getSettings] نوع mosqueId:', typeof mosqueId, 'القيمة:', JSON.stringify(mosqueId));

  if (mosqueId) {
    console.log('🔍 [getSettings] جلب إعدادات مسجد محدد:', mosqueId);

    // أولاً: محاولة جلب الإعدادات من التخزين المحلي
    const localSettings = getLocalSettings(mosqueId);
    const isLocalSettingsValid = localSettings.mosqueName !== DEFAULT_SETTINGS.mosqueName;

    if (isLocalSettingsValid) {
      console.log('✅ [getSettings] تم العثور على إعدادات محلية للمسجد:', localSettings.mosqueName);

      // إذا كان متصل بالإنترنت، حاول تحديث الإعدادات في الخلفية
      if (navigator.onLine) {
        console.log('🔄 [getSettings] تحديث الإعدادات في الخلفية...');
        getFirestoreSettingsById(mosqueId).then(firestoreSettings => {
          if (firestoreSettings) {
            saveLocalSettings(firestoreSettings, mosqueId);
            console.log('✅ [getSettings] تم تحديث الإعدادات المحلية في الخلفية');
          }
        }).catch(error => {
          console.warn('⚠️ [getSettings] فشل في تحديث الإعدادات في الخلفية:', error);
        });
      }

      return {
        settings: localSettings,
        found: true
      };
    }

    // ثانياً: إذا لم توجد إعدادات محلية، حاول الجلب من Firestore مع مهلة زمنية
    try {
      console.log('🌐 [getSettings] محاولة جلب الإعدادات من Firestore...');

      // إضافة مهلة زمنية (5 ثوانٍ) للطلب
      const firestoreSettingsPromise = getFirestoreSettingsById(mosqueId);
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('انتهت مهلة الطلب')), 5000)
      );

      const firestoreSettings = await Promise.race([
        firestoreSettingsPromise,
        timeoutPromise
      ]);

      if (firestoreSettings) {
        console.log('✅ [getSettings] تم العثور على إعدادات المسجد من Firestore:', firestoreSettings.mosqueName);

        // حفظ الإعدادات محلياً للاستخدام المستقبلي
        saveLocalSettings(firestoreSettings, mosqueId);

        return {
          settings: firestoreSettings,
          found: true
        };
      } else {
        console.warn(`❌ [getSettings] المسجد غير موجود في قاعدة البيانات: ${mosqueId}`);
        return {
          settings: DEFAULT_SETTINGS,
          found: false
        };
      }
    } catch (error) {
      console.error('💥 [getSettings] فشل في جلب إعدادات المسجد المحدد:', {
        mosqueId: mosqueId,
        error: error,
        errorMessage: error instanceof Error ? error.message : 'خطأ غير معروف'
      });

      // محاولة استخدام أي إعدادات محلية كـ fallback
      const fallbackSettings = getLocalSettings(mosqueId);
      if (fallbackSettings.mosqueName !== DEFAULT_SETTINGS.mosqueName) {
        console.log('🆘 [getSettings] استخدام الإعدادات المحلية كـ fallback');
        return {
          settings: fallbackSettings,
          found: true
        };
      }

      return {
        settings: DEFAULT_SETTINGS,
        found: false
      };
    }
  } else if (user) {
    // جلب إعدادات المستخدم المسجل (بدون mosqueId محدد)
    console.log('👤 [getSettings] جلب إعدادات المستخدم المسجل:', user.uid);
    try {
      // إضافة مهلة زمنية للطلب
      const firestoreSettingsPromise = getFirestoreSettings(user);
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('انتهت مهلة الطلب')), 5000)
      );

      const firestoreSettings = await Promise.race([
        firestoreSettingsPromise,
        timeoutPromise
      ]);

      if (firestoreSettings) {
        // حفظ الإعدادات محلياً كنسخة احتياطية
        saveLocalSettings(firestoreSettings);
        console.log('✅ [getSettings] تم جلب إعدادات المستخدم:', firestoreSettings.mosqueName);
        return {
          settings: firestoreSettings,
          found: true
        };
      }
    } catch (error) {
      console.warn('⚠️ [getSettings] فشل في جلب الإعدادات من Firestore، سيتم استخدام الإعدادات المحلية:', error);
    }
  }

  console.log('📱 [getSettings] استخدام الإعدادات المحلية - mosqueId:', mosqueId, 'found:', !mosqueId);
  // إذا فشل جلب الإعدادات من Firestore أو لم يكن المستخدم مسجل الدخول
  return {
    settings: getLocalSettings(mosqueId),
    found: !mosqueId // إذا لم يكن هناك mosqueId محدد، فالإعدادات المحلية صالحة
  };
};

// الدالة الرئيسية لحفظ الإعدادات
export const saveSettings = async (settings: Settings, user?: User | null, mosqueId?: string): Promise<void> => {
  // حفظ الإعدادات محلياً دائماً
  saveLocalSettings(settings, mosqueId);
  
  // إذا كان المستخدم مسجل الدخول، احفظ في Firestore أيضاً
  if (user) {
    try {
      await saveFirestoreSettings(user, settings);
    } catch (error) {
      if (error instanceof Error && error.message === 'PERMISSION_DENIED') {
        console.warn('تم حفظ الإعدادات محلياً فقط - يتطلب تحديث صلاحيات قاعدة البيانات');
        throw new Error('PERMISSION_DENIED');
      } else {
        console.error('فشل في حفظ الإعدادات في Firestore، تم الحفظ محلياً فقط:', error);
        // لا نرمي الخطأ هنا لأن الحفظ المحلي نجح
      }
    }
  }
};

// تحديث كلمة مرور المستخدم
export const updateUserPassword = async (user: User, newPassword: string): Promise<void> => {
  try {
    await updatePassword(user, newPassword);
    console.log('✅ تم تغيير كلمة المرور بنجاح');
  } catch (error: any) {
    console.error('💥 خطأ في تغيير كلمة المرور:', error);
    
    // ترجمة رسائل الخطأ إلى العربية
    switch (error.code) {
      case 'auth/requires-recent-login':
        throw new Error('يتطلب تسجيل دخول حديث. يرجى تسجيل الخروج والدخول مرة أخرى ثم المحاولة');
      case 'auth/weak-password':
        throw new Error('كلمة المرور ضعيفة. يرجى اختيار كلمة مرور أقوى');
      case 'auth/network-request-failed':
        throw new Error('خطأ في الاتصال بالإنترنت');
      default:
        throw new Error('فشل في تغيير كلمة المرور. حاول مرة أخرى');
    }
  }
};

// إنشاء حساب مسجد جديد (للمسؤول فقط)
export const createMosqueUser = async (
  email: string, 
  password: string, 
  mosqueName: string, 
  location: { latitude: number; longitude: number; city: string; country: string }
): Promise<void> => {
  try {
    console.log('🔄 إنشاء حساب مسجد جديد:', { email, mosqueName, location });
    
    // إنشاء حساب المستخدم في Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;
    
    console.log('✅ تم إنشاء حساب المستخدم:', newUser.uid);
    
    // إنشاء مستند المسجد في Firestore
    const mosqueData = {
      ...DEFAULT_SETTINGS,
      mosqueName,
      location,
      email,
      madhab: 'Shafi',
      createdAt: new Date(),
      isActive: true
    };
    
    const mosqueDocRef = doc(db, 'mosques', newUser.uid);
    await setDoc(mosqueDocRef, mosqueData);
    
    console.log('✅ تم إنشاء مستند المسجد في Firestore');
    
    // تسجيل خروج المستخدم الجديد (لأن المسؤول لا يريد تسجيل الدخول بحساب المسجد)
    await auth.signOut();
    
    console.log('✅ تم إنشاء حساب المسجد بنجاح');
  } catch (error: any) {
    console.error('💥 خطأ في إنشاء حساب المسجد:', error);
    
    // ترجمة رسائل الخطأ إلى العربية
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new Error('البريد الإلكتروني مستخدم بالفعل');
      case 'auth/invalid-email':
        throw new Error('البريد الإلكتروني غير صالح');
      case 'auth/weak-password':
        throw new Error('كلمة المرور ضعيفة. يجب أن تكون 6 أحرف على الأقل');
      case 'auth/network-request-failed':
        throw new Error('خطأ في الاتصال بالإنترنت');
      default:
        throw new Error('فشل في إنشاء حساب المسجد. حاول مرة أخرى');
    }
  }
};

// دالة مساعدة للحصول على الإعدادات بشكل متزامن (للاستخدام في الحالات التي لا تدعم async)
export const getSettingsSync = (mosqueId?: string): Settings => {
  return getLocalSettings(mosqueId);
};

// رفع صورة خلفية إلى Firebase Storage
export const uploadBackgroundImage = async (
  file: File,
  user: User,
  onProgress?: (progress: number) => void
): Promise<{ id: string; url: string; type: 'image' | 'video'; name: string }> => {
  try {
    console.log('🔄 بدء رفع الصورة:', file.name, 'الحجم:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    // إنشاء مرجع فريد في Firebase Storage
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
    const storageRef = ref(storage, `backgrounds/${user.uid}/${fileName}`);
    
    onProgress?.(20);
    
    // رفع الملف إلى Firebase Storage
    console.log('📤 رفع الملف إلى Firebase Storage...');
    const uploadResult = await uploadBytes(storageRef, file);
    
    onProgress?.(80);
    
    // الحصول على رابط التحميل
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    onProgress?.(100);
    
    console.log('✅ تم رفع الصورة بنجاح:', downloadURL);
    
    return {
      id: fileName.split('.')[0], // استخدام اسم الملف بدون الامتداد كمعرف
      url: downloadURL,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      name: file.name
    };
    
  } catch (error) {
    console.error('💥 خطأ في رفع الصورة:', error);
    throw new Error('فشل في رفع الصورة. يرجى المحاولة مرة أخرى.');
  }
};

// حذف صورة خلفية من Firebase Storage
export const deleteBackgroundImage = async (
  backgroundId: string,
  user: User
): Promise<void> => {
  try {
    // البحث عن الملف في Firebase Storage
    const storageRef = ref(storage, `backgrounds/${user.uid}/${backgroundId}`);
    
    // محاولة حذف الملف
    await deleteObject(storageRef);
    console.log('✅ تم حذف الصورة من Firebase Storage:', backgroundId);
    
  } catch (error: any) {
    // إذا كان الملف غير موجود، لا نعتبر هذا خطأ
    if (error.code === 'storage/object-not-found') {
      console.log('ℹ️ الملف غير موجود في Firebase Storage:', backgroundId);
      return;
    }
    
    console.error('💥 خطأ في حذف الصورة:', error);
    throw new Error('فشل في حذف الصورة من التخزين.');
  }
};

// إضافة خلفية جديدة إلى إعدادات المسجد (يعيد الإعدادات المحدثة)
export const addBackgroundToSettings = (
  currentSettings: Settings,
  backgroundItem: { id: string; url: string; type: 'image' | 'video'; name: string; objectFit?: string; objectPosition?: string }
): Settings => {
  // إنشاء عنصر خلفية جديد
  const newBackground = {
    id: backgroundItem.id,
    url: backgroundItem.url,
    type: backgroundItem.type,
    name: backgroundItem.name,
    objectFit: backgroundItem.objectFit || 'fill',
    objectPosition: backgroundItem.objectPosition || 'center'
  };
  
  // إضافة الخلفية الجديدة إلى القائمة وإرجاع الإعدادات المحدثة
  return {
    ...currentSettings,
    backgrounds: [...currentSettings.backgrounds, newBackground]
  };
};

// حذف خلفية من إعدادات المسجد (يعيد الإعدادات المحدثة)
export const removeBackgroundFromSettings = (
  currentSettings: Settings,
  backgroundId: string
): Settings => {
  // إزالة الخلفية من القائمة
  const updatedBackgrounds = currentSettings.backgrounds.filter(bg => bg.id !== backgroundId);
  
  // إذا كانت الخلفية المحذوفة هي المحددة حالياً، إعادة تعيين الاختيار
  let selectedBackgroundId = currentSettings.selectedBackgroundId;
  if (selectedBackgroundId === backgroundId) {
    selectedBackgroundId = updatedBackgrounds.length > 0 ? updatedBackgrounds[0].id : null;
  }
  
  // إرجاع الإعدادات المحدثة
  return {
    ...currentSettings,
    backgrounds: updatedBackgrounds,
    selectedBackgroundId
  };
};