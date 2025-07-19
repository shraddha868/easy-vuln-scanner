import { useState } from 'react';
import { Shield, Search, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ScanResults } from './ScanResults';
import { ScanHistory } from './ScanHistory';

export interface ScanResult {
  id: string;
  url: string;
  timestamp: Date;
  overallScore: number;
  vulnerabilities: Vulnerability[];
  scanDuration: number;
}

export interface Vulnerability {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  details?: string;
}

const MOCK_VULNERABILITIES: Vulnerability[] = [
  {
    id: '1',
    type: 'SSL/TLS',
    severity: 'medium',
    title: 'Weak SSL/TLS Configuration',
    description: 'The website uses older TLS protocols that may be vulnerable.',
    recommendation: 'Upgrade to TLS 1.3 and disable older protocols.',
    details: 'TLS 1.0 and 1.1 detected. These versions have known security issues.'
  },
  {
    id: '2',
    type: 'Headers',
    severity: 'high',
    title: 'Missing Security Headers',
    description: 'Critical security headers are not implemented.',
    recommendation: 'Implement Content-Security-Policy, X-Frame-Options, and HSTS headers.',
    details: 'Missing: Content-Security-Policy, X-Frame-Options, Strict-Transport-Security'
  },
  {
    id: '3',
    type: 'XSS',
    severity: 'critical',
    title: 'Cross-Site Scripting Vulnerability',
    description: 'Potential XSS vulnerability detected in user input fields.',
    recommendation: 'Implement proper input validation and output encoding.',
    details: 'Reflected XSS found in search parameter. Input: <script>alert(1)</script>'
  }
];

export const SecurityScanner = () => {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [activeTab, setActiveTab] = useState<'scanner' | 'history'>('scanner');
  const { toast } = useToast();

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const simulateScan = async (): Promise<ScanResult> => {
    const steps = [
      'Checking SSL certificate...',
      'Analyzing security headers...',
      'Testing for XSS vulnerabilities...',
      'Scanning for SQL injection...',
      'Checking open ports...',
      'Generating report...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress(((i + 1) / steps.length) * 100);
      
      toast({
        title: 'Scanning...',
        description: steps[i],
        duration: 800
      });
    }

    // Generate random vulnerabilities for demo
    const numVulns = Math.floor(Math.random() * 4) + 1;
    const selectedVulns = MOCK_VULNERABILITIES.slice(0, numVulns);
    
    const overallScore = Math.max(10, 100 - (selectedVulns.length * 15));

    return {
      id: Date.now().toString(),
      url,
      timestamp: new Date(),
      overallScore,
      vulnerabilities: selectedVulns,
      scanDuration: 4.8
    };
  };

  const handleScan = async () => {
    if (!validateUrl(url)) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid HTTP or HTTPS URL.',
        variant: 'destructive'
      });
      return;
    }

    setIsScanning(true);
    setProgress(0);
    setCurrentResult(null);

    try {
      const result = await simulateScan();
      setCurrentResult(result);
      setScanHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 scans
      
      toast({
        title: 'Scan Complete',
        description: `Found ${result.vulnerabilities.length} potential issues.`,
        variant: result.vulnerabilities.some(v => v.severity === 'critical') ? 'destructive' : 'default'
      });
    } catch (error) {
      toast({
        title: 'Scan Failed',
        description: 'An error occurred during the security scan.',
        variant: 'destructive'
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
              SecureScope
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive website security analysis tool. Scan for vulnerabilities, check SSL certificates, and get actionable security recommendations.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 justify-center">
          <Button
            variant={activeTab === 'scanner' ? 'default' : 'outline'}
            onClick={() => setActiveTab('scanner')}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Scanner
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'outline'}
            onClick={() => setActiveTab('history')}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            History ({scanHistory.length})
          </Button>
        </div>

        {activeTab === 'scanner' ? (
          <div className="space-y-6">
            {/* Scanner Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Website Security Scanner
                </CardTitle>
                <CardDescription>
                  Enter a website URL to perform a comprehensive security analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isScanning}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleScan}
                    disabled={isScanning || !url}
                    className="min-w-[120px]"
                  >
                    {isScanning ? 'Scanning...' : 'Start Scan'}
                  </Button>
                </div>

                {isScanning && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Scanning progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Scan Results */}
            {currentResult && <ScanResults result={currentResult} />}

            {/* Quick Stats */}
            {scanHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{scanHistory.length}</div>
                      <div className="text-sm text-muted-foreground">Total Scans</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-critical">
                        {scanHistory.reduce((acc, scan) => 
                          acc + scan.vulnerabilities.filter(v => v.severity === 'critical').length, 0
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">Critical Issues</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-high">
                        {scanHistory.reduce((acc, scan) => 
                          acc + scan.vulnerabilities.filter(v => v.severity === 'high').length, 0
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">High Issues</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(scanHistory.reduce((acc, scan) => acc + scan.overallScore, 0) / scanHistory.length)}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <ScanHistory 
            history={scanHistory} 
            onSelectScan={setCurrentResult}
            onClearHistory={() => setScanHistory([])}
          />
        )}
      </div>
    </div>
  );
};