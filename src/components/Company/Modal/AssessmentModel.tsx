"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";


import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ParallelogramSelectSearch } from "@/components/common/ParallelogramSelectSearch";
import { ParallelogramSelect } from "@/components/common/ParallelogramSelect";
import { SkillSelector } from "@/components/common/SkillSelector";
import { ParallelogramInput } from "@/components/common/ParallelogramInput";

export interface AssessmentData {
  numberOfQuestions: number;
  dimensions: string[];
  companyStyle: "Startup" | "Standard" | "Non-Profit" | "Corporation" | "Enterprise";
  opportunityVisibility: "Public" | "Private" | "Invite Only";
  roleType: string;
  seniorityLevel: string;
  mission: string;
  communicationNorms: string;
  traitsWanted: string;
  traitsNotWanted: string;
  goalsNext3Months: string;
  skills: string[];
  values: string[];
  selectedSector: string;
  questionMode: "dynamic" | "static";
  applicationCloseAt: string;
  assessmentDeadlineHours: number;
}

export interface AssessmentQuestion {
  id?: string;
  question: string;
  type: "text" | "select" | "checkbox" | "rating";
  dimension: string;
  evaluationHint?: string;
  options?: string[];
  isRequired?: boolean;
}

interface Props {
  assessment?: AssessmentData | null;
  isOpen: boolean;
  questionCountOptions?: number[];
  onClose: () => void;
  initialQuestions?: AssessmentQuestion[];
  onSave: (data: AssessmentData, questions: AssessmentQuestion[]) => void;
}

