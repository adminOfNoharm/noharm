"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { capitalize } from "@/lib/utils";
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchDashboardMetrics, fetchRecentActivity, formatTimestamp, formatStageName, getStatusColor, getStageBadgeColor, type ProfileMetrics, type StatusChange } from '@/lib/utils/dashboard-management';

interface OnboardingStage {
  stage_id: number;
  stage_name: string;
}

interface OnboardingProgress {
  uuid: string;
  stage_id: number;
  status: string;
  created_at: string;
  last_updated_at: string;
  onboarding_stages: {
    stage_id: number;
    stage_name: string;
  };
}

interface AdminDashboardProps {}

export default function AdminDashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<ProfileMetrics>({
    totalProfiles: 0,
    inReviewProfiles: 0,
    boardingProfiles: 0
  });
  const [recentActivity, setRecentActivity] = useState<StatusChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    fetchRecentActivityData();
  }, []);

  const fetchMetrics = async () => {
    try {
      const metricsData = await fetchDashboardMetrics();
      setMetrics(metricsData);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  const fetchRecentActivityData = async () => {
    try {
      const activityData = await fetchRecentActivity(20); // Limit to 20 most recent activities
      console.log("Recent activity data:", activityData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      not_started: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      in_review: 'bg-yellow-100 text-yellow-800',
      boarding: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || colors.not_started;
  };

  const getStageBadgeColor = (stageName: string) => {
    if (!stageName) {
      return 'bg-slate-100 text-slate-800';
    }
    
    const colors = {
      kyc: 'bg-fuchsia-100 text-fuchsia-800',
      contract_sign: 'bg-lime-100 text-lime-800',
      awaiting_payment: 'bg-purple-100 text-purple-800',
      tool_questionaire: 'bg-orange-100 text-orange-800',
      document_input: 'bg-sky-100 text-sky-800'
    };
    return colors[stageName.toLowerCase() as keyof typeof colors] || 'bg-slate-100 text-slate-800';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    // Format the full date
    const fullDate = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);

    // Format relative time
    let timeAgo;
    if (diffInSeconds < 60) {
      timeAgo = 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      timeAgo = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      timeAgo = `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      timeAgo = `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      timeAgo = fullDate;
    }

    return { timeAgo, fullDate };
  };

  const formatStageName = (stageName: string): string => {
    if (!stageName) {
      return 'Unknown Stage';
    }
    
    if (stageName.toLowerCase() === 'kyc') {
      return 'Initial Onboarding';
    }
    return stageName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link 
          href="/admin/analytics"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          View Analytics
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Total Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.totalProfiles}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Profiles In Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{metrics.inReviewProfiles}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Profiles Boarding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{metrics.boardingProfiles}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Status Changes</h2>
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const { timeAgo, fullDate } = formatTimestamp(activity.last_updated_status);
                  return (
                    <div 
                      key={`${activity.uuid}-${activity.last_updated_status}`}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-grow">
                        <p className="font-medium">{activity.email}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          {activity.is_stage_change ? (
                            <>
                              <span>Moved from</span>
                              {activity.previous_stage_name && (
                                <Badge className={getStageBadgeColor(activity.previous_stage_name)}>
                                  {formatStageName(activity.previous_stage_name)}
                                </Badge>
                              )}
                              <span>to</span>
                              {activity.stage_name && (
                                <Badge className={getStageBadgeColor(activity.stage_name)}>
                                  {formatStageName(activity.stage_name)}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <>
                              <span>Status changed in</span>
                              {activity.stage_name && (
                                <Badge className={getStageBadgeColor(activity.stage_name)}>
                                  {formatStageName(activity.stage_name)}
                                </Badge>
                              )}
                              <span>to</span>
                              <Badge className={getStatusColor(activity.status)}>
                                {activity.status ? capitalize(activity.status.replace('_', ' ')) : 'Unknown Status'}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <time 
                          className="text-sm text-gray-500"
                          title={fullDate}
                        >
                          {timeAgo}
                        </time>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/profile/${activity.uuid}`)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 