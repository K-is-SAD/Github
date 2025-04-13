"use client";
import React, { useState, useEffect } from "react";
import Grid from "@/components/grids/Index";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { 
  IconUserCircle, 
  IconBrandGithub,
  IconKey,
  IconCheck, 
  IconX,
  IconTemplate,
  IconHistory
} from "@tabler/icons-react";
import Link from "next/link";

interface UserPreferences {
  darkMode: boolean;
  useAI: boolean;
  defaultTemplate?: string;
}

interface Template {
  _id: string;
  name: string;
}

interface UserStats {
  totalRepositories: number;
  totalReadmes: number;
  totalArticles: number;
  savedTemplates: number;
}

interface UserActivity {
  _id: string;
  type: string;
  title: string;
  timestamp: string;
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [preferences, setPreferences] = useState<UserPreferences>({
    darkMode: true,
    useAI: true,
  });
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalRepositories: 0,
    totalReadmes: 0,
    totalArticles: 0,
    savedTemplates: 0
  });
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [githubToken, setGithubToken] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoaded || !user) return;
      
      try {
        // Fetch user preferences
        const userResponse = await fetch('/api/user');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setPreferences({
            darkMode: userData.preferences?.darkMode ?? true,
            useAI: userData.preferences?.useAI ?? true,
            defaultTemplate: userData.preferences?.defaultTemplate || ""
          });
          
          // Set GitHub info if available
          if (userData.githubUsername) {
            // Token is just a placeholder, in a real app we wouldn't expose the actual token
            setGithubToken("••••••••••••••••••••");
          }
        }
        
        // Fetch templates for dropdown
        const templatesResponse = await fetch('/api/templates');
        if (templatesResponse.ok) {
          const templatesData = await templatesResponse.json();
          setTemplates(templatesData);
        }
        
        // Mock user statistics 
        setStats({
          totalRepositories: 8,
          totalReadmes: 14,
          totalArticles: 3,
          savedTemplates: 5
        });
        
        // Mock activity data
        setActivity([
          { 
            _id: "1", 
            type: "readme", 
            title: "Generated README for project-x", 
            timestamp: new Date(Date.now() - 3600000).toISOString() 
          },
          { 
            _id: "2", 
            type: "repository", 
            title: "Added repository user/awesome-project", 
            timestamp: new Date(Date.now() - 86400000).toISOString() 
          },
          { 
            _id: "3", 
            type: "template", 
            title: "Created new template 'Technical Documentation'", 
            timestamp: new Date(Date.now() - 172800000).toISOString() 
          },
          { 
            _id: "4", 
            type: "article", 
            title: "Published article 'How to document your API'", 
            timestamp: new Date(Date.now() - 259200000).toISOString() 
          },
          { 
            _id: "5", 
            type: "repository", 
            title: "Added repository user/api-service", 
            timestamp: new Date(Date.now() - 345600000).toISOString() 
          }
        ]);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [isLoaded, user]);
  
  const handlePreferenceChange = (key: keyof UserPreferences, value: unknown) => {
      setPreferences(prev => ({
        ...prev,
        [key]: value as boolean | string | undefined
      }));
    
    setSaveSuccess(null); // Reset save status when changes are made
  };
  
  const handleSave = async () => {
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });
      
      setSaveSuccess(response.ok);
      
      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      setSaveSuccess(false);
    }
  };

  const handleConnectGitHub = async () => {
    setIsConnecting(true);
    try {
      // In a real application, this would redirect to GitHub OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      setGithubToken("••••••••••••••••••••");
    } catch (error) {
      console.error("Error connecting to GitHub:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'readme':
        return <IconTemplate size={18} className="text-blue-500" />;
      case 'repository':
        return <IconBrandGithub size={18} className="text-green-500" />;
      case 'template':
        return <IconHistory size={18} className="text-purple-500" />;
      case 'article':
        return <IconHistory size={18} className="text-yellow-500" />;
      default:
        return <IconHistory size={18} />;
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen">
      <div className="absolute inset-0">
        <Grid />
      </div>
      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Profile Header */}
            <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-500">
              <div className="absolute -bottom-12 left-8">
                {user?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={user.imageUrl} 
                    alt={user.fullName || 'User'} 
                    className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-800">
                    <IconUserCircle size={50} />
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-16 pb-8 px-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold">{user?.fullName || user?.username || 'User'}</h1>
                  <p className="text-gray-600 dark:text-gray-400">{user?.primaryEmailAddress?.emailAddress}</p>
                  {user?.publicMetadata && 'githubUsername' in (user.publicMetadata as Record<string, unknown>) && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      GitHub: @{(user.publicMetadata as Record<string, unknown>).githubUsername as string}
                    </p>
                  )}
                </div>
                <Button className="rounded-md dark:bg-white bg-black">
                  <span className="flex items-center -translate-x-1 -translate-y-1 rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-2 hover:-translate-y-2 active:translate-x-0 active:translate-y-0 transition-all">
                    Edit Profile
                  </span>
                </Button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "profile"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "settings"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "activity"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Activity
                  </button>
                  <button
                    onClick={() => setActiveTab("connections")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "connections"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Connections
                  </button>
                </nav>
              </div>

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-medium mb-4">Usage Statistics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-blue-700 dark:text-blue-300">Repositories</span>
                          <IconBrandGithub className="text-blue-500" size={20} />
                        </div>
                        <p className="text-2xl font-bold mt-2">{stats.totalRepositories}</p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-green-700 dark:text-green-300">READMEs</span>
                          <IconTemplate className="text-green-500" size={20} />
                        </div>
                        <p className="text-2xl font-bold mt-2">{stats.totalReadmes}</p>
                      </div>
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-yellow-700 dark:text-yellow-300">Articles</span>
                          <IconHistory className="text-yellow-500" size={20} />
                        </div>
                        <p className="text-2xl font-bold mt-2">{stats.totalArticles}</p>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-purple-700 dark:text-purple-300">Templates</span>
                          <IconTemplate className="text-purple-500" size={20} />
                        </div>
                        <p className="text-2xl font-bold mt-2">{stats.savedTemplates}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      {activity.slice(0, 3).map(item => (
                        <div key={item._id} className="flex items-start gap-3 py-3 border-b dark:border-gray-700 last:border-b-0">
                          <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                            {getActivityIcon(item.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{item.title}</p>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(item.timestamp)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center mt-4">
                      <button 
                        onClick={() => setActiveTab("activity")}
                        className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                      >
                        View all activity
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <Link href="/codebase">
                        <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                          <IconBrandGithub size={24} className="mb-2" />
                          <span className="text-sm font-medium">Add Repository</span>
                        </div>
                      </Link>
                      <Link href="/templates">
                        <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                          <IconTemplate size={24} className="mb-2" />
                          <span className="text-sm font-medium">Browse Templates</span>
                        </div>
                      </Link>
                      <Link href="/editor">
                        <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                          <IconHistory size={24} className="mb-2" />
                          <span className="text-sm font-medium">New Article</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div>
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Preferences</h3>
                        <div className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium">Use AI for content generation</label>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Enable AI-powered features to enhance content creation
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={preferences.useAI}
                                onChange={(e) => handlePreferenceChange('useAI', e.target.checked as boolean)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium">Dark Mode</label>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Enable dark mode for a better viewing experience in low light
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={preferences.darkMode}
                                onChange={(e) => handlePreferenceChange('darkMode', e.target.checked as boolean)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Default Template</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              Choose a template that will be used as default when creating new content
                            </p>
                            <select
                              value={preferences.defaultTemplate}
                              onChange={(e) => handlePreferenceChange('defaultTemplate', e.target.value as string)}
                              className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                            >
                              <option value="">Select a default template</option>
                              {templates.map((template) => (
                                <option key={template._id} value={template._id}>
                                  {template.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="pt-4 flex items-center">
                            <Button 
                              onClick={handleSave}
                              className="rounded-md dark:bg-white bg-black"
                            >
                              <span className="block -translate-x-1 -translate-y-1 rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-2 hover:-translate-y-2 active:translate-x-0 active:translate-y-0 transition-all">
                                Save Preferences
                              </span>
                            </Button>
                            
                            {saveSuccess !== null && (
                              <div className={`ml-4 flex items-center ${saveSuccess ? 'text-green-600' : 'text-red-600'}`}>
                                {saveSuccess ? (
                                  <>
                                    <IconCheck size={16} className="mr-1" />
                                    <span className="text-sm">Settings saved!</span>
                                  </>
                                ) : (
                                  <>
                                    <IconX size={16} className="mr-1" />
                                    <span className="text-sm">Failed to save</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Account</h3>
                        <div className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <div className="flex items-center">
                              <input 
                                type="email"
                                value={user?.primaryEmailAddress?.emailAddress || ''}
                                readOnly
                                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500"
                              />
                              <Button className="ml-2 rounded-md bg-transparent border border-gray-300 dark:border-gray-600">
                                Change
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <div className="flex items-center">
                              <input 
                                type="password"
                                value="••••••••••••"
                                readOnly
                                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500"
                              />
                              <Button className="ml-2 rounded-md bg-transparent border border-gray-300 dark:border-gray-600">
                                Change
                              </Button>
                            </div>
                          </div>
                          
                          <div className="pt-4">
                            <button className="text-red-600 dark:text-red-400 text-sm hover:underline">
                              Delete account
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === "activity" && (
                <div>
                  <h2 className="text-lg font-medium mb-4">Activity History</h2>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg">
                    {activity.map(item => (
                      <div 
                        key={item._id} 
                        className="flex items-start gap-3 p-4 border-b dark:border-gray-700 last:border-b-0"
                      >
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                          {getActivityIcon(item.type)}
                        </div>
                        <div className="flex-1">
                          <p>{item.title}</p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(item.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {activity.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">No activity to display</p>
                    </div>
                  )}
                </div>
              )}

              {/* Connections Tab */}
              {activeTab === "connections" && (
                <div>
                  <h2 className="text-lg font-medium mb-4">Connected Services</h2>
                  
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg mb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <IconBrandGithub size={32} className="mt-1" />
                        <div>
                          <h3 className="font-medium">GitHub</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Connect your GitHub account to access private repositories
                          </p>
                          {githubToken && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                              Connected ✓
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        className={`rounded-md ${githubToken ? 'bg-transparent border border-gray-300 dark:border-gray-600' : 'dark:bg-white bg-black'}`}
                        onClick={handleConnectGitHub}
                        disabled={isConnecting}
                      >
                        {githubToken ? (
                          "Disconnect"
                        ) : (
                          <span className="flex items-center -translate-x-1 -translate-y-1 rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-2 hover:-translate-y-2 active:translate-x-0 active:translate-y-0 transition-all">
                            {isConnecting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                                Connecting...
                              </>
                            ) : (
                              <>Connect</>
                            )}
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <h2 className="text-lg font-medium mb-4">API Keys</h2>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
                    <div className="flex items-start space-x-4">
                      <IconKey size={32} className="mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium">API Access</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Generate an API key to access our services programmatically
                        </p>
                        
                        <div className="mt-4 flex items-center">
                          <input 
                            type="text"
                            value="••••••••••••••••••••••••••••••"
                            readOnly
                            className="w-full p-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500"
                          />
                          <button 
                            className="p-2 rounded-r-md bg-gray-200 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                        
                        <div className="mt-4">
                          <Button className="rounded-md dark:bg-white bg-black">
                            <span className="block -translate-x-1 -translate-y-1 rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-2 hover:-translate-y-2 active:translate-x-0 active:translate-y-0 transition-all">
                              Generate New Key
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}