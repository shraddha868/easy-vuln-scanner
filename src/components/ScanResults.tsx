import { AlertTriangle, CheckCircle, Clock, ExternalLink, Shield, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import type { ScanResult, Vulnerability } from './SecurityScanner';

interface ScanResultsProps {
  result: ScanResult;
}

const getSeverityColor = (severity: Vulnerability['severity']) => {
  switch (severity) {
    case 'critical':
      return 'bg-critical text-critical-foreground';
    case 'high':
      return 'bg-high text-high-foreground';
    case 'medium':
      return 'bg-medium text-medium-foreground';
    case 'low':
      return 'bg-low text-low-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getSeverityIcon = (severity: Vulnerability['severity']) => {
  switch (severity) {
    case 'critical':
      return <XCircle className="h-4 w-4" />;
    case 'high':
      return <AlertTriangle className="h-4 w-4" />;
    case 'medium':
      return <AlertTriangle className="h-4 w-4" />;
    case 'low':
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <AlertTriangle className="h-4 w-4" />;
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-medium';
  if (score >= 40) return 'text-high';
  return 'text-critical';
};

export const ScanResults = ({ result }: ScanResultsProps) => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const criticalCount = result.vulnerabilities.filter(v => v.severity === 'critical').length;
  const highCount = result.vulnerabilities.filter(v => v.severity === 'high').length;
  const mediumCount = result.vulnerabilities.filter(v => v.severity === 'medium').length;
  const lowCount = result.vulnerabilities.filter(v => v.severity === 'low').length;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Score
            </div>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {result.scanDuration}s
            </Badge>
          </CardTitle>
          <CardDescription>
            Scanned {result.url} on {result.timestamp.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Security Score</span>
            <span className={`text-2xl font-bold ${getScoreColor(result.overallScore)}`}>
              {result.overallScore}/100
            </span>
          </div>
          <Progress 
            value={result.overallScore} 
            className="h-3"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-critical">{criticalCount}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-high">{highCount}</div>
              <div className="text-xs text-muted-foreground">High</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-medium">{mediumCount}</div>
              <div className="text-xs text-muted-foreground">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-low">{lowCount}</div>
              <div className="text-xs text-muted-foreground">Low</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vulnerabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Vulnerabilities Found ({result.vulnerabilities.length})
          </CardTitle>
          <CardDescription>
            Click on any vulnerability to view details and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.vulnerabilities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-success" />
              <p>No vulnerabilities found! Your website appears to be secure.</p>
            </div>
          ) : (
            result.vulnerabilities.map((vuln) => (
              <Collapsible key={vuln.id}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto hover:bg-muted/50"
                    onClick={() => toggleItem(vuln.id)}
                  >
                    <div className="flex items-center gap-3 text-left">
                      {getSeverityIcon(vuln.severity)}
                      <div className="flex-1">
                        <div className="font-medium">{vuln.title}</div>
                        <div className="text-sm text-muted-foreground">{vuln.description}</div>
                      </div>
                      <Badge className={getSeverityColor(vuln.severity)}>
                        {vuln.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <ExternalLink className={`h-4 w-4 transition-transform ${
                      openItems.includes(vuln.id) ? 'rotate-90' : ''
                    }`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Type</h4>
                      <Badge variant="outline">{vuln.type}</Badge>
                    </div>
                    
                    {vuln.details && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Technical Details</h4>
                        <p className="text-sm text-muted-foreground bg-background/50 p-2 rounded font-mono">
                          {vuln.details}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium text-sm mb-1">Recommendation</h4>
                      <p className="text-sm text-muted-foreground">{vuln.recommendation}</p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Recommended actions to improve your website's security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {criticalCount > 0 && (
            <div className="flex items-start gap-3 p-3 bg-critical/10 rounded-lg border border-critical/20">
              <XCircle className="h-5 w-5 text-critical mt-0.5" />
              <div>
                <p className="font-medium text-critical">Immediate Action Required</p>
                <p className="text-sm text-muted-foreground">
                  Address {criticalCount} critical {criticalCount === 1 ? 'vulnerability' : 'vulnerabilities'} immediately to prevent potential security breaches.
                </p>
              </div>
            </div>
          )}
          
          {highCount > 0 && (
            <div className="flex items-start gap-3 p-3 bg-high/10 rounded-lg border border-high/20">
              <AlertTriangle className="h-5 w-5 text-high mt-0.5" />
              <div>
                <p className="font-medium text-high">High Priority</p>
                <p className="text-sm text-muted-foreground">
                  Fix {highCount} high-severity {highCount === 1 ? 'issue' : 'issues'} within the next week.
                </p>
              </div>
            </div>
          )}
          
          {result.overallScore >= 80 && (
            <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-success">Good Security Posture</p>
                <p className="text-sm text-muted-foreground">
                  Your website has strong security measures. Continue monitoring and maintaining best practices.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};