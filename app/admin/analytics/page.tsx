'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';
import { Download } from 'lucide-react';
import { fetchEmailClickAnalytics, fetchUserJourney, exportAnalyticsData, type EmailMetrics, type EmailClickEvent, type AnalyticsEvent } from '@/lib/utils/analytics-management';

interface EventMetrics {
  uniqueEmailClicks: number;
  staticUsers: number;
}

interface OnboardingProgress {
  uuid: string;
  status: string;
  onboarding_stages: {
    stage_name: string;
  };
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<EmailMetrics>({
    uniqueEmailClicks: 0,
    staticUsers: 0
  });
  const [emailClickEvents, setEmailClickEvents] = useState<EmailClickEvent[]>([]);
  const [selectedUserEvents, setSelectedUserEvents] = useState<AnalyticsEvent[]>([]);
  const [isUserJourneyOpen, setIsUserJourneyOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [exportingData, setExportingData] = useState(false);
  const [currentExportEmail, setCurrentExportEmail] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { metrics, emailClickEvents } = await fetchEmailClickAnalytics();
      
      setMetrics(metrics);
      setEmailClickEvents(emailClickEvents);
    } catch (error) {
      console.error('Error in fetchAnalytics:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserJourneyData = async (email: string) => {
    try {
      setIsUserJourneyOpen(true); // Open modal immediately to show loading state
      setSelectedUserEvents([]); // Reset previous events

      console.log('Fetching user journey for email:', email);

      const events = await fetchUserJourney(email);
      
      setSelectedUserEvents(events);
    } catch (error) {
      console.error('Error in fetchUserJourney:', error);
      toast.error('Failed to fetch user journey');
      setIsUserJourneyOpen(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const formatEventType = (type: string): string => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredUserEvents = selectedEventType === 'all'
    ? selectedUserEvents
    : selectedUserEvents.filter(event => event.event_type === selectedEventType);

  // Function to export data
  const exportData = async () => {
    try {
      setExportingData(true);
      
      // Get the CSV file from the server
      const csvBlob = await exportAnalyticsData();
      
      // Create and download the CSV file
      const url = URL.createObjectURL(csvBlob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `email-clicks-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExportingData(false);
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
      setExportingData(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Unique Email Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{metrics.uniqueEmailClicks}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Static Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-yellow-600">{metrics.staticUsers}</p>
              <p className="text-sm text-gray-500">users haven't started their stages</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Email Link Clicks Table */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Email Link Clicks</h2>
          <Button 
            onClick={exportData} 
            disabled={emailClickEvents.length === 0 || exportingData}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            {exportingData ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Static Stage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emailClickEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimestamp(event.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.role || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {event.staticStage ? (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            {event.staticStage}
                          </Badge>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => fetchUserJourneyData(event.email)}
                        >
                          View Journey
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {emailClickEvents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No email click events found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* User Journey Modal */}
      <Dialog open={isUserJourneyOpen} onOpenChange={setIsUserJourneyOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Journey</DialogTitle>
          </DialogHeader>
          
          {selectedUserEvents.length > 0 ? (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  {selectedUserEvents[0]?.auth_user?.email}
                </h3>
                
                <Tabs defaultValue="all" value={selectedEventType} onValueChange={setSelectedEventType}>
                  <TabsList>
                    <TabsTrigger value="all">All Events ({selectedUserEvents.length})</TabsTrigger>
                    {Array.from(new Set(selectedUserEvents.map(e => e.event_type))).map(type => (
                      <TabsTrigger key={type} value={type}>
                        {formatEventType(type)} ({selectedUserEvents.filter(e => e.event_type === type).length})
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="space-y-4">
                {filteredUserEvents.map((event) => (
                  <Card key={event.id}>
                    <CardHeader className="py-3 px-4">
                      <div className="flex justify-between items-center">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          {formatEventType(event.event_type)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(event.created_at)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                        {JSON.stringify(event.event_data, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredUserEvents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No events found for the selected filter
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-40">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 