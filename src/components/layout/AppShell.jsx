export default function AppShell({ children, className = '' }) {
  return (
    <main className={`min-h-screen bg-ivory px-5 pb-10 pt-6 ${className}`}>
      {children}
    </main>
  )
}
