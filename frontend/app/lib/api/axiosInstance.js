// import { default as axiosInstance } from "axios";
import axios from "axios";
import { applyRoutes } from "./mockAxiosRoutes";
// import MockAdapter from "axios-mock-adapter";

// axiosInstance.defaults.withCredentials = true;
axios.defaults.withCredentials = true;
console.log('Axios set in axiosInstance', axios);
// const mockAxios = new MockAdapter(axios, { onNoMatch: "throwException", delayResponse: 0 });
// const mock = applyRoutes(mockAxios);
// Return mockAxios if we are running a test, otherwise actual axios
// const axiosInstance = process.env.NODE_ENV === "test" ? mock : axios;
// export { axiosInstance as axios };
// export { axiosInstance as axios };
export { axios };