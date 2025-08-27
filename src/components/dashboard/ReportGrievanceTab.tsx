import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Upload, Send, X, FileText, Clock, AlertCircle, CheckCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReports } from "@/hooks/useReports";

const ReportGrievanceTab = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    complaint_category: "",
    subcategory: "",
    location: "",
    priority_level: ""
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { createGrievanceReport, uploadFile, grievanceReports, loading } = useReports();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

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

      // Create the grievance report
      const { data: report, error: reportError } = await createGrievanceReport({
        title: formData.title,
        complaint_category: formData.complaint_category,
        subcategory: formData.subcategory || null,
        description: formData.description,
        location: formData.location,
        priority_level: formData.priority_level || 'medium',
        evidence_files: fileUrls.length > 0 ? fileUrls : null
      });

      if (reportError || !report) {
        throw new Error(reportError?.message || 'Failed to create report');
      }

      toast({
        title: "Report Submitted",
        description: "Your grievance report has been submitted successfully and is under review."
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        complaint_category: "",
        subcategory: "",
        location: "",
        priority_level: ""
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


  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "text-green-600 border-green-600";
      case "under_review": return "text-blue-600 border-blue-600";
      case "investigating": return "text-orange-600 border-orange-600";
      case "pending": return "text-yellow-600 border-yellow-600";
      case "rejected": return "text-red-600 border-red-600";
      default: return "text-gray-600 border-gray-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "text-red-600 border-red-600";
      case "high": return "text-orange-600 border-orange-600";
      case "medium": return "text-yellow-600 border-yellow-600";
      case "low": return "text-green-600 border-green-600";
      default: return "text-gray-600 border-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Pending";
      case "investigating": return "Investigating";
      case "resolved": return "Resolved";
      case "rejected": return "Rejected";
      case "under_review": return "Under Review";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit New Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submit New Grievance
            </CardTitle>
            <CardDescription>
              Report cybersecurity policy violations, access issues, or other concerns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Report Title</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the issue"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="complaint_category">Category</Label>
                  <Select
                    value={formData.complaint_category}
                    onValueChange={(value) => setFormData({...formData, complaint_category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cybercrime">Cybercrime</SelectItem>
                      <SelectItem value="fraud">Fraud</SelectItem>
                      <SelectItem value="harassment">Online Harassment</SelectItem>
                      <SelectItem value="privacy">Privacy Violation</SelectItem>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select
                    value={formData.priority_level}
                    onValueChange={(value) => setFormData({...formData, priority_level: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
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
                <Label htmlFor="subcategory">Subcategory (Optional)</Label>
                <Input
                  id="subcategory"
                  placeholder="Specific subcategory if applicable"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Where did this incident occur?"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the grievance..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="files">Supporting Documents</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  <input
                    type="file"
                    id="files"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="files"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload files or drag and drop
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PDF, DOC, TXT, JPG, PNG (Max 10MB each)
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
                    Submit Grievance Report
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Report Status Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Report Guidelines</CardTitle>
            <CardDescription>
              Important information about submitting grievance reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Be Specific</h4>
                  <p className="text-sm text-muted-foreground">
                    Provide detailed information including dates, times, and people involved
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Attach Evidence</h4>
                  <p className="text-sm text-muted-foreground">
                    Include screenshots, documents, or other supporting materials
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Response Time</h4>
                  <p className="text-sm text-muted-foreground">
                    Most reports are reviewed within 24-48 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Follow Up</h4>
                  <p className="text-sm text-muted-foreground">
                    You'll receive updates on your report status via email
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Existing Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Your Recent Reports</CardTitle>
          <CardDescription>
            Track the status of your submitted grievance reports ({grievanceReports.length} total)
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
          ) : grievanceReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
              <p className="text-muted-foreground">
                You haven't submitted any grievance reports yet. Use the form above to submit your first report.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {grievanceReports.map((report) => (
              <div
                key={report.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      <p className="font-mono text-sm">{report.id.slice(0, 8)}...</p>
                        {report.priority_level || 'medium'}
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{report.title}</h4>
                      <p className="text-sm capitalize">{report.complaint_category}</p>
                      {getStatusLabel(report.status)}
                    </Badge>
                      <span className="text-sm text-muted-foreground">Location:</span>
                      <p className="text-sm">{report.location}</p>
                    {report.status}
                  </Badge>
                </div>
                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {report.description}
                    </p>
                  <div>
                    <span className="text-sm text-muted-foreground">Category:</span>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>Submitted: {new Date(report.created_at).toLocaleDateString()}</span>
                    <span>Updated: {new Date(report.updated_at).toLocaleDateString()}</span>
                  </div>

                  {report.evidence_files && report.evidence_files.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Evidence Files:</p>
                      <p className="text-sm text-muted-foreground">
                        {report.evidence_files.length} file(s) attached
                      </p>
                    </div>
                  )}

                    <p className="text-sm">{report.category}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <p className="text-sm">{new Date(report.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Progress:</span>
                    <span className="text-sm font-medium">{report.progress}%</span>
                  </div>
                  <Progress value={report.progress} className="h-2" />
                </div>

                <div className="flex justify-end mt-3">
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

export { ReportGrievanceTab };