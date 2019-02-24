const RP = require('request-promise');

const HandleSuccess = (response: any) => {
  if (typeof response === 'string') {
    return JSON.parse(response);
  }
  return response;
};

const HandleError = (error: any) => {
  return error;
};

const Huetility = {
  discover: () => {
    const url = 'https://discovery.meethue.com';
    return RP.get(url)
        .then(HandleSuccess)
        .catch(HandleError);
  },
  lights: {
    new: (ipAddress: string, username: string): any[] => {
      const path = `api/${username}/lights/new`;
      return RP.get(`http://${ipAddress}/${path}`)
        .then(HandleSuccess)
        .catch(HandleError);
    },
    search: (ipAddress: string, username: string) => {
      const path = `api/${username}/lights`;
      return RP.post(`http://${ipAddress}/${path}`)
          .then(HandleSuccess)
          .catch(HandleError);
    },
    state: (ipAddress: string, username: string, state: object) => {
      const path = `api/${username}/lights/4/state`;
      return RP.put(`http://${ipAddress}/${path}`, {
        json: true,
        body: {
          ...state
        }
      })
        .then(HandleSuccess)
        .catch(HandleError);
    }
  },
  groups: () => {

  },
  configuration: {
    createUser: (ipAddress: string) => {
      const path = 'api';
      return RP.post(`http://${ipAddress}/${path}`, {
        json: true,
        body: {
            devicetype: `VSCodeExtension#Hue`
          }
        })
          .then(HandleSuccess)
          .catch(HandleError);
    }
  }
};


export default Huetility;