import * as vscode from 'vscode';

import { GroupsAPI, LightsAPI } from './huetility';
import { defaultAmbientLightsRules } from './default_ambient_lights_rules';
import { setDefaultGroupState } from './group';
import { getHueConfiguration } from './config';

export async function setAmbientLights(isEnabled: boolean) {
  await (vscode.workspace.getConfiguration()).update('hue.ambientLights.enabled', isEnabled, vscode.ConfigurationTarget.Global);
  vscode.window.showInformationMessage('Hue: Ambient lights has been enabled');
  if (vscode.window.activeTextEditor) {
    adapt(vscode.window.activeTextEditor.document.languageId);
  }
}

/**
 * Adapt lights to the language
 *
 * @param languageID Language ID
 */
export async function adapt (languageID: string) {
  const hueConfiguration = getHueConfiguration();
  if (hueConfiguration.bridge && hueConfiguration.bridge.isRegistered()) {
    const { enabled, rules: userRules } = hueConfiguration.ambientLights;

    if (enabled) {
      const rules = Object.assign(
        {},
        defaultAmbientLightsRules,
        userRules
      );

      const rule: any = rules[languageID];
      if (rule) {
        const lightsAPI = new LightsAPI(hueConfiguration.bridge);
        const groupsAPI = new GroupsAPI(hueConfiguration.bridge);
        const { lightStates, groupStates, state } = rule;
        if (lightStates) {
          const lightPromises: Promise<{}>[] = [];
          const lights = await lightsAPI.get();
          for (const lightName of Object.keys(lightStates)) {
            const lightIDs = Object.keys(lights)
              .filter(lightID => lights[lightID].name === lightName);
            const lightID = lightIDs[0];
            lightPromises.push(
                lightsAPI.setLightState(parseInt(lightID), lightStates[lightName])
            );
          }
          return Promise.all(lightPromises);
        } else if (groupStates) {
          const groupPromises: Promise<{}>[] = [];
          const groups = await groupsAPI.get();
          for (const groupName of Object.keys(groupStates)) {
            const groupIDs = Object.keys(groups)
              .filter(groupID => groups[groupID].name === groupName);
            const groupID = groupIDs[0];
            groupPromises.push(
                groupsAPI.setGroupState(parseInt(groupID), groupStates[groupName])
            );
          }
          return Promise.all(groupPromises);
        } else if (state) {
          await setDefaultGroupState(state);
        }
      }
    }
  }
}

export async function setDefaultGroup() {
  const defaultGroupInput = await vscode.window.showInputBox({
    prompt: "Enter default group name",
    placeHolder: 'i.e: Living room/Bedroom/Workstation'
  });
  if (!defaultGroupInput) {
    return;
  }
  const defaultGroupName = defaultGroupInput.trim();
  let message = 'Hue: Default group ';
  if (!defaultGroupName) {
    message += 'has been emptied. Defaulted to all lights';
  } else {
    message += `has been set to '${defaultGroupInput}'`;
  }
  await (vscode.workspace.getConfiguration()).update('hue.defaultGroup', defaultGroupName, vscode.ConfigurationTarget.Global);
  vscode.window.showInformationMessage(message);0
}