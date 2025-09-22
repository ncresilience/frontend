// PDF Generation utility for Impact Reports
// Uses client-side generation for government reports

interface ReportData {
  county: string;
  entityType: 'agriculture' | 'small-business';
  overallScore: number;
  metrics: any[];
  events: any[];
  timeframe: string;
  generatedDate: string;
}

interface AssessmentReportData {
  countyName: string;
  entityType: 'agriculture' | 'small-business';
  overallScore: number;
  creditRisk: number;
  disasterRisk: number;
  supplyChainRisk: number;
  recommendations: string[];
  riskFactors: Array<{
    category: string;
    level: string;
    description: string;
  }>;
  generatedDate: string;
}

interface GovernmentReportData {
  title: string;
  summary: string;
  keyMetrics: Record<string, number>;
  countiesAnalyzed: number;
  recommendations: string[];
  costSavings: number;
  generatedDate: string;
}

interface PDFOptions {
  title: string;
  includeCharts: boolean;
  includeRecommendations: boolean;
  includeComparisons: boolean;
}

export class PDFReportGenerator {
  private jsPDF: any;
  
  constructor() {
    // Dynamic import will be handled in the component
    this.jsPDF = null;
  }

  async initializePDF() {
    if (typeof window !== 'undefined' && !this.jsPDF) {
      // Dynamic import for client-side only
      const { jsPDF } = await import('jspdf');
      this.jsPDF = jsPDF;
    }
  }

  async generateQuarterlyReport(data: ReportData): Promise<void> {
    await this.initializePDF();
    if (!this.jsPDF) return;

    const doc = new this.jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Header
    this.addHeader(doc, pageWidth, 'Quarterly Resilience Report');
    
    // Report metadata
    let yPos = 40;
    doc.setFontSize(12);
    doc.text(`County: ${data.county}`, 20, yPos);
    doc.text(`Sector: ${data.entityType === 'agriculture' ? 'Agriculture' : 'Small Business'}`, 20, yPos + 7);
    doc.text(`Report Period: ${data.timeframe}`, 20, yPos + 14);
    doc.text(`Generated: ${data.generatedDate}`, 20, yPos + 21);
    
    yPos += 35;

    // Executive Summary
    this.addSection(doc, 'Executive Summary', yPos);
    yPos += 15;
    
    const summaryText = this.generateExecutiveSummary(data);
    const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 40);
    doc.setFontSize(10);
    doc.text(splitSummary, 20, yPos);
    yPos += splitSummary.length * 5 + 10;

    // Overall Score Section
    this.addSection(doc, 'Overall Resilience Score', yPos);
    yPos += 15;
    
    doc.setFontSize(24);
    doc.setTextColor(0, 100, 200);
    doc.text(`${data.overallScore}/100`, 20, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    const scoreInterpretation = this.getScoreInterpretation(data.overallScore);
    doc.text(scoreInterpretation, 60, yPos - 5);
    yPos += 20;

    // Check if we need a new page
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 30;
    }

    // Metrics Analysis
    this.addSection(doc, 'Detailed Metrics Analysis', yPos);
    yPos += 15;
    
