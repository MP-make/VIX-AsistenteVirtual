# Lógica del Sistema VIX

## Audio

### Web (webkitSpeechRecognition)
- `continuous: true` para no cerrarse tras 1s de silencio
- `onerror` network: log warning (Google servers inaccesibles en ciertas redes)
- No fallback a edge function (no se configuró GEMINI_API_KEY)

### APK Nativo (Capacitor Speech Recognition)
- `popup: true` → usa el diálogo nativo de Android
- `endedRef` flag para evitar que `stop()` cuelgue tras cerrar el popup
- No requiere API key externa

### Flujo general
1. Usuario toca micrófono → `startRecording()`
2. Grabación → `stopRecording()` devuelve transcript
3. Transcript se envía directo a `onSend()` (sin modal de confirmación)
4. Aparece como mensaje de usuario en el chat

---

## Parseo de Tareas Local (`local-task-parser.ts`)

### Extraer Título
- Quita prefijos: `tengo que`, `necesito`, `debo`, `hay que`, `quiero`, `voy a`, `tengo pendiente`
- Quita verbos crear/agregar/añadir/registrar/programar + tarea/recordatorio/alarma
- Quita cláusulas `para ...`, `antes de ...`, `después de ...`
- Quita keywords de urgencia
- Quita referencias de fecha/hora

### Extraer Fecha
| Patrón | Ejemplo | Resultado |
|--------|---------|-----------|
| `hoy` | "hoy" | Hoy 23:59 |
| `mañana` | "mañana" | Hoy+1 23:59 |
| `pasado mañana` | "pasado mañana" | Hoy+2 23:59 |
| `esta semana` | "esta semana" | Domingo 23:59 |
| `este mes` | "este mes" | Fin de mes 23:59 |
| `este año` | "este año" | 31 Dic 23:59 |
| `en N [dias/semanas/mes]` | "en 3 dias" | Hoy+N |
| `el/este/próximo [día]` | "el lunes" | Próximo lunes |
| `dd/mm` o `dd-mm` | "15/07" | 15 de julio |

### Extraer Hora
- Keywords: `medianoche` → 00:00, `mediodía`/`medio día` → 12:00
- Regex: `(\d{1,2})(?::(\d{2}))?\s*(am|pm|a.m.|p.m.)?`
- **Smart AM/PM** (sin sufijo):
  - Si la hora en AM ya pasó y la PM no → usa PM
  - Si `hora=12` y ya pasó el mediodía → interpreta como medianoche (00:00)
  - Si `hora=12` y es antes del mediodía → interpreta como mediodía (12:00)

### Combinación Fecha+Hora
- Si hay fecha y hora: `fecha.setHours(hora, minuto)`
- Si hay fecha sin hora: `fecha.setHours(23, 59)`
- Si hay hora sin fecha: hora aplicada a hoy; si ya pasó → día siguiente (solo si es medianoche 00:00)
- Si no hay nada: fin de semana actual (domingo 23:59)

### Urgencia (`nivel_urgencia`)
| Prioridad | Keywords |
|-----------|----------|
| `Crítico` | urgente, critico, crítica, crítico, importante, superurgente, alta |
| `Medio` | media, normal |
| `Baja` | baja |
| `Idea` | opcional, idea |

Además de keywords, se considera el **tiempo restante**:
- ≤4h para vencer → `Crítico`
- ≤24h para vencer → `Medio`
- Ya vencido → `Crítico`
- Por defecto: `Medio`

---

## Notificaciones (`notification-service.ts`)

### Intervalos dinámicos según tiempo restante
| Horas restantes | Intervalo |
|----------------|-----------|
| > 168 (7 días) | Cada 24h |
| > 48 (2 días) | Cada 12h |
| > 24 (1 día) | Cada 6h |
| > 4h | Cada 60min |
| > 1h | Cada 30min |
| > 30min | Cada 15min |
| < 30min | Cada 5min |

- Máximo 30 notificaciones por tarea
- Primera notificación: 1 minuto después de programar
- Se cancelan todas las previas al reprogramar

---

## Estados de Tarea

- `completada = false` + `fecha_vencimiento` futuro → **Pendiente**
- `completada = false` + `fecha_vencimiento` pasado → **Vencida**
- `completada = true` → **Completada**

### Reglas
- Una tarea **Vencida** NO se puede desmarcar (checkbox deshabilitado)
- Se puede marcar como completada (incluso si está vencida), pero no desmarcar después
- La protección es tanto en UI (`task-card.tsx`) como en backend (`tasks-repository.ts`)

---

## Puntos por Urgencia
| Urgencia | Puntos al completar |
|----------|-------------------|
| Crítico | 30 |
| Medio | 20 |
| Baja | 10 |
| Idea | 5 |

- No completar: -puntos al desmarcar
