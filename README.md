Visual Studio Code Extension – hue
===
Hue is VS Code extension that integrates your favorite Hue lights with your favorite code editor!

Besides providing basic commands to control your Hue lights, you can also set rules for your Hue Lights to change according to your preferences and the current file you are editing.

[Download](https://marketplace.visualstudio.com/items?itemName=kelvien.hue) and give it a try

Dev note
---
There are still a lot more rooms to be covered in this extension, and please feel free to contribute!

Prerequisites
---
- Connect your Hue Bridge to the same network as your computer by LAN cable

How to use?
---
1. Register your Hue Bridge:
`Ctrl+Shift+p` or on Mac `Cmd+Shift+p` then type `Hue: register bridge`, pick a Hue Bridge that you want to register
2. See list of supported commands below:

|Command|Command Palette|Hue Action|Keyboard shorcuts|Mac keyboard shortcuts
|:-|:-|:-|:-|:-|
|extension.hue.registerBridge|Hue: register bridge|Attempt to discover and register a Hue bridge|||
|extension.hue.registerLights|Hue: register new lights|Attempt to discover and register new Hue lights|||
|extension.hue.turnAllLightsOn|Hue: turn all lights on |Turn all Hue lights on|<kbd>Ctrl+h 1</kbd>|<kbd>Cmd+h 1</kbd>|
|extension.hue.turnAllLightsOff|Hue: turn all lights off |Turn all Hue lights off|<kbd>Ctrl+h 0</kbd>|<kbd>Cmd+h 0</kbd>|
|extension.hue.enableAmbientLights|Hue: enable ambient lights|Enable lights' color to be adaptive to the current file you are on|||
|extension.hue.disableAmbientLights|Hue: disable ambient lights|Disable lights' color to be adaptive to the current file you are on|||

Settings (Optional)
---
Settings can be used to override the Hue Bridge IP address, and the ambient lighting rules, etc.

|Key|Type|Default value|Description|
|:-|:-|:-|:-|
|settings.hue.bridge|object|{}|Bridge configuration. `{id, ipAddress, username}`|
|settings.hue.ambient.enabled|bool|false|Ambient lights status|
|settings.hue.ambient.rules|object|{}|Ambient lights rules `{language: {lights|groups, state}}`|

Example of `settings.json`:
```json
{
  "settings.hue.bridge": {
    "id": "ABC",
    "ipAddress": "192.168.1.123",
    "username": "XYZ",
  },
  "settings.hue.ambient.enabled": true,
  "settings.hue.ambient.rules": {
    "dockerfile": {
      "lights": "all",
      "state": {
        "on": true,
        "bri": 254,
        "hue": 33761,
        "sat": 200
      }
    },
    "javascript": {
      "lights": ["1"],
      "state": {
        "on": true,
        "bri": 200,
        "hue": 1,
        "sat": 100
      }
    },
    "markdown": {
      "groups": ["Living room"],
      "state": {
        "on": true,
        "bri": 100,
        "hue": 5000
      }
    }
  }
}
```

### State
Refer to [Philips official site](https://developers.meethue.com/develop/hue-api/lights-api/#set-light-state) for more details

|state|type|description|
|:-|:-|:-|
|on|bool|On/Off state of the light. On=true, Off=false|
|bri|uint8|The brightness value to set the light to.Brightness is a scale from 1 (the minimum the light is capable of) to 254 (the maximum). Note: a brightness of 1 is not off|
|hue|uint16|The hue value to set light to.The hue value is a wrapping value between 0 and 65535. Both 0 and 65535 are red, 25500 is green and 46920 is blue.|
|sat|uint8|Saturation of the light. 254 is the most saturated (colored) and 0 is the least saturated (white).	|
|xy|list 2..2 of float 4|The x and y coordinates of a color in CIE color space.The first entry is the x coordinate and the second entry is the y coordinate. Both x and y must be between 0 and 1. If the specified coordinates are not in the CIE color space, the closest color to the coordinates will be chosen.|
|ct|uint16|The Mired color temperature of the light. 2012 connected lights are capable of 153 (6500K) to 500 (2000K).	|
|alert|string|The alert effect,is a temporary change to the bulb’s state, and has one of the following values: “none” – The light is not performing an alert effect. “select” – The light is performing one breathe cycle. “lselect” – The light is performing breathe cycles for 15 seconds or until an "alert": "none" command is received|
|effect|string|The dynamic effect of the light. Currently “none” and “colorloop” are supported. Other values will generate an error of type 7.Setting the effect to colorloop will cycle through all hues using the current brightness and saturation settings.	|
|transitiontime|uint16|The duration of the transition from the light’s current state to the new state. This is given as a multiple of 100ms and defaults to 4 (400ms). For example, setting transitiontime:10 will make the transition last 1 second.	|
|bri_inc|-254 to 254|Increments or decrements the value of the brightness.  bri_inc is ignored if the bri attribute is provided. Any ongoing bri transition is stopped. Setting a value of 0 also stops any ongoing transition. The bridge will return the bri value after the increment is performed.	|
|sat_inc|-254 to 254|Increments or decrements the value of the sat.  sat_inc is ignored if the sat attribute is provided. Any ongoing sat transition is stopped. Setting a value of 0 also stops any ongoing transition. The bridge will return the sat value after the increment is performed.|
|hue_inc|-65534 to 65534|Increments or decrements the value of the hue.   hue_inc is ignored if the hue attribute is provided. Any ongoing color transition is stopped. Setting a value of 0 also stops any ongoing transition. The bridge will return the hue value after the increment is performed.Note if the resulting values are < 0 or > 65535 the result is wrapped.|
|ct_inc|-65534 to 65534|Increments or decrements the value of the ct. ct_inc is ignored if the ct attribute is provided. Any ongoing color transition is stopped. Setting a value of 0 also stops any ongoing transition. The bridge will return the ct value after the increment is performed.	|
|xy_inc|list 2..2 of float 4|Increments or decrements the value of the xy.  xy_inc is ignored if the xy attribute is provided. Any ongoing color transition is stopped. Setting a value of 0 also stops any ongoing transition. Will stop at it’s gamut boundaries. The bridge will return the xy value after the increment is performed. Max value [0.5, 0.5].	|