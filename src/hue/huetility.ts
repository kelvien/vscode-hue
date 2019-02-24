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
  discover: function() {
    const url = 'https://discovery.meethue.com';
    return RP.get(url)
        .then(HandleSuccess)
        .catch(HandleError);
  },
  light: function() {
    const path = '/api';

  },
  group: function() {

  },
  configuration: {
    createUser: function(ipAddress: string) {
      const path = '/api';
      return RP.post(`http://${ipAddress}${path}`, {
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