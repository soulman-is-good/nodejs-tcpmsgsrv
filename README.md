Royal Messenger
===================

Royal messenger works via tcp protocol and with encryption **AES-256-CTR** based on _Diffie-Hellman_ algorithm by modp14.

TCP packet structure
----------------------
_Request:_
```
+---------------------+
|        Action       |  1 byte
+---------------------+
|      Session ID     |  32 bytes
+---------------------+
| Data section length |  4 byte
+---------------------+
|        Data         |
|        \\\\\        |  up to 4Gb of data
+---------------------+
```

_Response:_
```
+---------------------+
|       Status        |  1 byte
+---------------------+
|    Message length   |  4 bytes
+---------------------+
|       Message       |  up to 4Gb of data
+---------------------+
```

Packets
----------

### :arrow_right: Authorization


:small_orange_diamond:_Client request:_

+ Action - 0x01
+ Data - must contain client's account (4 bytes) and public key

:small_orange_diamond:_Server response:_

+ Could be either server public key or error code in case of an error

### :arrow_right: ACK package

:small_orange_diamond:_Server request:_

+ Server sends zero byte (0x00) request to test if client is alive

:small_orange_diamond:_Client response:_

Client sends back zero byte with no other fields in packet. If client won't respond in 10 seconds server will destroy this socket and client must reconnect
+ Action - 0x00

### :arrow_right: Basic message

:small_orange_diamond:_Client request:_

+ Action - 0x02
+ Data - encrypted client message in json format

:small_orange_diamond:_JSON message format:_

```json
{
  "account": [1, 2, 14, 15],
  "message": "message text"
}
```

:small_orange_diamond:_Server response:_

+ Delivery status encrypted in json or error code

:small_orange_diamond:_JSON delivery response format:_

```json
[{
  "account": 1,
  "status": "delivered"
},
{
  "account": 2,
  "status": "queued"
},
{
  "account": 14,
  "status": "error",
  "message": "You can't send messages to this account"
},
{
  "account": 15,
  "status": "receiving",
  "message": 1024
}]
```
_on `receiving` event `message` field represents how many bytes have been received already_
