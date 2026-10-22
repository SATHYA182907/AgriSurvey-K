import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Sprout,
  Layers,
  ArrowRight,
  Filter,
  RefreshCw,
  CheckCheck,
  Smartphone,
  Info,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { notificationService } from '@/services/notification.service';
import { mockDb } from '@/services/mock-db';
import { Notification } from '@/types';

export const FarmerNotificationsPage: React.FC = () => {
  const farmer = mockDb.currentUser;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const list = await notificationService.getMyNotifications(farmer.id);
      setNotifications(list);
    } finally {
      setIsRefreshing(false);
    }
  }, [farmer.id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    for (const n of notifications) {
      if (!n.read_at) {
        await notificationService.markAsRead(n.id);
      }
    }
    loadNotifications();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'UNREAD') return !n.read_at;
    if (activeFilter === 'VERIFICATION') {
      return (
        n.notification_type.includes('VERIFICATION') ||
        n.notification_type.includes('APPLICATION') ||
        n.notification_type.includes('STATUS')
      );
    }
    if (activeFilter === 'PLANT_HEALTH') {
      return (
        n.notification_type.includes('PLANT') ||
        n.notification_type.includes('HEALTH') ||
        n.notification_type.includes('ALERT')
      );
    }
    if (activeFilter === 'INSPECTION') {
      return n.notification_type.includes('INSPECTION') || n.notification_type.includes('DRONE');
    }
    return true;
  });

  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const verificationCount = notifications.filter(
    (n) => n.notification_type.includes('VERIFICATION') || n.notification_type.includes('APPLICATION')
  ).length;
  const plantAlertsCount = notifications.filter(
    (n) => n.notification_type.includes('PLANT') || n.notification_type.includes('ALERT')
  ).length;

  const getNotificationIcon = (type: string) => {
    if (type.includes('PLANT') || type.includes('HEALTH') || type.includes('ALERT')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
          <Sprout className="w-5 h-5" />
        </div>
      );
    }
    if (type.includes('VERIFICATION') || type.includes('APPLICATION')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
      );
    }
    if (type.includes('INSPECTION') || type.includes('DRONE')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
          <Layers className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
        <Bell className="w-5 h-5" />
      </div>
    );
  };

  const getNotificationLink = (n: Notification) => {
    if (n.notification_type.includes('INSPECTION') || n.notification_type.includes('DRONE')) {
      return { text: 'View Flight Status', href: '/farmer/inspection-status' };
    }
    if (n.notification_type.includes('FINAL_VERIFICATION_COMPLETED') || n.notification_type.includes('REPORT')) {
      return { text: 'Download Report', href: '/farmer/reports' };
    }
    if (n.notification_type.includes('ADDITIONAL_INFO') || n.notification_type.includes('APPLICATION')) {
      return { text: 'View Land Properties', href: '/farmer/properties' };
    }
    if (n.notification_type.includes('PLANT') || n.notification_type.includes('ALERT')) {
      return { text: 'Inspect Plant Unit', href: '/farmer/dashboard' };
    }
    return null;
  };

  return (
    <DashboardLayout
      title="Notifications & System Alerts"
      subtitle="Live administrative updates, Tahsildar verification notices, and telemetry plant alerts."
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>All Notifications</span>
              <Bell className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Inbox message history</div>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Unread Notices</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{unreadCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Requiring your attention</div>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Revenue Verification</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{verificationCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Tahsildar updates</div>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Plant Health Warnings</span>
              <Sprout className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-extrabold text-rose-600 mt-1">{plantAlertsCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Sensor & agronomic flags</div>
          </Card>
        </div>

        {/* Filter & Action Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'ALL', label: 'All Notices' },
              { id: 'UNREAD', label: `Unread (${unreadCount})` },
              { id: 'VERIFICATION', label: 'Tahsildar / Land' },
              { id: 'PLANT_HEALTH', label: 'Plant Intelligence' },
              { id: 'INSPECTION', label: 'Drone Flights' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                icon={<CheckCheck className="w-3.5 h-3.5" />}
                onClick={handleMarkAllAsRead}
              >
                Mark All Read
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
              onClick={loadNotifications}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Notifications Feed */}
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center bg-white border-dashed border-2 border-slate-200">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Notifications in this Filter</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              You are all caught up! Verification milestones, drone inspection dispatches, and plant
              health alerts will be delivered here in real time.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const isUnread = !notif.read_at;
              const link = getNotificationLink(notif);

              return (
                <Card
                  key={notif.id}
                  className={`p-4 sm:p-5 border transition-all ${
                    isUnread
                      ? 'bg-white border-emerald-300 shadow-xs ring-1 ring-emerald-100'
                      : 'bg-white/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {getNotificationIcon(notif.notification_type)}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-extrabold ${
                              isUnread ? 'text-slate-900' : 'text-slate-700'
                            }`}
                          >
                            {notif.title}
                          </h4>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(notif.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            , {new Date(notif.created_at).toLocaleDateString()}
                          </span>

                          {notif.channel === 'both' || notif.channel === 'sms' ? (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] flex items-center gap-1 font-medium">
                              <Smartphone className="w-2.5 h-2.5" /> SMS Sent
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                              In-App
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                        {link ? (
                          <Link
                            to={link.href}
                            className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                          >
                            <span>{link.text}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <div />
                        )}

                        {isUnread && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="text-slate-500 hover:text-slate-800 font-medium transition-colors text-xs"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
