import { registerPlugin } from '@capacitor/core';

export interface NotificationSoundPlugin {
  setCustomSound(options: { fileUri: string }): Promise<{ channelId: string }>;
  resetToDefault(): Promise<void>;
  getCurrentSound(): Promise<{ fileUri: string | null }>;
}

const NotificationSound = registerPlugin<NotificationSoundPlugin>('NotificationSound');

export { NotificationSound };
