import React, { useState } from 'react';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { AdminHeader } from './components/layout/AdminHeader';
import { DashboardPage } from './pages/DashboardPage';
import { FlightsPage } from './pages/FlightsPage';
import { BookingsPage } from './pages/BookingsPage';
import { PricingPage } from './pages/PricingPage';
import { CustomersPage } from './pages/CustomersPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { StaffPage } from './pages/StaffPage';
import { CMSPage } from './pages/CMSPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('SUPER_ADMIN');

  return (
    <div className="flex min-h-screen bg-[#0b111e] text-slate-100 selection:bg-orange-500 selection:text-white">
      {/* Fixed Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
        />

        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardPage onNavigate={setActiveTab} />}
          {activeTab === 'flights' && <FlightsPage currentRole={currentRole} />}
          {activeTab === 'bookings' && <BookingsPage />}
          {activeTab === 'pricing' && <PricingPage />}
          {activeTab === 'customers' && <CustomersPage />}
          {activeTab === 'payments' && <PaymentsPage />}
          {activeTab === 'staff' && <StaffPage />}
          {activeTab === 'cms' && <CMSPage />}
        </main>
      </div>
    </div>
  );
};

export default App;
