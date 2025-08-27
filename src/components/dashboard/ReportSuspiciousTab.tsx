import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Upload, 
  Shield, 
  Globe, 
  Mail, 
  Phone,
  Send,
  Eye,
  Clock,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReports } from "@/hooks/useReports";

const ReportSuspiciousTab = () => {
  const [reportData, setReportData] = useState({
    entity_type: "",
    entity_value: "",
    threat_level: "",
    description: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { createSuspiciousReport, uploadFile, suspiciousReports, loading } = useReports();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Upload files first if any
      let fileUrls: string[] = [];
      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const tempId = Date.now().toString();
          const result = await uploadFile(file, tempId);
          return result.data;
        });
        
        const uploadResults = await Promise.all(uploadPromises);
        fileUrls = uploadResults.filter(url => url !== null) as string[];
      }

      // Create the suspicious report
      const { data: report, error: reportError } = await createSuspiciousReport({
        entity_type: reportData.entity_type,
        entity_value: reportData.entity_value,
        description: reportData.description,
        threat_level: reportData.threat_level || 'medium',
        evidence_files: fileUrls.length > 0 ? fileUrls : null
      });

      if (reportError || !report) {
        throw new Error(reportError?.message || 'Failed to create report');
      }

      toast({
        title: "Report Submitted",
        description: "Your suspicious activity report has been submitted successfully and is under review."
      });

      // Reset form
      setReportData({
        entity_type: "",
        entity_value: "",
        threat_level: "",
        description: "",
      });
      setFiles([]);

    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getThreatLevelColor = (threatLevel: string) => {
    switch (threatLevel) {
      case "critical": return "text-red-600 border-red-600";
      case "high": return "text-orange-600 border-orange-600";
      case "medium": return "text-yellow-600 border-yellow-600";
      case "low": return "text-green-600 border-green-600";
      default: return "text-gray-600 border-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "text-green-600 border-green-600";
      case "investigating": return "text-blue-600 border-blue-600";
      case "reported": return "text-yellow-600 border-yellow-600";
      case "false_positive": return "text-red-600 border-red-600";
      default: return "text-gray-600 border-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "reported": return "Reported";
      case "investigating": return "Investigating";
      case "verified": return "Verified";
      case "false_positive": return "False Positive";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> If you've discovered an immediate security threat, 
          please contact our emergency response team immediately at emergency@cybersecure.com 
          or call +1 (555) 999-CYBER.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit Suspicious Activity Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Report Suspicious Activity
            </CardTitle>
            <CardDescription>
              Report potential security threats, malware, phishing attempts, or other suspicious activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="entity_type">Entity Type</Label>
                <Select
                  value={reportData.entity_type}
                  onValueChange={(value) => setReportData({...reportData, entity_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile_app">Mobile App</SelectItem>
                    <SelectItem value="phone_number">Phone Number</SelectItem>
                    <SelectItem value="social_media_id">Social Media ID</SelectItem>
                    <SelectItem value="upi_id">UPI ID</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entity_value">Entity Value</Label>
                <Input
                  id="entity_value"
                  placeholder="Enter the suspicious entity (URL, phone number, app name, etc.)"
                  value={reportData.entity_value}
                  onChange={(e) => setReportData({...reportData, entity_value: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="threat_level">Threat Level</Label>
                  <Select
                    value={reportData.threat_level}
                    onValueChange={(value) => setReportData({...reportData, threat_level: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select threat level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the suspicious activity in detail. Include what happened, when it occurred, and any relevant context..."
                  value={reportData.description}
                  onChange={(e) => setReportData({...reportData, description: e.target.value})}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="files">Evidence Files</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  <input
                    type="file"
                    id="files"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.jpg,.png,.eml,.msg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="files"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Upload screenshots, emails, or other evidence
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PDF, DOC, TXT, JPG, PNG, EML, MSG (Max 25MB each)
                    </span>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <span className="text-sm">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Submitting Report...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Suspicious Activity Report
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Tips
            </CardTitle>
            <CardDescription>
              How to identify and handle suspicious activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Phishing Emails</h4>
                  <p className="text-sm text-muted-foreground">
                    Look for spelling errors, urgent language, suspicious links, or requests for personal information
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Suspicious Websites</h4>
                  <p className="text-sm text-muted-foreground">
                    Check for HTTPS, verify domain names, and be cautious of pop-ups or download prompts
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Social Engineering</h4>
                  <p className="text-sm text-muted-foreground">
                    Be wary of unsolicited calls requesting passwords, access codes, or personal information
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Immediate Actions</h4>
                  <p className="text-sm text-muted-foreground">
                    Don't click suspicious links, don't provide credentials, disconnect if compromised
                  </p>
                </div>
              </div>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Remember:</strong> When in doubt, report it! It's better to report 
                a false alarm than to miss a real security threat.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Recent Suspicious Activity Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Your Recent Reports</CardTitle>
          <CardDescription>
            Track the status of your submitted suspicious activity reports ({suspiciousReports.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : suspiciousReports.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
              <p className="text-muted-foreground">
                You haven't submitted any suspicious activity reports yet. Use the form above to submit your first report.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {suspiciousReports.map((report) => (
              <div
                key={report.id}
                      <h4 className="font-medium capitalize">{report.entity_type.replace('_', ' ')}</h4>
                      <Badge variant="outline" className={getThreatLevelColor(report.threat_level || 'medium')}>
                        {report.threat_level || 'medium'}
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{report.type}</h4>
                    <Badge variant="outline" className={getUrgencyColor(report.urgency)}>
                      {getStatusLabel(report.status)}
                    </Badge>
                  </div>
                      <p className="font-mono text-sm">{report.id.slice(0, 8)}...</p>
                    {report.status}
                  </Badge>
                      <span className="text-sm text-muted-foreground">Entity Value:</span>
                      <p className="text-sm truncate">{report.entity_value}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Report ID:</span>
                      <p className="text-sm">{new Date(report.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Source:</span>
                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {report.description}
                    </p>
                  </div>

                  {report.evidence_files && report.evidence_files.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Evidence Files:</p>
                      <p className="text-sm text-muted-foreground">
                        {report.evidence_files.length} file(s) attached
                      </p>
                    </div>
                  )}

                    <p className="text-sm">{report.source}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <p className="text-sm">{new Date(report.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { ReportSuspiciousTab };