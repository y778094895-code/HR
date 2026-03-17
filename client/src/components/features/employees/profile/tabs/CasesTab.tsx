import React, { useState } from 'react';
import { EmployeeProfileBundle } from '@/services/resources/profileDataAdapter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-display/table';
import { Badge } from '@/components/ui/data-display/badge';
import { useProfileDrawer } from '../drawers/ProfileActionDrawer';

interface CasesTabProps {
    profile: EmployeeProfileBundle;
}

export default function CasesTab({ profile }: CasesTabProps) {
    const { cases } = profile;
    const { openDrawer } = useProfileDrawer();

    const handleOpenCaseDrawer = (id: string) => {
        openDrawer('VIEW_CASE', { caseId: id });
    };

    return (
        <div className="space-y-6 mt-4">
            <Card className="bg-card shadow-sm border-border/60">
                <CardHeader>
                    <CardTitle className="text-lg">Cases & Interventions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Case ID</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cases && cases.length > 0 ? cases.map((c, idx) => (
                                    <TableRow
                                        key={c.id || idx}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleOpenCaseDrawer(c.id)}
                                    >
                                        <TableCell className="font-mono text-xs">{c.id}</TableCell>
                                        <TableCell className="capitalize">{c.type || c.title || 'Unknown'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{c.severity || 'Medium'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={c.status === 'Open' ? 'border-primary text-primary' : ''}>
                                                {c.status || 'Resolved'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No cases or interventions linked.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
