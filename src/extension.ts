import * as vscode from 'vscode';

import { CONTEXT_BRIDGE_IS_REGISTERED, getBridgeConfiguration, registerBridge } from './hue/bridge';
import { registerNewLights, turnAllLightsState } from './hue/light';
import {} from './hue/groups';
import { adapt } from './hue/ambient_lights';

/**
 * Activate entrypoint
 */
export async function activate(context: vscode.ExtensionContext) {
  // Set context on activation depending on the current Bridge configuration
  const existingBridgeConfiguration = getBridgeConfiguration();
  if (existingBridgeConfiguration.isRegistered()) {
    vscode.commands.executeCommand('setContext', CONTEXT_BRIDGE_IS_REGISTERED, true);
  }

  // Setup event listener to Bridge configuration in case user changes it manually in the future
  const bridgeConfigurationChangesListener = vscode.workspace.onDidChangeConfiguration(() => {
    const bridgeConfiguration = getBridgeConfiguration();
    if (bridgeConfiguration && bridgeConfiguration.isRegistered()) {
      vscode.commands.executeCommand('setContext', CONTEXT_BRIDGE_IS_REGISTERED, true);
      return;
    }
    vscode.commands.executeCommand('setContext', CONTEXT_BRIDGE_IS_REGISTERED, false);
    return;
  });
  context.subscriptions.push(bridgeConfigurationChangesListener);

  // Setup event listener to the current active text editor
  const changeActiveTextEditorListener = vscode.window.onDidChangeActiveTextEditor(async (e: vscode.TextEditor | undefined): Promise<any> => {
    if (!e) {
      return;
    }
    const isAmbientLightsEnabled = await (vscode.workspace.getConfiguration('settings')).get('hue.ambient.enabled');
    if (!isAmbientLightsEnabled) {
      return;
    }
    await adapt(e.document.languageId);
  });
  context.subscriptions.push(changeActiveTextEditorListener);

  // Register bridge command
  const registerBridgeCommand = vscode.commands.registerCommand('extension.hue.registerBridge', async () => {
    await registerBridge("asd");
  });
  context.subscriptions.push(registerBridgeCommand);

  // Register new lights command
  const registerNewLightsCommand = vscode.commands.registerCommand('extension.hue.registerNewLights', async () => {
    await registerNewLights();
  });
  context.subscriptions.push(registerNewLightsCommand);

  // Turn all lights on command
  const turnAllLightsOnCommand = vscode.commands.registerCommand('extension.hue.turnAllLightsOn', async () => {
    await turnAllLightsState({
      on: true,
      xy: [0.3227, 0.329] // white
    });
  });
  context.subscriptions.push(turnAllLightsOnCommand);

  // Turn all lights off command
  const turnOffAllLightsCommand = vscode.commands.registerCommand('extension.hue.turnAllLightsOff', async () => {
    await turnAllLightsState({
      on: false,
      xy: [0.3227, 0.329] // white
    });
  });
  context.subscriptions.push(turnOffAllLightsCommand);

  // Change all lights state command
  const changeAllLightsStateCommand = vscode.commands.registerCommand('extension.hue.changeAllLightsState', async () => {
    await turnAllLightsState({}, true);
  });
  context.subscriptions.push(changeAllLightsStateCommand);

  // All groups command
  const groupsCommand = vscode.commands.registerCommand('extension.hue.groups', async () => {
    vscode.window.showInformationMessage('Groups');
  });
  context.subscriptions.push(groupsCommand);

  // Enable ambient lights command
  const enableAmbientLightsCommand = vscode.commands.registerCommand('extension.hue.enableAmbientLights', async () => {
    await (vscode.workspace.getConfiguration('settings')).update('hue.ambient.enabled', true, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage('Hue: Ambient lights has been enabled');
    if (vscode.window.activeTextEditor) {
      adapt(vscode.window.activeTextEditor.document.languageId);
    }
  });
  context.subscriptions.push(enableAmbientLightsCommand);

  // Disable ambient lights command
  const disableAmbientLightsCommand = vscode.commands.registerCommand('extension.hue.disableAmbientLights', async () => {
    await (vscode.workspace.getConfiguration('settings')).update('hue.ambient.enabled', false, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage('Hue: Ambient lights has been disabled');
    if (vscode.window.activeTextEditor) {
      adapt(vscode.window.activeTextEditor.document.languageId);
    }
  });
  context.subscriptions.push(disableAmbientLightsCommand);
}

/**
 * Deactivate entrypoint
 */
export function deactivate() {}