import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '0771234567',
    nic: '200322700285',
    password: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [emailValidation, setEmailValidation] = useState({
    isValid: false,
    isTouched: false,
    message: ''
  });
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    isTouched: false,
    message: ''
  });
  const [passwordStrength, setPasswordStrength] = useState({
    isValid: false,
    isTouched: false,
    message: ''
  });
  const [phoneValidation, setPhoneValidation] = useState({
    isValid: false,
    isTouched: false,
    message: ''
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp, loginWithGoogle } = useAuth();

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return { isValid: false, message: 'Email is required' };
    }
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    return { isValid: true, message: 'Email looks good!' };
  };

  // Password matching validation function
  const validatePasswordMatch = (password: string, confirmPassword: string) => {
    if (!password && !confirmPassword) {
      return { isValid: false, message: 'Passwords are required' };
    }
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }
    if (!confirmPassword) {
      return { isValid: false, message: 'Please confirm your password' };
    }
    if (password !== confirmPassword) {
      return { isValid: false, message: 'Passwords do not match' };
    }
    return { isValid: true, message: 'Passwords match!' };
  };

  const handleInputChange = (field: string, value: string) => {
    // Normalize phone to digits only and cap at 10
    if (field === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, phone: digitsOnly }));

      // Real-time phone validation
      const isTen = /^\d{10}$/.test(digitsOnly);
      const msg = digitsOnly.length === 0
        ? 'Phone number is required'
        : isTen
          ? 'Phone number looks good!'
          : 'Phone number must be exactly 10 digits';
      setPhoneValidation({ isValid: isTen, isTouched: true, message: msg });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Real-time email validation
    if (field === 'email') {
      const validation = validateEmail(value);
      setEmailValidation({
        isValid: validation.isValid,
        isTouched: true,
        message: validation.message
      });
    }

  // Real-time password matching validation
    if (field === 'password' || field === 'confirmPassword') {
      const currentPassword = field === 'password' ? value : formData.password;
      const currentConfirmPassword = field === 'confirmPassword' ? value : formData.confirmPassword;
      
      const validation = validatePasswordMatch(currentPassword, currentConfirmPassword);
      setPasswordValidation({
        isValid: validation.isValid,
        isTouched: true,
        message: validation.message
      });
    }

  // Real-time password strength validation (on password change only)
  if (field === 'password') {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\[\]{}\-_=+,.?;:]).{8,}$/;
    const isStrong = strongRegex.test(value);
    setPasswordStrength({
      isValid: isStrong,
      isTouched: true,
      message: isStrong ? 'Strong password' : 'Use 8+ chars incl. upper, lower, number, and symbol'
    });
  }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) { setError('First name is required'); return false; }
    if (!formData.lastName.trim()) { setError('Last name is required'); return false; }
    if (!formData.email.trim()) { setError('Email address is required'); return false; }
    if (!emailValidation.isValid) { setError('Please enter a valid email address'); return false; }
    if (!formData.phone.trim()) { setError('Phone number is required'); return false; }
    if (!/^\d{10}$/.test(formData.phone)) { setError('Phone number must be exactly 10 digits'); return false; }
    if (!formData.nic.trim()) { setError('NIC number is required'); return false; }
    // Enforce strong password
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\[\]{}\-_=+,.?;:]).{8,}$/;
    if (!strongRegex.test(formData.password)) { setError('Password is too weak. Use 8+ chars with upper, lower, number, and symbol.'); return false; }
    if (!passwordValidation.isValid) { setError('Passwords do not match'); return false; }
    if (!agreeToTerms) { setError('You must agree to the Terms of Service and Privacy Policy'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.firstName, formData.lastName, formData.phone, formData.nic);
      toast({ title: 'Account Created Successfully!', description: 'Please check your email to verify your account' });
      
      // Redirect to email verification page
      navigate(`/verify-email?from=signup&email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      toast({ title: 'Sign-up Failed', description: err.message || 'Failed to create account', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast({ title: 'Google Sign-up Successful!', description: 'Welcome to SLT Prodigy Hub' });
      
      // Google users always go directly to qualification tab (since we can't control their email)
      navigate('/user?tab=qualification&from=signup');
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed. Please try again.');
      toast({ title: 'Google Sign-up Failed', description: err.message || 'Google sign-up failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src="/images/SLTBG.png" alt="SLT Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-lg p-8 space-y-6 shadow-lg">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="text-gray-800 text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <div className="w-8 h-1 bg-blue-400 rounded"></div>
                  <div className="w-8 h-1 bg-green-400 rounded"></div>
                </div>
                <div className="text-2xl font-bold">SLTMOBITEL</div>
                <div className="text-sm">The Connection</div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          </div>

                                <Button type="button" variant="outline" onClick={handleGoogleSignUp} disabled={isGoogleLoading} className="w-full bg-white text-gray-800 hover:text-gray-800 focus:text-gray-800 active:text-gray-900 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-gray-300 h-12 rounded-lg font-medium">
             {isGoogleLoading ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Signing Up...</>) : (
               <>
                 <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                 Sign up with Google
               </>
             )}
          </Button>

          <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div><div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gray-500">or</span></div></div>

          {error && (<Alert className="border-red-200 bg-red-50 text-red-700"><AlertDescription className="text-sm">{error}</AlertDescription></Alert>)}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="firstName" className="text-gray-700 text-sm">First Name *</Label><Input id="firstName" type="text" placeholder="First name" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} required disabled={isLoading} className="border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 focus:border-blue-500 focus:ring-blue-500" /></div>
              <div className="space-y-2"><Label htmlFor="lastName" className="text-gray-700 text-sm">Last Name *</Label><Input id="lastName" type="text" placeholder="Last name" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} required disabled={isLoading} className="border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 focus:border-blue-500 focus:ring-blue-500" /></div>
            </div>
                        <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 text-sm">Email Address *</Label>
              <div className="relative">
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your.email@example.com" 
                  value={formData.email} 
                  onChange={(e) => handleInputChange('email', e.target.value)} 
                  required 
                  disabled={isLoading} 
                  className={`border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 pr-12 focus:ring-blue-500 ${
                    emailValidation.isTouched 
                      ? emailValidation.isValid 
                        ? 'focus:border-green-500 border-green-500' 
                        : 'focus:border-red-500 border-red-500' 
                      : 'focus:border-blue-500'
                  }`}
                />
                {emailValidation.isTouched && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    {emailValidation.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {emailValidation.isTouched && (
                <p className={`text-xs ${
                  emailValidation.isValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {emailValidation.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 text-sm">Phone Number *</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="Phone number" 
                value={formData.phone} 
                onChange={(e) => handleInputChange('phone', e.target.value)} 
                required 
                disabled={isLoading} 
                maxLength={10} 
                className={`border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 focus:ring-blue-500 ${
                  phoneValidation.isTouched 
                    ? phoneValidation.isValid 
                      ? 'focus:border-green-500 border-green-500' 
                      : 'focus:border-red-500 border-red-500' 
                    : 'focus:border-blue-500'
                }`} 
              />
              {phoneValidation.isTouched && (
                <p className={`text-xs ${
                  phoneValidation.isValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {phoneValidation.message}
                </p>
              )}
            </div>
            <div className="space-y-2"><Label htmlFor="nic" className="text-gray-700 text-sm">Enter NIC *</Label><Input id="nic" type="text" placeholder="Enter your NIC number" value={formData.nic} onChange={(e) => handleInputChange('nic', e.target.value)} required disabled={isLoading} className="border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 focus:border-blue-500 focus:ring-blue-500" /></div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 text-sm">Password *</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Enter your password" 
                  value={formData.password} 
                  onChange={(e) => handleInputChange('password', e.target.value)} 
                  required 
                  disabled={isLoading} 
                  className={`border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 pr-12 focus:ring-blue-500 ${
                    passwordStrength.isTouched 
                      ? passwordStrength.isValid 
                        ? 'focus:border-green-500 border-green-500' 
                        : 'focus:border-red-500 border-red-500' 
                      : 'focus:border-blue-500'
                  }`}
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-100 text-gray-500" 
                  onClick={() => setShowPassword(!showPassword)} 
                  disabled={isLoading}
                >
                  {showPassword ? (<EyeOff className="h-4 w-4" />) : (<Eye className="h-4 w-4" />)}
                </Button>
              </div>
              {passwordStrength.isTouched && (
                <p className={`text-xs ${
                  passwordStrength.isValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {passwordStrength.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 text-sm">Confirm Password *</Label>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  placeholder="Confirm your password" 
                  value={formData.confirmPassword} 
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)} 
                  required 
                  disabled={isLoading} 
                  className={`border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 pr-12 focus:ring-blue-500 ${
                    passwordValidation.isTouched 
                      ? passwordValidation.isValid 
                        ? 'focus:border-green-500 border-green-500' 
                        : 'focus:border-red-500 border-red-500' 
                      : 'focus:border-blue-500'
                  }`}
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-100 text-gray-500" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (<EyeOff className="h-4 w-4" />) : (<Eye className="h-4 w-4" />)}
                </Button>
              </div>
              {passwordValidation.isTouched && (
                <p className={`text-xs ${
                  passwordValidation.isValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {passwordValidation.message}
                </p>
              )}
            </div>
            <div className="flex items-start space-x-2"><Checkbox id="agreeToTerms" checked={agreeToTerms} onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)} className="border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 mt-1" /><Label htmlFor="agreeToTerms" className="text-gray-700 text-sm leading-relaxed">I agree to the <Link to="/privacy-policy" className="text-blue-600 hover:underline font-medium">Terms of Service</Link> and <Link to="/privacy-policy" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link></Label></div>
            <div className="flex justify-center"><Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg h-12 w-full" disabled={isLoading}>{isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Account...</>) : ("Create Account")}</Button></div>
          </form>
        </div>

        <div className="text-center mt-4"><p className="text-white text-sm">Already have an account?{' '}<Link to="/login" className="text-blue-400 hover:underline font-medium">Sign in here</Link></p></div>
      </div>
    </div>
  );
}
