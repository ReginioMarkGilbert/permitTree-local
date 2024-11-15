import { useQuery, useMutation, gql } from '@apollo/client';

// Queries
export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    getNotifications {
      id
      type
      title
      message
      metadata {
        applicationId
        stage
        status
        remarks
      }
      read
      createdAt
    }
  }
`;

export const GET_UNREAD_NOTIFICATIONS = gql`
  query GetUnreadNotifications {
    getUnreadNotifications {
      id
      type
      title
      message
      read
      createdAt
      metadata {
        applicationId
        oopId
        stage
        status
        remarks
      }
    }
  }
`;

// Subscription
export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnNotificationCreated($recipientId: ID!) {
    notificationCreated(recipientId: $recipientId) {
      id
      type
      title
      message
      read
      createdAt
      metadata {
        applicationId
        oopId
        stage
        status
        remarks
      }
    }
  }
`;

// Mutations
export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      id
      read
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

export const useUserNotifications = () => {
   const { data: allData, loading: allLoading, error: allError, refetch: refetchAll } = useQuery(GET_NOTIFICATIONS, {
      onError: (error) => {
         console.error('Error fetching notifications:', error);
      }
   });

   const { data: unreadData, loading: unreadLoading, error: unreadError, refetch: refetchUnread } = useQuery(GET_UNREAD_NOTIFICATIONS, {
      onError: (error) => {
         console.error('Error fetching unread notifications:', error);
      }
   });

   const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ, {
      onError: (error) => {
         console.error('Error marking notification as read:', error);
      }
   });

   const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ, {
      onError: (error) => {
         console.error('Error marking all notifications as read:', error);
      }
   });

   const handleMarkAsRead = async (notificationId) => {
      try {
         await markAsRead({
            variables: { id: notificationId },
            refetchQueries: [
               { query: GET_NOTIFICATIONS },
               { query: GET_UNREAD_NOTIFICATIONS }
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
               { query: GET_NOTIFICATIONS },
               { query: GET_UNREAD_NOTIFICATIONS }
            ]
         });
      } catch (error) {
         console.error('Error marking all notifications as read:', error);
      }
   };

   return {
      notifications: allData?.getNotifications || [],
      unreadNotifications: unreadData?.getUnreadNotifications || [],
      loading: allLoading || unreadLoading,
      error: allError || unreadError,
      markAsRead: handleMarkAsRead,
      markAllAsRead: handleMarkAllAsRead,
      refetchAll,
      refetchUnread
   };
};
