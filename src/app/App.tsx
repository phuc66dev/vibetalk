import { BrowserRouter } from 'react-router-dom';
import AuraBackdrop from '../components/ui/AuraBackdrop';
import ReportModal from '../features/report/ReportModal';
import AppRoutes from './AppRoutes';
import useDemoApp from './useDemoApp';

function AppShell() {
  const app = useDemoApp();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuraBackdrop />
      <AppRoutes app={app} />

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

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
