import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/ThemeProvider"
import { useMemo } from "react"

export function ThemeToggle() {
   const { theme, setTheme } = useTheme()

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
               onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
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
            <DropdownMenuItem onClick={() => setTheme("light")}>
               Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
               Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
               System
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   )
}
