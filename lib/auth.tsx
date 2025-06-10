import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

/**
 * Authentication Context with Integrated Legal Compliance
 * 
 * This provides enterprise-grade authentication with:
 * - GDPR-compliant user registration and consent management
 * - Age verification (16+) for UK data protection compliance
 * - AI content safety disclaimers and user awareness
 * - Comprehensive audit logging for legal protection
 * - Secure session management with privacy protection
 * 
 * Unlike basic auth systems, this integrates legal compliance
 * from day one, making Ingred industry-leading in user protection.
 */

// Legal consent data structure for GDPR compliance
export interface ConsentData {
  terms_version: string
  privacy_version: string
  age_confirmed: boolean
  marketing_consent: boolean
  analytics_consent: boolean
  ai_learning_consent: boolean
  ip_address: string
  user_agent: string
  consent_timestamp: string
}

// Authentication result with user-friendly messaging
export interface AuthResult {
  data?: any
  error?: Error | null
  message?: string
  success: boolean
}

// Authentication context interface
export interface AuthContextType {
  // Current authentication state
  user: User | null
  session: Session | null
  isLoading: boolean
  
  // Core authentication methods with legal compliance
  signUp: (email: string, password: string, legalConsent: ConsentData) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthResult>
  
  // Legal compliance methods
  updateConsent: (updates: Partial<ConsentData>) => Promise<AuthResult>
  getUserConsent: () => Promise<ConsentData | null>
  
  // Account management with GDPR rights
  exportUserData: () => Promise<AuthResult>
  deleteAccount: (reason?: string) => Promise<AuthResult>
}

// Create authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Authentication Provider Component
 * 
 * Wraps the entire app to provide authentication state and methods
 * with integrated legal compliance and security features.
 */
interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Authentication state
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for authentication state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)

      // Log authentication events for security audit (non-blocking)
      if (event === 'SIGNED_IN' && session?.user) {
        await logSecurityEventSafe(session.user.id, 'successful_login')
      } else if (event === 'SIGNED_OUT') {
        await logSecurityEventSafe(null, 'logout')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  /**
   * Simplified User Registration - Fixed Foreign Key Issues
   * This creates the user profile first, then handles logging
   */
  const signUp = async (
    email: string,
    password: string,
    legalConsent: ConsentData
  ): Promise<AuthResult> => {
    try {
      // Validate age requirement (16+) - UK GDPR compliance
      if (!legalConsent.age_confirmed) {
        return {
          success: false,
          error: new Error('You must be 16 or older to create an account'),
          message: 'Age verification is required by UK data protection law.'
        }
      }

      // Validate legal consent completeness
      if (!legalConsent.terms_version || !legalConsent.privacy_version) {
        return {
          success: false,
          error: new Error('Legal consent is required to create an account'),
          message: 'Please accept our Terms & Privacy Agreement to continue.'
        }
      }

      console.log('🔐 Creating user account with Supabase Auth...')

      // Step 1: Create user account with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: 'ingred://auth/verify-email',
          data: {
            app_name: 'Ingred',
            registration_source: 'mobile_app',
            terms_version: legalConsent.terms_version,
            privacy_version: legalConsent.privacy_version,
            age_confirmed: legalConsent.age_confirmed,
            registration_ip: legalConsent.ip_address
          }
        }
      })

      if (error) {
        console.error('Supabase Auth error:', error)
        return {
          success: false,
          error,
          message: 'Registration failed. Please try again.'
        }
      }

      if (!data.user) {
        return {
          success: false,
          error: new Error('User creation failed'),
          message: 'Registration failed. Please try again.'
        }
      }

      console.log('✅ User created in Supabase Auth, completing registration...')

      // Step 2: Complete registration using database function
      const { data: registrationResult, error: registrationError } = await supabase.rpc(
        'simple_user_registration',
        {
          p_user_id: data.user.id,
          p_email: email.toLowerCase().trim()
        }
      )

      if (registrationError || !registrationResult) {
        console.error('Registration completion error:', registrationError)
        return {
          success: false,
          error: registrationError,
          message: 'Registration failed during setup. Please contact support.'
        }
      }

      console.log('✅ Registration completed successfully!')

      // Step 3: Log security event (non-blocking, after profile creation)
      await logSecurityEventSafe(data.user.id, 'account_created')

      return {
        success: true,
        data,
        message: 'Account created successfully! Please check your email to verify your account.'
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: error as Error,
        message: 'An unexpected error occurred during registration.'
      }
    }
  }

  /**
   * Secure User Login with Security Logging
   */
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      })

      if (error) {
        // Log failed login attempts for security monitoring (non-blocking)
        await logSecurityEventSafe(null, 'failed_login', { 
          email: email.toLowerCase().trim(), 
          error: error.message 
        })
        
        return {
          success: false,
          error,
          message: 'Invalid email or password. Please try again.'
        }
      }

      return {
        success: true,
        data,
        message: 'Signed in successfully!'
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error as Error,
        message: 'An unexpected error occurred during login.'
      }
    }
  }

  /**
   * Password Reset with Improved Error Handling
   */
  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      console.log('🔄 Sending password reset email...')
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim()
      )

      // Log password reset request (non-blocking)
      await logSecurityEventSafe(null, 'password_reset_requested', { 
        email: email.toLowerCase().trim() 
      })

      if (error) {
        console.error('Password reset error:', error)
        return {
          success: false,
          error,
          message: 'Password reset failed. Please check your email and try again.'
        }
      }

      console.log('✅ Password reset email sent successfully')

      return {
        success: true,
        data,
        message: 'Password reset email sent! Check your email and click the link to reset your password.'
      }
    } catch (error) {
      console.error('Password reset error:', error)
      return {
        success: false,
        error: error as Error,
        message: 'An unexpected error occurred. Please try again.'
      }
    }
  }

  /**
   * Secure Logout
   */
  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error)
    }
  }

  /**
   * Update User Consent (GDPR Article 7.3 - Right to withdraw consent)
   */
  const updateConsent = async (updates: Partial<ConsentData>): Promise<AuthResult> => {
    if (!user) {
      return {
        success: false,
        error: new Error('User not authenticated'),
        message: 'Please sign in to update consent preferences.'
      }
    }

    try {
      const { error } = await supabase
        .from('user_consent')
        .update({
          ...updates,
          accepted_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) {
        return {
          success: false,
          error,
          message: 'Failed to update consent preferences. Please try again.'
        }
      }

      // Log consent update for audit trail (non-blocking)
      await logDataProcessingSafe(user.id, {
        processing_type: 'consent_update',
        data_categories: ['consent_preferences'],
        legal_basis: 'consent',
        purpose: 'User updated consent preferences'
      })

      return {
        success: true,
        message: 'Consent preferences updated successfully.'
      }
    } catch (error) {
      console.error('Consent update error:', error)
      return {
        success: false,
        error: error as Error,
        message: 'An unexpected error occurred while updating consent.'
      }
    }
  }

  /**
   * Get User Consent Information
   */
  const getUserConsent = async (): Promise<ConsentData | null> => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('user_consent')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        console.error('Failed to get user consent:', error)
        return null
      }

      return {
        terms_version: data.terms_accepted_version,
        privacy_version: data.privacy_accepted_version,
        age_confirmed: true, // Confirmed during registration
        marketing_consent: data.marketing_consent,
        analytics_consent: data.analytics_consent,
        ai_learning_consent: data.ai_learning_consent,
        ip_address: data.ip_address || '',
        user_agent: data.user_agent || '',
        consent_timestamp: data.accepted_at
      }
    } catch (error) {
      console.error('Error getting user consent:', error)
      return null
    }
  }

  /**
   * Export User Data (GDPR Article 20 - Right to data portability)
   */
  const exportUserData = async (): Promise<AuthResult> => {
    if (!user) {
      return {
        success: false,
        error: new Error('User not authenticated'),
        message: 'Please sign in to export your data.'
      }
    }

    try {
      // Call the database function for complete data export
      const { data, error } = await supabase.rpc('export_user_data', {
        user_uuid: user.id
      })

      if (error) {
        return {
          success: false,
          error,
          message: 'Data export failed. Please contact support if this continues.'
        }
      }

      return {
        success: true,
        data,
        message: 'Your data has been exported successfully.'
      }
    } catch (error) {
      console.error('Data export error:', error)
      return {
        success: false,
        error: error as Error,
        message: 'An unexpected error occurred during data export.'
      }
    }
  }

  /**
   * Delete User Account (GDPR Article 17 - Right to erasure)
   */
  const deleteAccount = async (reason: string = 'user_request'): Promise<AuthResult> => {
    if (!user) {
      return {
        success: false,
        error: new Error('User not authenticated'),
        message: 'Please sign in to delete your account.'
      }
    }

    try {
      // Call the database function for complete account deletion
      const { data, error } = await supabase.rpc('delete_user_data', {
        user_uuid: user.id,
        deletion_reason: reason
      })

      if (error || !data) {
        return {
          success: false,
          error,
          message: 'Account deletion failed. Please contact support for assistance.'
        }
      }

      // Sign out after successful deletion
      await signOut()

      return {
        success: true,
        message: 'Your account and all data have been permanently deleted.'
      }
    } catch (error) {
      console.error('Account deletion error:', error)
      return {
        success: false,
        error: error as Error,
        message: 'An unexpected error occurred during account deletion.'
      }
    }
  }

  // Context value with all authentication methods and state
  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateConsent,
    getUserConsent,
    exportUserData,
    deleteAccount
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to use authentication context
 * 
 * Provides type-safe access to authentication state and methods
 * throughout the app with integrated legal compliance.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Helper Functions for Legal Compliance and Security
 * These are now "safe" versions that won't block authentication if they fail
 */

