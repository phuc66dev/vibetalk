import { Outlet, useLocation, useOutletContext } from 'react-router-dom';
import AuraBackdrop from '../ui/AuraBackdrop';
import TopBar from '../layout/TopBar';
import ReportModal from '../../features/report/ReportModal';
import useDemoApp, { type DemoAppController } from '../../app/useDemoApp';

/**
 * AppLayout – layout chính cho các trang authenticated.
 * Cung cấp: AuraBackdrop + TopBar + ReportModal.
 * Truyền toàn bộ app state xuống children qua Outlet context.
 */
function AppLayout() {
  const app = useDemoApp();
  const location = useLocation();
  const showDefaultTopBar = location.pathname !== '/chat';

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuraBackdrop />

      {showDefaultTopBar ? <TopBar onOpenReport={app.openReportModal} /> : null}

      {/* Outlet nhận context để các page con dùng useAppContext() */}
      <Outlet context={app} />

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
