import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ title, children, fullBleed = false }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-64 flex flex-col h-screen">
        <Header title={title} />
        <main className={`flex-1 overflow-y-auto ${fullBleed ? '' : 'p-8 lg:p-12 max-w-[1600px]'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
