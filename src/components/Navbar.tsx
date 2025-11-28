import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Shield, Menu, X, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        updateUserInfo(session.user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(session.user);
          updateUserInfo(session.user);
        } else {
          setUser(null);
          setUserRole('');
          setUserName('');
          localStorage.removeItem('firebaseUser');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const updateUserInfo = (user: any) => {
    // Check if this is a Firebase user
    const firebaseUser = localStorage.getItem('firebaseUser');
    if (firebaseUser) {
      const userData = JSON.parse(firebaseUser);
      setUserRole(userData.role);
      setUserName(userData.name);
    } else {
      // Use Supabase user metadata
      setUserRole(user.user_metadata?.role || 'owner');
      setUserName(user.user_metadata?.full_name || user.email?.split('@')[0]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('firebaseUser');
    setUser(null);
    setUserRole('');
    setUserName('');
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;
  const isAdmin = userRole === 'admin';

  // Don't show navbar on auth page
  if (location.pathname === '/auth') {
    return null;
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Electronic Number Plate (ENP) System</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                {isAdmin ? (
                  <>
                    <Link
                      to="/dashboard"
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/toll"
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        isActive('/toll') ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      Toll Management
                    </Link>
                    <Link
                      to="/vehicles"
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        isActive('/vehicles') ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      Vehicles
                    </Link>
                    <Link
                      to="/hardware"
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        isActive('/hardware') ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      Hardware
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/owner"
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive('/owner') ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    My Dashboard
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    {userName} ({userRole})
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              <Button asChild>
                <Link to="/auth">Login</Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-2">
              {user ? (
                <>
                  {isAdmin ? (
                    <>
                      <Link
                        to="/dashboard"
                        className="text-sm font-medium text-muted-foreground hover:text-primary py-2"
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/toll"
                        className="text-sm font-medium text-muted-foreground hover:text-primary py-2"
                        onClick={() => setIsOpen(false)}
                      >
                        Toll Management
                      </Link>
                      <Link
                        to="/vehicles"
                        className="text-sm font-medium text-muted-foreground hover:text-primary py-2"
                        onClick={() => setIsOpen(false)}
                      >
                        Vehicles
                      </Link>
                      <Link
                        to="/hardware"
                        className="text-sm font-medium text-muted-foreground hover:text-primary py-2"
                        onClick={() => setIsOpen(false)}
                      >
                        Hardware
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/owner"
                      className="text-sm font-medium text-muted-foreground hover:text-primary py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      My Dashboard
                    </Link>
                  )}
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      {userName} ({userRole})
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </Button>
                  </div>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="text-sm font-medium text-muted-foreground hover:text-primary py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
