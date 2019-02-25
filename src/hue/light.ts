import * as vscode from 'vscode';
import { getBridgeConfiguration } from './bridge';
import { LightsAPI } from './huetility';

const SECOND_MILLISECONDS = 1000;
const SEARCH_SECONDS = 30;

/**
 * COMMANDS
 */
export async function registerNewLights() {
  const existingBridgeConfiguration = getBridgeConfiguration();
  const lightsAPI = new LightsAPI(existingBridgeConfiguration.id, existingBridgeConfiguration.ipAddress, existingBridgeConfiguration.username);
  await lightsAPI.searchLights();
  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'Searching for new lights',
    cancellable: true
  }, searchForLights);
  const lightsSinceLastScan: any[] = await lightsAPI.getNewLights();
  vscode.window.showInformationMessage(`Found and registered ${lightsSinceLastScan.length} light(s)`);
}

export async function searchForLights(progress: vscode.Progress<{ increment: number, message: string }>) {
  progress.report({ increment: 0, message: `${SEARCH_SECONDS}s` });

  for (let second = SEARCH_SECONDS; second > 0; second--) {
    await new Promise((resolve) => setTimeout(() => resolve(), SECOND_MILLISECONDS));
    progress.report({
      increment: (100 / SEARCH_SECONDS),
      message: `${(second - 1)}s`
    });
  }

  return new Promise((resolve) => resolve());
}

/**
 * Turn all lights state
 *
 * @param state State to be set
 * @param prompt Prompt flag to replace state
 */
export async function turnAllLightsState(state: any, prompt?: boolean) {
  const existingBridgeConfiguration = getBridgeConfiguration();
  const lightsAPI = new LightsAPI(existingBridgeConfiguration.id, existingBridgeConfiguration.ipAddress, existingBridgeConfiguration.username);
  if (prompt) {
    const inputState = await vscode.window.showInputBox({
      prompt: "Enter lights state",
      placeHolder: '{"on", "bri", "hue", "sat", "effect", "xt", "ct", "alert", "effect", "transitiontime", "bri_inc", "sat_inc", "hue_inc", "ct_inc", "xy_inc"}'
    });
    try {
      state = JSON.parse(inputState || '');
    } catch {
      vscode.window.showErrorMessage('State is not a valid JSON format. Please try again');
      return;
    }
  }
  await lightsAPI.setAllLightsState(state);
  vscode.window.showInformationMessage('All lights state have been changed');
}