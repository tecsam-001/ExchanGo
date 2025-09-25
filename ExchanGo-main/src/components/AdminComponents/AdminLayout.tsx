import { ReactNode } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AdminBottomBar from './AdminBottomBar';

type LayoutProps = {
     children: ReactNode;
};

export default function AdminLayout({ children }: LayoutProps) {
     return (
          <div className="min-h-screen flex flex-col relative overflow-x-hidden">
               <AdminHeader />
               <div className="flex max-w-[1140px] mx-auto w-full justify-between items-start gap-8 lg:gap-[50px]">
                    <AdminSidebar />
                    <main className="max-w-[808px] mx-auto w-full px-5 md:pl-3 pb-[120px] overflow-x-auto hide-scrollbar min-h-screen">{children}</main>
                    <AdminBottomBar />
               </div>
          </div>
     );
}
