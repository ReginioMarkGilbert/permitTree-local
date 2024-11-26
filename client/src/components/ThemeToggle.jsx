import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/ThemeProvider"
import { useMemo, useEffect, useState } from "react"
import { useQuery, useMutation } from "@apollo/client"
import { gql } from "@apollo/client"

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
   const [isPersonnel, setIsPersonnel] = useState(false)

   // Determine user type on component mount
   useEffect(() => {
      const user = JSON.parse(localStorage.getItem('user'));
      const personnelRoles = [
         'Chief_RPS', 'Chief_TSD', 'Technical_Staff',
         'Receiving_Clerk', 'Releasing_Clerk', 'Accountant',
         'OOP_Staff_Incharge', 'Bill_Collector', 'Credit_Officer',
         'PENR_CENR_Officer', 'Deputy_CENR_Officer', 'Inspection_Team',
         'superadmin'
      ];
      setIsPersonnel(user?.roles.some(role => personnelRoles.includes(role)));
   }, []);

   // Only query admin data if user is personnel
   const {
      data: adminData,
      loading: adminLoading,
      error: adminError
   } = useQuery(GET_CURRENT_ADMIN, {
      skip: !isPersonnel,
      fetchPolicy: 'network-only',
      onError: (error) => {
         if (!error.message.includes('Store reset while query was in flight')) {
            console.error('Admin query error:', error);
         }
      }
   });

   // Only query user data if user is not personnel
   const {
      data: userData,
      loading: userLoading,
      error: userError
   } = useQuery(GET_CURRENT_USER, {
      skip: isPersonnel,
      fetchPolicy: 'network-only',
      onError: (error) => {
         if (!error.message.includes('Store reset while query was in flight')) {
            console.error('User query error:', error);
         }
      }
   });

   const [updateUserTheme] = useMutation(UPDATE_USER_THEME);
   const [updateAdminTheme] = useMutation(UPDATE_ADMIN_THEME);

   // Initialize theme based on user type
   useEffect(() => {
      if (isPersonnel && adminData?.getCurrentAdmin?.themePreference) {
         setTheme(adminData.getCurrentAdmin.themePreference);
      } else if (!isPersonnel && userData?.getCurrentUser?.themePreference) {
         setTheme(userData.getCurrentUser.themePreference);
      }
   }, [adminData?.getCurrentAdmin, userData?.getCurrentUser, isPersonnel]);

   const handleThemeChange = async (newTheme) => {
      try {
         if (isPersonnel) {
            await updateAdminTheme({
               variables: { theme: newTheme },
               refetchQueries: [{ query: GET_CURRENT_ADMIN }]
            });
         } else {
            await updateUserTheme({
               variables: { theme: newTheme },
               refetchQueries: [{ query: GET_CURRENT_USER }]
            });
         }
         setTheme(newTheme);
      } catch (error) {
         console.error('Theme update failed:', error);
         // Update theme locally even if server update fails
         setTheme(newTheme);
      }
   };

   // Browser detection
   const isChrome = useMemo(() => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isBrave = navigator.brave !== undefined;
      return userAgent.includes('chrome') && !userAgent.includes('edg') && !isBrave;
   }, []);

   // Show loading state or fallback
   if ((isPersonnel && adminLoading) || (!isPersonnel && userLoading)) {
      return null; // Or a loading spinner if preferred
   }

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
