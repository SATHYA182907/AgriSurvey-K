import { supabase, isLiveSupabaseConfigured } from '@/lib/supabase';
import { mockDb } from './mock-db';
import { Notification, NotificationJob, NotificationChannel, DeliveryStatusType } from '@/types';

export interface CreateNotificationParams {
  recipient_user_id: string;
  notification_type: string;
  title: string;
  message: string;
  related_application_id?: string | null;
  channel?: NotificationChannel;
}

export class NotificationService {
  async getMyNotifications(userId: string): Promise<Notification[]> {
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }

    return mockDb.notifications
      .filter((n) => n.recipient_user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async markAsRead(notificationId: string): Promise<void> {
    if (isLiveSupabaseConfigured && supabase) {
      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);
      return;
    }

    const n = mockDb.notifications.find((notif) => notif.id === notificationId);
    if (n) {
      n.read_at = new Date().toISOString();
      mockDb.persistAll();
    }
  }

  async createNotification(params: CreateNotificationParams): Promise<Notification> {
    const channel = params.channel || 'in_app';
    const isSmsRequested = channel === 'sms' || channel === 'both';

    // Check if SMS provider is configured in environment
    const env = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};
    const isSmsConfigured = Boolean(
      env.SMS_PROVIDER_API_KEY && env.SMS_PROVIDER_BASE_URL
    );

    const deliveryStatus: DeliveryStatusType = isSmsRequested
      ? isSmsConfigured
        ? 'sent'
        : 'provider_unavailable'
      : 'delivered';

    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipient_user_id: params.recipient_user_id,
      notification_type: params.notification_type,
      title: params.title,
      message: params.message,
      related_application_id: params.related_application_id || null,
      channel,
      delivery_status: deliveryStatus,
      read_at: null,
      created_at: new Date().toISOString(),
    };

    mockDb.notifications.unshift(notif);

    // If SMS requested, log the delivery job
    if (isSmsRequested) {
      console.info(
        `[AgriSurvey SMS Dispatch] Recipient: ${params.recipient_user_id} | Status: ${deliveryStatus} | Msg: "${params.message}"`
      );
    }

    mockDb.persistAll();
    return notif;
  }

  async getNotificationJobs(): Promise<NotificationJob[]> {
    // Generate recent jobs from notifications with channel sms or both
    return mockDb.notifications
      .filter((n) => n.channel === 'sms' || n.channel === 'both')
      .map((n) => ({
        id: `job-${n.id}`,
        notification_id: n.id,
        provider: 'National Agro-SMS Gateway (NIC/CDAC Sandbox)',
        delivery_status: n.delivery_status,
        attempt_count: 1,
        last_attempt_at: n.created_at,
        delivered_at: n.delivery_status === 'delivered' ? n.created_at : null,
        provider_message_reference: `SMS-TXN-${n.id.slice(-6).toUpperCase()}`,
        error_code: n.delivery_status === 'provider_unavailable' ? 'SMS_GATEWAY_NOT_CONFIGURED_DEV_MODE' : null,
        created_at: n.created_at,
        updated_at: n.created_at,
      }));
  }
}

export const notificationService = new NotificationService();
