import { EmptyState } from "@/components/ui";

export default function SettingsPage() {
    return (
        <div className="mx-auto max-w-4xl h-[80vh] flex items-center justify-center">
            <EmptyState
                icon="⚙️"
                title="Settings"
                description="This page is under construction. Future application settings will appear here."
            />
        </div>
    );
}
