"use client";

import { 
  signIn, 
  signUp, 
  signOut, 
  confirmSignUp,
  resendSignUpCode,
  getCurrentUser,
  fetchAuthSession,
  type SignInInput,
  type SignUpInput,
} from 'aws-amplify/auth';

/**
 * Authentication utilities for AWS Cognito
 */

export interface SignUpParams {
  email: string;
  password: string;
  name?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface ConfirmSignUpParams {
  email: string;
  code: string;
}

/**
 * Sign up a new user
 */
export async function signUpUser({ email, password, name }: SignUpParams) {
  try {
    const signUpParams: SignUpInput = {
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          ...(name && { name }),
        },
        autoSignIn: true,
      },
    };

    const { isSignUpComplete, userId, nextStep } = await signUp(signUpParams);

    return {
      success: true,
      isSignUpComplete,
      userId,
      nextStep,
    };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return {
      success: false,
      error: error.message || 'Failed to sign up',
    };
  }
}

/**
 * Confirm sign up with verification code
 */
export async function confirmSignUpUser({ email, code }: ConfirmSignUpParams) {
  try {
    const { isSignUpComplete, nextStep } = await confirmSignUp({
      username: email,
      confirmationCode: code,
    });

    return {
      success: true,
      isSignUpComplete,
      nextStep,
    };
  } catch (error: any) {
    console.error('Confirm sign up error:', error);
    return {
      success: false,
      error: error.message || 'Failed to confirm sign up',
    };
  }
}

/**
 * Resend verification code
 */
export async function resendConfirmationCode(email: string) {
  try {
    await resendSignUpCode({ username: email });
    return { success: true };
  } catch (error: any) {
    console.error('Resend code error:', error);
    return {
      success: false,
      error: error.message || 'Failed to resend code',
    };
  }
}

/**
 * Sign in user
 */
export async function signInUser({ email, password }: SignInParams) {
  try {
    const signInParams: SignInInput = {
      username: email,
      password,
    };

    const { isSignedIn, nextStep } = await signIn(signInParams);

    return {
      success: true,
      isSignedIn,
      nextStep,
    };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: error.message || 'Failed to sign in',
    };
  }
}

/**
 * Sign out user
 */
export async function signOutUser() {
  try {
    await signOut();
    return { success: true };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: error.message || 'Failed to sign out',
    };
  }
}

/**
 * Get current authenticated user
 */
export async function getAuthenticatedUser() {
  try {
    const user = await getCurrentUser();
    return {
      success: true,
      user: {
        userId: user.userId,
        username: user.username,
      },
    };
  } catch (error: any) {
    console.error('Get user error:', error);
    return {
      success: false,
      error: error.message || 'Not authenticated',
    };
  }
}

/**
 * Get current auth session with tokens
 */
export async function getAuthSession() {
  try {
    const session = await fetchAuthSession();
    
    if (!session.tokens) {
      return {
        success: false,
        error: 'No tokens available',
      };
    }

    return {
      success: true,
      idToken: session.tokens.idToken?.toString(),
      accessToken: session.tokens.accessToken?.toString(),
    };
  } catch (error: any) {
    console.error('Get session error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get session',
    };
  }
}

/**
 * Get ID token for API calls
 */
export async function getIdToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() || null;
  } catch (error) {
    console.error('Get ID token error:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}

