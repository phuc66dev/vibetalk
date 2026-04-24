import { Outlet, useOutletContext } from 'react-router-dom';
import AuraBackdrop from '../ui/AuraBackdrop';
import BottomNav from '../layout/BottomNav';
import TopBar from '../layout/TopBar';
import ReportModal from '../../features/report/ReportModal';
import useDemoApp, { type DemoAppController } from '../../app/useDemoApp';

/**
 * AppLayout – layout chính cho các trang authenticated.
 * Cung cấp: AuraBackdrop + TopBar + BottomNav + ReportModal.
 * Truyền toàn bộ app state xuống children qua Outlet context.
 */
function AppLayout() {
  const app = useDemoApp();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuraBackdrop />

      <TopBar onOpenReport={app.openReportModal} />

      {/* Outlet nhận context để các page con dùng useAppContext() */}
      <Outlet context={app} />

      <BottomNav active="home" />

      {app.report.open ? (
        <ReportModal
          details={app.report.details}
          onClose={app.closeReportModal}
          onDetailsChange={app.setReportDetails}
          onReasonChange={app.setReportReason}
          onSubmit={app.submitReport}
          reason={app.report.reason}
        />
      ) : null}
    </div>
  );
}

/** Hook tiện ích — dùng trong bất kỳ page nào bên trong AppLayout */
export function useAppContext() {
  return useOutletContext<DemoAppController>();
}

export default AppLayout;
