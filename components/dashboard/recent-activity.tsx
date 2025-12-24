'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Receipt, 
  FolderKanban, 
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'invoice' | 'quote' | 'project' | 'time';
  title: string;
  status: string;
  timestamp: Date;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'invoice',
        title: 'Invoice INV-001 created',
        status: 'sent',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
      {
        id: '2',
        type: 'quote',
        title: 'Quote QT-001 approved',
        status: 'approved',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        id: '3',
        type: 'project',
        title: 'Residential Building Project updated',
        status: 'in-progress',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      },
      {
        id: '4',
        type: 'time',
        title: 'Time entry logged',
        status: 'approved',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
    ];
    setActivities(mockActivities);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return <Receipt className="h-4 w-4 text-green-600" />;
      case 'quote':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'project':
        return <FolderKanban className="h-4 w-4 text-blue-600" />;
      case 'time':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'approved' || status === 'sent') {
      return <CheckCircle2 className="h-3 w-3 text-green-600" />;
    }
    return <XCircle className="h-3 w-3 text-gray-400" />;
  };

  return (
    <Card className="border-2 border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
              <div className="mt-0.5">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(activity.status)}
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

