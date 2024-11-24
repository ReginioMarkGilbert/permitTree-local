import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_DASHBOARD_STATS = gql`
    query GetDashboardStats {
        getDashboardStats {
            totalUsers
            applicationsForReview
            approvedToday
            applicationsReturned
            applicationIncrease
        }
    }
`;

export const useDashboardStats = () => {
    const { data, loading, error, refetch } = useQuery(GET_DASHBOARD_STATS, {
        fetchPolicy: 'network-only'
    });

    return {
        dashboardStats: data?.getDashboardStats || {
            totalUsers: 0,
            applicationsForReview: 0,
            approvedToday: 0,
            applicationsReturned: 0,
            applicationIncrease: 0
        },
        loading,
        error,
        refetch
    };
};
