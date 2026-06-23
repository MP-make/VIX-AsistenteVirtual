import { Sidebar } from '@/layouts/parts/sidebar';
import { ChatViewport } from '@/features/chat/components/chat-viewport';
import { ChatInput } from '@/features/chat/components/chat-input';

export function AppLayout() {
  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <Sidebar />
      <main className="flex flex-1 flex-col">
        <ChatViewport />
        <ChatInput />
      </main>
    </div>
  );
}
