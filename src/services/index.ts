import axios, { AxiosInstance } from "axios";

class Api {
    axiosClient: AxiosInstance;

    constructor(){
        this.axiosClient = axios.create({
            baseURL: ""
        });
    }
}