Visual Studio Code Extension – hue
===
This extension integrates your favorite Hue lights with your favorite code editor!

Prerequisites
---
- Be in a workspace (This extension needs to save your configuration in workspace-level)
- Install VS Code extension: `hue`
- Connect your hue Bridge to the same network as your computer by LAN cable

How to use?
---
- Register your Hue Bridge:
`Ctrl+Shift+p` or on Mac `Cmd+Shift+p` then type `Hue: register`, pick Hue Bridge you want to register
- See list of supported commands below and play around:

|VS Code Command|Hue Action|
|:-|:-|
|Hue: register new lights|Attempt to discover and register new lights|
|Hue: turn all lights on |Turn all lights on|
|Hue: turn all lights off |Turn all lights off|
|Hue: turn group lights on |Choose a group and turn all associated lights on|
|Hue: turn group lights off |Choose a group and turn all associated lights off|
|Hue: enable ambient lights|Enable lights' color to be adaptive to the current file you are on|
|Hue: disable ambient lights|Disable lights' color to be adaptive to the current file you are on|
|Hue: set language to color|Set a rule for a language to a color|
|Hue: set theme to color|Set a rule for a theme to a color|
|Hue: unregister bridge|Unregister bridge that you have been registered to|

Settings (Optional)
---
Settings in Hue can be used to override the Hue Bridge username, and the ambient lighting rules, etc.

|Key|Type|Default value|
|:--|:--|:--|
|hue.bridge|object|{}|
|hue.ambient.enabled|bool|false|
|hue.ambient.rules|object|{}|

Example of `settings.json`:
```json
{
  "hue": {
    "bridge": {
      "id": "ABC",
      "ipAddress": "192.168.123",
      "username": "ZXY"
    },
    "ambient": {
      "rules": {
        "javascript": {
          "color": "#22eeee",
          "brightness": "50"
        },
        "markdown": "white"
      }
    }
  }
}
```

Notes:
- By default Hue lights' colors are derived from the file's theme/language main color

***
Feel free to contribute to this repository.