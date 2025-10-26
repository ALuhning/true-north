import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Play } from './pages/Play';
import { Results } from './pages/Results';
import { LeaderboardScreen } from './pages/LeaderboardScreen';
import { AdminPad } from './components/AdminPad';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/play" element={<Play />} />
        <Route path="/results" element={<Results />} />
        <Route path="/leaderboard" element={<LeaderboardScreen />} />
        <Route path="/admin" element={<AdminPad />} />
      </Routes>
    </BrowserRouter>
  );
}
