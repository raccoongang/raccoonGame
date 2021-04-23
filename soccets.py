#!/usr/bin/env python
import json
import asyncio
import websockets

from websockets.exceptions import ConnectionClosed

connected = set()
global_pull_users = {}


def room(message):

    print(message)
    print(global_pull_users)

    message = json.loads(message)
    _id = message.get('_id')
    user = global_pull_users.get(_id, '')
    if not user:
        for k, v in global_pull_users.items():
            if not v and k != _id:
                user = global_pull_users[_id] = k
                global_pull_users[k] = _id
                break
        else:
            global_pull_users[_id] = ''
    message['pare'] = user
    message = json.dumps(message)
    return message


def remove_from_room(message):
    message = json.loads(message)
    _id = message.get('_id')
    global_pull_users.pop(_id)
    global_pull_users[global_pull_users.get(_id, '')] = ''
    message['pare'] = ''
    message = json.dumps(message)
    return message


async def handler(websocket, path):
    global connected
    connected.add(websocket)

    while True:
        try:
            message = room(await websocket.recv())
            await asyncio.wait([ws.send(message) for ws in connected])
        except ConnectionClosed as e:
            remove_from_room(message)
            # for x in xrange(1,10):
            # 	connection_closed
            print(e)
            print(dir(e))
            print(dir(list(connected)[0]))
            break

start_server = websockets.serve(handler, '127.0.0.1', 5678)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
