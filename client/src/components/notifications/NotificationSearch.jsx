import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const NotificationSearch = ({ searchQuery, onSearchChange }) => {
   return (
      <div className="relative w-full sm:w-80">
         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
         <Input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-full"
         />
      </div>
   );
};

export default NotificationSearch;
