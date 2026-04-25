// src/app/Student/opportunity/page.tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo,useEffect } from "react";
import DashboardLayout from "@/components/Student/DashboardLayout";
import { useStudentOpportunityHandler } from "@/hooks/studentapihandler/useStudentOpportunityHandler";
import { useStudentApplicationHandler } from "@/hooks/studentapihandler/useStudentApplicationHandler";
import {FileSearch, Search, X} from 'lucide-react';
import { MappedOpportunity} from "@/types/opportunity-s";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { Pagination } from "@/components/common/Pagination";
import { OpportunityCard } from "@/components/Student/OpportunityCard";
import { OpportunityCardSkeleton } from "@/components/Student/Skeleton/OpportunityCardSkeleton";


 
export default function ContractListPage() {
      // Stats
      const [selectedOpportunityFrom, setSelectedOpportunityFrom] = useState<"All" | "Company" | "Investor">("All");
      const [selectedLocation, setSelectedLocation] = useState<string>("All");
      const router = useRouter();
      const [searchQuery, setSearchQuery] = useState("");
      const [currentPage, setCurrentPage] = useState(1);
      const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 10000]);
      const [selectedJobType, setSelectedJobType] = useState<"All" | "Full-time" | "Part-time" | "Contract">("All");
      const [applyingOpportunityId, setApplyingOpportunityId] = useState<string | null>(null);
      const [isFocused, setIsFocused] = useState(false);
      const [appliedMap, setAppliedMap] = useState<Record<string, boolean>>({});
      // API Hooks
      const { opportunities, loading: opportunitiesLoading, error: opportunitiesError, listOpportunities } = useStudentOpportunityHandler();
      const { createApplication, loading: applying, checkApplicationExists } = useStudentApplicationHandler(); 
      // Fetch all opportunities on mount
      useEffect(() => {
        listOpportunities(1, 1000).catch(console.error);
      }, []);

      useEffect(() => {
        if (!opportunities || opportunities.length === 0) return;

        const checkAllApplications = async () => {
          const results: Record<string, boolean> = {};

          await Promise.all(
            opportunities.map(async (opp) => {
              try {
                const applied = await checkApplicationExists(opp.id);
                results[opp.id] = applied;
              } catch {
                results[opp.id] = false;
              }
            })
          );

          setAppliedMap(results);
        };

        checkAllApplications();
      }, [opportunities]);

      // Map opportunities to mockContracts format
      const mappedOpportunities = useMemo(() => {
        if (!opportunities || !Array.isArray(opportunities)) {
          return [];
        }
        const mapped: MappedOpportunity[] = opportunities.map((opp, index) => {
          const mappedItem: MappedOpportunity = {
            id: index + 1,
            originalId: opp.id,
            applicantId: 0,

            contractTitle: opp.title,
            company: opp.company?.name || "Unknown Company",
            salary: opp.allowance
              ? `${opp.currency} ${opp.allowance}`
              : "Not specified",

            jobType:
              opp.type === "Full-time" ||
              opp.type === "Part-time" ||
              opp.type === "Contract"
                ? opp.type
                : "Full-time",

            location: opp.location || "Not specified",
            jobDescription: opp.details || "",

            workProgress: Math.floor(Math.random() * 100),

            deadline: opp.startDate
              ? new Date(opp.startDate).toLocaleDateString()
              : "Not specified",

            startDate: opp.startDate
              ? new Date(opp.startDate).toLocaleDateString()
              : "Not specified",

            endDate: "Not specified",

            status: "Running",
            applicantIds: [],

            companyId: opp.companyId || "",

            // ✅ FIXED
            opportunityStatus: "Applied",
            opportunityFrom: "Company",

            skills: opp.skills || [],
            benefits: opp.benefits || [],
            keyResponsibilities: opp.keyResponsibilities || [],
            whyYoullLoveWorkingHere:
              opp.whyYouWillLoveWorkingHere || [],

            // ✅ NEW REQUIRED FIELDS
            originalStatus: "pending", // map from backend later
            appliedAt: new Date().toISOString(), // or opp.appliedAt if exists
            opportunityId: opp.id, // backend id
            hasAssessment: Boolean(opp.hasAssessment),
          };

          return mappedItem;
        });

        return mapped;
      }, [opportunities]);
      
      // Use only real API data (no mock fallback)
      const displayContracts = mappedOpportunities;
      
      //---------------------filter----------------------------------
      const locations = useMemo(() => {
        const unique = Array.from(
          new Set(displayContracts.map(c => c.location))
        );
        return ["All", ...unique];
      }, [displayContracts]);



      // 🔍 Filter applicants
      const filteredApplicants = useMemo(() => {
        return displayContracts.filter(contract => {

          // 🔍 Search
          const searchMatch =
            !searchQuery.trim() ||
            contract.contractTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.jobType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.company.toLowerCase().includes(searchQuery.toLowerCase());

          // ✅ Job Type filter (NEW)
          const jobTypeMatch =
            selectedJobType === "All" ||
            contract.jobType === selectedJobType;

          // 📍 Location
          const locationMatch =
            selectedLocation === "All" ||
            contract.location === selectedLocation;

          // 💰 Salary
          const salaryStr = String(contract.salary).replace(/[^0-9]/g, "");
          const salary = salaryStr ? Number(salaryStr) : 0;

          const salaryMatch =
            salary === 0 ||
            contract.salary === "Not specified" ||
            (salary >= salaryRange[0] && salary <= salaryRange[1]);

          // 🏢 Opportunity From
          const opportunityFromMatch =
            selectedOpportunityFrom === "All" ||
            contract.opportunityFrom === selectedOpportunityFrom;

          return (
            searchMatch &&     
            jobTypeMatch &&     
            locationMatch &&
            salaryMatch &&
            opportunityFromMatch
          );
        });
      }, [
        displayContracts,
        searchQuery,  
        selectedJobType,       
        selectedLocation,
        salaryRange,
        selectedOpportunityFrom
      ]);
      

      const STEP = 100;
      const MIN = 0;
      const MAX = 10000;

      // Handle Apply 
      const handleApply = async (contract: MappedOpportunity) => {
        try {
          const opportunityId =
            (contract as any).originalId || String(contract.id);

          setApplyingOpportunityId(opportunityId);
          if (contract.hasAssessment) {
            router.push(`/Student/applied-Opportunity/${opportunityId}`);
            return;
          }

          await createApplication(opportunityId);
          setAppliedMap((prev) => ({
            ...prev,
            [opportunityId]: true,
          }));
          toast.success("Application submitted successfully!");
        } catch (err: any) {
          toast.error(err.message || "Failed to submit application");
        } finally {
          setApplyingOpportunityId(null);
        }
      };
  
      // 📄 Pagination
      const ITEMS_PER_PAGE = 4;
      const totalPages = Math.ceil(filteredApplicants.length / ITEMS_PER_PAGE);
      const paginatedApplicants = filteredApplicants.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      );
      const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
      };
      const goToPrevious = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
      };
      const goToNext = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
      };
      const VISIBLE_PAGES = 5;
      // Compute start and end of visible page range
      const startPage = Math.max(1, Math.min(currentPage, totalPages - VISIBLE_PAGES + 1));
      const endPage = Math.min(totalPages, startPage + VISIBLE_PAGES - 1);
      const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
      const showPlus = endPage < totalPages; // whether to show "+" button





