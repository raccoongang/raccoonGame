** Game about raccoons **


To use development to use WebSocket server:

```
#!/usr/bin/env python

import asyncio
import websockets

connected = set()

async def handler(websocket, path):
    global connected
    connected.add(websocket)

    while True:
        message = await websocket.recv()
        await asyncio.wait([ws.send(message) for ws in connected])

start_server = websockets.serve(handler, '127.0.0.1', 5678)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
```


To run WebSocket server:

    virtualenv venv3 --python=python3
    source venv3/bin/activate
    pip install -r requirements.txt
    python app.py
