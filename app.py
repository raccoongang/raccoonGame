#!/usr/bin/env python

import asyncio
import websockets
from websockets.exceptions import ConnectionClosed

connected = set()

# TODO investigate "Task was destroyed but it is pending!"
async def handler(websocket, path):
    global connected
    connected.add(websocket)

    while True:
        try:
            message = await websocket.recv()
        except ConnectionClosed:
            connected.remove(websocket)
        else:
            await asyncio.wait([ws.send(message) for ws in connected])


start_server = websockets.serve(handler, '0.0.0.0', 5678)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
