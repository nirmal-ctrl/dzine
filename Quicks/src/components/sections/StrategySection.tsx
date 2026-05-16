import React from 'react';
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GOALS, PLATFORMS } from "@/shared/constants";
import type { StrategyContext } from "@/shared/types";

interface StrategySectionProps {
    strategy: StrategyContext;
    onUpdate: (key: keyof StrategyContext, value: string) => void;
}

export const StrategySection: React.FC<StrategySectionProps> = ({ strategy, onUpdate }) => {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <Badge variant="outline" className="bg-background text-primary border-primary/20">Step 1</Badge>
                <h2 className="text-sm font-semibold tracking-tight">Strategy Context</h2>
            </div>

            <div className="grid gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
                <div className="grid gap-2">
                    <Label className="text-xs font-medium text-muted-foreground">Goal</Label>
                    <Select value={strategy.goal} onValueChange={v => onUpdate('goal', v)}>
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select a goal" />
                        </SelectTrigger>
                        <SelectContent>
                            {GOALS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label className="text-xs font-medium text-muted-foreground">Platform</Label>
                        <Select value={strategy.platform} onValueChange={v => onUpdate('platform', v)}>
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="Platform" />
                            </SelectTrigger>
                            <SelectContent>
                                {PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-xs font-medium text-muted-foreground">Audience</Label>
                        <Input
                            value={strategy.audience}
                            onChange={e => onUpdate('audience', e.target.value)}
                            className="h-9"
                            placeholder="e.g. Founders"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};
