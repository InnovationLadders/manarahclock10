import { analytics } from '../firebase';
import { logEvent } from 'firebase/analytics';

export const trackPageView = (pageName: string, additionalData?: Record<string, any>) => {
  if (analytics) {
    logEvent(analytics, 'page_view', {
      page_title: pageName,
      page_location: window.location.href,
      page_path: window.location.pathname,
      ...additionalData
    });
  }
};

export const trackMosqueView = (mosqueId: string, mosqueName: string, city: string, country: string) => {
  if (analytics) {
    logEvent(analytics, 'mosque_view', {
      mosque_id: mosqueId,
      mosque_name: mosqueName,
      city: city,
      country: country,
      timestamp: new Date().toISOString()
    });
  }
};

export const trackMosqueCardClick = (mosqueId: string, mosqueName: string) => {
  if (analytics) {
    logEvent(analytics, 'mosque_card_click', {
      mosque_id: mosqueId,
      mosque_name: mosqueName,
      timestamp: new Date().toISOString()
    });
  }
};

export const trackDisplayScreenOpen = (mosqueId: string) => {
  if (analytics) {
    logEvent(analytics, 'display_screen_open', {
      mosque_id: mosqueId,
      timestamp: new Date().toISOString()
    });
  }
};

export const trackSearch = (searchTerm: string, resultsCount: number) => {
  if (analytics) {
    logEvent(analytics, 'search', {
      search_term: searchTerm,
      results_count: resultsCount,
      timestamp: new Date().toISOString()
    });
  }
};

export const trackFilterUsage = (filterType: 'city' | 'country', filterValue: string) => {
  if (analytics) {
    logEvent(analytics, 'filter_usage', {
      filter_type: filterType,
      filter_value: filterValue,
      timestamp: new Date().toISOString()
    });
  }
};
