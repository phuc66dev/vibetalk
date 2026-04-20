import { Navigate, Route, Routes } from 'react-router-dom';
import ChatPage from '../pages/ChatPage';
import DisconnectedPage from '../pages/DisconnectedPage';
import EditProfilePage from '../pages/EditProfilePage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import ProfilePage from '../pages/ProfilePage';
import RegisterPage from '../pages/RegisterPage';
import SettingsPage from '../pages/SettingsPage';
import type { DemoAppController } from './useDemoApp';

type AppRoutesProps = {
  app: DemoAppController;
};

function AppRoutes({ app }: AppRoutesProps) {
  return (
    <Routes>
      <Route
        path="/login"
        element={app.isAuthenticated ? <Navigate replace to="/" /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={app.isAuthenticated ? <Navigate replace to="/" /> : <RegisterPage onRegister={app.login} />}
      />
      <Route
        path="/"
        element={
          app.isAuthenticated ? (
            <HomePage onOpenReport={app.openReportModal} onStartChat={app.startNewChat} />
          ) : (
            <Navigate replace to="/login" />
          )
        }
      />
      <Route
        path="/chat"
        element={
          app.isAuthenticated ? (
            <ChatPage
              messages={app.messages}
              onOpenReport={app.openReportModal}
              onSend={app.sendMessage}
              onSkip={app.skipChat}
              strangerTyping={app.strangerTyping}
            />
          ) : (
            <Navigate replace to="/login" />
          )
        }
      />
      <Route
        path="/chat/disconnected"
        element={
          app.isAuthenticated ? (
            <DisconnectedPage onFindNewChat={app.startNewChat} onOpenReport={app.openReportModal} />
          ) : (
            <Navigate replace to="/login" />
          )
        }
      />
      <Route
        path="/profile"
        element={
          app.isAuthenticated ? (
            <ProfilePage onOpenReport={app.openReportModal} profile={app.profile} />
          ) : (
            <Navigate replace to="/login" />
          )
        }
      />
      <Route
        path="/profile/edit"
        element={
          app.isAuthenticated ? (
            <EditProfilePage onOpenReport={app.openReportModal} onSave={app.saveProfile} profile={app.profile} />
          ) : (
            <Navigate replace to="/login" />
          )
        }
      />
      <Route
        path="/settings"
        element={
          app.isAuthenticated ? (
            <SettingsPage
              blockedUsers={app.blockedUsers}
              onLogout={app.logout}
              onOpenReport={app.openReportModal}
              onToggle={app.toggleSetting}
              onUnblock={app.unblockUser}
              settings={app.settings}
            />
          ) : (
            <Navigate replace to="/login" />
          )
        }
      />
      <Route path="*" element={<Navigate replace to={app.isAuthenticated ? '/' : '/login'} />} />
    </Routes>
  );
}

export default AppRoutes;