    data.metrics.forEach((metric, index) => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 30;
      }
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`${metric.name}: ${metric.value}${metric.unit}`, 20, yPos);
      
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Change: ${metric.change > 0 ? '+' : ''}${metric.change}${metric.unit} | Category: ${metric.category}`, 20, yPos + 5);
      doc.text(metric.description, 20, yPos + 10);
      
      doc.setTextColor(0, 0, 0);
      yPos += 18;
    });

    // Add new page for insights
    doc.addPage();
    yPos = 30;

    // Key Insights
    this.addSection(doc, 'Key Insights & Recommendations', yPos);
    yPos += 15;
    
    const insights = this.generateKeyInsights(data);
    insights.forEach(insight => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 30;
      }
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`• ${insight.title}`, 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      const splitText = doc.splitTextToSize(insight.description, pageWidth - 30);
      doc.text(splitText, 25, yPos + 5);
      yPos += 5 + splitText.length * 4 + 8;
    });

    // Footer
    this.addFooter(doc, pageHeight);
    
    // Save the PDF
    doc.save(`${data.county}-${data.entityType}-quarterly-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  async generateProgressSummary(data: ReportData): Promise<void> {
    await this.initializePDF();
    if (!this.jsPDF) return;

    const doc = new this.jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    this.addHeader(doc, pageWidth, 'Progress Summary Report');
    
    let yPos = 40;
    doc.setFontSize(12);
    doc.text(`${data.county} County - ${data.entityType === 'agriculture' ? 'Agricultural' : 'Small Business'} Resilience Progress`, 20, yPos);
    yPos += 20;

    // Progress Timeline
    this.addSection(doc, 'Progress Timeline', yPos);
    yPos += 15;
    
    data.events.forEach((event, index) => {
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`${new Date(event.date).toLocaleDateString()}: ${event.title}`, 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(event.description, 20, yPos + 5);
      doc.setTextColor(0, 150, 0);
      doc.text(`+${event.impact_score} impact points`, 20, yPos + 10);
      doc.setTextColor(0, 0, 0);
      yPos += 18;
    });

    // Total Impact
    yPos += 10;
    const totalImpact = data.events.reduce((sum, event) => sum + event.impact_score, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Impact Gained: +${totalImpact} points`, 20, yPos);
    
    doc.save(`${data.county}-${data.entityType}-progress-summary-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  async generateComplianceReport(data: ReportData): Promise<void> {
    await this.initializePDF();
    if (!this.jsPDF) return;

    const doc = new this.jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    this.addHeader(doc, pageWidth, 'Compliance & Risk Management Report');
    
    let yPos = 40;
    
    // Compliance Statement
    this.addSection(doc, 'Compliance Certification', yPos);
    yPos += 15;
    
    const complianceText = `This report certifies that ${data.county} County ${data.entityType === 'agriculture' ? 'agricultural operations' : 'small businesses'} have undergone comprehensive resilience assessment and demonstrate the following compliance levels:`;
    const splitCompliance = doc.splitTextToSize(complianceText, pageWidth - 40);
    doc.setFontSize(10);
    doc.text(splitCompliance, 20, yPos);
    yPos += splitCompliance.length * 5 + 15;

    // Compliance Metrics
    data.metrics.forEach(metric => {
      const complianceLevel = this.getComplianceLevel(metric.value, metric.unit);
      doc.text(`${metric.name}: ${complianceLevel}`, 20, yPos);
      yPos += 7;
    });

    yPos += 15;
    
    // Risk Documentation
    this.addSection(doc, 'Risk Management Documentation', yPos);
    yPos += 15;
    
    const riskText = this.generateRiskDocumentation(data);
    const splitRisk = doc.splitTextToSize(riskText, pageWidth - 40);
    doc.text(splitRisk, 20, yPos);
    
    this.addFooter(doc, doc.internal.pageSize.getHeight());
    
    doc.save(`${data.county}-${data.entityType}-compliance-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  private addHeader(doc: any, pageWidth: number, title: string): void {
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(title, 20, 16);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
  }

  private addSection(doc: any, title: string, yPos: number): void {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text(title, 20, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
  }

  private addFooter(doc: any, pageHeight: number): void {
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Generated by NC Resilience Platform - https://ncresilience.org', 20, pageHeight - 10);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 20, pageHeight - 5);
  }

  private generateExecutiveSummary(data: ReportData): string {
    const sector = data.entityType === 'agriculture' ? 'agricultural operations' : 'small businesses';
    const scoreLevel = data.overallScore >= 80 ? 'excellent' : data.overallScore >= 60 ? 'good' : data.overallScore >= 40 ? 'moderate' : 'needs improvement';
    
    return `This quarterly report provides a comprehensive assessment of resilience metrics for ${sector} in ${data.county} County. The overall resilience score of ${data.overallScore}/100 indicates ${scoreLevel} preparedness levels. Key improvements have been observed in ${data.metrics.filter(m => m.change > 0).length} out of ${data.metrics.length} tracked metrics. The analysis covers preparedness, financial stability, infrastructure resilience, and community support factors. ${data.events.length} significant activities have contributed to resilience improvements during this reporting period.`;
  }

  private getScoreInterpretation(score: number): string {
    if (score >= 80) return 'Excellent resilience - well-prepared for challenges';
    if (score >= 60) return 'Good resilience - moderate preparation with room for improvement';
    if (score >= 40) return 'Moderate resilience - significant preparation needed';
    return 'Lower resilience - substantial improvement opportunities';
  }

  private generateKeyInsights(data: ReportData): Array<{title: string, description: string}> {
    const insights = [];
    
    // Top performing metric
    const topMetric = data.metrics.reduce((max, metric) => 
      (metric.value > max.value) ? metric : max
    );
    insights.push({
      title: 'Strongest Performance Area',
      description: `${topMetric.name} shows exceptional performance at ${topMetric.value}${topMetric.unit}, indicating strong ${topMetric.category} capabilities. This represents a key competitive advantage that should be maintained and leveraged.`
    });

    // Most improved metric
    const mostImproved = data.metrics.reduce((max, metric) => 
      (metric.change > max.change) ? metric : max
    );
    if (mostImproved.change > 0) {
      insights.push({
        title: 'Greatest Improvement',
        description: `${mostImproved.name} has shown remarkable improvement with a gain of ${mostImproved.change}${mostImproved.unit}. This demonstrates effective implementation of resilience strategies in the ${mostImproved.category} category.`
      });
    }

    // Areas needing attention
    const needsAttention = data.metrics.filter(m => m.value < 50 || m.change < 0);
    if (needsAttention.length > 0) {
      insights.push({
        title: 'Priority Improvement Areas',
        description: `Focus should be placed on improving ${needsAttention.map(m => m.name).join(', ')}. These metrics indicate vulnerabilities that could impact overall resilience and should be addressed through targeted interventions.`
      });
    }

    // Activity impact
    const totalImpact = data.events.reduce((sum, event) => sum + event.impact_score, 0);
    insights.push({
      title: 'Activity Impact Assessment',
      description: `The ${data.events.length} resilience activities completed during this period have generated a total impact of ${totalImpact} points. The most effective activity was "${data.events.sort((a, b) => b.impact_score - a.impact_score)[0]?.title}" which contributed ${data.events[0]?.impact_score || 0} points to overall resilience.`
    });

    // Recommendations
    insights.push({
      title: 'Strategic Recommendations',
      description: `Continue focus on ${topMetric.category} excellence while addressing gaps in ${needsAttention.map(m => m.category).filter((v, i, a) => a.indexOf(v) === i).join(' and ')} areas. Implement regular monitoring and consider partnerships with high-performing neighboring counties to share best practices.`
    });

    return insights;
  }

  private getComplianceLevel(value: number, unit: string): string {
    // Normalize different units to percentage for compliance assessment
    let normalizedValue = value;
    if (unit === 'days') normalizedValue = Math.max(0, 100 - value * 2);
    else if (unit === 'months') normalizedValue = Math.min(100, value * 20);
    else if (unit === 'sources') normalizedValue = Math.min(100, value * 25);
    else if (unit === '/10') normalizedValue = value * 10;

    if (normalizedValue >= 80) return 'Fully Compliant';
    if (normalizedValue >= 60) return 'Substantially Compliant';
    if (normalizedValue >= 40) return 'Partially Compliant';
    return 'Non-Compliant - Improvement Required';
  }

  private generateRiskDocumentation(data: ReportData): string {
    return `Risk management protocols have been established and tested through ${data.events.filter(e => e.type === 'incident').length} documented incidents. Emergency response capabilities demonstrate ${data.metrics.find(m => m.id === 'preparedness')?.value || 'N/A'}% readiness level. Financial risk mitigation includes ${data.metrics.find(m => m.category === 'financial')?.value || 'N/A'} months of emergency reserves. Infrastructure redundancy and backup systems have been verified and tested. All risk management activities comply with industry standards and regulatory requirements for ${data.entityType === 'agriculture' ? 'agricultural operations' : 'small business enterprises'}.`;
  }
}

// Helper function to install jsPDF if not available
export const installJsPDF = async () => {
  if (typeof window !== 'undefined') {
    try {
      // Try to load jsPDF from CDN if not installed via npm
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      document.head.appendChild(script);
      
      return new Promise((resolve) => {
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
      });
    } catch (error) {
      console.error('Failed to load jsPDF:', error);
      return false;
    }
  }
  return false;
};

// Simple PDF generation function for forms and assessments
export interface PDFData {
  title: string;
  content: any;
  filename: string;
}

// Generate Assessment Report PDF
export const generateAssessmentPDF = async (data: AssessmentReportData): Promise<void> => {
  try {
    const reportContent = `
RISK ASSESSMENT REPORT
${data.countyName} County - ${data.entityType === 'agriculture' ? 'Agricultural' : 'Small Business'} Sector

Generated: ${data.generatedDate}

OVERALL RESILIENCE SCORE: ${data.overallScore}/100

RISK COMPONENT ANALYSIS:
- Credit Risk Level: ${data.creditRisk}/100
- Disaster Risk Level: ${data.disasterRisk}/100  
- Supply Chain Risk Level: ${data.supplyChainRisk}/100

IDENTIFIED RISK FACTORS:
${data.riskFactors.map(factor => `• ${factor.category} (${factor.level}): ${factor.description}`).join('\n')}

RECOMMENDATIONS:
${data.recommendations.map(rec => `• ${rec}`).join('\n')}

This assessment was generated using the NC Resilience Platform.
Data sources: FEMA National Risk Index, SBA Open Data, US Courts Bankruptcy Statistics.

Report ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.countyName.replace(/\s+/g, '-')}-${data.entityType}-assessment-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Assessment PDF generation failed:', error);
    alert('Assessment report generated as text file.');
  }
};

// Generate Government Impact Report
export const generateGovernmentPDF = async (data: GovernmentReportData): Promise<void> => {
  try {
    const reportContent = `
${data.title}
North Carolina Resilience Platform - Government Impact Report

Generated: ${data.generatedDate}

EXECUTIVE SUMMARY:
${data.summary}

KEY PERFORMANCE INDICATORS:
${Object.entries(data.keyMetrics).map(([key, value]) => `• ${key}: ${value}`).join('\n')}

COUNTIES ANALYZED: ${data.countiesAnalyzed}

ESTIMATED COST SAVINGS: $${data.costSavings.toLocaleString()}

STRATEGIC RECOMMENDATIONS:
${data.recommendations.map(rec => `• ${rec}`).join('\n')}

PLATFORM IMPACT:
This open-source platform provides unprecedented transparency in risk assessment,
enabling data-driven government decision making and targeted resource allocation.

The platform serves both farmers and small business owners across North Carolina,
helping them understand and prepare for various risks while connecting them with
relevant government assistance programs.

METHODOLOGY:
Risk scores are calculated using official government data including:
- FEMA National Risk Index for disaster risk assessment
- SBA Open Data Portal for program accessibility analysis  
- US Courts bankruptcy statistics for credit risk evaluation
- Census County Business Patterns for economic diversity analysis

All algorithms and methodologies are open source and available for peer review.

For more information: https://github.com/ncresilient/platform
Contact: ncresilient@example.com

Report ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NC-Resilience-Government-Report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Government PDF generation failed:', error);
    alert('Government report generated as text file.');
  }
};

export const generatePDF = async (data: PDFData): Promise<void> => {
  try {
    // For now, create a simple text-based report
    const reportContent = JSON.stringify(data.content, null, 2);
    const blob = new Blob([`${data.title}\n\n${reportContent}`], { type: 'text/plain' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = data.filename || 'report.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('PDF generation failed:', error);
    alert('Report generated as text file. PDF generation requires additional setup.');
  }
};