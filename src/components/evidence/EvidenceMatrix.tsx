import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { sources, sourceTypeColors, reliabilityColors, Source } from "@/data/sourcesData";
import { timelineData } from "@/data/timelineData";
import { keyFindings, findingCategoryColors, severityColors } from "@/data/keyFindingsData";
import { FileText, CheckCircle, AlertTriangle, Filter, Grid, List, BookOpen, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export const EvidenceMatrix = () => {
  const [viewMode, setViewMode] = useState<"matrix" | "list">("list");
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [filterType, setFilterType] = useState<Source["type"] | null>(null);

  const filteredSources = useMemo(() => {
    if (!filterType) return sources;
    return sources.filter(s => s.type === filterType);
  }, [filterType]);

  const getEventsBySource = (source: Source) => {
    return source.events.map(idx => timelineData[idx]).filter(Boolean);
  };

  const sourceTypes: Source["type"][] = ["document", "legal", "audio", "testimony", "report", "petition"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Evidence Matrix
          </h1>
          <p className="text-muted-foreground">
            Cross-reference {sources.length} sources across {timelineData.length} documented events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/intel-briefing">
            <Button variant="outline" size="sm">
              <BookOpen className="w-4 h-4 mr-1" />
              Intel Briefing
            </Button>
          </Link>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4 mr-1" />
            List
          </Button>
          <Button
            variant={viewMode === "matrix" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("matrix")}
          >
            <Grid className="w-4 h-4 mr-1" />
            Matrix
          </Button>
        </div>
      </div>

      {/* Intel Briefing Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">X24 Intelligence Briefing Available</h3>
                <p className="text-xs text-muted-foreground">
                  Comprehensive analysis of forensic evidence, witness statements, and persecution patterns from 123 sources
                </p>
              </div>
            </div>
            <Link to="/intel-briefing">
              <Button size="sm">
                View Full Briefing
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-2">Filter by type:</span>
            <Button
              variant={filterType === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(null)}
            >
              All
            </Button>
            {sourceTypes.map(type => (
              <Button
                key={type}
                variant={filterType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(filterType === type ? null : type)}
                className={cn(filterType === type && sourceTypeColors[type], "text-white")}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Findings Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Critical Findings from Evidence Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {keyFindings.filter(f => f.severity === "critical").map(finding => (
              <div 
                key={finding.id}
                className={cn(
                  "p-3 rounded-lg border",
                  findingCategoryColors[finding.category]
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={severityColors[finding.severity]} variant="secondary">
                    {finding.severity}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm">{finding.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{finding.summary}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sources Table/List */}
      {viewMode === "list" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Source Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reliability</TableHead>
                  <TableHead className="text-center">Events</TableHead>
                  <TableHead>Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSources.map(source => (
                  <TableRow 
                    key={source.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedSource(
                      selectedSource?.id === source.id ? null : source
                    )}
                  >
                    <TableCell className="font-mono text-muted-foreground">
                      [{source.id}]
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {source.title}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(sourceTypeColors[source.type], "text-white")}>
                        {source.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={reliabilityColors[source.reliability]}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {source.reliability}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{source.events.length}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                      {source.summary}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        /* Matrix View */
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event-Source Matrix</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid gap-1" style={{ 
                gridTemplateColumns: `200px repeat(${filteredSources.length}, 40px)` 
              }}>
                {/* Header row */}
                <div className="font-medium text-xs text-muted-foreground p-2">Event</div>
                {filteredSources.map(s => (
                  <div 
                    key={s.id} 
                    className="text-[10px] text-center p-1 font-mono text-muted-foreground"
                    title={s.title}
                  >
                    [{s.id}]
                  </div>
                ))}

                {/* Event rows */}
                {timelineData.slice(0, 15).map((event, idx) => (
                  <>
                    <div 
                      key={idx} 
                      className="text-xs p-2 truncate border-t"
                      title={event.description}
                    >
                      {event.date.split('-')[0]}: {event.description.slice(0, 40)}...
                    </div>
                    {filteredSources.map(source => (
                      <div 
                        key={`${idx}-${source.id}`}
                        className="border-t flex items-center justify-center"
                      >
                        {source.events.includes(idx) ? (
                          <div className={cn(
                            "w-4 h-4 rounded-full",
                            sourceTypeColors[source.type]
                          )} />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-muted" />
                        )}
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Source Details */}
      {selectedSource && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{selectedSource.title}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedSource(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={cn(sourceTypeColors[selectedSource.type], "text-white")}>
                  {selectedSource.type}
                </Badge>
                <Badge variant="outline" className={reliabilityColors[selectedSource.reliability]}>
                  Reliability: {selectedSource.reliability}
                </Badge>
                <Badge variant="secondary">{selectedSource.category}</Badge>
              </div>
              <p className="text-sm">{selectedSource.summary}</p>
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Referenced in {selectedSource.events.length} events:
                </h4>
                <div className="space-y-2">
                  {getEventsBySource(selectedSource).map((event, i) => (
                    <div key={i} className="text-sm p-2 rounded bg-muted">
                      <span className="font-mono text-xs text-muted-foreground mr-2">
                        {event.date}
                      </span>
                      {event.description.slice(0, 100)}...
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
