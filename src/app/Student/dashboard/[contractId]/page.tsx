"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState,useEffect } from "react";
import DashboardLayout from "@/components/Student/DashboardLayout";
import { useStudentOpportunityHandler } from "@/hooks/studentapihandler/useStudentOpportunityHandler";
import { useStudentApplicationHandler } from "@/hooks/studentapihandler/useStudentApplicationHandler";
import { useStudentReviewHandler } from "@/hooks/studentapihandler/useStudentReviewHandler";
import {  Briefcase, Building2,  Check, ArrowLeft, Star } from 'lucide-react';
import { SyncLoader } from "react-spinners";
import { useOpportunityApplicants } from "@/hooks/studentapihandler/useOpportunityApplicants";
import { IconTabs } from "@/components/common/TabItem";
import { DescriptionComponent } from "@/components/common/DescriptionComponent";
import EmployeeCard from "@/components/common/employee-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/common/LoadingState";
import EmptyStateFeedback from "@/components/common/EmptyStateFeedback";
import { toast } from "sonner";
import { CompanyDetailsCard } from "@/components/Student/CompanyDetailsCard";


export default function contractDetailPage() {

    const [applying, setApplying] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);

    const { contractId } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const opportunityId = contractId as string;
    
    // Check if coming from applied opportunities page
    const fromApplied = searchParams.get('from') === 'applied';
    const [hasApplied, setHasApplied] = useState(fromApplied);

    const { opportunity, loading: opportunityLoading, getOpportunityById, getOpportunityQuestions,error } = useStudentOpportunityHandler();
    const { createApplication, checkApplicationExists } = useStudentApplicationHandler();
    const { getReviewsByCompanyId, loading: reviewsLoading } = useStudentReviewHandler();



    useEffect(() => {
        if (opportunityId) {
            loadOpportunity();
        }
    }, [opportunityId]);

    const loadOpportunity = async () => {
        try {
            const opp = await getOpportunityById(opportunityId);
            // Load reviews for the company
            if (opp?.companyId) {
                try {
                    const companyReviews = await getReviewsByCompanyId(opp.companyId);
                    setReviews(companyReviews);
                } catch (error: any) {
                    console.error('Failed to load reviews:', error);
                    setReviews([]);
                }
            }
            
            // Only check backend if not coming from applied opportunities page
            if (!fromApplied) {
                try {
                    const hasAppliedToThis = await checkApplicationExists(opportunityId);
                    setHasApplied(hasAppliedToThis);
                } catch (error: any) {
                    console.error('Failed to check application:', error);
                }
            }
        } catch (error: any) {
            toast.error('Failed to load opportunity');
        }
    };

    const handleApply = async () => {
      try {
        setApplying(true);
        const hasAssessmentFlow = Boolean(opportunity?.hasAssessment);
        if (hasAssessmentFlow) {
          router.push(`/Student/applied-Opportunity/${opportunityId}`);
          return;
        }
        await createApplication(opportunityId);
        setHasApplied(true);
        toast.success("Application submitted successfully!");
      } catch (error: any) {
        toast.error("Failed to submit application");
      } finally {
        setApplying(false);
      }
    };

    const { applicants, loading: applicantsLoading, error: applicantsError, getApplicantsByCompany } = useOpportunityApplicants();
    useEffect(() => {
      if (opportunity?.company?.id) {
        getApplicantsByCompany(opportunity.company.id).catch(console.error);
      }
    }, [opportunity?.company?.id, getApplicantsByCompany]);


  if (opportunityLoading) {
      return (
        <DashboardLayout>
          <div className="flex h-screen items-center justify-center">
            <LoadingState label="Fetching Data..." />
          </div>
        </DashboardLayout>
      );
  }

 if (!opportunity || error) {
  return (
    <DashboardLayout>
      <EmptyStateFeedback
        type={error ? "error" : "notfound"}
        title={error ? "Something went wrong" : "Opportunity Not Found"}
        description={
          error
            ? "We couldn’t load the opportunity. Please try again."
            : "The opportunity you're looking for doesn't exist or may have been removed."
        }
        id={!error ? opportunity?.id : undefined}
      />
    </DashboardLayout>
  );
}


  return (
    
    <DashboardLayout>
        <div className="px-4 sm:px-6 lg:px-6 py-6">
                          {/* BACK BUTTON */}
                <Button
                  variant="outline"
                  size="sm"
                  className="mb-2 gap-2"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button> 
            <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              {/* ================= HEADER ================= */}
              <Card className="p-4">
                <div className="flex items-center justify-between gap-3">

                  <div className="flex flex-col">
                    <h1 className="text-lg font-semibold">
                      Opportunity Details
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      View job and company information
                    </p>
                  </div>

                  <Button
                    onClick={handleApply}
                    disabled={applying || hasApplied}
                    className="w-[140px]"
                    variant={hasApplied ? "default" : "secondary"}
                  >
                    {hasApplied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Applied
                      </>
                    ) : applying ? (
                      "Applying..."
                    ) : (
                      opportunity?.hasAssessment ? "Continue" : "Apply"
                    )}
                  </Button>

                </div>
              </Card>

              {/* ================= TABS (NO CARD WRAPPER) ================= */}
              <>

                <IconTabs
                  defaultValue="job"
                  tabs={[
                    {
                      name: "Job Details",
                      value: "job",
                      icon: Briefcase,
                      content: (
                        <>
                          <DescriptionComponent opportunity={opportunity} />
                        </>
                      ),
                    },
                    {
                      name: "Company Info",
                      value: "company",
                      icon: Building2,
                      content: (
                        <>
                          <CompanyDetailsCard opportunity={opportunity} />
                        </>
                      ),
                    },
                  ]}
                />

              </>
            </div>

            <div className="w-full lg:w-1/2 flex items-start">
                <div className="flex flex-col gap-2 w-full max-w-2xl mx-auto lg:h-[calc(100vh-120px)] lg:overflow-y-auto">
                  {/* =======================
                      Current Employees
                  ======================= */}
                    <Card className="w-full">

                      {/* HEADER */}
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold">
                          Current Employees
                        </CardTitle>

                        <CardDescription>
                          People who are currently part of this opportunity
                        </CardDescription>
                      </CardHeader>

                      {/* CONTENT */}
                      <CardContent className="pt-0">

                        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                          {applicantsLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              Loading applicants...
                              <SyncLoader size={8} color="#D4AF37" />
                            </div>
                          ) : applicantsError ? (
                            <p className="text-sm text-red-500">{applicantsError}</p>
                          ) : applicants.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No applicants yet.
                            </p>
                          ) : (
                            applicants.map((applicant: any) => (
                              <div
                                key={applicant.applicantId}
                                className="min-w-[220px] max-w-[220px] shrink-0"
                              >
                                <EmployeeCard
                                  applicant={applicant}
                                  onView={() =>
                                    router.push(
                                      `/Student/dashboard/${contractId}/applicant/${applicant.student.id}`
                                    )
                                  }
                                />
                              </div>
                            ))
                          )}

                        </div>

                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl border shadow-sm flex flex-col">
                      {/* HEADER */}
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold">Reviews</CardTitle>
                        <CardDescription>
                          What people say about this company
                        </CardDescription>
                      </CardHeader>

                      {/* CONTENT */}
                      <CardContent className="flex-1 overflow-hidden">
                        <ScrollArea className="h-[200px] pr-2">

                          {reviewsLoading ? (
                            <p className="text-sm text-muted-foreground">
                              Loading reviews...
                            </p>
                          ) : reviews.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No reviews yet
                            </p>
                          ) : (
                            <div className="space-y-3">

                              {reviews.map((review) => (
                                <div
                                  key={review.id}
                                  className="bg-muted/30 border rounded-xl p-4 w-full"
                                >

                                  {/* TOP ROW */}
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

                                    {/* LEFT SIDE */}
                                    <div className="flex items-center gap-3 min-w-0">

                                      <Avatar className="w-8 h-8 shrink-0">
                                        <AvatarImage src={review.reviewerImage ?? undefined} />
                                        <AvatarFallback>
                                          {review.reviewerName?.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>

                                      <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">
                                          {review.reviewerName}
                                        </p>

                                        {/* MOBILE STARS */}
                                        <div className="flex gap-1 sm:hidden mt-1">
                                          {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                              key={i}
                                              className={`w-4 h-4 ${
                                                i < review.rating
                                                  ? "fill-primary text-primary"
                                                  : "fill-muted-foreground text-muted-foreground"
                                              }`}
                                            />
                                          ))}
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                          {review.dateReviewed}
                                        </p>
                                      </div>
                                    </div>

                                    {/* DESKTOP STARS */}
                                    <div className="hidden sm:flex gap-1 shrink-0">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < review.rating
                                              ? "fill-primary text-primary"
                                              : "fill-muted-foreground text-muted-foreground"
                                          }`}
                                        />
                                      ))}
                                    </div>

                                  </div>

                                  {/* TEXT */}
                                  <p className="text-sm text-muted-foreground mt-2 break-words">
                                    {review.reviewText}
                                  </p>

                                </div>
                              ))}

                            </div>
                          )}

                        </ScrollArea>
                      </CardContent>
                    </Card>

                </div>
            </div>


    </div>
        </div>

    </DashboardLayout>
  );
}