const AssessmentModal: React.FC<Props> = ({
  assessment,
  isOpen,
  questionCountOptions = [10, 20, 50],
  onClose,
  initialQuestions = [],
  onSave,
}) => {
  const defaultSkillOptions = [
    { key: "javascript", label: "JavaScript" },
    { key: "typescript", label: "TypeScript" },
    { key: "python", label: "Python" },
    { key: "java", label: "Java" },
    { key: "react", label: "React" },
    { key: "node", label: "Node.js" },
    { key: "sql", label: "SQL" },
    { key: "docker", label: "Docker" },
    { key: "aws", label: "AWS" },
  ];
  const sectorOptions = [
    "software_engineering",
    "devops_infra",
    "data_engineering",
    "machine_learning",
    "mobile",
    "security_engineering",
    "qa_testing",
  ];
  const sectorRoleMap: Record<string, string[]> = {
    software_engineering: ["Backend Developer", "Frontend Developer", "Full Stack Developer", "Software Engineer", "API Engineer", "Platform Engineer"],
    devops_infra: ["DevOps Engineer", "SRE", "Cloud Architect", "Platform Engineer", "Infrastructure Engineer", "Release Engineer"],
    data_engineering: ["Data Engineer", "Analytics Engineer", "ETL Developer", "Data Platform Engineer", "Data Architect"],
    machine_learning: ["ML Engineer", "Data Scientist", "MLOps Engineer", "AI Research Engineer", "NLP Engineer", "Computer Vision Engineer"],
    mobile: ["iOS Developer", "Android Developer", "React Native Developer", "Flutter Developer", "Mobile Architect", "Mobile Lead"],
    security_engineering: ["Security Engineer", "AppSec Engineer", "Penetration Tester", "Security Architect", "DevSecOps Engineer", "SOC Analyst"],
    qa_testing: ["QA Engineer", "SDET", "Test Automation Engineer", "QA Lead", "Performance Test Engineer", "QA Analyst"],
  };
  const sectorSkillMap: Record<string, Array<{ key: string; label: string }>> = {
    software_engineering: [
      { key: "python", label: "Python" }, { key: "javascript", label: "JavaScript" }, { key: "typescript", label: "TypeScript" },
      { key: "java", label: "Java" }, { key: "go", label: "Go" }, { key: "react", label: "React" }, { key: "node", label: "Node.js" },
      { key: "postgresql", label: "PostgreSQL" }, { key: "graphql", label: "GraphQL" },
    ],
    devops_infra: [
      { key: "aws", label: "AWS" }, { key: "gcp", label: "GCP" }, { key: "azure", label: "Azure" },
      { key: "docker", label: "Docker" }, { key: "kubernetes", label: "Kubernetes" }, { key: "terraform", label: "Terraform" },
      { key: "prometheus", label: "Prometheus" }, { key: "grafana", label: "Grafana" }, { key: "linux", label: "Linux" },
    ],
    data_engineering: [
      { key: "python", label: "Python" }, { key: "sql", label: "SQL" }, { key: "spark", label: "Spark" },
      { key: "airflow", label: "Airflow" }, { key: "dbt", label: "dbt" }, { key: "kafka", label: "Kafka" },
      { key: "snowflake", label: "Snowflake" }, { key: "bigquery", label: "BigQuery" }, { key: "databricks", label: "Databricks" },
    ],
    machine_learning: [
      { key: "python", label: "Python" }, { key: "pytorch", label: "PyTorch" }, { key: "tensorflow", label: "TensorFlow" },
      { key: "scikit", label: "scikit-learn" }, { key: "huggingface", label: "Hugging Face" }, { key: "mlflow", label: "MLflow" },
      { key: "kubeflow", label: "Kubeflow" }, { key: "sagemaker", label: "AWS SageMaker" }, { key: "vertexai", label: "Vertex AI" },
    ],
    mobile: [
      { key: "swift", label: "Swift" }, { key: "kotlin", label: "Kotlin" }, { key: "reactnative", label: "React Native" },
      { key: "flutter", label: "Flutter" }, { key: "dart", label: "Dart" }, { key: "swiftui", label: "SwiftUI" },
      { key: "jetpackcompose", label: "Jetpack Compose" }, { key: "firebase", label: "Firebase" }, { key: "fastlane", label: "Fastlane" },
    ],
    security_engineering: [
      { key: "appsec", label: "Application Security" }, { key: "cloudsecurity", label: "Cloud Security" }, { key: "networksecurity", label: "Network Security" },
      { key: "pentesting", label: "Penetration Testing" }, { key: "threatmodeling", label: "Threat Modeling" }, { key: "iam", label: "IAM" },
      { key: "cryptography", label: "Cryptography" }, { key: "incidentresponse", label: "Incident Response" }, { key: "terraform", label: "Terraform" },
    ],
    qa_testing: [
      { key: "selenium", label: "Selenium" }, { key: "cypress", label: "Cypress" }, { key: "playwright", label: "Playwright" },
      { key: "jest", label: "Jest" }, { key: "pytest", label: "Pytest" }, { key: "appium", label: "Appium" },
      { key: "k6", label: "k6" }, { key: "jmeter", label: "JMeter" }, { key: "postman", label: "Postman" },
    ],
  };
  const roleSkillMap: Array<{ keywords: string[]; options: Array<{ key: string; label: string }> }> = [
    {
      keywords: ["frontend", "front end", "ui", "web"],
      options: [
        { key: "javascript", label: "JavaScript" },
        { key: "typescript", label: "TypeScript" },
        { key: "react", label: "React" },
        { key: "nextjs", label: "Next.js" },
        { key: "vue", label: "Vue" },
        { key: "angular", label: "Angular" },
        { key: "html", label: "HTML" },
        { key: "css", label: "CSS" },
        { key: "tailwind", label: "Tailwind CSS" },
      ],
    },
    {
      keywords: ["backend", "back end", "api", "server"],
      options: [
        { key: "node", label: "Node.js" },
        { key: "python", label: "Python" },
        { key: "java", label: "Java" },
        { key: "go", label: "Go" },
        { key: "dotnet", label: ".NET" },
        { key: "sql", label: "SQL" },
        { key: "postgresql", label: "PostgreSQL" },
        { key: "redis", label: "Redis" },
        { key: "graphql", label: "GraphQL" },
      ],
    },
    {
      keywords: ["fullstack", "full stack"],
      options: [
        { key: "javascript", label: "JavaScript" },
        { key: "typescript", label: "TypeScript" },
        { key: "react", label: "React" },
        { key: "nextjs", label: "Next.js" },
        { key: "node", label: "Node.js" },
        { key: "express", label: "Express" },
        { key: "postgresql", label: "PostgreSQL" },
        { key: "mongodb", label: "MongoDB" },
        { key: "docker", label: "Docker" },
      ],
    },
    {
      keywords: ["mobile", "android", "ios", "react native", "flutter"],
      options: [
        { key: "swift", label: "Swift" },
        { key: "kotlin", label: "Kotlin" },
        { key: "reactnative", label: "React Native" },
        { key: "flutter", label: "Flutter" },
        { key: "dart", label: "Dart" },
        { key: "firebase", label: "Firebase" },
        { key: "graphql", label: "GraphQL" },
        { key: "rest", label: "REST APIs" },
        { key: "fastlane", label: "Fastlane" },
      ],
    },
    {
      keywords: ["devops", "infra", "sre", "platform"],
      options: [
        { key: "aws", label: "AWS" },
        { key: "gcp", label: "GCP" },
        { key: "azure", label: "Azure" },
        { key: "docker", label: "Docker" },
        { key: "kubernetes", label: "Kubernetes" },
        { key: "terraform", label: "Terraform" },
        { key: "prometheus", label: "Prometheus" },
        { key: "grafana", label: "Grafana" },
        { key: "linux", label: "Linux" },
      ],
    },
    {
      keywords: ["qa", "test", "sdet", "automation"],
      options: [
        { key: "playwright", label: "Playwright" },
        { key: "cypress", label: "Cypress" },
        { key: "selenium", label: "Selenium" },
        { key: "jest", label: "Jest" },
        { key: "pytest", label: "Pytest" },
        { key: "postman", label: "Postman" },
        { key: "k6", label: "k6" },
        { key: "jmeter", label: "JMeter" },
        { key: "ci", label: "CI/CD" },
      ],
    },
  ];
  const [formData, setFormData] = useState<AssessmentData>({
    numberOfQuestions: 10,
    dimensions: [],
    companyStyle: "Startup",
    opportunityVisibility: "Public",
    roleType: "User",
    seniorityLevel: "Internship",
    mission: "",
    communicationNorms: "",
    traitsWanted: "",
    traitsNotWanted: "",
    goalsNext3Months: "",
    skills: [],
    values: [],
    selectedSector: "",
    questionMode: "dynamic",
    applicationCloseAt: "",
    assessmentDeadlineHours: 72,
  });

  const [loading, setLoading] = useState(false);
  const [showFitProfile, setShowFitProfile] = useState(false);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);
  const [deadlineInput, setDeadlineInput] = useState("72");

  useEffect(() => {
    if (assessment) setFormData(assessment);
  }, [assessment]);

  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions, isOpen]);

  useEffect(() => {
    const value = Number(formData.assessmentDeadlineHours);
    setDeadlineInput(Number.isFinite(value) && value > 0 ? String(value) : "72");
  }, [formData.assessmentDeadlineHours]);

  const handleInputChange = (field: keyof AssessmentData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const dynamicSkillOptions = useMemo(() => {
    if (formData.selectedSector && sectorSkillMap[formData.selectedSector]) {
      return sectorSkillMap[formData.selectedSector];
    }
    const role = String(formData.roleType || "").toLowerCase().trim();
    const matched = roleSkillMap.find((entry) =>
      entry.keywords.some((keyword) => role.includes(keyword))
    );
    return matched?.options || defaultSkillOptions;
  }, [formData.roleType, formData.selectedSector]);
  const roleSuggestions = useMemo(() => {
    if (formData.selectedSector && sectorRoleMap[formData.selectedSector]) {
      return sectorRoleMap[formData.selectedSector];
    }
    return ["Frontend", "Backend", "Fullstack", "Devops", "Mobile", "QA", "Other"];
  }, [formData.selectedSector]);

  const handleSubmit = async () => {
    setLoading(true);

    await new Promise((r) => setTimeout(r, 500));

    onSave(formData, questions);
    setLoading(false);
    onClose();
  };

  const addQuestionForDimension = (dimension: string) => {
    const count = questions.filter((q) => q.dimension === dimension).length;
    if (count >= 2) return;
    setQuestions((prev) => [
      ...prev,
      {
        type: "text",
        dimension,
        question: "",
        evaluationHint: "",
        options: [],
        isRequired: false,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (
    index: number,
    field: "question" | "evaluationHint",
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === index
          ? { ...q, [field]: value }
          : q
      )
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
          w-[calc(100%-24px)] 
          max-w-[640px] 
          max-h-[90vh] 
          flex flex-col
          p-0
        "
      >
        
        {/* Header */}
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {assessment ? "Edit Assessment" : "Create Assessment"}
          </DialogTitle>

          <DialogDescription>
            {assessment
              ? "Update assessment details, questions, or settings as needed."
              : "Set up a new assessment by defining its structure, questions, and configuration."}
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-4">
          
          <ParallelogramSelect
            label="Sector"
            placeholder="Select sector"
            value={formData.selectedSector}
            options={sectorOptions}
            onChange={(val) => handleInputChange("selectedSector", val)}
          />
          <ParallelogramSelect
            label="Company Style"
            placeholder="Select company style"
            value={formData.companyStyle}
            options={["Startup", "Standard", "Non-Profit", "Corporation", "Enterprise"]}
            onChange={(val) => handleInputChange("companyStyle", val)}
          />

          <ParallelogramSelect
            label="Number of Questions"
            placeholder="Select number"
            value={formData.numberOfQuestions.toString()}
            options={questionCountOptions.map((count) => count.toString())}
            onChange={(val) =>
              handleInputChange("numberOfQuestions", Number(val))
            }
          />
          <div className="w-full">
            <ParallelogramSelect
              label="Opportunity Visibility"
              placeholder="Select visibility"
              value={formData.opportunityVisibility}
              options={["Public", "Private"]}
              onChange={(val) =>
                handleInputChange("opportunityVisibility", val)
              }
            />
                        {/* Helper text */}
            <p className="text-xs text-muted-foreground mt-2">
              {formData.opportunityVisibility === "Private"
                ? "Only visible to candidates you invite"
                : "Visible to all candidates in their feed"}
            </p>
          </div>
          <div className="w-full">
            <ParallelogramSelectSearch
              label="Role Type"
              placeholder="Select role"
              value={formData.roleType}
              options={[
                ...roleSuggestions,
              ]}
              onChange={(val) => handleInputChange("roleType", val)}
            />
            {/* Helper text */}
            <p className="text-xs text-muted-foreground mt-2">
              Type any role — our AI adapts questions to match
            </p>
          </div>

          <ParallelogramSelect
            label="Seniority Level"
            placeholder="Select level"
            value={formData.seniorityLevel}
            options={[
              "junior",
              "mid",
              "senior",
              "staff",
            ]}
            onChange={(val) => handleInputChange("seniorityLevel", val)}
          />
          <ParallelogramSelect
            label="Question Mode"
            placeholder="Select mode"
            value={formData.questionMode}
            options={["dynamic", "static"]}
            onChange={(val) => handleInputChange("questionMode", val as "dynamic" | "static")}
          />
          <ParallelogramInput
            label="Assessment Deadline (hours)"
            placeholder="72"
            value={deadlineInput}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d]/g, "");
              setDeadlineInput(raw);
              if (raw) {
                const parsed = parseInt(raw, 10);
                if (!Number.isNaN(parsed)) {
                  handleInputChange("assessmentDeadlineHours", parsed);
                }
              }
            }}
            onBlur={() => {
              const parsed = parseInt(deadlineInput, 10);
              if (Number.isNaN(parsed) || parsed <= 0) {
                setDeadlineInput("72");
                handleInputChange("assessmentDeadlineHours", 72);
              }
            }}
          />

          {/* Dimensions */}
            <div className="w-full">
              <div className="flex flex-col gap-3">

                  {/* Label */}
                  <label className="text-sm font-medium text-muted-foreground">
                    Assessment Dimensions (select at least 1)
                  </label>

                <div className="flex flex-col gap-2">
                  {[
                    { key: "technical_execution", label: "Technical", description: "Coding, system design, debugging" },
                    { key: "communication", label: "Communication", description: "Clarity, stakeholder management, written communication" },
                    { key: "personality", label: "Personality", description: "Conflict resolution, teamwork, adaptability" },
                    { key: "work_ethic", label: "Work Ethics", description: "Ownership, initiative, quality vs speed" },
                    { key: "motivation", label: "Motivation", description: "Learning drive, goals, resilience" },
                  ].map((trait) => {
                    const isSelected = formData.dimensions.includes(trait.key);
                    const questionCount = questions.filter((q) => q.dimension === trait.key && q.question.trim()).length;
                    return (
                      <div key={trait.key} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              let newDimensions = [...formData.dimensions];
                              if (newDimensions.includes(trait.key)) {
                                if (newDimensions.length <= 1) return;
                                newDimensions = newDimensions.filter((t) => t !== trait.key);
                                setQuestions((prev) => prev.filter((q) => q.dimension !== trait.key));
                                if (expandedDimension === trait.key) {
                                  setExpandedDimension(null);
                                }
                              } else {
                                newDimensions.push(trait.key);
                              }
                              handleInputChange("dimensions", newDimensions);
                            }}
                            className={`
                              w-full text-left px-4 py-3 rounded-lg border transition
                              hover:bg-muted/40 hover:border-primary
                              ${
                                isSelected
                                  ? "bg-primary/10 border-primary"
                                  : "bg-background border-border"
                              }
                            `}
                          >
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium text-foreground">
                                {trait.label}{questionCount > 0 ? ` (${questionCount})` : ""}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {trait.description}
                              </span>
                            </div>
                          </button>
                          {isSelected && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setExpandedDimension(expandedDimension === trait.key ? null : trait.key)
                              }
                            >
                              {expandedDimension === trait.key ? "−" : "+"}
                            </Button>
                          )}
                        </div>
                        {isSelected && expandedDimension === trait.key && (
                          <div className="border rounded-md p-3 space-y-2">
                            {questions
                              .map((q, index) => ({ q, index }))
                              .filter(({ q }) => q.dimension === trait.key)
                              .map(({ q, index }) => (
                                <div key={`${trait.key}-${index}`} className="border rounded-md p-3 space-y-2">
                                  <textarea
                                    className="w-full min-h-[72px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Your custom question text..."
                                    value={q.question}
                                    onChange={(e) => updateQuestion(index, "question", e.target.value)}
                                  />
                                  <textarea
                                    className="w-full min-h-[64px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Evaluation hint (optional)"
                                    value={q.evaluationHint || ""}
                                    onChange={(e) => updateQuestion(index, "evaluationHint", e.target.value)}
                                  />
                                  <div className="flex justify-end">
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => removeQuestion(index)}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            {questions.filter((q) => q.dimension === trait.key).length < 2 && (
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => addQuestionForDimension(trait.key)}
                              >
                                Add custom question (max 2)
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formData.dimensions.length === 5
                  ? "All dimensions selected — questions distributed evenly"
                  : `${formData.dimensions.length}/5 dimensions — questions focused on selected areas`}
              </p>
            </div>

            <Collapsible open={showFitProfile} onOpenChange={setShowFitProfile}>
              
              {/* Trigger */}
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm font-medium text-destructive"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showFitProfile ? "rotate-180" : ""
                    }`}
                  />

                  Fit Profile (optional — influences question scenarios)
                </button>
              </CollapsibleTrigger>

              {/* Content */}
              <CollapsibleContent className="mt-4 flex flex-col gap-4">

                  <div className="w-full">
                    <SkillSelector
                      label="Technical Skills / Languages"
                      options={dynamicSkillOptions}
                      selected={formData.skills || []}
                      onChange={(selected) => handleInputChange("skills", selected)}
                      allowCustom
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Select the tech stack for this role — coding questions will use these languages
                    </p>
                  </div>
                
                <ParallelogramInput
                  label="Mission"
                  placeholder="Team mission"
                  value={formData.mission}
                  onChange={(e) =>
                    handleInputChange("mission", e.target.value)
                  }
                />

                  <div className="w-full">
                    <ParallelogramInput
                      label="Values (comma-separated)"
                      placeholder="Speed, Ownership, Collaboration..."
                      value={(formData.values || []).join(", ")} // ✅ safe fallback
                      onChange={(e) =>
                        handleInputChange(
                          "values",
                          e.target.value.split(",").map((v) => v.trim())
                        )
                      }
                    />
                    {/* Helper text */}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Enter multiple values separated by commas (e.g., Speed, Ownership, Collaboration)
                    </p>
                  </div>

                <ParallelogramInput
                  label="Communication Norms"
                  placeholder="Async-first, Daily standups, Weekly 1:1s..."
                  value={formData.communicationNorms}
                  onChange={(e) =>
                    handleInputChange("communicationNorms", e.target.value)
                  }
                />

                  <ParallelogramInput
                    label="Traits Wanted"
                    placeholder="E.g. Growth mindset, Detail-oriented, Proactive..."
                    value={formData.traitsWanted}
                    onChange={(e) => handleInputChange("traitsWanted", e.target.value)}
                  />
                  <ParallelogramInput
                    label="Traits NOT Wanted"
                    placeholder="E.g. Micromanagement, Perfectionism, Risk-averse..."
                    value={formData.traitsNotWanted}
                    onChange={(e) => handleInputChange("traitsNotWanted", e.target.value)}
                  />
                  <ParallelogramInput
                    label="Goals for Next 3 Months"
                    placeholder="E.g. Launch new feature, Improve test coverage, Refactor legacy code..."
                    value={formData.goalsNext3Months}
                    onChange={(e) => handleInputChange("goalsNext3Months", e.target.value)}
                  />

              </CollapsibleContent>

            </Collapsible>

        </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 flex gap-2">
          
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : assessment ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

export default AssessmentModal;