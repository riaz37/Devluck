"use client";

import { useParams, useRouter } from "next/navigation";
import { useState,useEffect } from "react";
import DashboardLayout from "@/components/Student/DashboardLayout";
import { useStudentContractHandler } from "@/hooks/studentapihandler/useStudentContractHandler";
import { useStudentPaymentHandler } from "@/hooks/studentapihandler/useStudentPaymentHandler";
import { useStudentReviewHandler } from "@/hooks/studentapihandler/useStudentReviewHandler";
import { FileText, Briefcase, ArrowLeft } from 'lucide-react';
import {SyncLoader } from "react-spinners";
import { DescriptionComponent } from "@/components/common/DescriptionComponent";

import { DataTable } from "@/components/common/DataTable";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

import { IconTabs } from "@/components/common/TabItem";
import { LoadingState } from "@/components/common/LoadingState";
import EmptyStateFeedback from "@/components/common/EmptyStateFeedback";
import { ContractDescriptionComponent } from "@/components/Student/ContractDescriptionComponent";
import ContractExtrasCard from "@/components/Student/ContractExtrasCard";

export default function contractDetailPage() {
  const [review, setReview] = useState("");
  const [starRating, setStarRating] = useState(0);
  const params = useParams();

  const contractId =
    typeof params.contractId === "string"
      ? params.contractId
      : params.contractId?.[0];
   
  const router = useRouter();
  const { contract, loading, error, getContractById } = useStudentContractHandler();
  const { payments, loading: paymentsLoading, listPayments } = useStudentPaymentHandler();
  const { createReview, loading: reviewLoading } = useStudentReviewHandler();

  useEffect(() => {
    if (contractId && typeof contractId === 'string') {
      getContractById(contractId).catch(console.error);
      listPayments(1, 100, contractId).catch(console.error);
    }
  }, [contractId, getContractById, listPayments]);
  const opportunity = contract?.opportunity;


  const paymentColumns = [
    {
      header: "Payment ID",
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[var(--color-text-primary)]">
            {row.transferId || row.id}
          </span>
          <span className="text-xs text-muted-foreground">
            Payment ID
          </span>
        </div>
      ),
    },

    {
      header: "Next Payment",
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[var(--color-text-primary)]">
            {row.nextPayment}
          </span>
          <span className="text-xs text-muted-foreground">
            Next Payment
          </span>
        </div>
      ),
    },

    {
      header: "Amount",
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[var(--color-text-primary)]">
            {row.monthlyAllowance}
          </span>
          <span className="text-xs text-muted-foreground">
            Amount
          </span>
        </div>
      ),
    },

    {
      header: "Status",
      cell: (row: any) => (
        <div className="flex flex-col gap-1">
          <Badge
            className={cn(
              row.paymentStatus === "Paid" && "bg-green-100 text-green-700",
              row.paymentStatus === "Pending" && "bg-gray-200 text-black",
              row.paymentStatus === "Due" && "bg-red-100 text-red-600"
            )}
          >
            {row.paymentStatus}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Payment Status
          </span>
        </div>
      ),
    },
  ];



  if (loading) {
      return (
        <DashboardLayout>
          <div className="flex h-screen items-center justify-center">
            <LoadingState label="Fetching Data..." />
          </div>
        </DashboardLayout>
      );
  }

    if (error || !contract) {
    return (
      <DashboardLayout>
        <EmptyStateFeedback
          type={error ? "error" : "notfound"}
          title={
            error
              ? "Something went wrong"
              : "Contract Not Found"
          }
          description={
            error
              ? "We couldn’t load the contract. Please try again."
              : "The contract you’re looking for doesn’t exist or may have been removed."
          }
          id={!error ? contractId : undefined}
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
                <div className="w-full lg:w-1/2">
                  <IconTabs
                    defaultValue="job"
                    tabs={[
                      {
                        name: "Job Details",
                        value: "job",
                        icon: Briefcase,
                        content: (
                          <div>
                            <DescriptionComponent opportunity={opportunity} />
                          </div>
                        ),
                      },
                      {
                        name: "Contract Details",
                        value: "contract",
                        icon: FileText,
                        content: (
                          <div>
                            <ContractDescriptionComponent contract={contract} />
                          </div>
                        ),
                      },
                    ]}
                  />

                </div>

                <div className="w-full lg:w-1/2 flex items-start">

                  <div className="flex flex-col gap-6 w-full lg:h-[calc(100vh-120px)] lg:overflow-y-auto">

                    <div className="w-full">
                      {/* HEADER */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg font-semibold">
                            Payments
                          </CardTitle>

                          <CardDescription>
                            Track all contract payments, status, and upcoming transfers
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="p-0">

                          {/* 🔥 ONLY ONE SCROLL LAYER */}
                          <div className="max-h-[150px] overflow-y-auto">

                            <div className="p-4">

                              {/* 🔥 THIS FIXES MOBILE HORIZONTAL SCROLL */}
                              <div className="w-full overflow-x-auto">
                                
                                {paymentsLoading ? (
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm text-muted-foreground">
                                      Loading payments
                                    </p>
                                    <SyncLoader size={8} color="#D4AF37" />
                                  </div>
                                ) : payments.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">
                                    No payments found for this contract.
                                  </p>
                                ) : (
                                  <div className="min-w-[400px]">
                                    <DataTable
                                      data={payments}
                                      getId={(row) => row.id}
                                      columns={paymentColumns}
                                    />
                                  </div>
                                )}

                              </div>
                            </div>

                          </div>

                        </CardContent>
                      </Card>
                    </div>
                    <div className="w-full">
                      <Card>
                        <CardHeader>
                          <CardTitle>Review</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-5">

                          {/* TEXTAREA */}
                          <Textarea
                            placeholder="Write your comments..."
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            className="min-h-[120px]"
                          />

                          {/* STARS */}
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setStarRating(star)}
                                className="transition hover:scale-110"
                              >
                                <svg
                                  width="22"
                                  height="22"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className={star <= starRating ? "text-yellow-400" : "text-muted-foreground"}
                                >
                                  <path d="M10 1.6l2.6 5.3 5.9.9-4.3 4.2 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.2 5.9-.9L10 1.6z" />
                                </svg>
                              </button>
                            ))}
                          </div>

                          {/* ACTIONS */}
                          <div className="flex justify-between gap-3 pt-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setReview("");
                                setStarRating(0);
                              }}
                            >
                              Cancel
                            </Button>

                            <Button
                              disabled={reviewLoading || !review.trim() || starRating === 0}
                              onClick={async () => {
                                if (!review.trim() || starRating === 0) {
                                  toast.error("Please provide both a review and rating");
                                  return;
                                }

                                if (!contractId) {
                                  toast.error("Contract ID is missing");
                                  return;
                                }

                                try {
                                  await createReview({
                                    review: review.trim(),
                                    rating: starRating,
                                    contractId,
                                  });

                                  setReview("");
                                  setStarRating(0);

                                  toast.success("Review submitted successfully!");
                                } catch (error: any) {
                                  toast.error(error?.message || "Failed to submit review");
                                }
                              }}
                            >
                              {reviewLoading ? "Sending..." : "Send"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                  </div>
                </div>
              </div>
            </div>
    </DashboardLayout>
  );
}
