import { useQuery, useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';

// Queries
export const GET_PERSONNEL_NOTIFICATIONS = gql`
  query GetPersonnelNotifications {
    getPersonnelNotifications {
      id
      type
      title
      message
      metadata {
        applicationId
        oopId
        stage
        status
        remarks
        actionRequired
      }
      priority
      read
      createdAt
    }
  }
`;

export const GET_UNREAD_PERSONNEL_NOTIFICATIONS = gql`
  query GetUnreadPersonnelNotifications {
    getPersonnelNotifications(unreadOnly: true) {
      id
      type
      title
      message
      metadata {
        applicationId
        oopId
        stage
        status
        remarks
        actionRequired
      }
      priority
      read
      createdAt
    }
  }
`;

// Subscription
export const PERSONNEL_NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnPersonnelNotificationCreated($recipientId: ID!) {
    personnelNotificationCreated(recipientId: $recipientId) {
      id
      type
      title
      message
      metadata {
        applicationId
        oopId
        stage
        status
        remarks
        actionRequired
      }
      priority
      read
      createdAt
    }
  }
`;

// Mutations
export const MARK_PERSONNEL_NOTIFICATION_AS_READ = gql`
  mutation MarkPersonnelNotificationAsRead($id: ID!) {
    markPersonnelNotificationAsRead(id: $id) {
      id
      read
    }
  }
`;

export const MARK_ALL_PERSONNEL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllPersonnelNotificationsAsRead {
    markAllPersonnelNotificationsAsRead
  }
`;

export const usePersonnelNotifications = () => {
  const {
    data: allData,
    loading: allLoading,
    error: allError,
    refetch: refetchAll,
    networkStatus
  } = useQuery(GET_PERSONNEL_NOTIFICATIONS, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only', // Don't use cache
    onError: (error) => {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    }
  });

  const {
    data: unreadData,
    loading: unreadLoading,
    error: unreadError,
    refetch: refetchUnread
  } = useQuery(GET_UNREAD_PERSONNEL_NOTIFICATIONS, {
    fetchPolicy: 'network-only', // Don't use cache
    onError: (error) => {
      console.error('Error fetching unread notifications:', error);
    }
  });

  const [markAsRead] = useMutation(MARK_PERSONNEL_NOTIFICATION_AS_READ, {
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  });

  const [markAllAsRead] = useMutation(MARK_ALL_PERSONNEL_NOTIFICATIONS_AS_READ, {
    onError: (error) => {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  });

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead({
        variables: { id: notificationId },
        refetchQueries: [
          { query: GET_PERSONNEL_NOTIFICATIONS },
          { query: GET_UNREAD_PERSONNEL_NOTIFICATIONS }
        ]
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({
        refetchQueries: [
          { query: GET_PERSONNEL_NOTIFICATIONS },
          { query: GET_UNREAD_PERSONNEL_NOTIFICATIONS }
        ]
      });
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const isLoading = allLoading || unreadLoading || networkStatus === 4;
  const error = allError || unreadError;

  if (error) {
    console.error('Notifications error:', error);
  }

  return {
    notifications: allData?.getPersonnelNotifications || [],
    unreadNotifications: unreadData?.getPersonnelNotifications || [],
    loading: isLoading,
    error,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    refetchAll,
    refetchUnread
  };
};
