# Storage Strategy

## Local Storage (localStorage)

All data stored client-side in the browser's localStorage:

| Key | Content |
|---|---|
| `mughis_image` | Array of generated images |
| `mughis_video` | Array of generated videos |
| `mughis_chat` | Array of chat conversations |
| `mughis_queue` | Pending task queue |
| `mughis_provider` | Selected AI provider |
| `mughis_key_huggingface` | Hugging Face API token |
| `mughis_key_gemini` | Gemini API key |

## Offline Support

- Service worker caches app shell (HTML, CSS, JS)
- AI API calls use network-first strategy (fall back to cache)
- Task queue persists in localStorage for retry after reconnect
- Background sync (when browser supports it) processes queued tasks

## Data Portability

- Export: Download all data as JSON file
- Import: Upload JSON file to restore data
- No server-side storage — data stays on device

## Limitations

- localStorage max ~5-10MB per origin
- Blob URLs are session-only (lost on page refresh)
- For persistent media, use Download button to save to device
