Visual Studio Code Extension – hue
===
Hue is VS Code extension that integrates your favorite Hue lights with your favorite code editor!
[Download](https://marketplace.visualstudio.com/items?itemName=kelvien.hue) and give it a try

Prerequisites
---
- Connect your Hue Bridge to the same network as your computer by LAN cable

How to use?
---
1. Register your Hue Bridge:
`Ctrl+Shift+p` or on Mac `Cmd+Shift+p` then type `Hue: register bridge`, pick a Hue Bridge that you want to register
2. See list of supported commands below:

|Command|Command Palette|Hue Action|
|:-|:-|:-|
|extension.hue.registerBridge|Hue: register bridge|Attempt to discover and register a Hue bridge|
|extension.hue.registerLights|Hue: register new lights|Attempt to discover and register new Hue lights|
||Hue: lights|Turn on/off/color/brightness of all of your lights|
||Hue: turn all lights on |Turn all Hue lights on|
||Hue: turn all lights off |Turn all Hue lights off|
||Hue: groups|See all groups|
||Hue: turn group lights on |Choose a group and turn all associated lights on|
||Hue: turn group lights off |Choose a group and turn all associated lights off|
||Hue: enable ambient lights|Enable lights' color to be adaptive to the current file you are on|
||Hue: disable ambient lights|Disable lights' color to be adaptive to the current file you are on|
||Hue: set language to color|Set a rule for a language to a color|
||Hue: set theme to color|Set a rule for a theme to a color|

3. See list of registered keybindings below:

|Key|Mac Key|Command|
|:-|:-|:-|
|<kbd>Ctrl+h 1</kbd>|<kbd>Cmd+h 1</kbd>|extension.hue.turnAllLightsOn|
|<kbd>Ctrl+h 0</kbd>|<kbd>Cmd+h 0</kbd>|extension.hue.turnAllLightsOff|

Settings (Optional)
---
Settings can be used to override the Hue Bridge IP address, and the ambient lighting rules, etc.

|Key|Type|Default value|
|:--|:--|:--|
|hue.bridge|object|{}|
|hue.ambient.enabled|bool|false|
|hue.ambient.rules|object|{}|

Example of `settings.json`:
```json
{
  "settings.hue.bridge": {
    "id": "ABC",
    "ipAddress": "192.168.1.123",
    "username": "ZXY",
  },
  "settings.hue.ambient.enabled": true,
  "settings.hue.ambient.rules": {
    "javascript": {
      "color": "#22eeee",
      "brightness": "50"
    },
    "markdown": "white"
  }
}
```

Notes:
- By default Hue lights' colors are derived from the file's theme/language main color

***
Feel free to contribute to this repository.