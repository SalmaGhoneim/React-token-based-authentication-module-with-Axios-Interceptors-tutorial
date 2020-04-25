import axios from "axios";
export const URL = "https://your/url.com";
export const API_URL = "https://your/api/url.com";
export const staging_URL = "https://your/staging/url.com";
export const my_app = axios.create({ baseURL: API_URL });
export const my_staging_app = axios.create({ baseURL: staging_URL_API });
