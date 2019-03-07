import { Bridge } from "./bridge";
import { BridgeConfiguration } from "./config";
import { Groups } from "./group";

const RP = require('request-promise');

const HandleSuccessResponse = (response: any) => {
  if (typeof response === 'string') {
    return JSON.parse(response);
  }
  return response;
};

/**
 * Bridge APIs
 */
export class BridgeAPI {
  discover(): Thenable<Bridge[]> {
    const url = 'https://discovery.meethue.com';
    return RP.get(url).then(HandleSuccessResponse);
  }
}

/**
 * Base class for components that do not need a registered bridge
 */
abstract class UnregisteredBridgeAPI {
  id: string;
  ipAddress: string;
  baseUrl: string;

  constructor(bridge: Bridge) {
    this.id = bridge.id;
    this.ipAddress = bridge.internalipaddress;
    this.baseUrl = `http://${this.ipAddress}/api`;
  }
}

/**
 * Base class for components that needs a registered bridge
 */
abstract class RegisteredBridgeAPI extends UnregisteredBridgeAPI{
  username: string;

  constructor(bridge: BridgeConfiguration) {
    super({ id: bridge.id, internalipaddress: bridge.ipAddress });
    this.username = bridge.username;
    this.baseUrl = `${this.baseUrl}/${bridge.username}`;
  }
}

/**
 * Lights APIs
 */
export class LightsAPI extends RegisteredBridgeAPI {
  constructor(bridge: BridgeConfiguration) {
    super(bridge);
    this.baseUrl = `${this.baseUrl}/lights`;
  }

  async getNewLights() {
    const lightsSinceLastScan = await RP.get(`${this.baseUrl}/new`).then(HandleSuccessResponse);
    let lights = [];
    for (let key in lightsSinceLastScan) {
      if (key != 'lastscan') {
        lights.push(lightsSinceLastScan[key]);
      }
    }
    return lights;
  }

  searchLights() {
    return RP.post(this.baseUrl).then(HandleSuccessResponse);
  }

  getAllLights() {
    return RP.get(this.baseUrl).then(HandleSuccessResponse);
  }

  setLightState(lightID: number, state: any) {
    return RP.put(`${this.baseUrl}/${lightID}/state`, {
      json: true,
      body: state
    }).then(HandleSuccessResponse);
  }

  async setLightsState(lightIDs: number[], state: any): Promise<{}> {
    const lightPromises: Promise<{}>[] = [];
    for (const lightID of lightIDs) {
      lightPromises.push(this.setLightState(lightID, state));
    }
    return Promise.all(lightPromises);
  }

  async setAllLightsState(state: any): Promise<{}> {
    const lights = await this.getAllLights();
    const lightPromises: Promise<{}>[] = [];
    for (const lightID in lights) {
      lightPromises.push(this.setLightState(parseInt(lightID), state));
    }
    return Promise.all(lightPromises);
  }

  get() {
    return RP.get(this.baseUrl).then(HandleSuccessResponse);
  }
}

/**
 * Groups API
 */
export class GroupsAPI extends RegisteredBridgeAPI {
  constructor(bridge: BridgeConfiguration) {
    super(bridge);
    this.baseUrl = `${this.baseUrl}/groups`;
  }

  setGroupState(groupID: number, state: any) {
    return RP.put(`${this.baseUrl}/${groupID}/action`, {
      json: true,
      body: state
    }).then(HandleSuccessResponse)
  }

  setGroupsState(groupIDs: number[], state: any) {
    const groupPromises: Promise<{}>[] = [];
    for (const groupID of groupIDs) {
      groupPromises.push(this.setGroupState(groupID, state));
    }
    return Promise.all(groupPromises);
  }

  get(): Groups {
    return RP.get(this.baseUrl).then(HandleSuccessResponse);
  }
}

/**
 * Configuration API
 */
export class ConfigurationAPI extends UnregisteredBridgeAPI{
  createNewUser() {
    return RP.post(this.baseUrl, {
      json: true,
      body: {
          devicetype: `VSCodeExtension#Hue`
        }
      }).then(HandleSuccessResponse);
  }
}