import * as vscode from 'vscode';

import { CONTEXT_BRIDGE_IS_REGISTERED, registerBridge } from './hue/bridge';
import { registerNewLights, turnAllLightsState } from './hue/light';
import { setDefaultGroupState } from './hue/group';
import { adapt, setAmbientLights, setDefaultGroup } from './hue/ambient_lights';
import { getHueConfiguration } from './hue/config';

function setContext() {
  const hueConfiguration = getHueConfiguration();
  if (!hueConfiguration.bridge.isRegistered()) {
    vscode.commands.executeCommand('setContext', CONTEXT_BRIDGE_IS_REGISTERED, false);
    return;
  }
  vscode.commands.executeCommand('setContext', CONTEXT_BRIDGE_IS_REGISTERED, true);
  return;
}

/**
 * Activate entrypoint
 */
export async function activate(context: vscode.ExtensionContext) {
  // Set context on activation
  setContext();

  // Set context on configuration changes events
  const bridgeConfigurationChangesListener = vscode.workspace.onDidChangeConfiguration(() => {
    setContext();
  });
  context.subscriptions.push(bridgeConfigurationChangesListener);

  // Let Ambient Lights adapt on current active text editor events
  const changeActiveTextEditorListener = vscode.window.onDidChangeActiveTextEditor(async (e: vscode.TextEditor | undefined): Promise<any> => {
    if (!e) {
      return;
    }
    const hueConfiguration = getHueConfiguration();
    if (!hueConfiguration.ambientLights.enabled) {
      return;
    }
    await adapt(e.document.languageId);
  });
  context.subscriptions.push(changeActiveTextEditorListener);

  // Register bridge command
  const registerBridgeCommand = vscode.commands.registerCommand('extension.hue.registerBridge', async () => {
    await registerBridge();
  });
  context.subscriptions.push(registerBridgeCommand);

  // Register new lights command
  const registerNewLightsCommand = vscode.commands.registerCommand('extension.hue.registerNewLights', async () => {
    await registerNewLights();
  });
  context.subscriptions.push(registerNewLightsCommand);

  // Turn all lights on command
  const turnDefaultGroupOnCommand = vscode.commands.registerCommand('extension.hue.turnDefaultGroupOn', async () => {
    await setDefaultGroupState({ on: true });
    vscode.window.showInformationMessage('Default group has been turned on');
  });
  context.subscriptions.push(turnDefaultGroupOnCommand);

  // Turn all lights off command
  const turnDefaultGroupCommand = vscode.commands.registerCommand('extension.hue.turnDefaultGroupOff', async () => {
    await setDefaultGroupState({ on: false });
    vscode.window.showInformationMessage('Default group has been turned off');
  });
  context.subscriptions.push(turnDefaultGroupCommand);

  // Set default group command
  const setDefaultGroupCommand = vscode.commands.registerCommand('extension.hue.setDefaultGroup', async () => {
    await setDefaultGroup();
  });
  context.subscriptions.push(setDefaultGroupCommand);

  // Enable ambient lights command
  const enableAmbientLightsCommand = vscode.commands.registerCommand('extension.hue.enableAmbientLights', async () => {
    await setAmbientLights(true);
    vscode.window.showInformationMessage('Hue: Ambient lights has been enabled');
  });
  context.subscriptions.push(enableAmbientLightsCommand);

  // Disable ambient lights command
  const disableAmbientLightsCommand = vscode.commands.registerCommand('extension.hue.disableAmbientLights', async () => {
    await setAmbientLights(false);
    vscode.window.showInformationMessage('Hue: Ambient lights has been disabled');
  });
  context.subscriptions.push(disableAmbientLightsCommand);
}

/**
 * Deactivate entrypoint
 */
export async function deactivate() {
  await turnAllLightsState({ on: true });
}