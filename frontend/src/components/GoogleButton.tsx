import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';

const googleClientId = "572314882899-0iudn869neecp3qjhv3mhio5dt9340di.apps.googleusercontent.com"

interface props {
    handleGoogleSubmit: (credentialResponse: CredentialResponse) => Promise<void>,
    handleGoogleSubmitError: () => void,
}
const GoogleLoginButton: React.FC<props> = ({ handleGoogleSubmit, handleGoogleSubmitError }) => {

    return (
        <GoogleLogin
            onSuccess={handleGoogleSubmit}
            onError={handleGoogleSubmitError}
            theme="outline"
            size="large"
        />
    );
};

export default function GoogleButton({ handleGoogleSubmit, handleGoogleSubmitError }:
    {
        handleGoogleSubmit: (credentialResponse: CredentialResponse) => Promise<void>,
        handleGoogleSubmitError: () => void,
    }) {
    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <GoogleLoginButton handleGoogleSubmit={handleGoogleSubmit} handleGoogleSubmitError={handleGoogleSubmitError} />
        </GoogleOAuthProvider>
    );
}
