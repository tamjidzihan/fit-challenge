import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateChallenge from './pages/CreateChallenge';
import ChallengeDetails from './pages/ChallengeDetails';
import Profile from './pages/Profile';
import ProtectedRoute from './ProtectedRoute';

export function AppRouter() {
  return <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/create-challenge" element={
        <ProtectedRoute>
          <Layout>
            <CreateChallenge />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/challenges/:id" element={
        <ProtectedRoute>
          <Layout>
            <ChallengeDetails />
          </Layout>
        </ProtectedRoute>}
      />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>}
      />
    </Routes>
  </BrowserRouter>;
}