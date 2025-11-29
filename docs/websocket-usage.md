# WebSocket Real-time Updates

## Overview

The application now includes WebSocket support for real-time features:

- Live chat in booking details
- Real-time notifications
- Booking status updates
- Payment status updates

## Running WebSocket Server

### Development

Run both Next.js and WebSocket server:

```bash
npm run dev:all
```

Or run them separately:

```bash
# Terminal 1 - Next.js
npm run dev

# Terminal 2 - WebSocket
npm run ws:dev
```

### Production

```bash
# Build the application
npm run build

# Start WebSocket server
npm run ws:start

# In another process, start Next.js
npm start
```

## Environment Variables

Add these to your `.env.local`:

```env
# WebSocket Configuration
WS_PORT=3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

For production:

```env
NEXT_PUBLIC_WS_URL=wss://your-domain.com
```

## Features

### 1. Live Chat

- Real-time messaging in booking details
- Typing indicators
- Message history
- Auto-reconnection

### 2. Real-time Notifications

- Toast notifications for new events
- Notification bell with unread count
- Click to navigate to relevant page

### 3. Status Updates

- Booking status changes
- Payment confirmations
- Service updates

## Usage in Components

### Using Booking Chat

```tsx
import { BookingChat } from '@/components/BookingChat'
;<BookingChat bookingId={booking.id} />
```

### Using Notifications

```tsx
import { RealtimeNotifications } from '@/components/RealtimeNotifications'
;<RealtimeNotifications />
```

### Custom WebSocket Hook

```tsx
import { useWebSocket } from '@/hooks/useWebSocket'

function MyComponent() {
  const { isConnected, on, emit } = useWebSocket()

  useEffect(() => {
    const unsubscribe = on('custom:event', data => {
      console.log('Received:', data)
    })

    return unsubscribe
  }, [on])

  const sendData = () => {
    emit('custom:action', { message: 'Hello' })
  }
}
```

## Server Events

### Emitting from API Routes

```typescript
import { emitWebSocketEvent } from '@/lib/websocket/init'

// In your API route
emitWebSocketEvent('user', userId, 'notification:new', {
  title: 'New Booking',
  message: 'You have a new booking request'
})
```

## Security

- JWT-based authentication
- User-specific rooms
- Role-based access control
- Automatic reconnection with auth

## Troubleshooting

### Connection Issues

1. Check WebSocket server is running
2. Verify NEXT_PUBLIC_WS_URL is correct
3. Check browser console for errors
4. Ensure JWT token is valid

### Message Not Sending

1. Check connection status
2. Verify user is authenticated
3. Check booking access permissions
4. Look for server-side errors

## Deployment

### Using PM2

```bash
# ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'rok-web',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 3000
      }
    },
    {
      name: 'rok-websocket',
      script: './node_modules/.bin/tsx',
      args: 'src/websocket-server.ts',
      env: {
        WS_PORT: 3001
      }
    }
  ]
}

# Start both
pm2 start ecosystem.config.js
```

### Using Docker

```dockerfile
# Add to Dockerfile
EXPOSE 3000 3001

# Add WebSocket startup
CMD ["sh", "-c", "npm run ws:start & npm start"]
```

### Nginx Configuration

```nginx
# WebSocket proxy
location /socket.io/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```
