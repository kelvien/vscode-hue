import * as vscode from 'vscode';
import { getHueConfiguration, State } from './config';
import { GroupsAPI } from './huetility';

export interface Group {
  name: string,
  lights: string[],
  type: string,
  action: State
}

/**
 * Groups model from API
 */
export interface Groups {
  [lightID: string]: Group
}

/**
 * Turn all lights state
 *
 * @param state State to be set
 * @param prompt Prompt flag to replace state
 */
export async function turnGroupState(id: number, state: any, prompt?: boolean) {
  const { bridge } = getHueConfiguration();
  const groupsAPI = new GroupsAPI(bridge);
  if (prompt) {
    const inputState = await vscode.window.showInputBox({
      prompt: "Enter state",
      placeHolder: '{"on", "bri", "hue", "sat", "effect", "xt", "ct", "alert", "effect", "transitiontime", "bri_inc", "sat_inc", "hue_inc", "ct_inc", "xy_inc"}'
    });
    try {
      state = JSON.parse(inputState || '');
    } catch {
      vscode.window.showErrorMessage('State is not a valid JSON format. Please try again');
      return;
    }
  }
  await groupsAPI.setGroupState(id, state);
}

/**
 * Set default group state
 *
 * @param state State
 */
export async function setDefaultGroupState(state: any) {
  const { defaultGroup, bridge } = getHueConfiguration();
  const groupAPI = new GroupsAPI(bridge);
  const groups = await groupAPI.get();
  const groupIDs = Object.keys(groups)
      .filter(groupID => groups[groupID].name === defaultGroup);
  const groupID = groupIDs[0] ? groupIDs[0] : 0;
  await turnGroupState(+groupID, state);
}