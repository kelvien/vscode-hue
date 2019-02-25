import * as vscode from 'vscode';

import { getBridgeConfiguration } from './bridge';
import { GroupsAPI, LightsAPI } from './huetility';

// DEFAULT STATE OF LANGUAGES AND DEFAULT
const DEFAULT_RULES: { [key: string]: any } = {
  c: {
    lights: "all",
    state: {
      "on": true,
      "bri": 254,
      "xy": [0.4432,0.5154]
    }
  },
  css: {
    lights: "all",
    state: {
      "on": true,
      "bri": 254,
      "xy": [0.262,0.3269]
    }
  },
  cpp: {
    lights: "all",
    state: {
      "on": true,
      "bri": 254,
      "xy": [0.3227,0.329]
    }
  },
  csharp: {
    lights: "all",
    state: {
      "on": true,
      "bri": 254,
      "xy": [0.3227,0.329]
    }
  },
  dockerfile: {
    lights: "all",
    state: {
      "on": true,
      "bri": 254,
      "xy": [0.139,0.081]
    }
  },
  html: {
    lights: "all",
    state: {
      "on": true,
      "bri": 254,
      "xy": [0.3292,0.3285]
    }
  },
  jsonc: {
    lights: "all",
    state: {
      "on": true,
      "bri": 254,
      "xy": [0.6531,0.2834]
    }
  },
  java: {
    lights: "all",
    state: {
      "on": true,
      "bri": 254,
      "xy": [0.6112,0.3261]
    }
  },
  javascript: {
    lights: "all",
    state: {
      "on": true,
      "bri": 254,
      "xy": [0.7,0.2986]
    }
  },
  plaintext: {
    lights: "all",
    state: {
      "on": true,
      "bri": 254,
      "xy": [0.3174,0.3207]
    }
  },
  php: {
    lights: "all",
    state: {
      "on": true,
      "bri": 254,
      "xy": [0.2703,0.1398]
    }
  },
  python: {
    lights: "all",
    state: {
      "on": true,
      "bri": 254,
      "xy": [0.2206,0.2948]
    }
  },
  typescript: {
    lights: "all",
    state: {
      "on": true,
      "bri": 254,
      "xy": [0.1649,0.1338]
    }
  }
};

/**
 * Adapt lights to the language
 *
 * @param languageID Language ID
 */
export async function adapt (languageID: string) {
  const bridgeConfiguration = getBridgeConfiguration();
  if (bridgeConfiguration.isRegistered()) {
    const rules = Object.assign({}, DEFAULT_RULES);
    const userRules = await (vscode.workspace.getConfiguration('settings')).get('hue.ambient.rules');
    Object.assign(rules, userRules);

    const rule = rules[languageID];
    const { groups, lights, state } = rule;
    if (rule && state) {
      if (lights) {
        const lightsAPI = new LightsAPI(bridgeConfiguration.id, bridgeConfiguration.ipAddress, bridgeConfiguration.username);
        if (state) {
          if (lights === 'all') {
            await lightsAPI.setAllLightsState(rule['state']);
          } else {
            await lightsAPI.setLightsState(rule['lights'], rule['state']);
          }
        }
      } else if(groups) {
        const groupsAPI = new GroupsAPI(bridgeConfiguration.id, bridgeConfiguration.ipAddress, bridgeConfiguration.username);
        await groupsAPI.setGroupsState(groups, state);
      }
    }
  }
}