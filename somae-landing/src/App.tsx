import { usePath } from '@/lib/router';
import { Home } from '@/pages/Home';
import { Privacy } from '@/pages/Privacy';

export default function App() {
  const path = usePath();
  return path.startsWith('/privacy') ? <Privacy /> : <Home />;
}
