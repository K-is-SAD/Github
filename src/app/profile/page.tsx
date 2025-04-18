/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import Grid from "@/components/grids/Index";
import { useUser } from "@clerk/nextjs";
import {
  IconUserCircle,
  IconBrandGithub,
  IconTemplate,
  IconHistory,
} from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";

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
  const navLinks = [
    { id: "profile", label: "Profile" },
    { id: "activity", label: "Activity" },
    { id: "connections", label: "Connections" },
  ];

  const actionLinks = [
    {
      href: "/codebase",
      icon: IconBrandGithub,
      label: "Add Repository",
    },
    {
      href: "/templates",
      icon: IconTemplate,
      label: "Browse Templates",
    },
    {
      href: "/editor",
      icon: IconHistory,
      label: "New Article",
    },
  ];

  const { user, isLoaded } = useUser();
  console.log(user)
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [stats, setStats] = useState<UserStats>({
    totalRepositories: 0,
    totalReadmes: 0,
    totalArticles: 0,
    savedTemplates: 0,
  });
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [githubToken, setGithubToken] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoaded || !user) return;

      try {
        // Mock user statistics
        setStats({
          totalRepositories: 8,
          totalReadmes: 14,
          totalArticles: 3,
          savedTemplates: 5,
        });

        // Mock activity data
        setActivity([
          {
            _id: "1",
            type: "readme",
            title: "Generated README for project-x",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            _id: "2",
            type: "repository",
            title: "Added repository user/awesome-project",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            _id: "3",
            type: "template",
            title: "Created new template 'Technical Documentation'",
            timestamp: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            _id: "4",
            type: "article",
            title: "Published article 'How to document your API'",
            timestamp: new Date(Date.now() - 259200000).toISOString(),
          },
          {
            _id: "5",
            type: "repository",
            title: "Added repository user/api-service",
            timestamp: new Date(Date.now() - 345600000).toISOString(),
          },
        ]);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isLoaded, user]);

  const handleConnectGitHub = async () => {
    setIsConnecting(true);
    try {
      // In a real application, this would redirect to GitHub OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setGithubToken("••••••••••••••••••••");
    } catch (error) {
      console.error("Error connecting to GitHub:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "readme":
        return <IconTemplate size={18} className="text-blue-500" />;
      case "repository":
        return <IconBrandGithub size={18} className="text-green-500" />;
      case "template":
        return <IconHistory size={18} className="text-purple-500" />;
      case "article":
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
          <div className="dark:bg-black bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Profile Header */}
            <div className="relative h-32 bg-gradient-to-r from-blue-950 to-black">
              <div className="absolute -bottom-12 left-8">
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.fullName || "User"}
                    width={100}
                    height={100}
                    className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                  />
                ) : (
                  ""
                )}
              </div>
            </div>

            <div className="pt-16 pb-8 px-8">
              <div className="flex md:flex-row flex-col justify-between items-start space-y-6">
                <div>
                  <h1 className="text-2xl font-bold">
                    {user?.fullName || user?.username || "User"}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
                <button className="rounded-md dark:bg-white bg-black">
                  <span
                    className={` -translate-x-2 -translate-y-2 flex items-center justify-between rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-4 text-xl  
                hover:-translate-y-3 active:translate-x-0 active:translate-y-0 transition-all
               `}
                  >
                    Edit Profile
                  </span>
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => setActiveTab(link.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === link.id
                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                </nav>
                <div>
                  {activeTab === "profile"}
                  {activeTab === "activity"}
                  {activeTab === "connections"}
                </div>
              </div>

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-medium mb-4">
                      Usage Statistics
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-blue-700 dark:text-blue-300">
                            Repositories
                          </span>
                          <IconBrandGithub
                            className="text-blue-500"
                            size={20}
                          />
                        </div>
                        <p className="text-2xl font-bold mt-2">
                          {stats.totalRepositories}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-green-700 dark:text-green-300">
                            READMEs
                          </span>
                          <IconTemplate className="text-green-500" size={20} />
                        </div>
                        <p className="text-2xl font-bold mt-2">
                          {stats.totalReadmes}
                        </p>
                      </div>
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-yellow-700 dark:text-yellow-300">
                            Articles
                          </span>
                          <IconHistory className="text-yellow-500" size={20} />
                        </div>
                        <p className="text-2xl font-bold mt-2">
                          {stats.totalArticles}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-purple-700 dark:text-purple-300">
                            Templates
                          </span>
                          <IconTemplate className="text-purple-500" size={20} />
                        </div>
                        <p className="text-2xl font-bold mt-2">
                          {stats.savedTemplates}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h2 className="text-lg font-medium mb-4">
                      Recent Activity
                    </h2>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      {activity.slice(0, 3).map((item) => (
                        <div
                          key={item._id}
                          className="flex items-start gap-3 py-3 border-b dark:border-gray-700 last:border-b-0"
                        >
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {actionLinks.map((link, index) => {
                        const Icon = link.icon;
                        return (
                          <Link href={link.href} key={index}>
                            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                              <Icon size={24} className="mb-2" />
                              <span className="text-sm font-medium">
                                {link.label}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === "activity" && (
                <div>
                  <h2 className="text-lg font-medium mb-4">Activity History</h2>

                  <div className="bg-transparent rounded-lg">
                    {activity.map((item) => (
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
                      <p className="text-gray-500 dark:text-gray-400">
                        No activity to display
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Connections Tab */}
              {activeTab === "connections" && (
                <div>
                  <h2 className="text-lg font-medium mb-4">
                    Connected Services
                  </h2>

                  <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg mb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <IconBrandGithub size={32} className="mt-1" />
                        <div>
                          <h3 className="font-medium">GitHub</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Connect your GitHub account to access private
                            repositories
                          </p>
                          {githubToken && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                              Connected ✓
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                       className="dark:bg-white bg-black dark:text-black text-white py-2 px-4 rounded-md font-semibold dark:hover:bg-black dark:hover:text-white hover:bg-white hover:text-black"
                        onClick={handleConnectGitHub}
                        disabled={isConnecting}
                      >
                        {githubToken ? (
                          "Disconnect"
                        ) : (
                          <span>
                            {isConnecting ? (
                              <>
                                Connecting...
                              </>
                            ) : (
                              "Connect"
                            )}
                          </span>
                        )}
                      </button>
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
