import { useQuery, useMutation, gql } from '@apollo/client';

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
  const { data: allData, loading: allLoading, error: allError, refetch: refetchAll } = useQuery(GET_PERSONNEL_NOTIFICATIONS);

  const { data: unreadData, loading: unreadLoading, error: unreadError, refetch: refetchUnread } = useQuery(GET_UNREAD_PERSONNEL_NOTIFICATIONS);

  const [markAsRead] = useMutation(MARK_PERSONNEL_NOTIFICATION_AS_READ);
  const [markAllAsRead] = useMutation(MARK_ALL_PERSONNEL_NOTIFICATIONS_AS_READ);

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
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return {
    notifications: allData?.getPersonnelNotifications || [],
    unreadNotifications: unreadData?.getPersonnelNotifications || [],
    loading: allLoading || unreadLoading,
    error: allError || unreadError,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    refetchAll,
    refetchUnread
  };
};