/**
 * Safe data processing logging (non-blocking)
 */
async function logDataProcessingSafe(
  userId: string,
  log: {
    processing_type: string
    data_categories: string[]
    legal_basis: string
    purpose: string
    third_party_processor?: string
    retention_period?: string
  }
): Promise<void> {
  try {
    await supabase.from('data_processing_logs').insert({
      user_id: userId,
      processing_type: log.processing_type,
      data_categories: log.data_categories,
      legal_basis: log.legal_basis,
      processing_purpose: log.purpose,
      third_party_processor: log.third_party_processor,
      retention_period: log.retention_period
    })
  } catch (error) {
    console.error('Failed to log data processing (non-blocking):', error)
    // Don't throw - this is non-blocking
  }
}

/**
 * Safe security event logging (non-blocking)
 */
async function logSecurityEventSafe(
  userId: string | null,
  eventType: string,
  metadata?: any
): Promise<void> {
  try {
    await supabase.from('security_audit_logs').insert({
      user_id: userId,
      operation: eventType,
      success: true,
      attempted_at: new Date().toISOString(),
      security_risk_level: 'low',
      ...(metadata && { user_agent: JSON.stringify(metadata) })
    })
  } catch (error) {
    console.error('Failed to log security event (non-blocking):', error)
    // Don't throw - this is non-blocking
  }
}

/**
 * Helper function to get user IP address (for legal compliance)
 * In production, this would get the actual user IP
 * For privacy, we might use a hashed or anonymized version
 */
export const getUserIP = async (): Promise<string> => {
  // Placeholder - in production this would get actual IP
  return '0.0.0.0'
}

/**
 * Helper function to get user agent (for legal compliance)
 */
export const getUserAgent = async (): Promise<string> => {
  // Get device/app information for legal audit trail
  return 'Ingred Mobile App v1.0'
}

export default AuthProvider