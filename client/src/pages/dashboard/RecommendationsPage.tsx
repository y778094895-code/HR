import React, { useEffect, useState, useMemo } from 'react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/cards/card';
import { Button } from '@/components/ui/buttons/button';
import { Badge } from '@/components/ui/data-display/badge';
import { 
  Sparkles, Check, X, ArrowRight, BrainCircuit, BarChart3, Target, 
  GraduationCap, ShieldAlert, DollarSign, Combine,
  Filter, RefreshCw, AlertCircle, TrendingUp, Users, Zap,
  Calculator, Activity
} from 'lucide-react';
import { useToast } from '@/components/ui/overlays/use-toast';
import { TabsContainer, TabItem } from '@/components/ui/navigation/TabsContainer';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/feedback/EmptyState';
import { 
  categorizeRecommendation, 
  getPriority, 
  RecommendationCategory,
  RecommendationPriority,
  sanitizeText
} from '@/lib/recommendations/analytics';
import { runSimulation, SimulationResult } from '@/lib/recommendations/simulation';

const RecommendationsPage: React.FC = () => {
  const { 
    recommendations: allRecommendations,
    recommendations,
    loading, 
    error,
    fetchRecommendations, 
    handleAction,
    analytics,
    upliftEstimates,
    filters,
    updateFilters,
    clearFilters,
    refresh
  } = useRecommendations();
  
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') || 'smart';
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Simulation state
  const [simAdoptionRate, setSimAdoptionRate] = useState(50);
  const [simTargetGroup, setSimTargetGroup] = useState<'all' | 'high_risk' | 'medium_risk' | 'low_risk'>('all');
  const [simCategories, setSimCategories] = useState<RecommendationCategory[]>(['retention', 'performance', 'training']);
  const [simTimeframe, setSimTimeframe] = useState(6);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const recommendationList = Array.isArray(recommendations) ? recommendations : [];
  const safeAllRecommendations = Array.isArray(allRecommendations) ? allRecommendations : [];
  const hasActiveRecommendations = recommendationList.some((r: any) => r?.status === 'active');
  const hasAnyRecommendations = recommendationList.length > 0;

  // Run simulation when inputs change
  useEffect(() => {
    const result = runSimulation(safeAllRecommendations, {
      adoptionRate: simAdoptionRate,
      targetGroup: simTargetGroup,
      categories: simCategories,
      timeframe: simTimeframe,
    });
    setSimulationResult(result);
  }, [safeAllRecommendations, simAdoptionRate, simTargetGroup, simCategories, simTimeframe]);

  const onApply = async (id: string) => {
    if (!id) return;
    setActionLoading(id);
    try {
      await handleAction(id, 'apply');
      toast({
        title: "Recommendation Applied",
        description: "An intervention has been created successfully.",
      });
      await refresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to apply recommendation.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const onReject = async (id: string) => {
    if (!id) return;
    setActionLoading(id);
    try {
      await handleAction(id, 'reject');
      toast({
        title: "Recommendation Rejected",
        description: "The recommendation has been rejected.",
      });
      await refresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to reject recommendation.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getConfidenceColor = (score: number | string) => {
    const numScore = typeof score === 'string' ? parseFloat(score) : score;
    if (numScore >= 0.8) return "text-emerald-600 bg-emerald-50";
    if (numScore >= 0.5) return "text-blue-600 bg-blue-50";
    return "text-amber-600 bg-amber-50";
  };

  const getPriorityBadge = (priority: RecommendationPriority) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-700">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-700">Low</Badge>;
    }
  };

  const getCategoryIcon = (category: RecommendationCategory) => {
    switch (category) {
      case 'retention':
        return <Users className="h-4 w-4" />;
      case 'performance':
        return <TrendingUp className="h-4 w-4" />;
      case 'training':
        return <GraduationCap className="h-4 w-4" />;
      case 'fairness':
        return <ShieldAlert className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'smart': return t('nav.smartRecommendations', 'Smart Recommendations');
      case 'uplift': return t('nav.expectedUplift', 'Expected Uplift');
      case 'simulation': return t('nav.whatIfSimulation', 'What-If Simulation');
      default: return t('nav.recommendations', 'AI Smart Recommendations');
    }
  };

  // Filter UI component
  const FilterPanel = () => (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Filters:</span>
        </div>
        
        <select 
          className="text-sm border rounded-md px-2 py-1"
          value={filters.status?.[0] || ''}
          onChange={(e) => updateFilters({ ...filters, status: e.target.value ? [e.target.value as any] : [] })}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="applied">Applied</option>
        </select>

        <select 
          className="text-sm border rounded-md px-2 py-1"
          value={filters.priority?.[0] || ''}
          onChange={(e) => updateFilters({ ...filters, priority: e.target.value ? [e.target.value as RecommendationPriority] : [] })}
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select 
          className="text-sm border rounded-md px-2 py-1"
          value={filters.category?.[0] || ''}
          onChange={(e) => updateFilters({ ...filters, category: e.target.value ? [e.target.value as RecommendationCategory] : [] })}
        >
          <option value="">All Categories</option>
          <option value="retention">Retention</option>
          <option value="performance">Performance</option>
          <option value="training">Training</option>
          <option value="fairness">Fairness</option>
          <option value="general">General</option>
        </select>

        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear
        </Button>
      </div>
    </div>
  );

  // Analytics Summary Component
  const AnalyticsSummary = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <BrainCircuit className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Total</span>
          </div>
          <div className="text-2xl font-bold text-indigo-900">{analytics.totalCount}</div>
          <div className="text-xs text-indigo-600">Recommendations</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <Check className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Active</span>
          </div>
          <div className="text-2xl font-bold text-emerald-900">{analytics.byStatus['active'] || 0}</div>
          <div className="text-xs text-emerald-600">Pending Action</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Target className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Avg Confidence</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{(analytics.averageConfidence * 100).toFixed(0)}%</div>
          <div className="text-xs text-blue-600">ML Certainty</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Zap className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">High Priority</span>
          </div>
          <div className="text-2xl font-bold text-amber-900">{analytics.byPriority['high'] || 0}</div>
          <div className="text-xs text-amber-600">Need Attention</div>
        </CardContent>
      </Card>
    </div>
  );

  // Check if uplift data has meaningful values (both potential AND impact must be > 0)
  const hasValidUpliftData = React.useMemo(() => {
    return upliftEstimates.length > 0 && upliftEstimates.some(
      u => u && typeof u.potentialCount === 'number' && u.potentialCount > 0 && typeof u.estimatedImpact === 'number' && u.estimatedImpact > 0
    );
  }, [upliftEstimates]);

  // Uplift Summary Component
  const UpliftSummary = () => (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          Expected Uplift Summary
        </CardTitle>
        <CardDescription>Derived from active recommendations based on confidence scores</CardDescription>
      </CardHeader>
      <CardContent>
        {hasValidUpliftData && upliftEstimates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upliftEstimates.map((uplift) => (
              <div key={uplift.category} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryIcon(uplift.category)}
                  <span className="font-medium capitalize">{uplift.category}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Potential:</span>
                    <span className="font-medium">{uplift.potentialCount} employees</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Confidence:</span>
                    <span className="font-medium">{(uplift.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Est. Impact:</span>
                    <span className="font-bold text-indigo-600">+{uplift.estimatedImpact}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={TrendingUp} 
            title="No Uplift Data Available" 
            description="Active recommendations are needed to calculate potential uplift. Accept or apply recommendations to see estimates."
            className="py-8"
          />
        )}
      </CardContent>
    </Card>
  );

  // Simulation Panel Component
  const SimulationPanel = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-indigo-600" />
            What-If Scenario Simulator
          </CardTitle>
          <CardDescription>
            Adjust parameters to estimate potential outcomes. All estimates are derived from current recommendation data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Adoption Rate Slider */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Adoption Rate: {simAdoptionRate}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={simAdoptionRate}
              onChange={(e) => setSimAdoptionRate(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Conservative (10%)</span>
              <span>Aggressive (100%)</span>
            </div>
          </div>

          {/* Target Group */}
          <div>
            <label className="text-sm font-medium mb-2 block">Target Group</label>
            <select
              value={simTargetGroup}
              onChange={(e) => setSimTargetGroup(e.target.value as any)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="all">All Employees</option>
              <option value="high_risk">High Risk (High Confidence)</option>
              <option value="medium_risk">Medium Risk (Medium Confidence)</option>
              <option value="low_risk">Low Risk (Low Confidence)</option>
            </select>
          </div>

          {/* Categories */}
          <div>
            <label className="text-sm font-medium mb-2 block">Recommendation Categories</label>
            <div className="flex flex-wrap gap-2">
              {(['retention', 'performance', 'training', 'fairness'] as RecommendationCategory[]).map((cat) => (
                <Button
                  key={cat}
                  variant={simCategories.includes(cat) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (simCategories.includes(cat)) {
                      setSimCategories(simCategories.filter(c => c !== cat));
                    } else {
                      setSimCategories([...simCategories, cat]);
                    }
                  }}
                  className="capitalize"
                >
                  {getCategoryIcon(cat)}
                  <span className="ml-1">{cat}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Timeframe */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Timeframe: {simTimeframe} months
            </label>
            <input
              type="range"
              min="1"
              max="24"
              value={simTimeframe}
              onChange={(e) => setSimTimeframe(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Results */}
          {simulationResult && (
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <h4 className="font-medium text-indigo-900 mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Estimated Outcomes
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold text-indigo-900">{simulationResult.employeesAffected}</div>
                  <div className="text-xs text-indigo-700">Employees Affected</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">+{simulationResult.retentionImprovement}%</div>
                  <div className="text-xs text-slate-600">Retention Improvement</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">+{simulationResult.performanceGain}%</div>
                  <div className="text-xs text-slate-600">Performance Gain</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">{simulationResult.confidence}%</div>
                  <div className="text-xs text-slate-600">Simulation Confidence</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3 italic">
                {simulationResult.methodology}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Recommendation Card Component - with safe fallbacks for missing/malformed fields
  const renderRecommendationCard = (rec: any) => {
    if (!rec || typeof rec !== 'object') return null;
    const category = categorizeRecommendation(rec);
    const priority = getPriority(rec.confidenceScore);
    
    // Use sanitizeText to ensure no corrupted/gibberish/???? text appears in UI
    const safeTitle = sanitizeText(rec.title, 'Untitled Recommendation');
    const safeDescription = sanitizeText(rec.description, 'No description available');
    const safeInterventionType = sanitizeText(rec.suggestedInterventionType, 'General').replace(/_/g, ' ');
    const safeSource = sanitizeText(rec.source, 'ML').toUpperCase();
    
    return (
      <Card key={rec.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/50">
          <div className="flex justify-between items-start mb-2">
            <div className="flex gap-2">
              <Badge variant="outline" className={`font-bold ${getConfidenceColor(rec.confidenceScore || 0)}`}>
                {((typeof rec.confidenceScore === 'string' ? parseFloat(rec.confidenceScore) : (rec.confidenceScore || 0)) * 100).toFixed(0)}% Confidence
              </Badge>
              {getPriorityBadge(priority)}
            </div>
            <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200">
              {safeSource}
            </Badge>
          </div>
          <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors">
            {safeTitle}
          </CardTitle>
          <CardDescription className="text-slate-600 font-medium flex items-center gap-2">
            {getCategoryIcon(category)}
            <span className="capitalize">{category}</span>
            <span className="mx-1">•</span>
            <span>{safeInterventionType}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <p className="text-sm leading-relaxed text-slate-700">
            {safeDescription}
          </p>

          {(rec as any).estimatedImpact && (
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold mb-2 uppercase">
                <BarChart3 className="h-4 w-4" /> Estimated Impact
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries((rec as any).estimatedImpact).map(([key, val]: [string, any]) => (
                  <div key={key} className="text-[11px] text-slate-600 flex justify-between">
                    <span>{key.replace('_', ' ')}:</span>
                    <span className="font-bold text-indigo-600">+{val * 100}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(rec as any).reasonCodes && Array.isArray((rec as any).reasonCodes) && (
            <div className="flex flex-wrap gap-1">
              {(rec as any).reasonCodes.map((code: string) => (
                <Badge key={code} variant="secondary" className="text-[10px] bg-slate-100">
                  #{code}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2 pb-6 border-t border-slate-50 bg-slate-50/30 flex gap-2">
          {rec.status === 'active' || rec.status === 'planned' ? (
            <>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                onClick={() => onApply(rec.id)}
                disabled={actionLoading === rec.id}
              >
                {actionLoading === rec.id ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Apply <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => onReject(rec.id)}
                disabled={actionLoading === rec.id}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button disabled className="w-full bg-slate-100 text-slate-400 border-none">
              <Check className="mr-2 h-4 w-4" /> {rec.status}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  // Main content renderers
  const renderSmartTab = () => (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
          <Button variant="ghost" size="sm" onClick={refresh} className="ml-auto">
            Retry
          </Button>
        </div>
      )}
      
      <FilterPanel />
      <AnalyticsSummary />
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <EmptyState 
            icon={Sparkles} 
            title="No Recommendations Found" 
            description={
              filters && Object.keys(filters).length > 0 
                ? "Try adjusting your filters to see more recommendations."
                : "No recommendations available at this time. Check back later as the system analyzes employee data."
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map(renderRecommendationCard)}
        </div>
      )}
    </div>
  );

  const renderUpliftTab = () => (
    <div>
      <UpliftSummary />
      
      {(!hasValidUpliftData || upliftEstimates.length === 0) && !loading && (
        <EmptyState 
          icon={TrendingUp} 
          title="No Uplift Data Available" 
          description="Active recommendations are needed to calculate potential uplift. Accept or apply recommendations to see estimates."
          className="mt-8"
        />
      )}
    </div>
  );

  const renderSimulationTab = () => (
    <div>
      <SimulationPanel />
    </div>
  );

  const renderTabs = (): TabItem[] => {
    switch (view) {
      case 'smart':
        return [
          {
            value: 'retention',
            label: t('recommendations.tabs.retention', 'Retention'),
            content: renderSmartTab()
          },
          {
            value: 'performance',
            label: t('recommendations.tabs.performanceImprovement', 'Performance'),
            content: (
              <div className="mt-4">
                {analytics.byCategory['performance'] ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations
                      .filter(r => categorizeRecommendation(r) === 'performance')
                      .map(renderRecommendationCard)}
                  </div>
                ) : (
                  <EmptyState icon={Target} title="No Performance Recommendations" description="No performance-related recommendations available at this time." />
                )}
              </div>
            )
          },
          {
            value: 'training',
            label: t('recommendations.tabs.trainingRecs', 'Training'),
            content: (
              <div className="mt-4">
                {analytics.byCategory['training'] ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations
                      .filter(r => categorizeRecommendation(r) === 'training')
                      .map(renderRecommendationCard)}
                  </div>
                ) : (
                  <EmptyState icon={GraduationCap} title="No Training Recommendations" description="No training-related recommendations available at this time." />
                )}
              </div>
            )
          }
        ];
      case 'uplift':
        return [
          {
            value: 'risk-impact',
            label: t('recommendations.tabs.impactOnRisk', 'Impact on Risk'),
            content: renderUpliftTab()
          },
          {
            value: 'perf-impact',
            label: t('recommendations.tabs.impactOnPerf', 'Impact on Performance'),
            content: renderUpliftTab()
          },
          {
            value: 'financial',
            label: t('recommendations.tabs.approxFinancial', 'Approx Financial Impact'),
            content: (
              <div className="mt-4">
                <EmptyState 
                  icon={DollarSign} 
                  title="Financial Impact Estimates" 
                  description="Financial impact calculations require additional backend data. This feature is currently limited by missing cost-per-hire and salary data."
                  className="py-12"
                />
              </div>
            )
          }
        ];
      case 'simulation':
        return [
          {
            value: 'scenarios',
            label: t('recommendations.tabs.scenarios', 'Scenarios'),
            content: renderSimulationTab()
          },
          {
            value: 'comparison',
            label: t('recommendations.tabs.scenarioComparison', 'Scenario Comparison'),
            content: (
              <div className="mt-4">
                <EmptyState 
                  icon={Combine} 
                  title="Scenario Comparison" 
                  description="Run multiple scenarios using the simulator to compare outcomes. Each scenario can be saved and compared side-by-side."
                  className="py-12"
                />
              </div>
            )
          },
          {
            value: 'approve',
            label: t('recommendations.tabs.approveReject', 'Approve/Reject → Link to Case'),
            content: (
              <div className="mt-4">
                {recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations
                      .filter(r => r.status === 'active')
                      .map(renderRecommendationCard)}
                  </div>
                ) : (
                  <EmptyState icon={Check} title="No Pending Approvals" description="All recommendations have been processed." />
                )}
              </div>
            )
          }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={getTitle()}
        description={t('recommendations.description', 'Actionable insights driven by machine learning to improve employee retention and performance.')}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={refresh} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate New
            </Button>
          </div>
        }
      />

      <TabsContainer
        syncWithUrl="tab"
        tabs={renderTabs()}
      />

      {!hasAnyRecommendations && !loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Operational Note</CardTitle>
            <CardDescription>
              No recommendations are currently available from the backend. The module remains fully operational in read-only empty-state mode.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {hasAnyRecommendations && !hasActiveRecommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Action Availability</CardTitle>
            <CardDescription>
              No active recommendations are available for apply/reject actions right now. Processed recommendations are shown for audit visibility.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default RecommendationsPage;

