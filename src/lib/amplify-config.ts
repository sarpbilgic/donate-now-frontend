import { Amplify } from 'aws-amplify';

// AWS Amplify Configuration for Cognito
export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
    },
  },
};

// Configure Amplify
export function configureAmplify() {
  try {
    Amplify.configure(amplifyConfig, { ssr: true });
    console.log('[Amplify] Configuration successful');
  } catch (error) {
    console.error('[Amplify] Configuration failed:', error);
  }
}

