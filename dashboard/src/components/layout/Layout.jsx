import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ title, children }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-60">
        <Header title={title} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
