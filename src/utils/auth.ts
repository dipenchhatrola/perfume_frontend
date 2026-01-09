// utils/auth.ts
export const getAllUsers = () => {
  try {
    const usersData = localStorage.getItem('perfume_users');
    if (usersData) {
      return JSON.parse(usersData);
    }
    return [];
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

export const findUserByEmail = (email: string) => {
  const users = getAllUsers();
  return users.find((user: any) => user.email.toLowerCase() === email.toLowerCase());
};

export const isLoggedIn = () => {
  return localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('perfume_user') !== null;
};

export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('perfume_user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('perfume_user');
  localStorage.removeItem('isLoggedIn');
  // Don't remove perfume_users - keep registered users
};