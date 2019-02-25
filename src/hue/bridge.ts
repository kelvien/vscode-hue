import * as vscode from 'vscode';

import { BridgeAPI, ConfigurationAPI } from './huetility'

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
}

/**
 * Bridge configuration
 */
export class BridgeConfiguration {
  id: string = '';
  ipAddress: string = '';
  username: string = '';

  constructor(id?: string, ipAddress?: string, username?: string) {
    if (id) {
      this.id = id;
    }
    if (ipAddress) {
      this.ipAddress = ipAddress;
    }
    if (username) {
      this.username = username;
    }
  }

  isRegistered(): boolean {
    return !!this.id && !!this.ipAddress && !!this.username;
  }
}

/**
 * Bridge option item > QuickPickItem
 */
export class BridgeQuickPickItem implements vscode.QuickPickItem {
  label: string;
  description: string;
  helpMessage: string;

  configuration: BridgeConfiguration;

  constructor(bridgeConfiguration: BridgeConfiguration) {
    this.configuration = bridgeConfiguration;

    this.label = `ID: ${this.configuration.id}`;
    this.description = `IP Address: ${this.configuration.ipAddress}`;
    this.helpMessage = `${this.label} with ${this.description}`;
  }

  setUsername(username: string): void {
    this.configuration.username = username;
  }
}

/**
 * Callback to attempt to register a Hue Bridge
 *
 * @param bridge Bridge that is going to be registered
 */
export function attemptToRegisterBridge(bridge: BridgeQuickPickItem): (progress: vscode.Progress<{ increment: number }>) => Thenable<string> {
  const configurationAPI = new ConfigurationAPI(bridge.configuration.id, bridge.configuration.ipAddress);

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
 * Helper function to get Bridge configuration from VS Code
 */
export function getBridgeConfiguration(): BridgeConfiguration {
  const bridgeConfig: BridgeConfiguration | undefined = (vscode.workspace.getConfiguration('settings')).get('hue.bridge');
  if (bridgeConfig) {
    return new BridgeConfiguration(bridgeConfig.id, bridgeConfig.ipAddress, bridgeConfig.username);
  }
  return new BridgeConfiguration();
}

/**
 * Helper function to save Bridge configuration to VS Code
 */
export async function saveBridgeConfiguration(bridgeConfig: BridgeConfiguration) {
  await (vscode.workspace.getConfiguration('settings')).update('hue.bridge', bridgeConfig, vscode.ConfigurationTarget.Global);
}

/**
 * COMMANDS
 */
export async function registerBridge(test: string) {
  // Check if Hue Bridge configuration exists
  const existingBridgeConfiguration = getBridgeConfiguration();
  if (existingBridgeConfiguration && existingBridgeConfiguration.isRegistered()) {
    const existingBridgeQuickPickItem = new BridgeQuickPickItem(existingBridgeConfiguration);
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
      placeHolder: `You have Hue Bridge ${existingBridgeQuickPickItem.helpMessage} registered in your settings. Do you want to proceed and replace the current settings anyway?`
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
  const bridgeItems = bridges.map((bridge: any) => new BridgeQuickPickItem(
      new BridgeConfiguration(bridge.id, bridge.internalipaddress))
  );
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
  await saveBridgeConfiguration(selectedBridge.configuration);
  vscode.window.showInformationMessage(`Hue Bridge ${selectedBridge.helpMessage} has successfully been registered.`);
  vscode.commands.executeCommand('setContext', CONTEXT_BRIDGE_IS_REGISTERED, true);
}