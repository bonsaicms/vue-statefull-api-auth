import axiosFactory from 'axios'

export function axiosHttpDriverFactory (config) {
  const axios = axiosFactory.create(config.http.config)

  return {
    request(endpointName, data) {
      return axios({
        data,
        method: config.apiEndpoints[endpointName].method,
        url: config.apiEndpoints[endpointName].url,
      }).then(response => response.data)
    }
  }
}
