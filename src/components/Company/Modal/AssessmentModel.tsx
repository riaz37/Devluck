"use client";

import React, { useState, useEffect } from "react";
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
  dimensions: string[];        // e.g., ["technical", "behavioral"]
  // ✅ NEW FIELDS
  companyStyle: "Startup" | "Standard" | "Non-Profit" | "Corporation" | "Enterprise";
  opportunityVisibility: "Public" | "Private" | "Invite Only";
  roleType: "Admin" | "User" | "Guest";
  seniorityLevel: "Internship" | "Entry-level" | "Mid-level" | "Senior" | "Executive" | "Other";
  mission: string;
  communicationNorms: string;      // E.g., Async-first, Daily standups...
  traitsWanted: string;            // Traits you want in candidates
  traitsNotWanted: string;         // Traits you don’t want
  goalsNext3Months: string;        // Company or team goals
  skills: string[];
  values: string[];   
}

interface Props {
  assessment?: AssessmentData | null;
  isOpen: boolean;
  questionCountOptions?: number[];
  onClose: () => void;
  onSave: (data: AssessmentData) => void;
}

const AssessmentModal: React.FC<Props> = ({
  assessment,
  isOpen,
  questionCountOptions = [10, 20, 50],
  onClose,
  onSave,
}) => {
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
  });

  const [loading, setLoading] = useState(false);
  const [showFitProfile, setShowFitProfile] = useState(false);

  useEffect(() => {
    if (assessment) setFormData(assessment);
  }, [assessment]);

  const handleInputChange = (field: keyof AssessmentData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    await new Promise((r) => setTimeout(r, 500));

    onSave(formData);
    setLoading(false);
    onClose();
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
                "Frontend",
                "Backend",
                "Fullstack",
                "Devops",
                "Mobile",
                "QA",
                "Other",
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
              "Internship",
              "Entry-level",
              "Mid-level",
              "Senior",
              "Executive",
              "Other"
            ]}
            onChange={(val) => handleInputChange("seniorityLevel", val)}
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
                    { key: "technical", label: "Technical", description: "Coding, system design, debugging" },
                    { key: "communication", label: "Communication", description: "Clarity, stakeholder management, written communication" },
                    { key: "personality", label: "Personality", description: "Conflict resolution, teamwork, adaptability" },
                    { key: "Work Ethics", label: "Work Ethics", description: "Ownership, initiative, quality vs speed" },
                    { key: "Motivation", label: "Motivation", description: "Learning drive,goals,resilience" },
                  ].map((trait) => (
                    <button
                      key={trait.key}
                      type="button"
                      onClick={() => {
                        let newDimensions = [...formData.dimensions];

                        if (newDimensions.includes(trait.key)) {
                          newDimensions = newDimensions.filter((t) => t !== trait.key);
                        } else {
                          newDimensions.push(trait.key);
                        }

                        handleInputChange("dimensions", newDimensions);
                      }}
                      className={`
                        w-full text-left px-4 py-3 rounded-lg border transition
                        hover:bg-muted/40 hover:border-primary
                        ${
                          formData.dimensions.includes(trait.key)
                            ? "bg-primary/10 border-primary"
                            : "bg-background border-border"
                        }
                      `}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-foreground">
                          {trait.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {trait.description}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
                          {/* Helper text */}
              <p className="mt-2 text-xs text-muted-foreground">
                All dimensions selected — questions distributed evenly
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
                      options={[
                        { key: "javascript", label: "JavaScript" },
                        { key: "python", label: "Python" },
                        { key: "react", label: "React" },
                        { key: "node", label: "Node.js" },
                        { key: "sql", label: "SQL" },
                        { key: "docker", label: "Docker" },
                        { key: "aws", label: "AWS" },
                        { key: "csharp", label: "C#" },
                        { key: "typescript", label: "TypeScript" },
                        { key: "java", label: "Java" },
                        { key: "kotlin", label: "Kotlin" },
                        { key: "swift", label: "Swift" },
                        { key: "go", label: "Go" },
                        { key: "php", label: "PHP" },
                        { key: "ruby", label: "Ruby" },
                        { key: "graphql", label: "GraphQL" },
                        { key: "html", label: "HTML" },
                        { key: "css", label: "CSS" },
                        { key: "sass", label: "Sass" },
                      ]}
                      selected={formData.skills || []} // ✅ ensure it's always an array
                      onChange={(selected) => handleInputChange("skills", selected)}
                    />
                    {/* Helper text */}
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