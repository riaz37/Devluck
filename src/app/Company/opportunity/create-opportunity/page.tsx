"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOpportunityHandler } from "@/hooks/companyapihandler/useOpportunityHandler";
import { useQuestionHandler } from "@/hooks/companyapihandler/useQuestionHandler";
import { useCompanyBillingHandler } from "@/hooks/companyapihandler/useCompanyBillingHandler";
import { toast } from "sonner";
import DashboardLayout from "@/components/Company/DashboardLayout";
import { ArrowLeft } from "lucide-react";
import DatePickerField from "@/components/common/DatePickerField";
import { ParallelogramInput } from "@/components/common/ParallelogramInput";
import { ParallelogramSelect } from "@/components/common/ParallelogramSelect";
import { MultiInputList } from "@/components/common/MultiInputList";
import AssessmentModal, { AssessmentData, AssessmentQuestion } from "@/components/Company/Modal/AssessmentModel";
import { Checkbox } from "@/components/ui/checkbox";


type OpportunityData = {
  id?: string;
  title: string;
  type: string;
  timeLength: string;
  currency: string;
  allowance?: string;
  location?: string;
  description: string;
  startDate?: string;
  skills: string[];
  whyYouWillLoveWorkingHere: string[];
  benefits: string[];
  keyResponsibilities: string[];
};

const TIME_LENGTH_UNITS = ["days", "weeks", "months", "years"] as const;
type TimeLengthUnit = (typeof TIME_LENGTH_UNITS)[number];

function parseTimeLength(timeLength: string): { value: string; unit: TimeLengthUnit } {
  const fallback = { value: "", unit: "days" as TimeLengthUnit };
  if (!timeLength) return fallback;
  const match = timeLength.trim().match(/^(\d+)\s+([a-zA-Z]+)$/);
  if (!match) return fallback;
  const parsedUnit = match[2].toLowerCase();
  const normalizedUnit = parsedUnit.endsWith("s") ? parsedUnit : `${parsedUnit}s`;
  if (!TIME_LENGTH_UNITS.includes(normalizedUnit as TimeLengthUnit)) return fallback;
  return { value: match[1], unit: normalizedUnit as TimeLengthUnit };
}

function formatTimeLength(value: string, unit: TimeLengthUnit): string {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "";
  const count = Number(trimmedValue);
  const singularUnit = unit.slice(0, -1);
  const displayUnit = count === 1 ? singularUnit : unit;
  return `${trimmedValue} ${displayUnit}`;
}
function mapOpportunityToForm(data: any): OpportunityData {
  return {
    id: data.id,
    title: data.title ?? "",
    type: data.type ?? "",
    timeLength: data.timeLength ?? "",
    currency: data.currency ?? "",
    allowance: data.allowance ?? "",
    location: data.location ?? "",
    // ✅ FIX: fallback for backend inconsistency
    description: data.description ?? data.details ?? "",

    // ✅ FIX: format date properly for input[type=date]
    startDate: data.startDate
      ? new Date(data.startDate).toISOString().split("T")[0]
      : "",

    skills: data.skills ?? [],
    whyYouWillLoveWorkingHere: data.whyYouWillLoveWorkingHere ?? [],
    benefits: data.benefits ?? [],
    keyResponsibilities: data.keyResponsibilities ?? [],
  };
}

/* ---------------- PAGE ---------------- */

