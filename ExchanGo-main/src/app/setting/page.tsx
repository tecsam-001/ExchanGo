'use client'
import DashboardLayout from '@/components/DashboardLayout'
import AccessSecurity from '@/components/Setting/AccessSecurity';
import ImageLogo from '@/components/Setting/ImageLogo';
import NotificationsReminders from '@/components/Setting/NotificationsReminders';
import OfficeInformation from '@/components/Setting/OfficeInformation';
import SupportDocumentation from '@/components/Setting/SupportDocumentation';
import React, { JSX, useState } from 'react'

interface TabType {
     id: string;
     label: string;
}

const Setting: React.FC = () => {
     const [activeTab, setActiveTab] = useState<string>('Office Information')

     const tabs: TabType[] = [
          { id: 'Office Information', label: 'Office Information' },
          { id: 'Image & Logo', label: 'Image & Logo' },
          { id: 'Access & Security', label: 'Access & Security' },
          { id: 'Notifications & Reminders', label: 'Notifications & Reminders' },
          { id: 'Support & Documentation', label: 'Support & Documentation' }
     ]

     const handleTabClick = (tabId: string): void => {
          setActiveTab(tabId)
     }

     const renderTabContent = (): JSX.Element => {
          switch (activeTab) {
               case 'Office Information':
                    return (
                         <OfficeInformation/>
                    )
               case 'Image & Logo':
                    return (
                         <ImageLogo/>
                    )
               case 'Access & Security':
                    return (
                         <AccessSecurity/>
                    )
               case 'Notifications & Reminders':
                    return (
                         <NotificationsReminders/>
                    )
               case 'Support & Documentation':
                    return (
                         <SupportDocumentation/>
                    )
               default:
                    return (
                         <div className=''>
                              <h1>Select a tab</h1>
                         </div>
                    )
          }
     }

     return (
          <DashboardLayout>
               <div>
                    <h3 className='text-[#111111] font-bold text-[32px] leading-[38px] mb-2'>Setting</h3>
                    <p className='text-[#585858] text-[14px] font-normal leading-[20px]'>Update setting for better features performance</p>

                    <div className='mt-4 sm:mt-6'>
                         <div className='border-b border-[#DEDEDE] mb-6 sm:mb-8 overflow-hidden relative'>
                              <div className='flex overflow-x-auto hide-scrollbar' style={{ background: "linear-gradient(270deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)" }}>
                                   {tabs.map((tab: TabType) => (
                                        <button
                                             key={tab.id}
                                             onClick={() => handleTabClick(tab.id)}
                                             className={`flex-shrink-0 px-0 pb-[9.12px] cursor-pointer pt-[8.11px] mr-6 last:mr-0 text-[14px] font-medium leading-[18px] transition-colors whitespace-nowrap ${activeTab === tab.id
                                                       ? 'text-[#111111] border-b-2 border-[#20523C]'
                                                       : 'text-[#585858] border-transparent hover:text-[#585858]'
                                                  }`}
                                             type="button"
                                             aria-selected={activeTab === tab.id}
                                             role="tab"
                                        >
                                             {tab.label}
                                        </button>
                                   ))}
                              </div>
                         </div>

                         <div role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
                              {renderTabContent()}
                         </div>
                    </div>
               </div>
          </DashboardLayout>
     )
}

export default Setting