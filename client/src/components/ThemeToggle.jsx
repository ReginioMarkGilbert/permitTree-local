import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/ThemeProvider"
import { useMemo, useEffect } from "react"
import { useQuery, useMutation } from "@apollo/client"
import { gql } from "@apollo/client"

// Add these GraphQL operations
const UPDATE_USER_THEME = gql`
  mutation UpdateUserTheme($theme: String!) {
    updateThemePreference(theme: $theme) {
      id
      themePreference
    }
  }
`;

const UPDATE_ADMIN_THEME = gql`
  mutation UpdateAdminThemePreference($theme: String!) {
    updateAdminThemePreference(theme: $theme) {
      id
      adminId
      username
      firstName
      lastName
      roles
      themePreference
    }
  }
`;

const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    getCurrentUser {
      id
      themePreference
    }
  }
`;

const GET_CURRENT_ADMIN = gql`
  query GetCurrentAdmin {
    getCurrentAdmin {
      id
      adminId
      username
      firstName
      lastName
      roles
      themePreference
    }
  }
`;

export function ThemeToggle() {
   const { theme, setTheme } = useTheme()

   // Add loading and error states to the queries
   const {
      data: userData,
      loading: userLoading,
      error: userError,
      refetch: refetchUser
   } = useQuery(GET_CURRENT_USER, {
      fetchPolicy: 'network-only', // Force network request
      onCompleted: (data) => console.log('User query completed:', data),
      onError: (error) => console.error('User query error:', error)
   });

   const {
      data: adminData,
      loading: adminLoading,
      error: adminError,
      refetch: refetchAdmin
   } = useQuery(GET_CURRENT_ADMIN, {
      fetchPolicy: 'network-only', // Force network request
      onCompleted: (data) => console.log('Admin query completed:', data),
      onError: (error) => console.error('Admin query error:', error)
   });

   const [updateUserTheme] = useMutation(UPDATE_USER_THEME, {
      onCompleted: (data) => console.log('User theme updated:', data),
      onError: (error) => console.error('User theme update error:', error)
   });

   const [updateAdminTheme] = useMutation(UPDATE_ADMIN_THEME, {
      onCompleted: (data) => console.log('Admin theme updated:', data),
      onError: (error) => console.error('Admin theme update error:', error)
   });

   // Debug authentication state
   useEffect(() => {
      const token = localStorage.getItem('token');
      console.log('Auth State:', {
         hasToken: !!token,
         adminData: adminData?.getCurrentAdmin,
         userData: userData?.getCurrentUser,
         adminLoading,
         userLoading,
         adminError: adminError?.message,
         userError: userError?.message
      });
   }, [adminData, userData, adminLoading, userLoading, adminError, userError]);

   // Add this new effect to initialize theme on login
   useEffect(() => {
      if (adminData?.getCurrentAdmin) {
         console.log('Initializing admin theme:', adminData.getCurrentAdmin.themePreference);
         setTheme(adminData.getCurrentAdmin.themePreference);
      } else if (userData?.getCurrentUser) {
         console.log('Initializing user theme:', userData.getCurrentUser.themePreference);
         setTheme(userData.getCurrentUser.themePreference);
      }
   }, [adminData?.getCurrentAdmin, userData?.getCurrentUser]);

   const handleThemeChange = async (newTheme) => {
      console.log('Starting theme change:', {
         newTheme,
         currentTheme: theme,
         adminData,
         userData,
         adminLoading,
         userLoading
      });

      try {
         if (adminLoading || userLoading) {
            console.log('Still loading auth state...');
            return;
         }

         if (adminData?.getCurrentAdmin) {
            console.log('Updating as admin:', adminData.getCurrentAdmin);
            const result = await updateAdminTheme({
               variables: { theme: newTheme },
               refetchQueries: [{ query: GET_CURRENT_ADMIN }],
               awaitRefetchQueries: true
            });
            console.log('Admin theme update result:', result);
            setTheme(newTheme);
         } else if (userData?.getCurrentUser) {
            console.log('Updating as user:', userData.getCurrentUser);
            const result = await updateUserTheme({
               variables: { theme: newTheme },
               refetchQueries: [{ query: GET_CURRENT_USER }],
               awaitRefetchQueries: true
            });
            console.log('User theme update result:', result);
            setTheme(newTheme);
         } else {
            console.log('No authenticated user/admin found');
            if (adminError) console.error('Admin Error:', adminError);
            if (userError) console.error('User Error:', userError);
            setTheme(newTheme);
         }
      } catch (error) {
         console.error('Theme update failed:', {
            error,
            message: error.message,
            graphQLErrors: error.graphQLErrors,
            networkError: error.networkError
         });
      }
   };

   // Browser detection
   const isChrome = useMemo(() => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isBrave = navigator.brave !== undefined;
      return userAgent.includes('chrome') && !userAgent.includes('edg') && !isBrave;
   }, []);

   if (isChrome) {
      return (
         <div className="relative inline-flex items-center">
            <button
               type="button"
               onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
               className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                  transition-colors duration-200 ease-in-out focus:outline-none
                  ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}
               `}
               role="switch"
               aria-checked={theme === 'dark'}
            >
               <span className="sr-only">Toggle theme</span>
               <span
                  className={`
                     pointer-events-none relative inline-block h-5 w-5 transform rounded-full
                     shadow ring-0 transition duration-200 ease-in-out
                     ${theme === 'dark' ? 'translate-x-5 bg-slate-950' : 'translate-x-0 bg-white'}
                  `}
               >
                  {/* Icons inside the switch */}
                  <span
                     className={`
                        absolute inset-0 flex h-full w-full items-center justify-center
                        transition-opacity
                        ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}
                     `}
                  >
                     <Sun className="h-3 w-3 text-gray-600" />
                  </span>
                  <span
                     className={`
                        absolute inset-0 flex h-full w-full items-center justify-center
                        transition-opacity
                        ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}
                     `}
                  >
                     <Moon className="h-3 w-3 text-gray-300" />
                  </span>
               </span>
            </button>
         </div>
      );
   }

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
               <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
               <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
               <span className="sr-only">Toggle theme</span>
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleThemeChange("light")}>
               Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
               Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleThemeChange("system")}>
               System
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   )
}
