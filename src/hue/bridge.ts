import * as vscode from 'vscode';

import { BridgeAPI, ConfigurationAPI } from './huetility'
import { BridgeConfiguration, getHueConfiguration } from './config';

/**
 * Context variables
 */
export const CONTEXT_BRIDGE_IS_REGISTERED = 'hue.bridgeIsRegistered';

/**
 * Time constants
 */
const MAX_RETRY_COUNT = 10;
const PAUSE_MILLISECONDS = 2 * 1000;


/**
 * Bridge model from discover.meethue.com API
 */
export interface Bridge {
  id: string;
  internalipaddress: string;
  username?: string;
}

/**
 * Bridge option item > QuickPickItem
 */
export class BridgeQuickPickItem implements vscode.QuickPickItem {
  label: string;
  description: string;
  helpMessage: string;

  bridge: Bridge;

  constructor(bridge: Bridge) {
    this.label = `ID: ${bridge.id}`;
    this.description = `IP Address: ${bridge.internalipaddress}`;
    this.helpMessage = `${this.label} with ${this.description}`;

    this.bridge = bridge;
  }

  setUsername(username: string): void {
    this.bridge.username = username;
  }
}

/**
 * Callback to attempt to register a Hue Bridge
 *
 * @param bridge Bridge that is going to be registered
 */
export function attemptToRegisterBridge(bridgeQuickPickItem: BridgeQuickPickItem): (progress: vscode.Progress<{ increment: number }>) => Thenable<string> {
  const configurationAPI = new ConfigurationAPI(bridgeQuickPickItem.bridge);

  return async (progress) => {
    progress.report({ increment: 0 });

    let username = '';
    for (let retryCount = 0; retryCount < MAX_RETRY_COUNT; retryCount++) {
      // Pause before trying
      await new Promise((resolve) => setTimeout(() => resolve(), PAUSE_MILLISECONDS));
      let createUserResponse = await configurationAPI.createNewUser();
      progress.report({ increment: (100 / MAX_RETRY_COUNT) });

      const validResponse = createUserResponse && createUserResponse[0];
      if (validResponse && validResponse.error) {
        continue;
      }
      username = validResponse.success.username;
      break;
    }

    return new Promise((resolve) => resolve(username));
  };
}

/**
 * Discover bridges
 *
 * @param progress progress
 */
export function discoverBridges(progress: vscode.Progress<{ increment: number }>): Thenable<Bridge[]> {
  const bridgeAPI = new BridgeAPI();
  return bridgeAPI.discover();
}

/**
 * Helper function to save Bridge configuration to VS Code
 */
export async function saveBridgeConfiguration(bridge: BridgeConfiguration) {
  await (vscode.workspace.getConfiguration()).update('hue.bridge', bridge, vscode.ConfigurationTarget.Global);
}

/**
 * COMMANDS
 */
export async function registerBridge() {
  // Check if Hue Bridge configuration exists
  const hueConfiguration = getHueConfiguration();
  if (hueConfiguration && hueConfiguration.bridge.isRegistered()) {
    const bridge = hueConfiguration.bridge;
    const existingBridge = new BridgeQuickPickItem({ id: bridge.id, internalipaddress: bridge.ipAddress, username: bridge.username });
    // Hue Bridge settings already exists, make sure user wants to replace their current Bridge settings
    const overrideSettingDecision: { label: string, value: boolean } | undefined = await vscode.window.showQuickPick<{ label: string, value: boolean }>([{
      label: 'No',
      value: false
    }, {
      label: 'Yes',
      value: true
    }], {
      canPickMany: false,
      ignoreFocusOut: false,
      placeHolder: `You have Hue Bridge ${existingBridge.helpMessage} registered in your settings. Do you want to proceed and replace the current settings anyway?`
    });
    if (!overrideSettingDecision || (overrideSettingDecision && !overrideSettingDecision.value)) {
      return;
    }
  }

  // Either we can't find existing Hue Bridge settings or user wants to replace their current settings
  const bridges = await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'Discovering bridges...',
    cancellable: true
  }, discoverBridges);
  if (!bridges) {
    vscode.window.showWarningMessage('Unable to find Hue Bridge. Make sure that your Hue Bridge is connected to your network your computer is currently on.');
    return;
  }
  const bridgeItems = bridges.map((bridge: any) => new BridgeQuickPickItem(bridge));
  const selectedBridge = await vscode.window.showQuickPick<BridgeQuickPickItem>(bridgeItems, {
    canPickMany: false,
    ignoreFocusOut: false,
    placeHolder: 'Select a Hue Bridge you want to register'
  });
  if (!selectedBridge) {
    return;
  }
  const registeredUsername = await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: "Locate and press the 'link' button on the Hue Bridge you are registering",
    cancellable: true
  }, attemptToRegisterBridge(selectedBridge));
  if (!registeredUsername) {
    vscode.window.showErrorMessage('Unable to register Hue Bridge. Please try again');
    return;
  }
  selectedBridge.setUsername(registeredUsername);
  const bridgeConfiguration = new BridgeConfiguration(
    selectedBridge.bridge.id,
    selectedBridge.bridge.internalipaddress,
    selectedBridge.bridge.username
  );
  await saveBridgeConfiguration(bridgeConfiguration);
  vscode.window.showInformationMessage(`Hue Bridge ${selectedBridge.helpMessage} has successfully been registered.`);
  vscode.commands.executeCommand('setContext', CONTEXT_BRIDGE_IS_REGISTERED, true);
}