import React from "react";
import { AxiosInstance } from "axios";
export interface ConfigProps {
    apiUrl: string;
    csrfCookieRoute: string;
    signInRoute: string;
    signOutRoute: string;
    userObjectRoute: string;
    twoFactorChallengeRoute?: string;
    axiosInstance?: AxiosInstance;
    usernameKey?: string;
}
interface Props {
    config: ConfigProps;
    checkOnInit?: boolean;
    children: React.ReactNode;
}
declare const Sanctum: React.FC<Props>;
export default Sanctum;