export default function CreateOpportunityPage() {

  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // 👈 EDIT MODE DETECTION
const [formData, setFormData] = useState<OpportunityData>({
  title: "",
  type: "",
  timeLength: "",
  currency: "",
  allowance: "",
  location: "",
  description: "",
  startDate: "",
  skills: [],
  whyYouWillLoveWorkingHere: [],
  benefits: [],
  keyResponsibilities: [],
});
  const [includeAssessment, setIncludeAssessment] = useState(false);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
  const [questionCountOptions, setQuestionCountOptions] = useState<number[]>([5, 10]);
  const [timeLengthValue, setTimeLengthValue] = useState("");
  const [timeLengthUnit, setTimeLengthUnit] = useState<TimeLengthUnit>("days");

    const router = useRouter();
 /* ──────────────────────────────────────────────
     LOAD EDIT DATA
  ────────────────────────────────────────────── */
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const data = await getOpportunityById(id);
        setFormData(mapOpportunityToForm(data));
        const rawFitProfile = (data as any)?.fitProfile;
        const parsedFitProfile =
          typeof rawFitProfile === "string"
            ? (() => {
                try {
                  return JSON.parse(rawFitProfile);
                } catch {
                  return null;
                }
              })()
            : rawFitProfile && typeof rawFitProfile === "object"
              ? rawFitProfile
              : null;
        if ((data as any)?.hasAssessment || parsedFitProfile) {
          setIncludeAssessment(true);
          setAssessmentData({
            numberOfQuestions: Number((data as any)?.questionCount || 10),
            dimensions: Array.isArray(parsedFitProfile?.selected_dimensions)
              ? parsedFitProfile.selected_dimensions
              : Array.isArray(parsedFitProfile?.dimensions)
                ? parsedFitProfile.dimensions
                : [],
            companyStyle: ((data as any)?.companyStyle || "Startup") as AssessmentData["companyStyle"],
            opportunityVisibility: ((data as any)?.visibility || "Public") as AssessmentData["opportunityVisibility"],
            roleType: parsedFitProfile?.role_type || parsedFitProfile?.roleType || "general",
            seniorityLevel: parsedFitProfile?.seniority || parsedFitProfile?.seniorityLevel || "mid",
            mission: parsedFitProfile?.mission || "",
            communicationNorms: parsedFitProfile?.communicationNorms || "",
            traitsWanted: parsedFitProfile?.traitsWanted || "",
            traitsNotWanted: parsedFitProfile?.traitsNotWanted || "",
            goalsNext3Months: parsedFitProfile?.goalsNext3Months || "",
            skills: Array.isArray(parsedFitProfile?.skills) ? parsedFitProfile.skills : [],
            values: Array.isArray(parsedFitProfile?.values) ? parsedFitProfile.values : [],
            selectedSector: parsedFitProfile?.sector || "",
            questionMode: (((data as any)?.questionMode || "dynamic") as AssessmentData["questionMode"]),
            applicationCloseAt: (data as any)?.applicationCloseAt || "",
            assessmentDeadlineHours: Number((data as any)?.assessmentDeadlineHours || 72),
          });
          const loadedQuestions = await getQuestions(id);
          setAssessmentQuestions(
            loadedQuestions.map((q) => ({
              id: q.id,
              question: q.question,
              type: q.type,
              dimension: (q as any).dimension || "technical_execution",
              evaluationHint: (q as any).evaluationHint || "",
              options: q.options || [],
              isRequired: q.isRequired,
            }))
          );
        }
      } catch (err) {
        toast.error("Failed to load opportunity");
      }
    };

    load();
  }, [id]);

  const handleChange = (key: keyof OpportunityData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleTimeLengthChange = (value: string, unit: TimeLengthUnit) => {
    setTimeLengthValue(value);
    setTimeLengthUnit(unit);
    handleChange("timeLength", formatTimeLength(value, unit));
  };

  const {
    loading,
    createOpportunity,
    updateOpportunity,
    getOpportunityById,
  } = useOpportunityHandler();
  const { bulkUpdateQuestions, getQuestions } = useQuestionHandler();
  const { getSubscriptionStatus } = useCompanyBillingHandler();
  useEffect(() => {
    const parsed = parseTimeLength(formData.timeLength);
    setTimeLengthValue(parsed.value);
    setTimeLengthUnit(parsed.unit);
  }, [formData.timeLength]);
  useEffect(() => {
    getSubscriptionStatus()
      .then((data) => {
        setQuestionCountOptions(
          Array.isArray(data.questionCountOptions) && data.questionCountOptions.length > 0
            ? data.questionCountOptions
            : [5, 10]
        );
      })
      .catch(() => {
        setQuestionCountOptions([5, 10]);
      });
  }, [getSubscriptionStatus]);
  /* ---------------- SUBMIT (CREATE + EDIT) ---------------- */
    const handleSubmit = async () => {
    try {
        console.log("SUBMIT:", formData);
        const payload: any = { ...formData };
        if (includeAssessment && assessmentData) {
          payload.companyStyle = assessmentData.companyStyle;
          payload.questionCount = assessmentData.numberOfQuestions;
          payload.visibility = assessmentData.opportunityVisibility;
          payload.questionMode = assessmentData.questionMode;
          payload.applicationCloseAt = assessmentData.applicationCloseAt || null;
          payload.assessmentDeadlineHours = assessmentData.assessmentDeadlineHours;
          payload.hasAssessment = true;
          payload.fitProfile = {
            sector: assessmentData.selectedSector || undefined,
            selected_dimensions: assessmentData.dimensions,
            role_type: assessmentData.roleType,
            seniority: assessmentData.seniorityLevel,
            dimensions: assessmentData.dimensions,
            roleType: assessmentData.roleType,
            seniorityLevel: assessmentData.seniorityLevel,
            mission: assessmentData.mission,
            communicationNorms: assessmentData.communicationNorms,
            traitsWanted: assessmentData.traitsWanted,
            traitsNotWanted: assessmentData.traitsNotWanted,
            goalsNext3Months: assessmentData.goalsNext3Months,
            skills: assessmentData.skills,
            values: assessmentData.values,
          };
        }
        let opportunityId = formData.id;
        if (opportunityId) {
        await updateOpportunity(opportunityId, payload);
        toast.success("Opportunity updated successfully");
        } else {
        const created = await createOpportunity(payload);
        opportunityId = created.id;
        toast.success("Opportunity created successfully");
        }
        if (includeAssessment && assessmentData && opportunityId) {
          await bulkUpdateQuestions(
            opportunityId,
            assessmentQuestions.map((q, index) => ({
              id: q.id,
              question: q.question,
              type: q.type,
              dimension: q.dimension,
              evaluationHint: q.evaluationHint || "",
              options: q.options || [],
              isRequired: q.isRequired ?? false,
              order: index,
            }))
          );
        }

        router.push("/Company/opportunity");
        router.refresh();
    } catch (err) {
        console.error("SUBMIT ERROR:", err);
        toast.error("Failed to save opportunity");
    }
    };

  return (
      <DashboardLayout>
    <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* BACK */}
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {formData.id ? "Edit Opportunity" : "Create Opportunity"}
        </h1>
        {/* GRID FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <ParallelogramInput
            label="Title"
            placeholder="Opportunity title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />

          <ParallelogramSelect
            label="Type"
            placeholder="Select type"
            value={formData.type}
            options={["Full-time", "Part-time", "Internship"]}
            onChange={(v) => handleChange("type", v)}
          />

          <ParallelogramSelect
            label="Location"
            placeholder="Select location"
            value={formData.location || ""}
            options={["Remote", "Hybrid", "Onsite"]}
            onChange={(v) => handleChange("location", v)}
          />

          <ParallelogramSelect
            label="Currency"
            placeholder="Select currency"
            value={formData.currency}
            options={["USD", "EUR", "SAR"]}
            onChange={(v) => handleChange("currency", v)}
          />

          <ParallelogramInput
            label="Allowance"
            placeholder="Salary / stipend"
            value={formData.allowance || ""}
            onChange={(e) => handleChange("allowance", e.target.value)}
          />

          <DatePickerField
            label="Start Date"
            value={formData.startDate || ""}
            onChange={(v) => handleChange("startDate", v)}
          />

                    {/* Inputs */}
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              placeholder="Time Length"
              value={timeLengthValue}
              onChange={(e) =>
                handleTimeLengthChange(e.target.value, timeLengthUnit)
              }
            />
            <Select
              value={timeLengthUnit}
              onValueChange={(val: TimeLengthUnit) =>
                handleTimeLengthChange(timeLengthValue, val)
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
                <SelectItem value="months">Months</SelectItem>
                <SelectItem value="years">Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
        </div>

        {/* DESCRIPTION FULL WIDTH */}
        <ParallelogramInput
          label="Description"
          placeholder="Opportunity description"
          value={formData.description}
          type="textarea"
          onChange={(e) => handleChange("description", e.target.value)}
        />

        {/* TAGS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <MultiInputList
            label="Skills"
            items={formData.skills}
            setItems={(v) => handleChange("skills", v)}
          />

          <MultiInputList
            label="Benefits"
            items={formData.benefits}
            setItems={(v) => handleChange("benefits", v)}
          />

          <MultiInputList
            label="Why You'll Love Working Here"
            items={formData.whyYouWillLoveWorkingHere}
            setItems={(v) => handleChange("whyYouWillLoveWorkingHere", v)}
          />

          <MultiInputList
            label="Responsibilities"
            items={formData.keyResponsibilities}
            setItems={(v) => handleChange("keyResponsibilities", v)}
          />

        </div>

        <div className="space-y-4 border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={includeAssessment}
              onCheckedChange={(checked) => setIncludeAssessment(Boolean(checked))}
            />
            <span className="text-sm font-medium">Include assessment</span>
          </div>
          {includeAssessment && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setAssessmentModalOpen(true)}
            >
              {assessmentData ? "Update assessment for this opportunity" : "Create assessment for this opportunity"}
            </Button>
          )}
        </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading
          ? "Saving..."
          : formData.id
          ? "Update Opportunity"
          : "Create Opportunity"}
      </Button>
      <AssessmentModal
        assessment={assessmentData}
        isOpen={assessmentModalOpen}
        questionCountOptions={questionCountOptions}
        initialQuestions={assessmentQuestions}
        onClose={() => setAssessmentModalOpen(false)}
        onSave={(data, questions) => {
          setAssessmentData(data);
          setAssessmentQuestions(questions);
          setAssessmentModalOpen(false);
        }}
      />
    </div>
    </DashboardLayout>
  );
}
