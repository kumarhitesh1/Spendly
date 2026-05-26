import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-midnight">
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 p-4 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
