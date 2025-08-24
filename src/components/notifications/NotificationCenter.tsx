'use client';

import { useAuth } from '@clerk/nextjs';
import {
  AlertCircle,
  Bell,
  Calendar,
  Check,
  CheckCircle,
  Info,
  Mail,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

export type Notification = {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  category: 'deal' | 'contact' | 'activity' | 'system';
};

type NotificationCenterProps = {
  className?: string;
};

export function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const { getToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock notifications for development
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      title: 'Deal Closed',
      message: 'Enterprise Software License deal worth $50,000 has been closed successfully.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      read: false,
      actionUrl: '/dashboard/deals/1',
      actionText: 'View Deal',
      category: 'deal',
    },
    {
      id: '2',
      type: 'info',
      title: 'New Contact Added',
      message: 'Sarah Johnson from TechStart Inc has been added to your contacts.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      read: false,
      actionUrl: '/dashboard/contacts/2',
      actionText: 'View Contact',
      category: 'contact',
    },
    {
      id: '3',
      type: 'warning',
      title: 'Meeting Reminder',
      message: 'You have a meeting with John Smith in 30 minutes.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      read: true,
      actionUrl: '/dashboard/activities/3',
      actionText: 'View Meeting',
      category: 'activity',
    },
    {
      id: '4',
      type: 'error',
      title: 'Email Sync Failed',
      message: 'Failed to sync emails from Gmail. Please check your connection.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
      read: true,
      actionUrl: '/dashboard/settings/integrations',
      actionText: 'Fix Integration',
      category: 'system',
    },
  ];

  // Load notifications
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        // Fallback to mock data
        setNotifications(mockNotifications);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      // Fallback to mock data
      setNotifications(mockNotifications);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = await getToken();
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification,
        ),
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Update locally anyway
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification,
        ),
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await getToken();
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true })),
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Update locally anyway
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true })),
      );
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = await getToken();
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId),
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Update locally anyway
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId),
      );
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      case 'error':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getCategoryIcon = (category: Notification['category']) => {
    switch (category) {
      case 'deal':
        return TrendingUp;
      case 'contact':
        return Users;
      case 'activity':
        return Calendar;
      case 'system':
        return Mail;
      default:
        return Info;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    }
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    }
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="crm-button crm-button-secondary relative p-2"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="crm-flex crm-items-center absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full bg-red-500">
            <span className="crm-text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 z-50 mt-2 max-h-96 w-96 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
            {/* Header */}
            <div className="border-b border-gray-200 p-4">
              <div className="crm-flex crm-items-center crm-justify-between">
                <h3 className="crm-text-lg crm-font-semibold text-gray-900">
                  Notifications
                </h3>
                <div className="crm-flex crm-items-center crm-gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="crm-text-sm text-blue-600 hover:text-blue-700"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading && (
                <div className="p-4 text-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <p className="crm-text-sm mt-2 text-gray-500">Loading notifications...</p>
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="p-8 text-center">
                  <Bell className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  <p className="crm-text-sm text-gray-500">No notifications</p>
                </div>
              )}

              {!loading && notifications.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    const CategoryIcon = getCategoryIcon(notification.category);

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 transition-colors hover:bg-gray-50 ${
                          !notification.read ? 'bg-blue-25' : ''
                        }`}
                      >
                        <div className="crm-flex crm-items-start crm-gap-3">
                          <div className={`crm-flex crm-items-center h-8 w-8 flex-shrink-0 justify-center rounded-full ${
                            notification.type === 'success'
                              ? 'bg-green-100'
                              : notification.type === 'warning'
                                ? 'bg-yellow-100'
                                : notification.type === 'error'
                                  ? 'bg-red-100'
                                  : 'bg-blue-100'
                          }`}
                          >
                            <IconComponent className={`h-4 w-4 ${getTypeColor(notification.type)}`} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="crm-flex crm-items-center crm-gap-2 mb-1">
                              <CategoryIcon className="h-3 w-3 text-gray-400" />
                              <h4 className="crm-text-sm crm-font-medium truncate text-gray-900">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></div>
                              )}
                            </div>

                            <p className="crm-text-sm mb-2 text-gray-600">
                              {notification.message}
                            </p>

                            <div className="crm-flex crm-items-center crm-justify-between">
                              <span className="crm-text-xs text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>

                              <div className="crm-flex crm-items-center crm-gap-2">
                                {notification.actionUrl && (
                                  <a
                                    href={notification.actionUrl}
                                    className="crm-text-xs text-blue-600 hover:text-blue-700"
                                    onClick={() => setIsOpen(false)}
                                  >
                                    {notification.actionText || 'View'}
                                  </a>
                                )}

                                {!notification.read && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="p-1 text-gray-400 hover:text-blue-600"
                                    title="Mark as read"
                                  >
                                    <Check className="h-3 w-3" />
                                  </button>
                                )}

                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="p-1 text-gray-400 hover:text-red-600"
                                  title="Delete"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="bg-gray-25 border-t border-gray-100 p-3">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/dashboard/notifications';
                  }}
                  className="crm-text-sm w-full text-center text-blue-600 hover:text-blue-700"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
