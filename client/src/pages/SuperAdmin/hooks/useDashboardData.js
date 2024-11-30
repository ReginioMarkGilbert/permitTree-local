import { useQuery, gql } from '@apollo/client';

const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    dashboardStats {
      totalUsers
      activeUsers
      totalApplications
      pendingApplications
      usersTrend
      activeUsersTrend
      applicationsTrend
      pendingApplicationsTrend
      userActivity {
        date
        users
      }
      recentActivities {
        id
        type
        username
        timestamp
        description
      }
    }
  }
`;

const useDashboardData = () => {
   const { data, loading, error } = useQuery(GET_DASHBOARD_DATA, {
      fetchPolicy: 'network-only',
      pollInterval: 30000, // Poll every 30 seconds for updates
   });

   return {
      data: data?.dashboardStats,
      loading,
      error,
   };
};

export default useDashboardData;
