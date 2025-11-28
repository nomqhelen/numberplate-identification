import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import tollSystemAPI from "@/services/api";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Firebase credential mapping
  const firebaseCredentials = [
    // Admin accounts
    { email: "admin@toll.gov.zw", password: "admin123", role: "admin", name: "System Administrator", id: "admin1" },
    { email: "tinevimbo.nyoni@zinara.co.zw", password: "admin123", role: "admin", name: "Tinevimbo Nyoni", id: "admin2" },
    
    // Owner accounts
    { email: "john.smith@gmail.com", password: "owner123", role: "owner", name: "John Smith", id: "owner1" },
    { email: "rebecca.too@gmail.com", password: "owner123", role: "owner", name: "Rebecca Too", id: "owner2" },
    { email: "charity.masiyiwa@gmail.com", password: "owner123", role: "owner", name: "Charity Masiyiwa", id: "owner3" },
    { email: "sarah.johnson@gmail.com", password: "owner123", role: "owner", name: "Sarah Johnson", id: "owner4" },
    { email: "lisa.moyo@gmail.com", password: "owner123", role: "owner", name: "Lisa Moyo", id: "owner5" },
    { email: "nomqhele.moyo@gmail.com", password: "owner123", role: "owner", name: "Nomqhele Moyo", id: "owner6" }
  ];

  useEffect(() => {
    // Check if user is already logged in and redirect based on role
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const userRole = getUserRole(session.user.email);
        if (userRole === 'admin') {
          navigate("/dashboard");
        } else {
          navigate("/owner");
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setTimeout(async () => {
          const userRole = getUserRole(session.user.email);
          if (userRole === 'admin') {
            navigate("/dashboard");
          } else {
            navigate("/owner");
          }
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getUserRole = (email: string | undefined): 'admin' | 'owner' => {
    if (!email) return 'owner';
    const credential = firebaseCredentials.find(cred => cred.email === email);
    return credential ? credential.role as 'admin' | 'owner' : 'owner';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // First, check if it's a Firebase credential
      const firebaseUser = firebaseCredentials.find(
        cred => cred.email === email && cred.password === password
      );

      if (firebaseUser) {
        // It's a Firebase credential, store user info in localStorage for your app to use
        const userData = {
          id: firebaseUser.id,
          email: firebaseUser.email,
          name: firebaseUser.name,
          role: firebaseUser.role
        };
        
        localStorage.setItem('firebaseUser', JSON.stringify(userData));

        // Try to sign up/sign in with Supabase using a consistent pattern
        // We'll use a fixed password for all Firebase users in Supabase
        const supabasePassword = 'firebase123';
        
        // Try to sign in first
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: supabasePassword,
        });

        if (signInError) {
          // If sign in fails, try to sign up
          const { error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: supabasePassword,
            options: {
              data: {
                full_name: firebaseUser.name,
                role: firebaseUser.role
              }
            }
          });

          if (signUpError) {
            throw new Error('Failed to create Supabase account');
          }
          
          // After signup, sign in
          await supabase.auth.signInWithPassword({
            email: email,
            password: supabasePassword,
          });
        }

        toast({
          title: "Success",
          description: `Welcome ${firebaseUser.name}! Logged in as ${firebaseUser.role}`,
        });

        // Navigate based on role
        if (firebaseUser.role === 'admin') {
          navigate("/dashboard");
        } else {
          navigate("/owner");
        }

      } else {
        // Not a Firebase credential, try normal Supabase auth
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({
            title: "Login Failed",
            description: "Invalid credentials. Please use one of the demo accounts below.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Logged in successfully",
          });
        }
      }

    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !fullName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Account created! Please log in.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Electronic Number Plate (ENP) System</CardTitle>
            <CardDescription>Secure access to your toll management account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="admin@toll.gov.zw or john.smith@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
                
                <div className="mt-4 p-4 bg-muted rounded-lg text-sm space-y-3">
                  <p className="font-semibold">Demo Accounts:</p>
                  
                  <div className="space-y-2">
                    <p className="font-medium text-blue-600">🔧 Admin Accounts:</p>
                    <p><strong>Email:</strong> admin@toll.gov.zw</p>
                    <p><strong>Password:</strong> admin123</p>
                    <hr className="my-2 opacity-50"/>
                    <p><strong>Email:</strong> tinevimbo.nyoni@zinara.co.zw</p>
                    <p><strong>Password:</strong> admin123</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-green-600">👤 Vehicle Owner Accounts:</p>
                    <p><strong>Email:</strong> john.smith@gmail.com</p>
                    <p><strong>Password:</strong> owner123</p>
                    <hr className="my-2 opacity-50"/>
                    <p><strong>Email:</strong> rebecca.too@gmail.com</p>
                    <p><strong>Password:</strong> owner123</p>
                    <hr className="my-2 opacity-50"/>
                    <p><strong>Email:</strong> charity.masiyiwa@gmail.com</p>
                    <p><strong>Password:</strong> owner123</p>
                  </div>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
