import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Shield, Mail, Lock, User, Languages } from "lucide-react";
import { toast } from "sonner";
import { Language, languages, translate } from "../utils/language";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface AuthProps {
  onSignIn: (userId: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function Auth({ onSignIn, language, onLanguageChange }: AuthProps) {
  const t = (key: string) => translate(language, key);
  
  const [signInForm, setSignInForm] = useState({ userId: "", password: "" });
  const [signUpForm, setSignUpForm] = useState({
    userId: "",
    email: "",
    password: "",
    confirmPassword: "",
    verificationCode: "",
  });
  const [showVerification, setShowVerification] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInForm.userId || !signInForm.password) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Sign in successful!");
    setTimeout(() => onSignIn(signInForm.userId), 500);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpForm.userId || !signUpForm.email || !signUpForm.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (signUpForm.password !== signUpForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (signUpForm.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setShowVerification(true);
    toast.success("Verification code sent!");
  };

  const handleVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpForm.verificationCode.length !== 6) {
      toast.error("Verification code must be 6 digits");
      return;
    }
    toast.success("Account verified!");
    setTimeout(() => onSignIn(signUpForm.userId), 500);
  };

  return (
    <div className="min-h-screen bg-[#010A13] dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0AC8B9]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C8AA6E]/10 rounded-full blur-3xl" />
        <div className="hextech-pattern w-full h-full opacity-30" />
      </div>

      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="border border-[#1E2328] hover:border-[#0AC8B9]/50 hover:bg-[#0AC8B9]/10"
            >
              <Languages className="h-5 w-5 text-[#0AC8B9]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#0A1428] border-[#1E2328] backdrop-blur-xl">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`cursor-pointer ${
                  language === lang.code 
                    ? 'bg-[#0AC8B9]/20 text-[#0AC8B9]' 
                    : 'hover:bg-[#1E2328] text-[#A09B8C]'
                }`}
              >
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-md bg-gradient-to-br from-[#0AC8B9] to-[#0A8B82] mb-4 border border-[#0BC6DE]/30 shadow-lg shadow-[#0AC8B9]/30">
            <Shield className="w-8 h-8 text-[#010A13]" />
          </div>
          <h1 className="text-[#F0E6D2] mb-2 tracking-wider">{t('signin.welcome')}</h1>
          <p className="text-[#A09B8C]">{t('signin.subtitle')}</p>
        </div>

        <Card className="border-[#1E2328] metal-frame hextech-corner backdrop-blur-xl">
          <CardHeader>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#0A1428] border border-[#1E2328] p-1">
                <TabsTrigger 
                  value="signin" 
                  onClick={() => setShowVerification(false)}
                  className="data-[state=active]:bg-[#0AC8B9]/20 data-[state=active]:text-[#0AC8B9] uppercase tracking-wider"
                >
                  {t('signin.title')}
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  onClick={() => setShowVerification(false)}
                  className="data-[state=active]:bg-[#0AC8B9]/20 data-[state=active]:text-[#0AC8B9] uppercase tracking-wider"
                >
                  {t('signup.title')}
                </TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="mt-0">
                <CardTitle className="mb-6 text-[#F0E6D2] tracking-wider">{t('signin.title')}</CardTitle>
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-[#C8AA6E] text-xs">{t('signin.userId')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0AC8B9]" />
                      <Input
                        type="text"
                        placeholder={t('signin.userId')}
                        value={signInForm.userId}
                        onChange={(e) => setSignInForm({ ...signInForm, userId: e.target.value })}
                        className="pl-10 bg-[#0A1428] border-[#1E2328] focus:border-[#0AC8B9]/50 text-[#F0E6D2] h-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#C8AA6E] text-xs">{t('signin.password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0AC8B9]" />
                      <Input
                        type="password"
                        placeholder={t('signin.password')}
                        value={signInForm.password}
                        onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                        className="pl-10 bg-[#0A1428] border-[#1E2328] focus:border-[#0AC8B9]/50 text-[#F0E6D2] h-10"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-[#0AC8B9] to-[#0A8B82] hover:from-[#0BC6DE] hover:to-[#0AC8B9] text-[#010A13] shadow-lg shadow-[#0AC8B9]/20 h-10 uppercase tracking-wider">
                    {t('signin.button')}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="mt-0">
                {!showVerification ? (
                  <>
                    <CardTitle className="mb-6 text-[#F0E6D2] tracking-wider">{t('signup.title')}</CardTitle>
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[#C8AA6E] text-xs">{t('signin.userId')}</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0AC8B9]" />
                          <Input
                            type="text"
                            value={signUpForm.userId}
                            onChange={(e) => setSignUpForm({ ...signUpForm, userId: e.target.value })}
                            className="pl-10 bg-[#0A1428] border-[#1E2328] focus:border-[#0AC8B9]/50 text-[#F0E6D2] h-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#C8AA6E] text-xs">{t('signup.email')}</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0AC8B9]" />
                          <Input
                            type="email"
                            value={signUpForm.email}
                            onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                            className="pl-10 bg-[#0A1428] border-[#1E2328] focus:border-[#0AC8B9]/50 text-[#F0E6D2] h-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#C8AA6E] text-xs">{t('signin.password')}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0AC8B9]" />
                          <Input
                            type="password"
                            value={signUpForm.password}
                            onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                            className="pl-10 bg-[#0A1428] border-[#1E2328] focus:border-[#0AC8B9]/50 text-[#F0E6D2] h-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#C8AA6E] text-xs">{t('signup.confirmPassword')}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0AC8B9]" />
                          <Input
                            type="password"
                            value={signUpForm.confirmPassword}
                            onChange={(e) => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })}
                            className="pl-10 bg-[#0A1428] border-[#1E2328] focus:border-[#0AC8B9]/50 text-[#F0E6D2] h-10"
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-[#0AC8B9] to-[#0A8B82] hover:from-[#0BC6DE] hover:to-[#0AC8B9] text-[#010A13] shadow-lg shadow-[#0AC8B9]/20 h-10 uppercase tracking-wider">
                        {t('signup.continueButton')}
                      </Button>
                    </form>
                  </>
                ) : (
                  <>
                    <CardTitle className="mb-6 text-[#F0E6D2] tracking-wider">{t('verify.title')}</CardTitle>
                    <form onSubmit={handleVerification} className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-[#C8AA6E] text-xs">{t('verify.code')}</Label>
                        <Input
                          type="text"
                          placeholder="000000"
                          maxLength={6}
                          value={signUpForm.verificationCode}
                          onChange={(e) => setSignUpForm({ ...signUpForm, verificationCode: e.target.value })}
                          className="text-center tracking-widest bg-[#0A1428] border-[#1E2328] focus:border-[#0AC8B9]/50 text-[#F0E6D2] h-12 text-lg"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-[#0AC8B9] to-[#0A8B82] hover:from-[#0BC6DE] hover:to-[#0AC8B9] text-[#010A13] shadow-lg shadow-[#0AC8B9]/20 h-10 uppercase tracking-wider">
                        {t('verify.button')}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-[#0AC8B9] hover:text-[#0BC6DE] hover:bg-[#0AC8B9]/10 uppercase tracking-wider"
                        onClick={() => toast.success(t('verify.resend'))}
                      >
                        {t('verify.resend')}
                      </Button>
                    </form>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
