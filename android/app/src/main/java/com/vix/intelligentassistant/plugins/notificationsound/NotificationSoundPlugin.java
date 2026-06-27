package com.vix.intelligentassistant.plugins.notificationsound;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;

@CapacitorPlugin(name = "NotificationSound")
public class NotificationSoundPlugin extends Plugin {

    private static final String CHANNEL_ID = "default";
    private static final String TAG = "NotificationSound";

    @PluginMethod
    public void setCustomSound(PluginCall call) {
        String fileUri = call.getString("fileUri");
        if (fileUri == null) {
            call.reject("fileUri is required");
            return;
        }

        try {
            Context context = getContext();
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

            String fileName = "vix_custom_sound_" + System.currentTimeMillis() + ".wav";
            File destDir = new File(context.getFilesDir(), "notifications");
            destDir.mkdirs();
            File destFile = new File(destDir, fileName);

            Uri sourceUri = Uri.parse(fileUri);
            InputStream is = context.getContentResolver().openInputStream(sourceUri);
            if (is == null) {
                call.reject("No se pudo leer el archivo de audio");
                return;
            }

            FileOutputStream fos = new FileOutputStream(destFile);
            byte[] buffer = new byte[4096];
            int read;
            while ((read = is.read(buffer)) != -1) {
                fos.write(buffer, 0, read);
            }
            fos.close();
            is.close();

            Uri soundUri = FileProvider.getUriForFile(context, context.getPackageName() + ".fileprovider", destFile);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                nm.deleteNotificationChannel(CHANNEL_ID);
                NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "VIX Notifications",
                    NotificationManager.IMPORTANCE_HIGH
                );
                AudioAttributes attrs = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .build();
                channel.setSound(soundUri, attrs);
                channel.enableVibration(true);
                nm.createNotificationChannel(channel);
            }

            JSObject result = new JSObject();
            result.put("channelId", CHANNEL_ID);
            result.put("soundUri", soundUri.toString());
            call.resolve(result);

            Log.d(TAG, "Custom notification sound set: " + soundUri);
        } catch (Exception e) {
            Log.e(TAG, "Error setting custom sound", e);
            call.reject("Error al configurar el sonido: " + e.getMessage());
        }
    }

    @PluginMethod
    public void resetToDefault(PluginCall call) {
        try {
            Context context = getContext();
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                nm.deleteNotificationChannel(CHANNEL_ID);
                NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "VIX Notifications",
                    NotificationManager.IMPORTANCE_HIGH
                );
                AudioAttributes attrs = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .build();
                channel.setSound(
                    RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION),
                    attrs
                );
                channel.enableVibration(true);
                nm.createNotificationChannel(channel);
            }

            call.resolve();
            Log.d(TAG, "Reset to default notification sound");
        } catch (Exception e) {
            call.reject("Error al restablecer: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getCurrentSound(PluginCall call) {
        JSObject result = new JSObject();
        result.put("channelId", CHANNEL_ID);
        call.resolve(result);
    }
}
