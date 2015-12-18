var _vars = {
  ACTION_ACK: 0x00,
  ACTION_AUTH: 0x01,
  ACTION_MSG: 0x02,
  STATUS_OK: 0x00,
  STATUS_ERROR: 0x01
};

for(var i in _vars) {
  global[i] = _vars[i];
}
