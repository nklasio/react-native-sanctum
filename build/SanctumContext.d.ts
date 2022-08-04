import * as React from "react";
export interface ContextProps {
    user: null | any;
    authenticated: null | boolean;
    signIn: (username: string, password: string, remember?: boolean) => Promise<{
        twoFactor: boolean;
        signedIn: boolean;
    }>;
    signOut: () => Promise<void>;
    twoFactorChallenge: (code: string, recovery?: boolean) => Promise<{}>;
    setUser: (user: object, authenticated?: boolean) => void;
    checkAuthentication: () => Promise<boolean>;
}
declare const SanctumContext: React.Context<ContextProps | undefined>;
export default SanctumContext;
