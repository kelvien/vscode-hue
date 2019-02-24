import * as vscode from 'vscode';

import Huetility from './hue/huetility';
import { AttemptToRegisterBridgeCallback, BridgeItem, BridgeConfiguration } from './hue/bridge';

export function activate(context: vscode.ExtensionContext) {
  const registerBridgeCommand = vscode.commands.registerCommand('extension.hue.registerBridge', async () => {
    const existingBridgeConfiguration = await (vscode.workspace.getConfiguration()).get<BridgeConfiguration>('hue.bridge');
    if (existingBridgeConfiguration && existingBridgeConfiguration.id && existingBridgeConfiguration.ipAddress && existingBridgeConfiguration.username) {
      const existingBridgeItem = new BridgeItem(existingBridgeConfiguration);
      // Hue Bridge settings already exists, proceed and replace current settings?
      const overrideSettingDecision: { label: string, value: boolean } | undefined = await vscode.window.showQuickPick<{ label: string, value: boolean }>([{
        label: 'No',
        value: false
      }, {
        label: 'Yes',
        value: true
      }], {
        canPickMany: false,
        ignoreFocusOut: false,
        placeHolder: `You have Hue Bridge ${existingBridgeItem.helpMessage} registered in your settings. Do you want to proceed and replace the current settings anyway?`
      });
      if (!overrideSettingDecision || (overrideSettingDecision && !overrideSettingDecision.value)) {
        return;
      }
    }

    // Either we can't find Hue Bridge settings or user wants to replace their current settings
    const bridges = await Huetility.discover();
    if (!bridges) {
      vscode.window.showWarningMessage('Unable to find Hue Bridge. Make sure that your Hue Bridge is connected to your network your computer is currently on.');
      return;
    }
    const bridgeItems = bridges.map((bridge: any, index: number) => new BridgeItem({
      id: bridge.id,
      ipAddress: bridge.internalipaddress,
      username: undefined
    }));
    const selectedBridge = await vscode.window.showQuickPick<BridgeItem>(bridgeItems, {
      canPickMany: false,
      ignoreFocusOut: false,
      placeHolder: 'Select a Hue Bridge you want to register'
    });
    if (!selectedBridge) {
      return;
    }
    const registeredUsername = await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Please press the 'link' button on the Hue Bridge you are registering",
      cancellable: true
    }, AttemptToRegisterBridgeCallback(selectedBridge));
    if (!registeredUsername) {
      vscode.window.showErrorMessage('Unable to register Hue Bridge. Please try again');
      return;
    }
    selectedBridge.setUsername(registeredUsername);
    await (vscode.workspace.getConfiguration()).update('hue.bridge', selectedBridge.configuration);
    vscode.window.showInformationMessage(`Hue Bridge ${selectedBridge.helpMessage} has successfully been registered.`);
  });

  const registerNewLightsCommand = vscode.commands.registerCommand('extension.hue.registerNewLights', () => {
    vscode.window.showInformationMessage('Hello Hue');
  });
  const showAllLightsCommand = vscode.commands.registerCommand('extension.hue.showAllLights', () => {
    vscode.window.showInformationMessage('Hello Hue');
    // vscode.window.onDidChangeActiveTextEditor
  });

  context.subscriptions.push(registerBridgeCommand);
  context.subscriptions.push(registerNewLightsCommand);
  context.subscriptions.push(showAllLightsCommand);
}

export function deactivate() {}