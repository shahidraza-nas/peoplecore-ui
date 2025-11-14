// This layout is no longer needed - using parent (dashboard) layout instead
// The layout at app/(dashboard)/layout.tsx handles the header and structure

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
