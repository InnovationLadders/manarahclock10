import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Check if a user has admin privileges
 * @param user - Firebase User object or null
 * @returns Promise<boolean> - true if user is admin, false otherwise
 */
export const checkAdminStatus = async (user: User | null): Promise<boolean> => {
  if (!user) {
    return false;
  }

  try {
    console.log('🔍 Checking admin status for user:', user.uid);
    
    // Query the users collection for the user's document
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const isAdmin = userData.role === 'admin';
      
      console.log('👤 User data:', userData);
      console.log('🔐 Is admin:', isAdmin);
      
      return isAdmin;
    } else {
      console.log('❌ User document not found in users collection');
      return false;
    }
  } catch (error) {
    console.error('💥 Error checking admin status:', error);
    return false;
  }
};