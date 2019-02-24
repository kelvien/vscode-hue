import * as vscode from 'vscode';

import Huetility from './huetility';

const MAX_RETRY_COUNT = 10;
const PAUSE_MILLISECONDS = 2000;

export class BridgeConfiguration {
  id: string;
  ipAddress: string;
  username: string | undefined;

  constructor(id: string, ipAddress: string, username?: string) {
    this.id = id;
    this.ipAddress = ipAddress;
    this.username = username;
  }

  isRegistered(): boolean {
    return !!this.id && !!this.ipAddress && !!this.username;
  }
}

export class BridgeItem implements vscode.QuickPickItem {
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

export function AttemptToRegisterBridgeCallback(bridge: BridgeItem): (progress: vscode.Progress<{ increment: number }>) => Thenable<string> {
  return async (progress) => {
    progress.report({ increment: 0 });

    let username = '';
    for (let retryCount = 0; retryCount < MAX_RETRY_COUNT; retryCount++) {
      let createUserResponse = await Huetility.configuration.createUser(bridge.configuration.ipAddress);

      // Pause before retrying
      await new Promise((resolve) => setTimeout(() => resolve(), PAUSE_MILLISECONDS));
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