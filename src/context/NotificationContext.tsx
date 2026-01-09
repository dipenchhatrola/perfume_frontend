import React, { createContext, useContext, useState } from 'react';

export type NotificationType = 'order' | 'promotion' | 'review' | 'system';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    type: NotificationType,
    title: string,
    message: string
  ) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const getTimeNow = () =>
  new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    type: NotificationType,
    title: string,
    message: string
  ) => {
    setNotifications(prev => [
      {
        id: Date.now(),
        type,
        title,
        message,
        time: getTimeNow(),
        read: false
      },
      ...prev
    ]);
  };

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside provider');
  return ctx;
};
