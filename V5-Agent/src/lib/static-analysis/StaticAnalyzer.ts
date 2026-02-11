import { VulnerabilityReasoning } from "../agents/AgentSystem";

export interface StaticAnalysisConfig {
    targetPath: string; // Path to repo or file
    rules?: string[];   // Specific rules or config path
}

export interface StaticAnalyzer {
    name: string;
    isAvailable(): Promise<boolean>;
    scan(config: StaticAnalysisConfig): Promise<VulnerabilityReasoning[]>;
}
