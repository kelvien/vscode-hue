import * as vscode from 'vscode';
import { defaultAmbientLightsRules } from './default_ambient_lights_rules';

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
 * Hue State
 */
export interface State {
  on?: boolean,
  bri?: number,
  hue?: number,
  sat?: number,
  xy?: number[],
  ct?: number,
  alert?: string,
  effect?: string,
  transitiontime?: number,
  bri_inc?: number,
  sat_inc?: number,
  hue_inc?: number,
  ct_inc?: number,
  xy_inc?: number,
  scene?: string
}

export interface AmbientLightRule {
  state: State
}

export interface AmbientLightsRule {
  lightStates: {
    [lightID: number]: State
  }
}

export interface AmbientLightsGroupsRule {
  groupStates: {
    [groupID: number]: State
  }
}

/**
 * Ambient Lights rules associated between language identifier to its state
 */
export interface AmbientLightsRules {
  [languageIdentifier: string]: AmbientLightsRule | AmbientLightsGroupsRule | AmbientLightRule
}

/**
 * Ambient Lights configuration
 */
export interface AmbientLightsConfiguration {
  enabled: boolean;
  rules: AmbientLightsRules;
}

/**
 * Hue Configuration
 */
export interface HueConfiguration {
  bridge: BridgeConfiguration,
  defaultGroup: string,
  ambientLights: AmbientLightsConfiguration
}

/**
 * Get Hue configuration
 */
export function getHueConfiguration(): HueConfiguration {
  const defaultHueConfiguration = {
    bridge: new BridgeConfiguration(),
    defaultGroup: '',
    ambientLights: {
      enabled: false,
      rules: defaultAmbientLightsRules
    }
  };
  const existingHueConfiguration = (vscode.workspace.getConfiguration()).get<HueConfiguration>('hue', defaultHueConfiguration);
  if (existingHueConfiguration) {
    if (existingHueConfiguration.bridge) {
      existingHueConfiguration.bridge = new BridgeConfiguration(
        existingHueConfiguration.bridge.id,
        existingHueConfiguration.bridge.ipAddress,
        existingHueConfiguration.bridge.username
      );
    }
  }
  return existingHueConfiguration;
}