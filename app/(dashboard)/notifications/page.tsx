import { EmptyState } from "@/components/ui";

export default function NotificationsPage() {
    return (
        <div className="mx-auto max-w-4xl h-[80vh] flex items-center justify-center">
            <EmptyState
                icon="🔔"
                title="Notifications"
                description="This page is under construction. Future notifications will appear here."
            />
        </div>
    );
}
