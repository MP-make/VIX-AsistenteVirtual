package com.vix.intelligentassistant;

import com.getcapacitor.BridgeActivity;
import com.vix.intelligentassistant.plugins.notificationsound.NotificationSoundPlugin;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(NotificationSoundPlugin.class);
    }
}
