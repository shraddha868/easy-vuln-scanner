import { useState } from 'react';
import { Clock, ExternalLink, Trash2, Eye, Calendar, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { ScanResult } from './SecurityScanner';

interface ScanHistoryProps {
  history: ScanResult[];
  onSelectScan: (result: ScanResult) => void;
  onClearHistory: () => void;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-medium';
  if (score >= 40) return 'text-high';
  return 'text-critical';
};

const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
  if (score >= 80) return 'default';
  if (score >= 60) return 'secondary';
  if (score >= 40) return 'outline';
  return 'destructive';
};

export const ScanHistory = ({ history, onSelectScan, onClearHistory }: ScanHistoryProps) => {
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);

  const handleViewScan = (scan: ScanResult) => {
    setSelectedScan(scan);
    onSelectScan(scan);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getTotalVulnerabilities = (scan: ScanResult) => {
    return scan.vulnerabilities.length;
  };

  const getCriticalCount = (scan: ScanResult) => {
    return scan.vulnerabilities.filter(v => v.severity === 'critical').length;
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scan History
          </CardTitle>
          <CardDescription>
            Your scan history will appear here
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No scans performed yet</p>
          <p className="text-sm text-muted-foreground">
            Start by scanning a website to see your results here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Scan History ({history.length})
              </CardTitle>
              <CardDescription>
                View and manage your previous security scans
              </CardDescription>
            </div>
            {history.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Clear History
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Scan History</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all scan history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onClearHistory}>
                      Clear History
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {history.map((scan) => (
            <div
              key={scan.id}
              className={`p-4 rounded-lg border transition-all hover:bg-muted/50 ${
                selectedScan?.id === scan.id ? 'bg-muted border-primary' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium truncate">{scan.url}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(scan.timestamp)}
                    </div>
                    <div>
                      Duration: {scan.scanDuration}s
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Security Score:</span>
                      <Badge 
                        variant={getScoreBadgeVariant(scan.overallScore)}
                        className={getScoreColor(scan.overallScore)}
                      >
                        {scan.overallScore}/100
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Issues:</span>
                      <Badge variant="outline">
                        {getTotalVulnerabilities(scan)} total
                      </Badge>
                      {getCriticalCount(scan) > 0 && (
                        <Badge className="bg-critical text-critical-foreground">
                          {getCriticalCount(scan)} critical
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewScan(scan)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>History Summary</CardTitle>
          <CardDescription>
            Overview of your scanning activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{history.length}</div>
              <div className="text-sm text-muted-foreground">Total Scans</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-critical">
                {history.reduce((acc, scan) => 
                  acc + scan.vulnerabilities.filter(v => v.severity === 'critical').length, 0
                )}
              </div>
              <div className="text-sm text-muted-foreground">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(history.reduce((acc, scan) => acc + scan.overallScore, 0) / history.length)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-info">
                {new Set(history.map(scan => new URL(scan.url).hostname)).size}
              </div>
              <div className="text-sm text-muted-foreground">Unique Sites</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};