return (
  <DashboardLayout>
    <div className="px-4 sm:px-6 lg:px-8 py-6">

      {/* Main Row: Search (1/2) + Grid (1/2) */}
      <div className="flex flex-col lg:flex-row gap-6 sm:mt-0 mt-4">

        {/* ================= LEFT COLUMN — SEARCH + LOCATION (1/2) ================= */}
          <div className="w-full lg:w-1/3">
            <Card className="rounded-2xl border shadow-sm">
              
              {/* Header */}
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-5">

              {/* 🔍 SEARCH */}
              <div className="space-y-2">

                <Label className="text-xs font-medium text-muted-foreground">
                  SEARCH
                </Label>

                <div className="relative group w-full">

                  {/* Glow effect */}
                  <div
                    className={cn(
                      "absolute -inset-[1px] rounded-xl transition-all duration-300 blur-[2px] -z-10",
                      isFocused
                        ? "bg-foreground/10 opacity-100"
                        : "bg-transparent opacity-0"
                    )}
                  />

                  <div className="relative flex items-center">

                    {/* Search icon */}
                    <div className="absolute left-4 z-20 pointer-events-none">
                      <Search
                        className={cn(
                          "w-4 h-4 transition-colors duration-300",
                          isFocused || searchQuery
                            ? "text-primary"
                            : "text-muted-foreground/50"
                        )}
                      />
                    </div>

                    {/* Input */}
                    <Input
                      value={searchQuery}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search opportunities..."
                      className={cn(
                        "h-11 pl-11 pr-10 rounded-xl transition-all duration-200 bg-background",
                        "border-border/60 hover:border-border",
                        "placeholder:text-muted-foreground/40 text-sm"
                      )}
                    />

                    {/* Clear button */}
                    <AnimatePresence>
                      {searchQuery && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute right-2 z-20"
                        >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSearchQuery("")}
                          className="h-8 w-8"
                        >
                          <X className="w-3.5 h-3.5 text-primary" />
                        </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                </div>
              </div>

                {/* 📍 + 💼 ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Location */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">LOCATION</Label>
                    <Select
                      value={selectedLocation}
                      onValueChange={(value) => {
                        setSelectedLocation(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Any location" />
                      </SelectTrigger>

                      <SelectContent align="center">
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Job Type */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">JOB TYPE</Label>
                    <Select
                      value={selectedJobType}
                      onValueChange={(value) => setSelectedJobType(value as any)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Any type" />
                      </SelectTrigger>

                      <SelectContent align="center">
                        {["All", "Full-time", "Part-time", "Contract"].map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 🏢 OPPORTUNITY FROM */}
                <div className="space-y-3">

                  <Label className="text-xs text-muted-foreground">
                    OPPORTUNITY FROM
                  </Label>

                  <Tabs
                    value={selectedOpportunityFrom}
                    onValueChange={(value) =>
                      setSelectedOpportunityFrom(value as any)
                    }
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="All">All</TabsTrigger>
                      <TabsTrigger value="Company">Company</TabsTrigger>
                      <TabsTrigger value="Investor">Investor</TabsTrigger>
                    </TabsList>
                  </Tabs>

                </div>

                {/* 💰 SALARY */}
                <div className="space-y-3 pt-2 border-t">

                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">
                      SALARY RANGE
                    </Label>

                    <span className="text-xs text-muted-foreground">
                      ${salaryRange[0]} - ${salaryRange[1]}
                    </span>
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      value={salaryRange[0]}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        if (val < MIN) val = MIN;
                        if (val > salaryRange[1]) val = salaryRange[1];
                        setSalaryRange([val, salaryRange[1]]);
                      }}
                      placeholder="Min"
                    />

                    <Input
                      type="number"
                      value={salaryRange[1]}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        if (val > MAX) val = MAX;
                        if (val < salaryRange[0]) val = salaryRange[0];
                        setSalaryRange([salaryRange[0], val]);
                      }}
                      placeholder="Max"
                    />
                  </div>

                  {/* Slider */}
                  <Slider
                    min={MIN}
                    max={MAX}
                    step={STEP}
                    value={salaryRange}
                    onValueChange={(value) =>
                      setSalaryRange(value as [number, number])
                    }
                  />
                  <div className="flex justify-between text-xs text-muted-foreground px-1">
                    {[0, 2000, 4000, 6000, 8000, 10000].map((value) => (
                      <span key={value}>
                        ${value === 0 ? 0 : `${value / 1000}k`}
                      </span>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>


        {/* ================= RIGHT COLUMN — GRID (3/4) ================= */}
        <div className="w-full lg:w-2/3 " >
          {opportunitiesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <OpportunityCardSkeleton key={i} />
              ))}
            </div>
          ) : opportunitiesError ? (
            <div className="flex h-screen items-center justify-center">
              <ErrorState
                icon={<FileSearch className="h-10 w-10text-red-500" />}
                title="Something went wrong"
                description={opportunitiesError || "Unable to load opportunities. Please try again."}
              />
            </div>
            ) : filteredApplicants.length === 0 ? (
            <div className="flex h-screen items-center justify-center">
              <EmptyState
                icon={<FileSearch className="h-10 w-10 text-muted-foreground" />}
                title="No opportunities found"
                description="Create your first opportunity to get started"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 grid-rows-2 gap-4">
              {paginatedApplicants.map((contract, index) => {
                const opportunityId = (contract as any).originalId || String(contract.id);
                return (
                    <OpportunityCard
                      key={contract.id || index}
                      opportunity={contract}
                      onClick={() =>
                        router.push(`/Student/opportunity/${opportunityId}`)
                      }
                      onApply={() => handleApply(contract)}
                      isApplying={applyingOpportunityId === opportunityId}
                      hasApplied={appliedMap[opportunityId]}
                    />
                );
              })}
            </div>
          )}

    {/* Pagination */}
       <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        visiblePages={visiblePages}
        loading={opportunitiesLoading}
        error={opportunitiesError}
        onPageChange={goToPage}
        onPrevious={goToPrevious}
        onNext={goToNext}
      />
        </div>

      </div>
    </div>
  </DashboardLayout>
);

}