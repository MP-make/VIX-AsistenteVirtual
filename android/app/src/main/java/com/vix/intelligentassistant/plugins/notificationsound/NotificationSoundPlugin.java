package com.vix.intelligentassistant.plugins.notificationsound;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ContentValues;
import android.content.Context;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Log;
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

    private static final String CHANNEL_ID = "vix-tasks";
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
            Uri sourceUri = Uri.parse(fileUri);
            String mimeType = context.getContentResolver().getType(sourceUri);
            if (mimeType == null) mimeType = "audio/wav";

            String ext = getExtension(mimeType);
            String fileName = "vix_notification_" + System.currentTimeMillis() + ext;

            Uri soundUri;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentValues values = new ContentValues();
                values.put(MediaStore.Audio.Media.DISPLAY_NAME, fileName);
                values.put(MediaStore.Audio.Media.MIME_TYPE, mimeType);
                values.put(MediaStore.Audio.Media.IS_NOTIFICATION, true);
                values.put(MediaStore.Audio.Media.RELATIVE_PATH, Environment.DIRECTORY_NOTIFICATIONS);

                Uri collection = MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
                Uri itemUri = context.getContentResolver().insert(collection, values);
                if (itemUri == null) {
                    call.reject("No se pudo crear el archivo de sonido");
                    return;
                }

                InputStream is = context.getContentResolver().openInputStream(sourceUri);
                if (is == null) {
                    context.getContentResolver().delete(itemUri, null, null);
                    call.reject("No se pudo leer el archivo de audio");
                    return;
                }

                FileOutputStream fos = (FileOutputStream) context.getContentResolver().openOutputStream(itemUri);
                if (fos == null) {
                    is.close();
                    context.getContentResolver().delete(itemUri, null, null);
                    call.reject("No se pudo escribir el archivo de audio");
                    return;
                }

                byte[] buffer = new byte[8192];
                int read;
                while ((read = is.read(buffer)) != -1) {
                    fos.write(buffer, 0, read);
                }
                fos.close();
                is.close();

                soundUri = itemUri;
            } else {
                File destDir = new File(context.getExternalFilesDir(Environment.DIRECTORY_NOTIFICATIONS), "vix");
                destDir.mkdirs();
                File destFile = new File(destDir, fileName);

                InputStream is = context.getContentResolver().openInputStream(sourceUri);
                if (is == null) {
                    call.reject("No se pudo leer el archivo de audio");
                    return;
                }

                FileOutputStream fos = new FileOutputStream(destFile);
                byte[] buffer = new byte[8192];
                int read;
                while ((read = is.read(buffer)) != -1) {
                    fos.write(buffer, 0, read);
                }
                fos.close();
                is.close();

                soundUri = Uri.fromFile(destFile);
            }

            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                nm.deleteNotificationChannel(CHANNEL_ID);
                NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Recordatorios de tareas",
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
                    "Recordatorios de tareas",
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

    private String getExtension(String mimeType) {
        if (mimeType == null) return ".wav";
        switch (mimeType) {
            case "audio/mpeg":
            case "audio/mp3":
                return ".mp3";
            case "audio/ogg":
            case "application/ogg":
                return ".ogg";
            case "audio/wav":
            case "audio/wave":
            case "audio/x-wav":
                return ".wav";
            case "audio/flac":
                return ".flac";
            case "audio/aac":
            case "audio/aacp":
                return ".aac";
            case "audio/mp4":
            case "audio/x-m4a":
                return ".m4a";
            case "audio/amr":
                return ".amr";
            default:
                return ".wav";
        }
    }
}
