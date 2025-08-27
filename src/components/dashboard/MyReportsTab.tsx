import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useReports } from "@/hooks/useReports";
import { Skeleton } from "@/components/ui/skeleton";

export const MyReportsTab = () => {
  const { grievanceReports, suspiciousReports, loading } = useReports();

  // Combine both types of reports for display
  const allReports = [
    ...grievanceReports.map(report => ({
      ...report,
      type: 'grievance' as const,
      category: report.complaint_category,
      severity: report.priority_level
    })),
    ...suspiciousReports.map(report => ({
      ...report,
      type: 'suspicious' as const,
      title: `${report.entity_type.replace('_', ' ')} - ${report.entity_value}`,
      category: report.entity_type,
      severity: report.threat_level
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'reported':
        return <Clock className="h-4 w-4" />;
      case 'under_review':
      case 'investigating':
        return <AlertTriangle className="h-4 w-4" />;
      case 'resolved':
      case 'verified':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
      case 'false_positive':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
      case 'reported':
        return 'secondary' as const;
      case 'under_review':
      case 'investigating':
        return 'default' as const;
      case 'resolved':
      case 'verified':
        return 'default' as const;
      case 'rejected':
      case 'false_positive':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'reported': return 'Reported';
      case 'under_review': return 'Under Review';
      case 'investigating': return 'Investigating';
      case 'resolved': return 'Resolved';
      case 'verified': return 'Verified';
      case 'rejected': return 'Rejected';
      case 'false_positive': return 'False Positive';
      default: return status.replace('_', ' ');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              My Reports
            </CardTitle>
            <CardDescription>
              Track the status of your submitted reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Reports
          </CardTitle>
          <CardDescription>
            Track the status of your submitted reports ({allReports.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
              <p className="text-muted-foreground">
                You haven't submitted any reports. Use the other tabs to report grievances or suspicious activities.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allReports.map((report) => (
                <div
                  key={report.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{report.title}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {report.type} Report
                      </p>
                    </div>
                    <Badge variant={getStatusVariant(report.status)} className="flex items-center gap-1">
                      {getStatusIcon(report.status)}
                      {getStatusLabel(report.status)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {report.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      {report.category && (
                        <span className="capitalize">Category: {report.category}</span>
                      )}
                      {report.severity && (
                        <span className="capitalize">Severity: {report.severity}</span>
                      )}
                    </div>
                    <span>Submitted: {formatDate(report.created_at)}</span>
                  </div>
                  
                  {((report.type === 'grievance' && (report as any).evidence_files) || 
                    (report.type === 'suspicious' && (report as any).evidence_files)) && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Attachments:</p>
                      <p className="text-sm text-muted-foreground">
                        {((report as any).evidence_files || []).length} file(s) attached
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};